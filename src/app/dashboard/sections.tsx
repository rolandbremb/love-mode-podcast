import Link from "next/link";
import AddIncomeForm from "@/components/dashboard/AddIncomeForm";
import { GrowthChart, RevenueChart } from "@/components/dashboard/Charts";
import StatusSelect from "@/components/dashboard/StatusSelect";
import { Card, Count, DuePill, JoinButton, Section, SourceNote, TextLink, pressable } from "@/components/dashboard/ui";
import { loadCalls, loadEmailsToAnswer, loadInbox, loadNewsletter, loadRevenue } from "@/lib/dashboard/load";
import { INCOME_STREAMS } from "@/lib/dashboard/shared";
import { dayKey, formatDay, formatMoney, formatTime, type RevenueMonth } from "@/lib/dashboard/summary";
import { replyDeadline } from "@/lib/emailSession";

/* The dashboard's sections. Each loads its own data, so the page can show each one as
   soon as it's ready (see the Suspense boundaries in page.tsx). */

const today = () => dayKey(new Date());

// ---------- Today ----------

export async function TodaySection() {
  const [toAnswer, calls, inbox] = await Promise.all([loadEmailsToAnswer(), loadCalls(), loadInbox()]);
  const now = today();
  const callsToday = calls.data.upcoming.filter((c) => dayKey(c.start) === now);
  const nextCall = calls.data.upcoming[0];
  const newBrands = inbox.data.brands.filter((b) => b.status === "new");
  const newGuests = inbox.data.guests.filter((g) => g.status === "new");

  return (
    <Section id="today" title="Today">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <Card className="col-span-2 flex flex-col gap-3 sm:col-span-1">
          <p className="text-sm font-semibold text-mauve">Emails to answer</p>
          <Count value={toAnswer.length} />
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            {toAnswer.slice(0, 3).map((e) => (
              <li key={e._id} className="flex items-center justify-between gap-2">
                <span className="truncate">{e.name}</span>
                <DuePill deadline={e.deadline} today={now} />
              </li>
            ))}
            {toAnswer.length === 0 && <li className="text-mauve">All answered.</li>}
          </ul>
        </Card>
        <Card className="col-span-2 flex flex-col gap-3 sm:col-span-1">
          <p className="text-sm font-semibold text-mauve">Calls today</p>
          <Count value={callsToday.length} />
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            {callsToday.map((c) => (
              <li key={c.uid} className="flex items-center justify-between gap-2">
                <span className="truncate">
                  <span className="font-semibold tabular-nums">{formatTime(c.start)}</span> {c.name}
                </span>
                <JoinButton call={c} />
              </li>
            ))}
            {callsToday.length === 0 && (
              <li className="text-pretty text-mauve">
                {nextCall ? `Next: ${formatDay(nextCall.start)}, ${formatTime(nextCall.start)}` : "No calls booked."}
              </li>
            )}
          </ul>
        </Card>
        <Card className="flex flex-col gap-3 !p-5 sm:!p-6">
          <p className="text-sm font-semibold text-mauve">New brand inquiries</p>
          <Count value={newBrands.length} />
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            {newBrands.slice(0, 3).map((b) => (
              <li key={b._id} className="truncate">
                {b.name}
              </li>
            ))}
            {newBrands.length === 0 && <li className="text-mauve">Nothing new.</li>}
          </ul>
        </Card>
        <Card className="flex flex-col gap-3 !p-5 sm:!p-6">
          <p className="text-sm font-semibold text-mauve">New guest applications</p>
          <Count value={newGuests.length} />
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            {newGuests.slice(0, 3).map((g) => (
              <li key={g._id} className="truncate">
                {g.name}
              </li>
            ))}
            {newGuests.length === 0 && <li className="text-mauve">Nothing new.</li>}
          </ul>
        </Card>
      </div>
    </Section>
  );
}

// ---------- Calendar and what's coming up ----------

type CalendarEvent = { day: string; time?: string; label: string; kind: "call" | "reply" };

