import Link from "next/link";
import DashboardNav, { PageHeader } from "@/components/dashboard/DashboardNav";
import { Card, SourceNote, pressable } from "@/components/dashboard/ui";
import { StageSelect } from "@/components/planner/client";
import { PlatformPills } from "@/components/planner/fields";
import { requireSignIn } from "@/lib/dashboard/auth";
import { loadPlanner } from "@/lib/planner/data";
import { PLATFORMS, POST_FORMATS, labelFor, slugFromId, type Episode, type Post } from "@/lib/planner/shared";
import { dayKey } from "@/lib/dashboard/summary";

export const dynamic = "force-dynamic";

/* The content calendar: a month of posts, each a small stamp in its platform's
   colour, with recording and release days marked. Undated posts wait as ideas. */

type DayItem =
  | { kind: "post"; post: Post }
  | { kind: "record" | "release"; episode: Episode };

const navClass = `inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold shadow-[inset_0_0_0_1.5px_rgba(45,21,48,0.18)] hover:bg-white ${pressable}`;

function monthParam(value?: string) {
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : dayKey(new Date()).slice(0, 7);
}

function href(month: string, platform: string) {
  const params = new URLSearchParams();
  if (month !== dayKey(new Date()).slice(0, 7)) params.set("month", month);
  if (platform) params.set("platform", platform);
  const query = params.toString();
  return `/dashboard/content${query ? `?${query}` : ""}`;
}

function colorOf(post: Post) {
  return PLATFORMS.find((p) => p.value === post.platforms[0]) ?? PLATFORMS[PLATFORMS.length - 1];
}

