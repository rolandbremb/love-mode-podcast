import type { Call, Inbox, Newsletter, Payment } from "@/lib/dashboard/data";
import { INCOME_STREAMS, type IncomeStream } from "@/lib/dashboard/shared";

// Andrea is in Miami: the dashboard's days and times are Miami time
export const DASHBOARD_TIME_ZONE = "America/New_York";

// "2026-11-10" for a moment, in Miami time
export function dayKey(date: Date | string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: DASHBOARD_TIME_ZONE }).format(new Date(date));
}

export function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: DASHBOARD_TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(
    new Date(date)
  );
}

export function formatDay(date: Date | string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { timeZone: DASHBOARD_TIME_ZONE, ...opts }).format(new Date(date));
}

export function formatMoney(amount: number, cents = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents ? 2 : 0,
    minimumFractionDigits: cents ? 2 : 0,
  }).format(amount);
}

// ---------- Revenue ----------

export type RevenueMonth = { month: string; label: string; total: number; byStream: Record<IncomeStream, number> };

function emptyStreams(): Record<IncomeStream, number> {
  return Object.fromEntries(INCOME_STREAMS.map((stream) => [stream.value, 0])) as Record<IncomeStream, number>;
}

// The last twelve months, oldest first, each split by income stream
export function revenueByMonth(payments: Payment[], now = new Date()): RevenueMonth[] {
  const months: RevenueMonth[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - i), 15));
    return {
      month: date.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date),
      total: 0,
      byStream: emptyStreams(),
    };
  });
  for (const payment of payments) {
    const month = months.find((m) => m.month === dayKey(payment.date).slice(0, 7));
    if (!month) continue;
    month.byStream[payment.stream] += payment.amount;
    month.total += payment.amount;
  }
  return months;
}

export function revenueTotals(payments: Payment[], now = new Date()) {
  const thisMonth = dayKey(now).slice(0, 7);
  const lastMonthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15));
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);
  const thisYear = dayKey(now).slice(0, 4);
  const byStreamYear = emptyStreams();
  let month = 0;
  let previous = 0;
  let year = 0;
  for (const payment of payments) {
    const key = dayKey(payment.date);
    if (key.startsWith(thisMonth)) month += payment.amount;
    if (key.startsWith(lastMonth)) previous += payment.amount;
    if (key.startsWith(thisYear)) {
      year += payment.amount;
      byStreamYear[payment.stream] += payment.amount;
    }
  }
  return { month, previous, year, byStreamYear };
}

// ---------- Sample data, only where unfinished sections show ----------

function daysFromNow(days: number, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const SAMPLE_NEWSLETTER: Newsletter = {
  total: 1284,
  last30: { added: 142, left: 18 },
  weeks: Array.from({ length: 12 }, (_, i) => ({
    start: daysFromNow(-7 * (11 - i)).slice(0, 10),
    added: [22, 18, 31, 27, 24, 40, 35, 29, 44, 38, 51, 33][i],
    left: [3, 5, 2, 4, 6, 3, 4, 7, 3, 5, 4, 2][i],
  })),
  interests: [
    { label: "Episodes & news", count: 1102 },
    { label: "Meetups & community", count: 431 },
    { label: "Back out there after divorce", count: 268 },
  ],
};

export const SAMPLE_CALLS: { upcoming: Call[]; past: Call[] } = {
  upcoming: [
    {
      uid: "sample-1",
      start: daysFromNow(0, 17, 30),
      end: daysFromNow(0, 18, 0),
      name: "Sample: Laura M.",
      email: "laura@example.com",
      timeZone: "America/Bogota",
      whatsGoingOn: "Sample: We broke up two months ago and he keeps writing to me. I don't know whether to answer.",
      foundVia: "Instagram",
      joinUrl: "#",
      manageUrl: "#",
      status: "accepted",
    },
    {
      uid: "sample-2",
      start: daysFromNow(3, 11, 0),
      end: daysFromNow(3, 11, 30),
      name: "Sample: Camila R.",
      email: "camila@example.com",
      timeZone: "America/Mexico_City",
      whatsGoingOn: "Sample: Starting to date again after my divorce and feeling lost on the apps.",
      foundVia: "YouTube",
      joinUrl: "#",
      manageUrl: "#",
      status: "accepted",
    },
  ],
  past: [],
};

export const SAMPLE_INBOX: Inbox = {
  emails: [
    {
      _id: "sample-email-1",
      status: "paid",
      name: "Sample: Daniela P.",
      email: "daniela@example.com",
      story: "Sample: I've been in a situationship for a year and I want more, but I'm afraid of losing him if I say it.",
      submittedAt: daysFromNow(-2),
      paidAt: daysFromNow(-2, 9),
      amountPaid: 35,
    },
    {
      _id: "sample-email-2",
      status: "answered",
      name: "Sample: Ana G.",
      email: "ana@example.com",
      story: "Sample: How do I know if I'm ready to date again?",
      submittedAt: daysFromNow(-9),
      paidAt: daysFromNow(-9, 15),
      amountPaid: 35,
    },
  ],
  brands: [
    {
      _id: "sample-brand-1",
      status: "new",
      name: "Sample: Café Aurora",
      email: "hola@example.com",
      collaborationType: "Podcast sponsorship",
      website: "https://example.com",
      budget: "$500 - $2,000",
      message: "Sample: We'd love a host-read integration for our new single-origin coffee in December.",
      submittedAt: daysFromNow(-1),
    },
  ],
  guests: [
    {
      _id: "sample-guest-1",
      status: "new",
      name: "Sample: Dra. Lucía Torres",
      email: "lucia@example.com",
      social: "@example",
      expertise: "Attachment styles",
      message: "Sample: Psychologist specialised in attachment; I'd love to talk about anxious attachment in dating.",
      submittedAt: daysFromNow(-4),
    },
  ],
  income: [],
};

export function samplePayments(): Payment[] {
  const payments: Payment[] = [];
  for (let i = 0; i < 12; i++) {
    const date = (day: number) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - i, day)).toISOString();
    const growth = 12 - i;
    for (let n = 0; n < Math.max(0, growth - 4); n++) payments.push({ date: date(3 + n), amount: 35, stream: "email" });
    for (let n = 0; n < Math.max(0, Math.floor(growth / 3)); n++) payments.push({ date: date(8 + n), amount: 65, stream: "calls" });
    payments.push({ date: date(12), amount: 15 + growth * 5, stream: "coffee" });
    if (i % 3 === 0) payments.push({ date: date(20), amount: 600, stream: "brandDeal" });
    payments.push({ date: date(25), amount: 20 + growth * 3, stream: "affiliate" });
    if (i % 2 === 0) payments.push({ date: date(27), amount: 40 + growth * 4, stream: "payout" });
  }
  return payments;
}
