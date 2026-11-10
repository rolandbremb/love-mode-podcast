import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  getCalls,
  getCoffeeConnection,
  getInbox,
  getNewsletter,
  getStripePayments,
  type Inbox,
  type Payment,
  type Source,
} from "@/lib/dashboard/data";
import {
  SAMPLE_CALLS,
  SAMPLE_INBOX,
  SAMPLE_NEWSLETTER,
  revenueByMonth,
  revenueTotals,
  samplePayments,
} from "@/lib/dashboard/summary";
import { replyDeadline } from "@/lib/emailSession";
import { showUpcoming } from "@/lib/socialProof";

/* Each dashboard section loads what it needs through these. React's cache() means a
   source is fetched once per page view however many sections use it, and each
   section streams in on its own instead of waiting for the slowest service.
   Locally, a source that isn't connected is replaced by labelled sample data. */

export const loadInbox = cache(async () => {
  const source = await getInbox();
  const empty = source.data.emails.length + source.data.brands.length + source.data.guests.length === 0;
  const sample = showUpcoming && empty;
  const data: Inbox = sample ? { ...SAMPLE_INBOX, income: source.data.income } : source.data;
  return { source, data, sample };
});

export const loadCalls = cache(async () => {
  const source = await getCalls();
  const sample = showUpcoming && source.status !== "ok";
  return { source, data: sample ? SAMPLE_CALLS : source.data, sample };
});

export const loadNewsletter = cache(async () => {
  const source = await getNewsletter();
  const sample = showUpcoming && source.status !== "ok";
  return { source, data: sample ? SAMPLE_NEWSLETTER : source.data, sample };
});

// Stripe pages through every charge, so its result is kept for ten minutes.
// Only successes are cached: a failure is retried on the next view.
const cachedStripePayments = unstable_cache(
  async () => {
    const result = await getStripePayments();
    if (result.status !== "ok") throw new Error(result.note ?? result.status);
    return result.data;
  },
  ["dashboard-stripe-payments"],
  { revalidate: 600 }
);

const loadStripe = cache(async (): Promise<Source<Payment[]>> => {
  const configured =
    Boolean(process.env.STRIPE_REPORTING_KEY) ||
    (process.env.NODE_ENV === "development" && Boolean(process.env.STRIPE_SECRET_KEY));
  if (!configured) return { status: "missing", data: [], note: "STRIPE_REPORTING_KEY" };
  try {
    return { status: "ok", data: await cachedStripePayments() };
  } catch (error) {
    return { status: "error", data: [], note: (error instanceof Error ? error.message : String(error)).slice(0, 140) };
  }
});

export const loadRevenue = cache(async () => {
  const [stripe, inbox] = await Promise.all([loadStripe(), loadInbox()]);
  const coffee = getCoffeeConnection();
  // Income entries: added by hand, plus Buy Me a Coffee payments saved by its webhook
  const income: Payment[] = inbox.data.income.map((entry) => ({
    date: `${entry.date}T12:00:00Z`,
    amount: entry.amount,
    stream: entry.stream,
  }));
  const real = [...stripe.data, ...income];
  const sample = showUpcoming && real.length === 0;
  const payments = sample ? samplePayments() : real;
  return { stripe, coffee, sample, months: revenueByMonth(payments), totals: revenueTotals(payments) };
});

// Paid emails still waiting for an answer, soonest deadline first
export async function loadEmailsToAnswer() {
  const inbox = await loadInbox();
  return inbox.data.emails
    .filter((email) => email.status === "paid")
    .map((email) => ({ ...email, deadline: replyDeadline(email.paidAt ?? email.submittedAt) }))
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
}
