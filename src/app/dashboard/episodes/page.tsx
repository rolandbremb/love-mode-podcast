import Link from "next/link";
import DashboardNav, { PageHeader } from "@/components/dashboard/DashboardNav";
import { SourceNote, pressable } from "@/components/dashboard/ui";
import { EpisodeCard } from "@/components/planner/EpisodeCard";
import { requireSignIn } from "@/lib/dashboard/auth";
import { loadPlanner, upcomingDays } from "@/lib/planner/data";

export const dynamic = "force-dynamic";

/* The production board: every episode from first idea to published, in four lanes.
   Each card still shows its exact stage, so the lanes can stay few and wide. */

const LANES = [
  { title: "Ideas", stages: ["idea"], empty: "Jot down the next topic you want to explore." },
  { title: "Booking & recording", stages: ["booking", "scheduled"], empty: "No guests being booked." },
  { title: "In production", stages: ["recorded", "editing", "ready"], empty: "Nothing in the edit." },
  { title: "Published", stages: ["published"], empty: "Published episodes land here." },
] as const;

const PUBLISHED_SHOWN = 6;

export default async function EpisodesPage() {
  await requireSignIn();
  const { status, data, sample } = await loadPlanner();
  const { from: today, to: soonUntil } = upcomingDays(8);

  return (
    <>
      <DashboardNav current="/dashboard/episodes" wide />
      <main className="mx-auto flex max-w-[86rem] flex-col gap-8 px-4 pb-24 pt-8 sm:px-8">
        <PageHeader eyebrow={`${data.episodes.filter((e) => e.stage !== "published" && e.stage !== "idea").length} in the works`} title="Episodes">
          <span className="flex flex-wrap items-center gap-3">
            <SourceNote status={status} envName="SANITY_WRITE_TOKEN" sample={sample} />
            <Link href="/dashboard/episodes/new" className={`btn-primary min-h-10 !px-5 !py-2.5 !text-[0.9375rem] ${pressable}`}>
              New episode
            </Link>
          </span>
        </PageHeader>

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LANES.map((lane) => {
            const all = data.episodes.filter((e) => (lane.stages as readonly string[]).includes(e.stage));
            // Published: newest first, and only the latest few
            const episodes = lane.title === "Published" ? [...all].sort((a, b) => (b.publishDate ?? "").localeCompare(a.publishDate ?? "")).slice(0, PUBLISHED_SHOWN) : all;
            return (
              <section key={lane.title} aria-labelledby={`lane-${lane.stages[0]}`} className="flex flex-col gap-2 rounded-[14px] bg-plum/[0.045] p-2">
                <h2 id={`lane-${lane.stages[0]}`} className="flex items-baseline justify-between gap-2 px-2 pb-1 pt-2">
                  <span className="font-display text-[1.375rem] leading-tight">{lane.title}</span>
                  <span className="text-sm font-semibold tabular-nums text-mauve">{all.length}</span>
                </h2>
                {episodes.map((episode, i) => (
                  <EpisodeCard key={episode._id} episode={episode} contacts={data.contacts} today={today} soonUntil={soonUntil} sample={sample} index={i} />
                ))}
                {all.length > episodes.length && <p className="px-2 py-1 text-sm text-mauve">And {all.length - episodes.length} older, in the Studio.</p>}
                {all.length === 0 && <p className="text-pretty rounded-md px-3 py-6 text-center text-sm text-mauve shadow-[inset_0_0_0_1.5px_rgba(45,21,48,0.1)]">{lane.empty}</p>}
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
