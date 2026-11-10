import Link from "next/link";
import AddIncomeForm from "@/components/dashboard/AddIncomeForm";
import { GrowthChart, RevenueChart } from "@/components/dashboard/Charts";
import StatusSelect from "@/components/dashboard/StatusSelect";
import { signOut } from "@/lib/dashboard/actions";
import { requireSignIn } from "@/lib/dashboard/auth";
import {
  getCalls,
  getCoffeePayments,
  getInbox,
  getNewsletter,
  getStripePayments,
  type Call,
  type EmailSessionItem,
  type Payment,
} from "@/lib/dashboard/data";
import { INCOME_STREAMS } from "@/lib/dashboard/shared";
import {
  SAMPLE_CALLS,
  SAMPLE_INBOX,
  SAMPLE_NEWSLETTER,
  dayKey,
  formatDay,
  formatMoney,
  formatTime,
  revenueByMonth,
  revenueTotals,
  samplePayments,
} from "@/lib/dashboard/summary";
import { replyDeadline } from "@/lib/emailSession";
import { showUpcoming } from "@/lib/socialProof";

export const dynamic = "force-dynamic";

// ---------- Small building blocks ----------

function Section({ id, title, note, children }: { id: string; title: string; note?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="font-display text-[2rem] leading-tight">{title}</h2>
        {note}
      </div>
      {children}
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-md bg-white p-6 shadow-postal ${className}`}>{children}</div>;
}

function SourceNote({ status, envName, sample, detail }: { status: string; envName?: string; sample: boolean; detail?: string }) {
  if (sample) {
    return <span className="rounded-full bg-plum px-3 py-1 text-xs font-semibold text-shell">Sample data until {envName} is set</span>;
  }
  if (status === "missing") {
    return <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold">Not connected: add {envName} in Vercel</span>;
  }
  if (status === "error") {
    return <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold">Couldn&apos;t load{detail ? `: ${detail}` : " right now"}</span>;
  }
  // Loaded, but some parts failed
  if (detail) {
    return <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold">Partly loaded: {detail}</span>;
  }
  return null;
}

// "Overdue", "Due today", "Due tomorrow" or the date, for a reply deadline
function dueLabel(deadline: Date, today: string) {
  const key = dayKey(deadline);
  if (key < today) return { text: "Overdue", urgent: true };
  if (key === today) return { text: "Due today", urgent: true };
  const tomorrow = dayKey(new Date(Date.now() + 86_400_000));
  if (key === tomorrow) return { text: "Due tomorrow", urgent: true };
  return { text: `Due ${formatDay(deadline)}`, urgent: false };
}

function DuePill({ deadline, today }: { deadline: Date; today: string }) {
  const due = dueLabel(deadline, today);
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        due.urgent ? "bg-tangerine text-plum" : "bg-shell text-plum/80"
      }`}
    >
      {due.text}
    </span>
  );
}

function JoinButton({ call }: { call: Call }) {
  if (!call.joinUrl) return null;
  return (
    <a href={call.joinUrl} target="_blank" rel="noopener noreferrer" className="btn-tangerine shrink-0 whitespace-nowrap !px-4 !py-1.5 !text-sm">
      Join call
    </a>
  );
}

// ---------- Calendar ----------

type CalendarEvent = { day: string; time?: string; label: string; kind: "call" | "reply" };

