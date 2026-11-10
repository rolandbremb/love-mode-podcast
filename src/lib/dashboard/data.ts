import { inboxClient } from "@/lib/inbox";
import { getStripe } from "@/lib/stripe";
import type { IncomeStream } from "@/lib/dashboard/shared";
import Stripe from "stripe";

/* Everything the dashboard shows, one function per source. Each says whether its
   source is connected, so a missing key shows as a note instead of an error. */

export type Source<T> = { status: "ok" | "missing" | "error"; data: T; note?: string };

// A short reason to show on the dashboard (never a key: Stripe masks them)
function errorNote(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 140);
}

const KIT_INTEREST_TAGS = [
  { id: 25642835, label: "Episodes & news" },
  { id: 25642836, label: "Meetups & community" },
  { id: 25642837, label: "Back out there after divorce" },
];

// ---------- Studio inbox ----------

export type EmailSessionItem = {
  _id: string;
  status: string;
  name: string;
  email: string;
  story: string;
  submittedAt: string;
  paidAt?: string;
  amountPaid?: number;
};
export type BrandItem = {
  _id: string;
  status: string;
  name: string;
  email: string;
  collaborationType?: string;
  website?: string;
  budget?: string;
  message: string;
  submittedAt: string;
};
export type GuestItem = {
  _id: string;
  status: string;
  name: string;
  email: string;
  social?: string;
  expertise?: string;
  message: string;
  submittedAt: string;
};
export type IncomeEntry = { _id: string; stream: IncomeStream; amount: number; date: string; note?: string };

export type Inbox = {
  emails: EmailSessionItem[];
  brands: BrandItem[];
  guests: GuestItem[];
  income: IncomeEntry[];
};

export async function getInbox(): Promise<Source<Inbox>> {
  const empty: Inbox = { emails: [], brands: [], guests: [], income: [] };
  const client = inboxClient();
  if (!client) return { status: "missing", data: empty, note: "SANITY_WRITE_TOKEN" };
  try {
    const data = await client.fetch<Inbox>(
      `{
        "emails": *[_type == "emailSession" && status != "pending"] | order(coalesce(paidAt, submittedAt) desc)[0...200]{
          _id, status, name, email, story, submittedAt, paidAt, amountPaid
        },
        "brands": *[_type == "brandInquiry"] | order(submittedAt desc)[0...200]{
          _id, status, name, email, collaborationType, website, budget, message, submittedAt
        },
        "guests": *[_type == "guestApplication"] | order(submittedAt desc)[0...200]{
          _id, status, name, email, social, expertise, message, submittedAt
        },
        "income": *[_type == "incomeEntry"] | order(date desc)[0...500]{ _id, stream, amount, date, note }
      }`
    );
    return { status: "ok", data };
  } catch (error) {
    console.error("[dashboard] Studio inbox:", error);
    return { status: "error", data: empty };
  }
}

// ---------- Newsletter (Kit) ----------

export type Newsletter = {
  total: number;
  last30: { added: number; left: number };
  weeks: { start: string; added: number; left: number }[];
  interests: { label: string; count: number }[];
};

const emptyNewsletter: Newsletter = { total: 0, last30: { added: 0, left: 0 }, weeks: [], interests: [] };

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Throws "growth stats: 403 Forbidden"-style messages, so the dashboard can say what failed
async function kitGet<T>(path: string, apiKey: string, what: string): Promise<T> {
  const res = await fetch(`https://api.kit.com/v4/${path}`, {
    headers: { "X-Kit-Api-Key": apiKey, Accept: "application/json" },
    next: { revalidate: 1800 },
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = Array.isArray(body?.errors) ? String(body.errors[0]).slice(0, 80) : "";
    } catch {
      // No JSON body
    }
    throw new Error(`${what}: ${res.status}${detail ? ` ${detail}` : ""}`);
  }
  return res.json();
}

type KitGrowth = { stats: { new_subscribers: number; cancellations: number } };