function MonthCalendar({ month, events, now }: { month: string; events: CalendarEvent[]; now: string }) {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7; // weeks start on Monday
  const cells = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];
  const shift = (delta: number) => new Date(Date.UTC(year, monthIndex - 1 + delta, 1)).toISOString().slice(0, 7);
  const title = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const navClass = `inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border-[1.5px] border-plum/20 px-3 text-sm font-semibold hover:bg-shell ${pressable}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl">{title}</p>
        <div className="flex gap-2">
          <Link href={`/dashboard?month=${shift(-1)}#calendar`} aria-label="Previous month" className={navClass}>
            ←
          </Link>
          <Link href="/dashboard#calendar" className={navClass}>
            Today
          </Link>
          <Link href={`/dashboard?month=${shift(1)}#calendar`} aria-label="Next month" className={navClass}>
            →
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-plum/60" aria-hidden="true">
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
              className={`flex min-h-[5.5rem] flex-col gap-1 rounded-sm p-1.5 ${
                day === now ? "bg-bubblegum/60 shadow-[inset_0_0_0_2px_#2d1530]" : "bg-shell/70"
              }`}
            >
              <span className="text-xs font-semibold tabular-nums">{Number(day.slice(8))}</span>
              {events
                .filter((e) => e.day === day)
                .slice(0, 3)
                .map((e, j) => (
                  <span
                    key={j}
                    className={`truncate rounded-[2px] px-1 py-0.5 text-[0.6875rem] leading-tight ${
                      e.kind === "call" ? "bg-plum text-shell" : "bg-white text-plum shadow-[inset_0_0_0_1px_rgba(45,21,48,0.2)]"
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
          <span className="h-2.5 w-2.5 rounded-[2px] bg-plum" aria-hidden="true" /> Call
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-white shadow-[inset_0_0_0_1px_rgba(45,21,48,0.3)]" aria-hidden="true" /> Email
          reply due
        </span>
        <span>Times are Miami time</span>
      </p>
    </div>
  );
}

export async function CalendarSection({ month }: { month: string }) {
  const [calls, toAnswer] = await Promise.all([loadCalls(), loadEmailsToAnswer()]);
  const now = today();
  const events: CalendarEvent[] = [
    ...[...calls.data.upcoming, ...calls.data.past].map((c) => ({
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
    ...calls.data.upcoming.map((c) => ({ at: c.start, kind: "call" as const, call: c })),
    ...toAnswer.map((e) => ({ at: e.deadline.toISOString(), kind: "reply" as const, email: e })),
  ]
    .filter((item) => dayKey(item.at) <= inTwoWeeks)
    .sort((a, b) => a.at.localeCompare(b.at));

  return (
    <Section
      id="calendar"
      title="Coming up"
      note={<SourceNote status={calls.source.status} envName="CAL_API_KEY" sample={calls.sample} detail={calls.source.status === "error" ? calls.source.note : undefined} />}
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        {/* The next two weeks come first: on a phone they're what matters */}
        <Card className="flex flex-col gap-2">
          <p className="font-display text-2xl">Next two weeks</p>
          <ul className="flex flex-col divide-y divide-plum/10">
            {comingUp.map((item) =>
              item.kind === "call" ? (
                <li key={item.call.uid} className="flex flex-col gap-1.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold tabular-nums">
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
                    <DuePill deadline={item.email.deadline} today={now} />
                  </div>
                  <span>Reply to {item.email.name}</span>
                </li>
              )
            )}
            {comingUp.length === 0 && <li className="py-3 text-mauve">Nothing in the next two weeks.</li>}
          </ul>
        </Card>
        <Card>
          {/* The month grid is cramped on a phone, so there it's one tap away */}
          <details className="group md:hidden">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 font-semibold [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>Show the whole month</summary>
            <div className="mt-4">
              <MonthCalendar month={month} events={events} now={now} />
            </div>
          </details>
          <div className="hidden md:block">
            <MonthCalendar month={month} events={events} now={now} />
          </div>
        </Card>
      </div>
    </Section>
  );
}

// ---------- Paid sessions ----------

export async function SessionsSection() {
  const [inbox, calls] = await Promise.all([loadInbox(), loadCalls()]);
  const now = today();
  return (
    <Section id="sessions" title="Paid sessions" note={<SourceNote status={inbox.source.status} envName="SANITY_WRITE_TOKEN" sample={inbox.sample} />}>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-2xl">Emails</p>
            <span className="text-sm text-mauve">{inbox.data.emails.length} paid in total</span>
          </div>
          <ul className="flex flex-col divide-y divide-plum/10">
            {inbox.data.emails.slice(0, 20).map((e) => (
              <li key={e._id} className="flex flex-col gap-1 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{e.name}</span>
                  <div className="flex items-center gap-2">
                    {e.status === "paid" && <DuePill deadline={replyDeadline(e.paidAt ?? e.submittedAt)} today={now} />}
                    <StatusSelect type="emailSession" id={e._id} status={e.status} label={`Status for ${e.name}`} disabled={inbox.sample} />
                  </div>
                </div>
                <details className="group text-[0.9375rem]">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-mauve [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>
                    Paid {formatDay(e.paidAt ?? e.submittedAt)}: read their story
                  </summary>
                  <p className="text-pretty whitespace-pre-wrap leading-relaxed">{e.story}</p>
                  <TextLink href={`mailto:${e.email}`}>Reply to {e.email}</TextLink>
                </details>
              </li>
            ))}
            {inbox.data.emails.length === 0 && <li className="py-3 text-mauve">No paid emails yet.</li>}
          </ul>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-2xl">Calls</p>
            <span className="text-sm text-mauve">
              {calls.data.upcoming.length} upcoming, {calls.data.past.length} past
            </span>
          </div>
          <ul className="flex flex-col divide-y divide-plum/10">
            {calls.data.upcoming.slice(0, 20).map((c) => (
              <li key={c.uid} className="flex flex-col gap-1 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="font-semibold">{c.name}</span>
                    <span className="tabular-nums text-mauve">
                      , {formatDay(c.start)} at {formatTime(c.start)}
                    </span>
                  </span>
                  <div className="flex items-center gap-3">
                    <JoinButton call={c} />
                    <TextLink href={c.manageUrl} external>
                      Manage
                    </TextLink>
                  </div>
                </div>
                {(c.whatsGoingOn || c.foundVia) && (
                  <details className="group text-[0.9375rem]">
                    <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-mauve [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>What&apos;s going on</summary>
                    {c.whatsGoingOn && <p className="text-pretty whitespace-pre-wrap leading-relaxed">{c.whatsGoingOn}</p>}
                    {c.foundVia && <p className="mt-2 text-mauve">Found Love Mode via {c.foundVia}</p>}
                    {c.timeZone && <p className="text-mauve">Their time zone: {c.timeZone}</p>}
                  </details>
                )}
              </li>
            ))}
            {calls.data.upcoming.length === 0 && <li className="py-3 text-mauve">No upcoming calls.</li>}
          </ul>
        </Card>
      </div>
    </Section>
  );
}

// ---------- Newsletter ----------

export async function NewsletterSection() {
  const { source, data, sample } = await loadNewsletter();
  return (
    <Section id="newsletter" title="Newsletter" note={<SourceNote status={source.status} envName="KIT_API_KEY" sample={sample} detail={source.note} />}>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-semibold text-mauve">Active subscribers</p>
            <p className="font-display text-6xl leading-none tabular-nums">{data.total.toLocaleString("en-US")}</p>
            <p className="mt-2 text-[0.9375rem] text-mauve">
              Last 30 days: <span className="font-semibold tabular-nums text-plum">+{data.last30.added}</span> new,{" "}
              <span className="font-semibold tabular-nums text-plum">−{data.last30.left}</span> unsubscribed
            </p>
          </div>
          <div className="flex flex-col gap-3 border-t-[1.5px] border-plum/10 pt-5">
            <p className="text-sm font-semibold text-mauve">What they signed up for</p>
            {data.interests.map((interest) => (
              <div key={interest.label} className="flex flex-col gap-1">
                <div className="flex justify-between text-[0.9375rem]">
                  <span>{interest.label}</span>
                  <span className="tabular-nums">{interest.count.toLocaleString("en-US")}</span>
                </div>
                <span className="h-2 rounded-full bg-shell">
                  <span
                    className="block h-2 rounded-full bg-[#2a78d6]"
                    style={{ width: `${data.total ? Math.min(100, (interest.count / data.total) * 100) : 0}%` }}
                  />
                </span>
              </div>
            ))}
            {data.interests.length === 0 && <p className="text-mauve">No interest counts yet.</p>}
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <p className="font-display text-2xl">Weekly growth, last 12 weeks</p>
          {data.weeks.length > 0 ? <GrowthChart weeks={data.weeks} /> : <p className="text-mauve">No data yet.</p>}
        </Card>
      </div>
    </Section>
  );
}

// ---------- Revenue ----------

// The last twelve months as a small line, so the headline number has context
function Sparkline({ months }: { months: RevenueMonth[] }) {
  const max = Math.max(...months.map((m) => m.total), 1);
  const points = months
    .map((m, i) => `${(i / (months.length - 1)) * 100},${28 - (m.total / max) * 26}`)
    .join(" ");
  const last = months[months.length - 1];
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-3 h-8 w-full" role="img" aria-label="Revenue over the last twelve months">
      <polyline points={points} fill="none" stroke="#2a78d6" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="100" cy={28 - (last.total / max) * 26} r="2.5" fill="#2a78d6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export async function RevenueSection() {
  const [{ stripe, coffee, sample, months, totals }, inbox] = await Promise.all([loadRevenue(), loadInbox()]);
  const trend = totals.previous > 0 ? Math.round(((totals.month - totals.previous) / totals.previous) * 100) : null;
  const streamLabel = Object.fromEntries(INCOME_STREAMS.map((s) => [s.value, s.label]));
  const thisMonth = months[months.length - 1];

  return (
    <Section
      id="revenue"
      title="Revenue"
      note={
        <span className="flex flex-wrap gap-2">
          {sample ? (
            <SourceNote status="ok" envName="STRIPE_REPORTING_KEY" sample />
          ) : (
            <SourceNote status={stripe.status} envName="STRIPE_REPORTING_KEY" sample={false} detail={stripe.status === "error" ? stripe.note : undefined} />
          )}
          {!sample && coffee.status !== "ok" && (
            <span className="rounded-full bg-shell px-3 py-1 text-xs font-semibold text-plum/80">Coffee entered by hand</span>
          )}
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-5">
        <Card>
          <p className="text-sm font-semibold text-mauve">This month</p>
          <p className="font-display text-5xl leading-none tabular-nums">{formatMoney(totals.month)}</p>
          {trend !== null && (
            <p className="mt-2 text-[0.9375rem] text-mauve">
              <span aria-hidden="true">{trend >= 0 ? "▲" : "▼"}</span> {Math.abs(trend)}% {trend >= 0 ? "up" : "down"} on last month
            </p>
          )}
          <Sparkline months={months} />
        </Card>
        <Card>
          <p className="text-sm font-semibold text-mauve">Last month</p>
          <p className="font-display text-5xl leading-none tabular-nums">{formatMoney(totals.previous)}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-mauve">This year</p>
          <p className="font-display text-5xl leading-none tabular-nums">{formatMoney(totals.year)}</p>
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
                  <td className="py-2 text-right tabular-nums">{formatMoney(thisMonth.byStream[stream.value])}</td>
                  <td className="py-2 text-right tabular-nums">{formatMoney(totals.byStreamYear[stream.value])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="flex flex-col gap-6">
          <AddIncomeForm today={today()} disabled={inbox.source.status !== "ok"} />
          <div className="flex flex-col gap-2 border-t-[1.5px] border-plum/10 pt-5">
            <p className="text-sm font-semibold text-mauve">Recently added by hand</p>
            <ul className="flex flex-col gap-1.5 text-[0.9375rem]">
              {inbox.data.income.slice(0, 6).map((entry) => (
                <li key={entry._id} className="flex justify-between gap-3">
                  <span className="truncate">
                    {streamLabel[entry.stream]}
                    {entry.note ? <span className="text-mauve">, {entry.note}</span> : null}
                  </span>
                  <span className="tabular-nums">{formatMoney(entry.amount, true)}</span>
                </li>
              ))}
              {inbox.data.income.length === 0 && <li className="text-mauve">Nothing yet.</li>}
            </ul>
          </div>
        </Card>
      </div>
    </Section>
  );
}

// ---------- Brand inquiries and guest applications ----------

export async function BrandsSection() {
  const inbox = await loadInbox();
  return (
    <Section id="brands" title="Brand inquiries" note={<span className="text-sm text-mauve">{inbox.data.brands.length} in total</span>}>
      <Card>
        <ul className="flex flex-col divide-y divide-plum/10">
          {inbox.data.brands.slice(0, 30).map((b) => (
            <li key={b._id} className="flex flex-col gap-1 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="font-semibold">{b.name}</span>
                  <span className="text-mauve">
                    {[b.collaborationType, b.budget, formatDay(b.submittedAt)].filter(Boolean).map((part) => `, ${part}`)}
                  </span>
                </span>
                <StatusSelect type="brandInquiry" id={b._id} status={b.status} label={`Status for ${b.name}`} disabled={inbox.sample} />
              </div>
              <details className="group text-[0.9375rem]">
                <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-mauve [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>Their idea</summary>
                <p className="text-pretty whitespace-pre-wrap leading-relaxed">{b.message}</p>
                <p className="flex flex-wrap gap-x-5">
                  <TextLink href={`mailto:${b.email}`}>Reply to {b.email}</TextLink>
                  {b.website && (
                    <TextLink href={b.website.startsWith("http") ? b.website : `https://${b.website}`} external>
                      Their website
                    </TextLink>
                  )}
                </p>
              </details>
            </li>
          ))}
          {inbox.data.brands.length === 0 && <li className="py-3 text-mauve">No brand inquiries yet.</li>}
        </ul>
      </Card>
    </Section>
  );
}