function MonthCalendar({ month, events, today }: { month: string; events: CalendarEvent[]; today: string }) {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7; // weeks start on Monday
  const cells = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];
  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
    return d.toISOString().slice(0, 7);
  };
  const title = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl">{title}</p>
        <div className="flex gap-2 text-sm font-semibold">
          <Link href={`/dashboard?month=${shift(-1)}#calendar`} aria-label="Previous month" className="rounded-full border-[1.5px] border-plum/20 px-3 py-1">
            ←
          </Link>
          <Link href="/dashboard#calendar" className="rounded-full border-[1.5px] border-plum/20 px-3 py-1">
            Today
          </Link>
          <Link href={`/dashboard?month=${shift(1)}#calendar`} aria-label="Next month" className="rounded-full border-[1.5px] border-plum/20 px-3 py-1">
            →
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-plum/60">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d} className="px-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) =>
          day ? (
            <div
              key={day}
              className={`flex min-h-[5.5rem] flex-col gap-1 rounded-lg p-1.5 ${day === today ? "bg-bubblegum/60 ring-2 ring-plum" : "bg-shell/70"}`}
            >
              <span className="text-xs font-semibold">{Number(day.slice(8))}</span>
              {events
                .filter((e) => e.day === day)
                .slice(0, 3)
                .map((e, j) => (
                  <span
                    key={j}
                    className={`truncate rounded px-1 py-0.5 text-[0.6875rem] leading-tight ${
                      e.kind === "call" ? "bg-plum text-shell" : "bg-white text-plum ring-1 ring-plum/20"
                    }`}
                    title={`${e.time ? `${e.time} ` : ""}${e.label}`}
                  >
                    {e.time ? `${e.time} ` : ""}
                    {e.label}
                  </span>
                ))}
            </div>
          ) : (
            <div key={`blank-${i}`} />
          )
        )}
      </div>
      <p className="flex flex-wrap gap-4 text-xs text-plum/70">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-plum" aria-hidden="true" /> Call
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-white ring-1 ring-plum/30" aria-hidden="true" /> Email reply due
        </span>
        <span>Times are Miami time</span>
      </p>
    </Card>
  );
}

