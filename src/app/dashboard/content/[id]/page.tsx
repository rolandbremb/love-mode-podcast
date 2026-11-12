import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardNav, { PageHeader } from "@/components/dashboard/DashboardNav";
import { BackChevron, Card, SourceNote, TextLink } from "@/components/dashboard/ui";
import { DeleteButton } from "@/components/planner/client";
import { PostForm } from "@/components/planner/forms";
import { requireSignIn } from "@/lib/dashboard/auth";
import { loadPlanner } from "@/lib/planner/data";
import { EPISODE_STAGES, idFromSlug, labelFor, slugFromId } from "@/lib/planner/shared";

export const dynamic = "force-dynamic";

function BackLink() {
  return (
    <Link href="/dashboard/content" className="-ml-1 inline-flex min-h-10 w-fit items-center gap-1 rounded-full pl-1 pr-3 text-sm font-semibold text-mauve transition-colors hover:text-plum">
      <BackChevron />
      Content calendar
    </Link>
  );
}

export default async function PostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string; episode?: string }> }) {
  await requireSignIn();
  const slug = (await params).id;
  const query = await searchParams;
  const { status, data, sample } = await loadPlanner();
  // Newest episodes first in the "From episode" list
  const episodes = [...data.episodes].reverse();

  if (slug === "new") {
    const date = query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date) ? query.date : undefined;
    const episodeId = query.episode ? idFromSlug(query.episode) ?? undefined : undefined;
    const episode = data.episodes.find((e) => e._id === episodeId);
    return (
      <>
        <DashboardNav current="/dashboard/content" />
        <main className="mx-auto flex max-w-[52rem] flex-col gap-8 px-4 pb-24 pt-8 sm:px-8">
          <BackLink />
          <PageHeader eyebrow={episode ? `For episode${episode.number ? ` ${episode.number}` : ""}: ${episode.title}` : undefined} title="New post" />
          <Card>
            <PostForm
              episodes={episodes}
              disabled={status !== "ok"}
              compact
              defaults={{ date, episodeId: episode?._id, stage: date ? "drafting" : "idea", platforms: ["instagram"], format: "reel" }}
              returnTo={episode ? `/dashboard/episodes/${slugFromId(episode._id)}` : undefined}
            />
          </Card>
        </main>
      </>
    );
  }

  const id = idFromSlug(slug);
  const post = id && data.posts.find((p) => p._id === id);
  if (!post) notFound();
  const episode = data.episodes.find((e) => e._id === post.episodeId);

  return (
    <>
      <DashboardNav current="/dashboard/content" />
      <main className="mx-auto flex max-w-[78rem] flex-col gap-8 px-4 pb-24 pt-8 sm:px-8">
        <BackLink />
        <PageHeader title={post.title}>
          <SourceNote status={status} envName="SANITY_WRITE_TOKEN" sample={sample} />
        </PageHeader>
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Card>
            <PostForm post={post} episodes={episodes} disabled={status !== "ok"} />
          </Card>
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            {episode && (
              <Card className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-mauve">Promotes</p>
                <Link href={`/dashboard/episodes/${slugFromId(episode._id)}`} className="text-balance font-display text-xl underline decoration-plum/20 underline-offset-4 hover:decoration-plum">
                  {episode.number ? `${episode.number}. ` : ""}
                  {episode.title}
                </Link>
                <p className="text-sm text-mauve">
                  {labelFor(EPISODE_STAGES, episode.stage)}
                  {episode.publishDate ? `, out ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${episode.publishDate}T12:00:00Z`))}` : ""}
                </p>
              </Card>
            )}
            {post.link && (
              <Card>
                <TextLink href={post.link} external>
                  See it live
                </TextLink>
              </Card>
            )}
            <div>
              <DeleteButton type="contentPost" id={post._id} what="this post" returnTo="/dashboard/content" disabled={status !== "ok"} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
