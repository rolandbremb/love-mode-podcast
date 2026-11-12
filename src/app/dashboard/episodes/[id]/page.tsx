import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardNav, { PageHeader } from "@/components/dashboard/DashboardNav";
import { BackChevron, Card, SourceNote, pressable } from "@/components/dashboard/ui";
import { ChecklistEditor, DeleteButton } from "@/components/planner/client";
import { PlatformPills } from "@/components/planner/fields";
import { EpisodeForm } from "@/components/planner/forms";
import { requireSignIn } from "@/lib/dashboard/auth";
import { loadPlanner } from "@/lib/planner/data";
import { CONTACT_KINDS, POST_STAGES, idFromSlug, labelFor, slugFromId } from "@/lib/planner/shared";
import { formatDay } from "@/lib/dashboard/summary";

export const dynamic = "force-dynamic";

function BackLink() {
  return (
    <Link href="/dashboard/episodes" className="-ml-1 inline-flex min-h-10 w-fit items-center gap-1 rounded-full pl-1 pr-3 text-sm font-semibold text-mauve transition-colors hover:text-plum">
      <BackChevron />
      All episodes
    </Link>
  );
}

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSignIn();
  const slug = (await params).id;
  const { status, data, sample } = await loadPlanner();

  if (slug === "new") {
    return (
      <>
        <DashboardNav current="/dashboard/episodes" />
        <main className="mx-auto flex max-w-[52rem] flex-col gap-8 px-4 pb-24 pt-8 sm:px-8">
          <BackLink />
          <PageHeader title="New episode" />
          <Card>
            <EpisodeForm contacts={data.contacts} disabled={status !== "ok"} compact />
          </Card>
          <p className="text-pretty text-sm text-mauve">
            Questions, notes and the checklist are on the episode&apos;s page once it&apos;s added. Guests come from your{" "}
            <Link href="/dashboard/contacts" className="font-semibold text-plum underline underline-offset-4">
              contacts
            </Link>
            .
          </p>
        </main>
      </>
    );
  }

  const id = idFromSlug(slug);
  const episode = id && data.episodes.find((e) => e._id === id);
  if (!episode) notFound();
  const guests = episode.guestIds.map((guestId) => data.contacts.find((c) => c._id === guestId)).filter((c) => c !== undefined);
  const posts = data.posts.filter((p) => p.episodeId === episode._id);

  return (
    <>
      <DashboardNav current="/dashboard/episodes" />
      <main className="mx-auto flex max-w-[78rem] flex-col gap-8 px-4 pb-24 pt-8 sm:px-8">
        <BackLink />
        <PageHeader eyebrow={episode.number ? `Episode ${episode.number}` : "Episode"} title={episode.title}>
          <SourceNote status={status} envName="SANITY_WRITE_TOKEN" sample={sample} />
        </PageHeader>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Card>
            <EpisodeForm episode={episode} contacts={data.contacts} disabled={status !== "ok"} />
          </Card>

          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            <Card>
              <ChecklistEditor episodeId={episode._id} items={episode.checklist} disabled={status !== "ok"} />
            </Card>

            <Card className="flex flex-col gap-2">
              <p className="font-display text-2xl">Guests</p>
              <ul className="flex flex-col divide-y divide-plum/10">
                {guests.map((g) => (
                  <li key={g._id} className="flex items-center justify-between gap-3 py-2">
                    <Link href={`/dashboard/contacts/${slugFromId(g._id)}`} className="font-semibold underline decoration-plum/20 underline-offset-4 hover:decoration-plum">
                      {g.name}
                    </Link>
                    {g.email ? (
                      <a href={`mailto:${g.email}`} className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold hover:bg-shell">
                        Email
                      </a>
                    ) : (
                      <span className="text-sm text-mauve">{labelFor(CONTACT_KINDS, g.kind)}</span>
                    )}
                  </li>
                ))}
                {guests.length === 0 && <li className="py-2 text-pretty text-mauve">No guest yet. Tick one in the form, or add them to your contacts first.</li>}
              </ul>
            </Card>

            <Card className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-2xl">Social posts</p>
                <Link
                  href={`/dashboard/content/new?episode=${slugFromId(episode._id)}`}
                  className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold shadow-[inset_0_0_0_1.5px_rgba(45,21,48,0.25)] hover:bg-shell ${pressable}`}
                >
                  Plan a post
                </Link>
              </div>
              <ul className="flex flex-col divide-y divide-plum/10">
                {posts.map((p) => (
                  <li key={p._id} className="flex flex-col gap-1 py-2.5">
                    <Link href={`/dashboard/content/${slugFromId(p._id)}`} className="font-semibold underline decoration-plum/20 underline-offset-4 hover:decoration-plum">
                      {p.title}
                    </Link>
                    <span className="flex flex-wrap items-center gap-2 text-sm text-mauve">
                      <PlatformPills platforms={p.platforms} />
                      {p.date ? formatDay(`${p.date}T12:00:00Z`) : "No date"}, {labelFor(POST_STAGES, p.stage).toLowerCase()}
                    </span>
                  </li>
                ))}
                {posts.length === 0 && <li className="py-2 text-pretty text-mauve">Plan the clips and posts that promote this episode.</li>}
              </ul>
            </Card>

            <div>
              <DeleteButton type="plannerEpisode" id={episode._id} what={`“${episode.title}”`} returnTo="/dashboard/episodes" disabled={status !== "ok"} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
