import Link from "next/link";
import { PlatformPills } from "@/components/planner/fields";
import { Card, Count, Section, SourceNote } from "@/components/dashboard/ui";
import { loadPlanner, upcomingDays } from "@/lib/planner/data";
import { slugFromId } from "@/lib/planner/shared";
import { formatDay } from "@/lib/dashboard/summary";

/* The overview's glance at the planner: what goes out, gets recorded and needs a
   follow-up in the next seven days. */

const day = (key: string) => formatDay(`${key}T12:00:00Z`);
const linkClass = "font-semibold underline decoration-plum/20 underline-offset-4 hover:decoration-plum";

export async function PlannerWeekSection() {
  const { status, data, sample } = await loadPlanner();
  const { from, to } = upcomingDays(7);
  const inWeek = (key?: string) => Boolean(key && key >= from && key <= to);

  const posts = data.posts.filter((p) => p.stage !== "posted" && inWeek(p.date));
  const overduePosts = data.posts.filter((p) => p.stage !== "posted" && p.date && p.date < from);
  const recordings = data.episodes.filter((e) => inWeek(e.recordDate));
  const releases = data.episodes.filter((e) => e.stage !== "published" && inWeek(e.publishDate));
  const followUps = data.contacts.filter((c) => c.followUp && c.followUp <= to && c.stage !== "notAFit");

  return (
    <Section id="planner" title="This week in the planner" note={<SourceNote status={status} envName="SANITY_WRITE_TOKEN" sample={sample} />}>
      <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-mauve">Posts going out</p>
            <Link href="/dashboard/content" className="text-sm font-semibold underline decoration-plum/30 underline-offset-4">
              Content
            </Link>
          </div>
          <Count value={posts.length} />
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            {posts.slice(0, 4).map((p) => (
              <li key={p._id} className="flex flex-col gap-0.5">
                <span className="text-sm tabular-nums text-mauve">
                  {day(p.date!)}
                  {p.time ? `, ${p.time}` : ""}
                </span>
                <Link href={`/dashboard/content/${slugFromId(p._id)}`} className={`truncate ${linkClass}`}>
                  {p.title}
                </Link>
                <PlatformPills platforms={p.platforms} />
              </li>
            ))}
            {posts.length === 0 && <li className="text-mauve">Nothing planned this week.</li>}
          </ul>
          {overduePosts.length > 0 && (
            <p className="rounded-sm bg-peach px-3 py-2 text-sm font-semibold">
              {overduePosts.length} past their date and not marked posted
            </p>
          )}
        </Card>
        <Card className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-mauve">Recording & releasing</p>
            <Link href="/dashboard/episodes" className="text-sm font-semibold underline decoration-plum/30 underline-offset-4">
              Episodes
            </Link>
          </div>
          <Count value={recordings.length + releases.length} />
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            {[
              ...recordings.map((e) => ({ e, when: e.recordDate!, what: `Record${e.recordTime ? ` at ${e.recordTime}` : ""}` })),
              ...releases.map((e) => ({ e, when: e.publishDate!, what: "Release" })),
            ]
              .sort((a, b) => a.when.localeCompare(b.when))
              .slice(0, 5)
              .map(({ e, when, what }) => (
                <li key={`${e._id}-${what}`} className="flex flex-col gap-0.5">
                  <span className="text-sm text-mauve">
                    {day(when)}: {what}
                  </span>
                  <Link href={`/dashboard/episodes/${slugFromId(e._id)}`} className={`truncate ${linkClass}`}>
                    {e.number ? `${e.number}. ` : ""}
                    {e.title}
                  </Link>
                </li>
              ))}
            {recordings.length + releases.length === 0 && <li className="text-mauve">No recordings or releases this week.</li>}
          </ul>
        </Card>
        <Card className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-mauve">Follow-ups due</p>
            <Link href="/dashboard/contacts" className="text-sm font-semibold underline decoration-plum/30 underline-offset-4">
              Contacts
            </Link>
          </div>
          <Count value={followUps.length} />
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            {followUps.slice(0, 5).map((c) => (
              <li key={c._id} className="flex items-center justify-between gap-2">
                <Link href={`/dashboard/contacts/${slugFromId(c._id)}`} className={`truncate ${linkClass}`}>
                  {c.name}
                </Link>
                <span
                  className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.followUp! <= from ? "bg-tangerine text-plum" : "bg-shell text-plum/80"}`}
                >
                  {c.followUp! < from ? "Overdue" : c.followUp === from ? "Today" : day(c.followUp!)}
                </span>
              </li>
            ))}
            {followUps.length === 0 && <li className="text-mauve">No one to chase.</li>}
          </ul>
        </Card>
      </div>
    </Section>
  );
}