// ---------- The page ----------

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  await requireSignIn();
  const { month: monthParam } = await searchParams;

  const [inboxSource, newsletterSource, callsSource, stripeSource, coffeeSource] = await Promise.all([
    getInbox(),
    getNewsletter(),
    getCalls(),
    getStripePayments(),
    getCoffeePayments(),
  ]);

  // Locally, missing sources show labelled samples so the layout can be reviewed
  const inboxEmpty =
    inboxSource.data.emails.length + inboxSource.data.brands.length + inboxSource.data.guests.length === 0;
  const inboxSample = showUpcoming && inboxEmpty;
  const inbox = inboxSample ? { ...SAMPLE_INBOX, income: inboxSource.data.income } : inboxSource.data;
  const newsletterSample = showUpcoming && newsletterSource.status !== "ok";
  const newsletter = newsletterSample ? SAMPLE_NEWSLETTER : newsletterSource.data;
  const callsSample = showUpcoming && callsSource.status !== "ok";
  const calls = callsSample ? SAMPLE_CALLS : callsSource.data;

  const manualPayments: Payment[] = inbox.income
    // Once Buy Me a Coffee is connected, its supporters come from there instead
    .filter((entry) => !(coffeeSource.status === "ok" && entry.stream === "coffee"))
    .map((entry) => ({ date: `${entry.date}T12:00:00Z`, amount: entry.amount, stream: entry.stream }));
  const realPayments = [...stripeSource.data, ...coffeeSource.data, ...manualPayments];
  const revenueSample = showUpcoming && realPayments.length === 0;
  const payments = revenueSample ? samplePayments() : realPayments;
  const months = revenueByMonth(payments);
  const totals = revenueTotals(payments);

  const today = dayKey(new Date());
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : today.slice(0, 7);

  // Paid emails waiting for an answer, soonest deadline first
  const toAnswer = inbox.emails
    .filter((e) => e.status === "paid")
    .map((e) => ({ ...e, deadline: replyDeadline(e.paidAt ?? e.submittedAt) }))
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  const callsToday = calls.upcoming.filter((c) => dayKey(c.start) === today);
  const newBrands = inbox.brands.filter((b) => b.status === "new");
  const newGuests = inbox.guests.filter((g) => g.status === "new");

  const events: CalendarEvent[] = [
    ...[...calls.upcoming, ...calls.past].map((c) => ({
      day: dayKey(c.start),
      time: formatTime(c.start),
      label: c.name,
      kind: "call" as const,
    })),
    ...toAnswer.map((e) => ({ day: dayKey(e.deadline), label: `Reply: ${e.name}`, kind: "reply" as const })),
  ];
  // Coming up: the next two weeks of calls and reply deadlines
  const inTwoWeeks = dayKey(new Date(Date.now() + 14 * 86_400_000));
  const comingUp = [
    ...calls.upcoming.map((c) => ({ at: c.start, kind: "call" as const, call: c })),
    ...toAnswer.map((e) => ({ at: e.deadline.toISOString(), kind: "reply" as const, email: e })),
  ]
    .filter((item) => dayKey(item.at) <= inTwoWeeks)
    .sort((a, b) => a.at.localeCompare(b.at));

  const trend = totals.previous > 0 ? Math.round(((totals.month - totals.previous) / totals.previous) * 100) : null;
  const streamLabel = Object.fromEntries(INCOME_STREAMS.map((s) => [s.value, s.label]));

  return (
    <div className="mx-auto flex max-w-[78rem] flex-col gap-16 px-4 pb-24 pt-8 sm:px-8">
      {/* ===== HEADER ===== */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.9375rem] font-semibold text-mauve">{formatDay(new Date(), { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-none">Love Mode dashboard</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
          {[
            ["Calendar", "#calendar"],
            ["Sessions", "#sessions"],
            ["Newsletter", "#newsletter"],
            ["Revenue", "#revenue"],
            ["Brands", "#brands"],
            ["Guests", "#guests"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="underline decoration-plum/30 underline-offset-4 hover:decoration-plum">
              {label}
            </a>
          ))}
          <a href="/studio" className="underline decoration-plum/30 underline-offset-4 hover:decoration-plum">
            Studio
          </a>
          <form action={signOut}>
            <button type="submit" className="rounded-full border-[1.5px] border-plum/25 px-3 py-1">
              Sign out
            </button>
          </form>
        </nav>
      </header>

      {/* ===== TODAY ===== */}
      <Section id="today" title="Today">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-mauve">Emails to answer</p>
            <p className="font-display text-5xl leading-none">{toAnswer.length}</p>
            <ul className="flex flex-col gap-2 text-[0.9375rem]">
              {toAnswer.slice(0, 3).map((e) => (
                <li key={e._id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{e.name}</span>
                  <DuePill deadline={e.deadline} today={today} />
                </li>
              ))}
              {toAnswer.length === 0 && <li className="text-mauve">All answered.</li>}
            </ul>
          </Card>
          <Card className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-mauve">Calls today</p>
            <p className="font-display text-5xl leading-none">{callsToday.length}</p>
            <ul className="flex flex-col gap-2 text-[0.9375rem]">
              {callsToday.map((c) => (
                <li key={c.uid} className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    <span className="font-semibold">{formatTime(c.start)}</span> {c.name}
                  </span>
                  <JoinButton call={c} />
                </li>
              ))}
              {callsToday.length === 0 && (
                <li className="text-mauve">
                  {calls.upcoming[0] ? `Next: ${formatDay(calls.upcoming[0].start)}, ${formatTime(calls.upcoming[0].start)}` : "No calls booked."}
                </li>
              )}
            </ul>
          </Card>
          <Card className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-mauve">New brand inquiries</p>
            <p className="font-display text-5xl leading-none">{newBrands.length}</p>
            <ul className="flex flex-col gap-2 text-[0.9375rem]">
              {newBrands.slice(0, 3).map((b) => (
                <li key={b._id} className="truncate">
                  {b.name} <span className="text-mauve">{b.budget ? `, ${b.budget}` : ""}</span>
                </li>
              ))}
              {newBrands.length === 0 && <li className="text-mauve">Nothing new.</li>}
            </ul>
          </Card>
          <Card className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-mauve">New guest applications</p>
            <p className="font-display text-5xl leading-none">{newGuests.length}</p>
            <ul className="flex flex-col gap-2 text-[0.9375rem]">
              {newGuests.slice(0, 3).map((g) => (
                <li key={g._id} className="truncate">
                  {g.name} <span className="text-mauve">{g.expertise ? `, ${g.expertise}` : ""}</span>
                </li>
              ))}
              {newGuests.length === 0 && <li className="text-mauve">Nothing new.</li>}
            </ul>
          </Card>
        </div>
      </Section>

      {/* ===== CALENDAR AND WHAT'S COMING UP ===== */}
      <Section id="calendar" title="Calendar" note={<SourceNote status={callsSource.status} envName="CAL_API_KEY" sample={callsSample} detail={callsSource.status === "error" ? callsSource.note : undefined} />}>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <MonthCalendar month={month} events={events} today={today} />
          <Card className="flex flex-col gap-4">
            <p className="font-display text-2xl">Coming up</p>
            <ul className="flex flex-col divide-y divide-plum/10">
              {comingUp.map((item) =>
                item.kind === "call" ? (
                  <li key={item.call.uid} className="flex flex-col gap-1.5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">
                        {formatDay(item.call.start)}, {formatTime(item.call.start)}
                      </span>
                      <JoinButton call={item.call} />
                    </div>
                    <span>Call with {item.call.name}</span>
                  </li>
                ) : (
                  <li key={item.email._id} className="flex flex-col gap-1.5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{formatDay(item.at)}</span>
                      <DuePill deadline={item.email.deadline} today={today} />
                    </div>
                    <span>Reply to {item.email.name}</span>
                  </li>
                )
              )}
              {comingUp.length === 0 && <li className="py-3 text-mauve">Nothing in the next two weeks.</li>}
            </ul>
          </Card>
        </div>
      </Section>

      {/* ===== PAID SESSIONS ===== */}
      <Section
        id="sessions"
        title="Paid sessions"
        note={<SourceNote status={inboxSource.status} envName="SANITY_WRITE_TOKEN" sample={inboxSample} />}
      >
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl">Emails</p>
              <span className="text-sm text-mauve">{inbox.emails.length} paid in total</span>
            </div>
            <ul className="flex flex-col divide-y divide-plum/10">
              {inbox.emails.slice(0, 20).map((e: EmailSessionItem) => (
                <li key={e._id} className="flex flex-col gap-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{e.name}</span>
                    <div className="flex items-center gap-2">
                      {e.status === "paid" && <DuePill deadline={replyDeadline(e.paidAt ?? e.submittedAt)} today={today} />}
                      <StatusSelect type="emailSession" id={e._id} status={e.status} label={`Status for ${e.name}`} disabled={inboxSample} />
                    </div>
                  </div>
                  <details className="text-[0.9375rem]">
                    <summary className="cursor-pointer text-mauve">
                      Paid {formatDay(e.paidAt ?? e.submittedAt)}: read their story
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{e.story}</p>
                    <a href={`mailto:${e.email}`} className="mt-2 inline-block font-semibold underline underline-offset-4">
                      Reply to {e.email}
                    </a>
                  </details>
                </li>
              ))}
              {inbox.emails.length === 0 && <li className="py-3 text-mauve">No paid emails yet.</li>}
            </ul>
          </Card>
          <Card className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl">Calls</p>
              <span className="text-sm text-mauve">
                {calls.upcoming.length} upcoming, {calls.past.length} past
              </span>
            </div>
            <ul className="flex flex-col divide-y divide-plum/10">
              {calls.upcoming.slice(0, 20).map((c) => (
                <li key={c.uid} className="flex flex-col gap-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-mauve">
                        , {formatDay(c.start)} at {formatTime(c.start)}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <JoinButton call={c} />
                      <a href={c.manageUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline underline-offset-4">
                        Manage
                      </a>
                    </div>
                  </div>
                  {(c.whatsGoingOn || c.foundVia) && (
                    <details className="text-[0.9375rem]">
                      <summary className="cursor-pointer text-mauve">What&apos;s going on</summary>
                      {c.whatsGoingOn && <p className="mt-2 whitespace-pre-wrap leading-relaxed">{c.whatsGoingOn}</p>}
                      {c.foundVia && <p className="mt-2 text-mauve">Found Love Mode via {c.foundVia}</p>}
                      {c.timeZone && <p className="text-mauve">Their time zone: {c.timeZone}</p>}
                    </details>
                  )}
                </li>
              ))}
              {calls.upcoming.length === 0 && <li className="py-3 text-mauve">No upcoming calls.</li>}
            </ul>
          </Card>
        </div>
      </Section>

      {/* ===== NEWSLETTER ===== */}
      <Section id="newsletter" title="Newsletter" note={<SourceNote status={newsletterSource.status} envName="KIT_API_KEY" sample={newsletterSample} detail={newsletterSource.note} />}>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Card className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold text-mauve">Active subscribers</p>
              <p className="font-display text-6xl leading-none">{newsletter.total.toLocaleString("en-US")}</p>
              <p className="mt-2 text-[0.9375rem] text-mauve">
                Last 30 days: <span className="font-semibold text-plum">+{newsletter.last30.added}</span> new,{" "}
                <span className="font-semibold text-plum">−{newsletter.last30.left}</span> unsubscribed
              </p>
            </div>
            <div className="flex flex-col gap-3 border-t-[1.5px] border-plum/10 pt-5">
              <p className="text-sm font-semibold text-mauve">What they signed up for</p>
              {newsletter.interests.map((interest) => (
                <div key={interest.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[0.9375rem]">
                    <span>{interest.label}</span>
                    <span className="tabular-nums">{interest.count.toLocaleString("en-US")}</span>
                  </div>
                  <span className="h-2 rounded-full bg-shell">
                    <span
                      className="block h-2 rounded-full bg-[#2a78d6]"
                      style={{ width: `${newsletter.total ? Math.min(100, (interest.count / newsletter.total) * 100) : 0}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col gap-4">
            <p className="font-display text-2xl">Weekly growth, last 12 weeks</p>
            {newsletter.weeks.length > 0 ? <GrowthChart weeks={newsletter.weeks} /> : <p className="text-mauve">No data yet.</p>}
          </Card>
        </div>
      </Section>

      {/* ===== REVENUE ===== */}
      <Section
        id="revenue"
        title="Revenue"
        note={
          <span className="flex flex-wrap gap-2">
            {revenueSample && <SourceNote status="ok" envName="STRIPE_REPORTING_KEY" sample />}
            {!revenueSample && (
              <SourceNote
                status={stripeSource.status}
                envName="STRIPE_REPORTING_KEY"
                sample={false}
                detail={stripeSource.status === "error" ? stripeSource.note : undefined}
              />
            )}
            {!revenueSample && coffeeSource.status !== "ok" && (
              <span className="rounded-full bg-shell px-3 py-1 text-xs font-semibold text-plum/80">Coffee entered by hand</span>
            )}
          </span>
        }
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Card>
            <p className="text-sm font-semibold text-mauve">This month</p>
            <p className="font-display text-5xl leading-none">{formatMoney(totals.month)}</p>
            {trend !== null && (
              <p className="mt-2 text-[0.9375rem] text-mauve">
                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
              </p>
            )}
          </Card>
          <Card>
            <p className="text-sm font-semibold text-mauve">Last month</p>
            <p className="font-display text-5xl leading-none">{formatMoney(totals.previous)}</p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-mauve">This year</p>
            <p className="font-display text-5xl leading-none">{formatMoney(totals.year)}</p>
          </Card>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="flex flex-col gap-4">
            <p className="font-display text-2xl">By month and income stream</p>
            <RevenueChart months={months} streams={INCOME_STREAMS} />
            <table className="mt-2 w-full text-[0.9375rem]">
              <caption className="sr-only">Revenue by income stream</caption>
              <thead>
                <tr className="border-b border-plum/10 text-left text-sm text-mauve">
                  <th className="py-2 font-semibold">Stream</th>
                  <th className="py-2 text-right font-semibold">This month</th>
                  <th className="py-2 text-right font-semibold">This year</th>
                </tr>
              </thead>
              <tbody>
                {INCOME_STREAMS.map((stream) => (
                  <tr key={stream.value} className="border-b border-plum/5">
                    <td className="flex items-center gap-2 py-2">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: stream.color }} aria-hidden="true" />
                      {stream.label}
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatMoney(months[months.length - 1].byStream[stream.value])}</td>
                    <td className="py-2 text-right tabular-nums">{formatMoney(totals.byStreamYear[stream.value])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="flex flex-col gap-6">
            <AddIncomeForm today={today} disabled={inboxSource.status !== "ok"} />
            <div className="flex flex-col gap-2 border-t-[1.5px] border-plum/10 pt-5">
              <p className="text-sm font-semibold text-mauve">Recently added by hand</p>
              <ul className="flex flex-col gap-1.5 text-[0.9375rem]">
                {inbox.income.slice(0, 6).map((entry) => (
                  <li key={entry._id} className="flex justify-between gap-3">
                    <span className="truncate">
                      {streamLabel[entry.stream]}
                      {entry.note ? <span className="text-mauve">, {entry.note}</span> : null}
                    </span>
                    <span className="tabular-nums">{formatMoney(entry.amount, true)}</span>
                  </li>
                ))}
                {inbox.income.length === 0 && <li className="text-mauve">Nothing yet.</li>}
              </ul>
            </div>
          </Card>
        </div>
      </Section>

      {/* ===== BRAND INQUIRIES ===== */}
      <Section id="brands" title="Brand inquiries" note={<span className="text-sm text-mauve">{inbox.brands.length} in total</span>}>
        <Card>
          <ul className="flex flex-col divide-y divide-plum/10">
            {inbox.brands.slice(0, 30).map((b) => (
              <li key={b._id} className="flex flex-col gap-2 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="font-semibold">{b.name}</span>
                    <span className="text-mauve">
                      {[b.collaborationType, b.budget, formatDay(b.submittedAt)].filter(Boolean).map((part) => `, ${part}`)}
                    </span>
                  </span>
                  <StatusSelect type="brandInquiry" id={b._id} status={b.status} label={`Status for ${b.name}`} disabled={inboxSample} />
                </div>
                <details className="text-[0.9375rem]">
                  <summary className="cursor-pointer text-mauve">Their idea</summary>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed">{b.message}</p>
                  <p className="mt-2 flex flex-wrap gap-4">
                    <a href={`mailto:${b.email}`} className="font-semibold underline underline-offset-4">
                      Reply to {b.email}
                    </a>
                    {b.website && (
                      <a href={b.website.startsWith("http") ? b.website : `https://${b.website}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                        Their website
                      </a>
                    )}
                  </p>
                </details>
              </li>
            ))}
            {inbox.brands.length === 0 && <li className="py-3 text-mauve">No brand inquiries yet.</li>}
          </ul>
        </Card>
      </Section>

      {/* ===== GUEST APPLICATIONS ===== */}
      <Section id="guests" title="Guest applications" note={<span className="text-sm text-mauve">{inbox.guests.length} in total</span>}>
        <Card>
          <ul className="flex flex-col divide-y divide-plum/10">
            {inbox.guests.slice(0, 30).map((g) => (
              <li key={g._id} className="flex flex-col gap-2 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="font-semibold">{g.name}</span>
                    <span className="text-mauve">{[g.expertise, formatDay(g.submittedAt)].filter(Boolean).map((part) => `, ${part}`)}</span>
                  </span>
                  <StatusSelect type="guestApplication" id={g._id} status={g.status} label={`Status for ${g.name}`} disabled={inboxSample} />
                </div>
                <details className="text-[0.9375rem]">
                  <summary className="cursor-pointer text-mauve">Why they&apos;d be a great guest</summary>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed">{g.message}</p>
                  <p className="mt-2 flex flex-wrap gap-4">
                    <a href={`mailto:${g.email}`} className="font-semibold underline underline-offset-4">
                      Reply to {g.email}
                    </a>
                    {g.social && <span className="text-mauve">{g.social}</span>}
                  </p>
                </details>
              </li>
            ))}
            {inbox.guests.length === 0 && <li className="py-3 text-mauve">No guest applications yet.</li>}
          </ul>
        </Card>
      </Section>

      {/* ===== CONNECTIONS ===== */}
      <footer className="flex flex-col gap-3 border-t-[1.5px] border-plum/10 pt-6 text-sm">
        <p className="font-semibold">Connections</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-mauve">
          {[
            { label: "Studio inbox", source: inboxSource, env: "SANITY_WRITE_TOKEN" },
            { label: "Kit newsletter", source: newsletterSource, env: "KIT_API_KEY" },
            { label: "Cal.com calls", source: callsSource, env: "CAL_API_KEY" },
            { label: "Stripe revenue", source: stripeSource, env: "STRIPE_REPORTING_KEY" },
            { label: "Buy Me a Coffee", source: coffeeSource, env: "BMC_ACCESS_TOKEN" },
          ].map(({ label, source, env }) => (
            <li key={label}>
              {label}:{" "}
              <span className="font-semibold text-plum">
                {source.status === "ok" ? (source.note ? "partly connected" : "connected") : source.status === "missing" ? `not connected (${env})` : "error"}
              </span>
              {source.note && source.status !== "missing" && <span> ({source.note})</span>}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