export async function getNewsletter(): Promise<Source<Newsletter>> {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) return { status: "missing", data: emptyNewsletter, note: "KIT_API_KEY" };

  const today = new Date();
  // Twelve whole weeks, Monday to Sunday, ending with the current one
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  const weekStarts = Array.from({ length: 12 }, (_, i) => {
    const start = new Date(monday);
    start.setUTCDate(monday.getUTCDate() - (11 - i) * 7);
    return start;
  });
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30);

  // Each part loads on its own, so one failing request doesn't hide the rest
  const [active, last30, weeks, interests] = await Promise.allSettled([
    kitGet<{ pagination: { total_count: number } }>(
      "subscribers?status=active&include_total_count=true&per_page=1",
      apiKey,
      "subscriber count"
    ),
    kitGet<KitGrowth>(`account/growth_stats?starting=${isoDate(thirtyDaysAgo)}&ending=${isoDate(today)}`, apiKey, "growth stats"),
    Promise.all(
      weekStarts.map(async (start) => {
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        const { stats } = await kitGet<KitGrowth>(
          `account/growth_stats?starting=${isoDate(start)}&ending=${isoDate(end)}`,
          apiKey,
          "weekly growth"
        );
        return { start: isoDate(start), added: stats.new_subscribers, left: stats.cancellations };
      })
    ),
    Promise.all(
      KIT_INTEREST_TAGS.map(async ({ id, label }) => {
        const res = await kitGet<{ pagination: { total_count: number } }>(
          `tags/${id}/subscribers?include_total_count=true&per_page=1`,
          apiKey,
          "interest tags"
        );
        return { label, count: res.pagination.total_count };
      })
    ),
  ]);

  const failures = [active, last30, weeks, interests]
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => (result.reason instanceof Error ? result.reason.message : String(result.reason)));
  if (failures.length) console.error("[dashboard] Kit:", failures);

  const data: Newsletter = {
    total: active.status === "fulfilled" ? active.value.pagination.total_count : 0,
    last30:
      last30.status === "fulfilled"
        ? { added: last30.value.stats.new_subscribers, left: last30.value.stats.cancellations }
        : { added: 0, left: 0 },
    weeks: weeks.status === "fulfilled" ? weeks.value : [],
    interests: interests.status === "fulfilled" ? interests.value : [],
  };
  // Everything failed: an error. Some parts failed: show the rest and say what's missing.
  if (failures.length === 4) return { status: "error", data, note: failures.join("; ") };
  return { status: "ok", data, note: failures.length ? failures.join("; ") : undefined };
}

// ---------- Calls (Cal.com) ----------

export type Call = {
  uid: string;
  start: string;
  end: string;
  name: string;
  email: string;
  timeZone?: string;
  whatsGoingOn?: string;
  foundVia?: string;
  joinUrl?: string;
  manageUrl: string;
  status: string;
};

type CalBooking = {
  uid: string;
  start: string;
  end: string;
  status: string;
  attendees?: { name: string; email: string; timeZone?: string }[];
  meetingUrl?: string;
  location?: string;
  bookingFieldsResponses?: Record<string, unknown>;
};

