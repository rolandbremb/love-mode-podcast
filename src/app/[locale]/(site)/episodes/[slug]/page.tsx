import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import EpisodeCard from "@/components/EpisodeCard";
import JsonLd from "@/components/JsonLd";
import ShowNotes from "@/components/ShowNotes";
import YouTubePlayer from "@/components/YouTubePlayer";
import { ArrowIcon } from "@/components/postal/ArrowLink";
import { Link } from "@/i18n/navigation";
import { episodePath, findEpisode, relatedEpisodes, splitEpisodeTitle, summarize } from "@/lib/episodes";
import { platformLabel } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { getAllEpisodes } from "@/lib/rss";
import { breadcrumbs, podcastEpisode } from "@/lib/structuredData";
import { getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

type Params = Promise<{ locale: string; slug: string }>;

async function loadEpisode(locale: string, slug: string) {
  const settings = await getSiteSettings({ locale });
  const episodes = await getAllEpisodes(settings?.podcastRssUrl);
  return { settings, episodes, episode: findEpisode(episodes, slug) };
}

export async function generateMetadata({ params }: { params: Params }, parent: ResolvingMetadata): Promise<Metadata> {
  const { locale, slug } = await params;
  const { episode } = await loadEpisode(locale, slug);
  if (!episode) return {};

  const t = await getTranslations({ locale, namespace: "episode" });
  const { title, guest } = splitEpisodeTitle(episode);
  return pageMetadata(parent, {
    title: guest ? `${title}, ${t("withGuest", { guest })}` : title,
    description: summarize(episode.description, 155),
    locale,
    path: episodePath(episode),
  });
}

export default async function EpisodePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const { settings, episodes, episode } = await loadEpisode(locale, slug);
  if (!episode) notFound();

  const t = await getTranslations({ locale, namespace: "episode" });
  const { number, title, guest } = splitEpisodeTitle(episode);
  const related = relatedEpisodes(episodes, episode);
  const date = episode.pubDate
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(episode.pubDate))
    : "";

  // Spotify and Apple open the show; YouTube opens this very episode
  const listenLinks = (settings?.platformLinks ?? [])
    .filter((link) => link.url)
    .map(({ platform, url }) => ({ label: platformLabel(platform), url: platform === "youtube" ? episode.link : url }));
  if (!listenLinks.some((link) => link.url === episode.link)) listenLinks.push({ label: "YouTube", url: episode.link });

  return (
    <article>
      <JsonLd
        data={{
          "@graph": [
            podcastEpisode(episode, locale, { withVideo: true }),
            breadcrumbs(
              [
                { name: t("backToAll"), path: "/episodes" },
                { name: title, path: episodePath(episode) },
              ],
              locale
            ),
          ],
        }}
      />

      {/* ===== HEADER ===== */}
      <header className="page-container pb-10 pt-8 md:pb-12 md:pt-14">
        <Link
          href="/episodes"
          className="inline-flex items-center gap-2 text-[1.0625rem] font-semibold underline underline-offset-[5px]"
        >
          <ArrowIcon className="h-[18px] w-[18px] rotate-180" />
          {t("backToAll")}
        </Link>
        {number && <p className="mt-8 font-hand text-[1.375rem] sm:text-[1.5rem]">{t("number", { number })}</p>}
        <h1
          lang="es"
          className="mt-3 max-w-[22ch] font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] tracking-[-0.03em] motion-safe:animate-rise"
        >
          {title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[1.0625rem] text-mauve">
          {guest && <span className="font-semibold text-plum">{t("withGuest", { guest })}</span>}
          {date && <time dateTime={episode.pubDate}>{date}</time>}
          {episode.duration && <span>{episode.duration}</span>}
        </div>
        {locale !== "es" && (
          <p className="mt-5 inline-block rounded-full bg-bubblegum px-4 py-1.5 text-[0.9375rem] font-semibold">
            {t("languageNote")}
          </p>
        )}
      </header>

      {/* ===== PLAYER, OTHER APPS AND SHOW NOTES =====
          On phones the apps sit right under the player; on desktop they stay beside it */}
      <div className="page-container grid gap-10 pb-24 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-16 lg:gap-y-12">
        {episode.videoId && (
          <div className="min-w-0 lg:col-start-1">
            <YouTubePlayer videoId={episode.videoId} title={episode.title} image={episode.image} playLabel={t("play")} />
          </div>
        )}

        <aside className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <p className="font-hand text-[1.375rem]">{t("listenOn")}</p>
          <ul className="mt-4 flex flex-wrap gap-3 lg:flex-col lg:items-start">
            {listenLinks.map((link) => (
              <li key={link.label}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {episode.description && (
          <section className="min-w-0 lg:col-start-1">
            <h2 className="mb-6 font-display text-[2rem] leading-[1.1]">{t("showNotes")}</h2>
            <ShowNotes text={episode.description} />
          </section>
        )}
      </div>

      {/* ===== MORE EPISODES ===== */}
      {related.length > 0 && (
        <section className="page-container pb-24 lg:pb-32">
          <h2 className="mb-10 font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05] tracking-[-0.02em]">
            {t("related")}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((other) => (
              <EpisodeCard key={other.link} episode={other} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
