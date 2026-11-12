import { Suspense } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { SectionSkeleton } from "@/components/dashboard/ui";
import { requireSignIn } from "@/lib/dashboard/auth";
import { dayKey, formatDay } from "@/lib/dashboard/summary";
import { PlannerWeekSection } from "./planner-week";
import {
  BrandsSection,
  CalendarSection,
  ConnectionsFooter,
  GuestsSection,
  NewsletterSection,
  RevenueSection,
  SessionsSection,
  TodaySection,
} from "./sections";

export const dynamic = "force-dynamic";

const NAV = [
  ["Today", "#today"],
  ["This week", "#planner"],
  ["Coming up", "#calendar"],
  ["Sessions", "#sessions"],
  ["Newsletter", "#newsletter"],
  ["Revenue", "#revenue"],
  ["Brands", "#brands"],
  ["Guests", "#guests"],
] as const;

/* Andrea's dashboard. Each section streams in as soon as its data is ready, so a slow
   service (Stripe, Kit) never holds up today's emails and calls. */
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  await requireSignIn();
  const { month: monthParam } = await searchParams;
  const month = monthParam && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam) ? monthParam : dayKey(new Date()).slice(0, 7);

  return (
    <>
      <DashboardNav current="/dashboard" sections={NAV} />

      <main className="mx-auto flex max-w-[78rem] flex-col gap-14 px-4 pb-24 pt-8 sm:gap-16 sm:px-8">
        <header>
          <p className="text-[0.9375rem] font-semibold text-mauve">{formatDay(new Date(), { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="text-balance font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-none">Love Mode dashboard</h1>
        </header>

        <Suspense fallback={<SectionSkeleton id="today" title="Today" height="h-44" />}>
          <TodaySection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton id="planner" title="This week in the planner" height="h-44" />}>
          <PlannerWeekSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton id="calendar" title="Coming up" height="h-80" />}>
          <CalendarSection month={month} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton id="sessions" title="Paid sessions" />}>
          <SessionsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton id="newsletter" title="Newsletter" height="h-72" />}>
          <NewsletterSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton id="revenue" title="Revenue" height="h-96" />}>
          <RevenueSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton id="brands" title="Brand inquiries" height="h-32" />}>
          <BrandsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton id="guests" title="Guest applications" height="h-32" />}>
          <GuestsSection />
        </Suspense>
        <Suspense fallback={null}>
          <ConnectionsFooter />
        </Suspense>
      </main>
    </>
  );
}