export async function GuestsSection() {
  const inbox = await loadInbox();
  return (
    <Section id="guests" title="Guest applications" note={<span className="text-sm text-mauve">{inbox.data.guests.length} in total</span>}>
      <Card>
        <ul className="flex flex-col divide-y divide-plum/10">
          {inbox.data.guests.slice(0, 30).map((g) => (
            <li key={g._id} className="flex flex-col gap-1 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="font-semibold">{g.name}</span>
                  <span className="text-mauve">{[g.expertise, formatDay(g.submittedAt)].filter(Boolean).map((part) => `, ${part}`)}</span>
                </span>
                <StatusSelect type="guestApplication" id={g._id} status={g.status} label={`Status for ${g.name}`} disabled={inbox.sample} />
              </div>
              <details className="group text-[0.9375rem]">
                <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-mauve [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>Why they&apos;d be a great guest</summary>
                <p className="text-pretty whitespace-pre-wrap leading-relaxed">{g.message}</p>
                <p className="flex flex-wrap items-center gap-x-5">
                  <TextLink href={`mailto:${g.email}`}>Reply to {g.email}</TextLink>
                  {g.social && <span className="text-mauve">{g.social}</span>}
                </p>
              </details>
            </li>
          ))}
          {inbox.data.guests.length === 0 && <li className="py-3 text-mauve">No guest applications yet.</li>}
        </ul>
      </Card>
    </Section>
  );
}

// ---------- Connections ----------

export async function ConnectionsFooter() {
  const [inbox, newsletter, calls, revenue] = await Promise.all([loadInbox(), loadNewsletter(), loadCalls(), loadRevenue()]);
  const rows = [
    { label: "Studio inbox", source: inbox.source, env: "SANITY_WRITE_TOKEN" },
    { label: "Kit newsletter", source: newsletter.source, env: "KIT_API_KEY" },
    { label: "Cal.com calls", source: calls.source, env: "CAL_API_KEY" },
    { label: "Stripe revenue", source: revenue.stripe, env: "STRIPE_REPORTING_KEY" },
    { label: "Buy Me a Coffee", source: revenue.coffee, env: "BMC_ACCESS_TOKEN" },
  ];
  return (
    <footer className="flex flex-col gap-3 border-t-[1.5px] border-plum/10 pt-6 text-sm">
      <p className="font-semibold">Connections</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-mauve">
        {rows.map(({ label, source, env }) => (
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
  );
}