async function calBookings(status: "upcoming" | "past", apiKey: string): Promise<CalBooking[]> {
  const res = await fetch(`https://api.cal.com/v2/bookings?status=${status}&take=100`, {
    headers: { Authorization: `Bearer ${apiKey}`, "cal-api-version": "2024-08-13" },
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error(`Cal.com ${status}: ${res.status}`);
  const body = await res.json();
  return body.data ?? [];
}

function toCall(booking: CalBooking): Call {
  const answers = booking.bookingFieldsResponses ?? {};
  const attendee = booking.attendees?.[0];
  const location = booking.location ?? "";
  return {
    uid: booking.uid,
    start: booking.start,
    end: booking.end,
    name: attendee?.name ?? String(answers.name ?? "Guest"),
    email: attendee?.email ?? String(answers.email ?? ""),
    timeZone: attendee?.timeZone,
    // "¿Qué está pasando?" is Cal.com's notes field, relabelled
    whatsGoingOn: typeof answers.notes === "string" ? answers.notes : undefined,
    foundVia: typeof answers["como-conociste"] === "string" ? (answers["como-conociste"] as string) : undefined,
    joinUrl: booking.meetingUrl || (location.startsWith("http") ? location : undefined),
    manageUrl: `https://app.cal.com/booking/${booking.uid}`,
    status: booking.status,
  };
}

export async function getCalls(): Promise<Source<{ upcoming: Call[]; past: Call[] }>> {
  const empty = { upcoming: [], past: [] };
  const apiKey = process.env.CAL_API_KEY;
  if (!apiKey) return { status: "missing", data: empty, note: "CAL_API_KEY" };
  try {
    const [upcoming, past] = await Promise.all([calBookings("upcoming", apiKey), calBookings("past", apiKey)]);
    return {
      status: "ok",
      data: {
        upcoming: upcoming.map(toCall).sort((a, b) => a.start.localeCompare(b.start)),
        past: past.map(toCall).sort((a, b) => b.start.localeCompare(a.start)),
      },
    };
  } catch (error) {
    console.error("[dashboard] Cal.com:", error);
    return { status: "error", data: empty, note: errorNote(error) };
  }
}

// ---------- Revenue (Stripe and Buy Me a Coffee) ----------

export type Payment = { date: string; amount: number; stream: IncomeStream };

/* Stripe charges from the last 13 months. A charge from the paid email carries the
   story's inbox id; Love Mode sells nothing else on Stripe, so the rest are calls
   booked through Cal.com. Refunds are taken off. Needs a key that can read charges
   (STRIPE_REPORTING_KEY), since the site's own key can only create checkouts. */
export async function getStripePayments(): Promise<Source<Payment[]>> {
  const key = process.env.STRIPE_REPORTING_KEY;
  const stripe = key ? new Stripe(key) : process.env.NODE_ENV === "development" ? getStripe() : null;
  if (!stripe) return { status: "missing", data: [], note: "STRIPE_REPORTING_KEY" };
  try {
    const since = new Date();
    since.setUTCMonth(since.getUTCMonth() - 13);
    const payments: Payment[] = [];
    for await (const charge of stripe.charges.list({ created: { gte: Math.floor(since.getTime() / 1000) }, limit: 100 })) {
      if (charge.status !== "succeeded" || !charge.paid || charge.currency !== "usd") continue;
      const amount = (charge.amount - charge.amount_refunded) / 100;
      if (amount <= 0) continue;
      payments.push({
        date: new Date(charge.created * 1000).toISOString(),
        amount,
        stream: charge.metadata?.inboxId ? "email" : "calls",
      });
    }
    return { status: "ok", data: payments };
  } catch (error) {
    console.error("[dashboard] Stripe:", error);
    return { status: "error", data: [], note: errorNote(error) };
  }
}

type CoffeeSupporter = { support_coffees: number; support_coffee_price: string; support_created_on: string };

// Buy Me a Coffee supporters, when BMC_ACCESS_TOKEN is set; otherwise coffee is entered by hand
export async function getCoffeePayments(): Promise<Source<Payment[]>> {
  const token = process.env.BMC_ACCESS_TOKEN;
  if (!token) return { status: "missing", data: [], note: "BMC_ACCESS_TOKEN" };
  try {
    const payments: Payment[] = [];
    let url: string | null = "https://developers.buymeacoffee.com/api/v1/supporters";
    for (let page = 0; url && page < 20; page++) {
      const res: Response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 1800 } });
      if (!res.ok) throw new Error(`Buy Me a Coffee: ${res.status}`);
      const body: { data?: CoffeeSupporter[]; next_page_url?: string | null } = await res.json();
      for (const supporter of body.data ?? []) {
        payments.push({
          date: new Date(supporter.support_created_on).toISOString(),
          amount: supporter.support_coffees * Number(supporter.support_coffee_price),
          stream: "coffee",
        });
      }
      url = body.next_page_url ?? null;
    }
    return { status: "ok", data: payments };
  } catch (error) {
    console.error("[dashboard] Buy Me a Coffee:", error);
    return { status: "error", data: [], note: errorNote(error) };
  }
}