function ItemChip({ item }: { item: DayItem }) {
  if (item.kind === "post") {
    const { post } = item;
    const color = colorOf(post);
    const others = post.platforms.length - 1;
    return (
      <Link
        href={`/dashboard/content/${slugFromId(post._id)}`}
        title={`${post.time ? `${post.time} ` : ""}${post.title}`}
        className={`flex min-h-10 items-center gap-1.5 overflow-hidden rounded-[6px] bg-white py-1 pl-1.5 pr-2 text-sm leading-tight md:min-h-6 md:rounded-[4px] md:py-0.5 md:pl-1 md:pr-1.5 md:text-[0.6875rem] shadow-[0_0_0_1px_rgba(45,21,48,0.08)] transition-[box-shadow] hover:shadow-[0_0_0_1.5px_rgba(45,21,48,0.4)] ${post.stage === "posted" ? "opacity-55" : ""}`}
      >
        <span className="h-3.5 w-1 shrink-0 rounded-full" style={{ background: color.color }} aria-hidden="true" />
        <span className="truncate">
          {post.time && <span className="font-semibold tabular-nums">{post.time} </span>}
          {post.title}
        </span>
        {others > 0 && <span className="ml-auto shrink-0 font-semibold text-mauve">+{others}</span>}
      </Link>
    );
  }
  const { episode } = item;
  return (
    <Link
      href={`/dashboard/episodes/${slugFromId(episode._id)}`}
      title={`${item.kind === "record" ? "Recording" : "Release"}: ${episode.title}`}
      className={`flex min-h-10 items-center gap-1 truncate rounded-[6px] px-2 py-1 text-sm font-semibold leading-tight md:min-h-6 md:rounded-[4px] md:px-1.5 md:py-0.5 md:text-[0.6875rem] ${
        item.kind === "release" ? "bg-plum text-shell" : "bg-bubblegum text-plum"
      }`}
    >
      <span className="truncate">
        {item.kind === "record" ? "Record" : "Out"}: {episode.number ? `#${episode.number}` : episode.title}
      </span>
    </Link>
  );
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ month?: string; platform?: string }> }) {
  await requireSignIn();
  const params = await searchParams;
  const { status, data, sample } = await loadPlanner();
  const month = monthParam(params.month);
  const platform = PLATFORMS.some((p) => p.value === params.platform) ? params.platform! : "";
  const today = dayKey(new Date());

  const posts = data.posts.filter((p) => !platform || p.platforms.includes(platform));
  const ideas = posts.filter((p) => !p.date && p.stage !== "posted");

  const itemsOn = (day: string): DayItem[] => [
    ...data.episodes.filter((e) => e.publishDate === day).map((episode) => ({ kind: "release" as const, episode })),
    ...data.episodes.filter((e) => e.recordDate === day).map((episode) => ({ kind: "record" as const, episode })),
    ...posts.filter((p) => p.date === day).map((post) => ({ kind: "post" as const, post })),
  ];

  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7; // weeks start on Monday
  const days = Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
  const cells = [...Array.from({ length: leading }, () => null), ...days];
  while (cells.length % 7) cells.push(null);
  const shift = (delta: number) => new Date(Date.UTC(year, monthIndex - 1 + delta, 1)).toISOString().slice(0, 7);
  const title = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const monthPosts = posts.filter((p) => p.date?.startsWith(month));
  const agenda = days.map((day) => ({ day, items: itemsOn(day) })).filter((d) => d.items.length > 0);
  const weekday = (day: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));

  return (
    <>
      <DashboardNav current="/dashboard/content" wide />
      <main className="mx-auto flex max-w-[86rem] flex-col gap-8 px-4 pb-24 pt-8 sm:px-8">
        <PageHeader eyebrow={`${monthPosts.length} ${monthPosts.length === 1 ? "post" : "posts"} planned in ${weekday(`${month}-01`, { month: "long" })}`} title="Content">
          <span className="flex flex-wrap items-center gap-3">
            <SourceNote status={status} envName="SANITY_WRITE_TOKEN" sample={sample} />
            <Link href="/dashboard/content/new" className={`btn-primary min-h-10 !px-5 !py-2.5 !text-[0.9375rem] ${pressable}`}>
              New post
            </Link>
          </span>
        </PageHeader>

        {/* Platform filter: also the calendar's colour key */}
        <nav aria-label="Filter by platform" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          <Link
            href={href(month, "")}
            aria-current={!platform ? "true" : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors ${!platform ? "bg-plum text-shell" : "bg-white hover:bg-peach"}`}
          >
            All platforms
          </Link>
          {PLATFORMS.map((p) => (
            <Link
              key={p.value}
              href={href(month, platform === p.value ? "" : p.value)}
              aria-current={platform === p.value ? "true" : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${platform === p.value ? "bg-plum text-shell" : "bg-white hover:bg-peach"}`}
            >
              <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]" style={{ background: p.color }} aria-hidden="true" />
              {p.label}
            </Link>
          ))}
        </nav>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="flex flex-col gap-4 !p-3 sm:!p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <h2 className="font-display text-[1.75rem] leading-none">{title}</h2>
              <div className="flex gap-2">
                <Link href={href(shift(-1), platform)} aria-label="Previous month" className={navClass}>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 3.5 5.5 8l4.5 4.5" />
                  </svg>
                </Link>
                <Link href={href(dayKey(new Date()).slice(0, 7), platform)} className={navClass}>
                  Today
                </Link>
                <Link href={href(shift(1), platform)} aria-label="Next month" className={navClass}>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 3.5 10.5 8 6 12.5" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* The grid from tablet width up */}
            <div className="hidden md:block">
              <div className="grid grid-cols-7 gap-1 pb-1 text-xs font-semibold text-plum/55" aria-hidden="true">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="px-1.5">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={`blank-${i}`} aria-hidden="true" />;
                  const items = itemsOn(day);
                  const isToday = day === today;
                  const past = day < today;
                  return (
                    <div
                      key={day}
                      className={`group/day relative flex min-h-[7.5rem] flex-col gap-1 rounded-[6px] p-1.5 ${
                        isToday ? "bg-white shadow-[inset_0_0_0_2px_#2d1530]" : past ? "bg-shell/50" : "bg-shell"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold tabular-nums ${isToday ? "bg-tangerine text-plum" : past ? "text-plum/40" : ""}`}
                        >
                          {Number(day.slice(8))}
                        </span>
                        {/* Quick add for this day, revealed on hover or focus */}
                        <Link
                          href={`/dashboard/content/new?date=${day}`}
                          aria-label={`New post on ${weekday(day, { month: "long", day: "numeric" })}`}
                          className="relative inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold text-mauve opacity-0 transition-opacity before:absolute before:-inset-2 before:content-[''] hover:bg-white hover:text-plum focus-visible:opacity-100 group-hover/day:opacity-100"
                        >
                          +
                        </Link>
                      </div>
                      {items.slice(0, 4).map((item, j) => (
                        <ItemChip key={j} item={item} />
                      ))}
                      {items.length > 4 && <span className="px-1 text-[0.6875rem] font-semibold text-mauve">+{items.length - 4} more</span>}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 px-1 text-xs text-plum/70">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-4 rounded-[3px] bg-plum" aria-hidden="true" /> Episode out
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-4 rounded-[3px] bg-bubblegum" aria-hidden="true" /> Recording
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-4 rounded-[3px] bg-white opacity-55 shadow-[0_0_0_1px_rgba(45,21,48,0.2)]" aria-hidden="true" /> Posted
                </span>
              </p>
            </div>

            {/* On a phone, the month as a list */}
            <ol className="flex flex-col md:hidden">
              {agenda.map(({ day, items }) => (
                <li key={day} className="flex gap-3 border-t border-plum/10 py-3 first:border-t-0">
                  <div className={`flex w-11 shrink-0 flex-col items-center rounded-[8px] py-1 ${day === today ? "bg-tangerine" : "bg-shell"}`}>
                    <span className="text-[0.6875rem] font-semibold">{weekday(day, { weekday: "short" })}</span>
                    <span className="font-display text-xl leading-none tabular-nums">{Number(day.slice(8))}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    {items.map((item, j) => (
                      <ItemChip key={j} item={item} />
                    ))}
                  </div>
                </li>
              ))}
              {agenda.length === 0 && <li className="py-4 text-mauve">Nothing planned this month yet.</li>}
            </ol>
          </Card>

          <aside className="flex flex-col gap-5" aria-label="Ideas without a date">
            <Card className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl">Ideas</h2>
                <span className="text-sm font-semibold tabular-nums text-mauve">{ideas.length}</span>
              </div>
              <p className="text-pretty text-sm text-mauve">Posts without a date. Give one a date to put it on the calendar.</p>
              <ul className="flex flex-col divide-y divide-plum/10">
                {ideas.map((p) => (
                  <li key={p._id} className="flex flex-col gap-1.5 py-3">
                    <Link href={`/dashboard/content/${slugFromId(p._id)}`} className="text-pretty font-semibold underline decoration-plum/20 underline-offset-4 hover:decoration-plum">
                      {p.title}
                    </Link>
                    <span className="flex flex-wrap items-center gap-2 text-xs text-mauve">
                      <PlatformPills platforms={p.platforms} />
                      {p.format && labelFor(POST_FORMATS, p.format)}
                    </span>
                    <StageSelect type="contentPost" id={p._id} stage={p.stage} label={`Stage for ${p.title}`} disabled={sample} />
                  </li>
                ))}
                {ideas.length === 0 && <li className="py-3 text-mauve">No loose ideas. Add one with New post and leave the date empty.</li>}
              </ul>
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}
