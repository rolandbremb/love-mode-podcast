import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import EpisodesBrowser from "@/components/EpisodesBrowser";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/postal/PageHeader";
import { Link } from "@/i18n/navigation";
import { episodePath } from "@/lib/episodes";
import { getAllEpisodes } from "@/lib/rss";
import { podcastEpisode, podcastSeries } from "@/lib/structuredData";
import { getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

function formatDate(dateStr: string, locale: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("episodesTitle");
  const description = t("episodesDescription");
  return pageMetadata(parent, { title, description, locale, path: "/episodes" });
}

export default async function EpisodesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "episodes" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });

  const settings = await getSiteSettings({ locale });
  const episodes = await getAllEpisodes(settings?.podcastRssUrl);

  const latest = episodes[0];
  const remainingEpisodes = episodes.slice(1);

  return (
    <div>
      <JsonLd
        data={{
          ...podcastSeries({ name: tMeta("title"), description: tMeta("description"), locale, settings }),
          episode: episodes.map((episode) => podcastEpisode(episode, locale)),
        }}
      />
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        note={episodes.length > 0 ? t("count", { count: episodes.length }) : undefined}
      />

      <div className="page-container pb-24 lg:pb-32">
        {latest ? (
          <>
            {/* ===== LATEST EPISODE ===== */}
            <article className="relative mb-20 grid overflow-hidden rounded-md bg-white shadow-postal md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="relative aspect-video bg-bubblegum md:aspect-auto md:min-h-[22rem]">
                {latest.image && (
                  <Image
                    src={latest.image}
                    alt={latest.title}
                    fill
                    priority
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col justify-center gap-4 p-7 md:p-10 lg:p-12">
                <p className="font-hand text-xl">{t("latest")}</p>
                <div className="flex flex-wrap items-center gap-2 text-[0.9375rem] text-mauve">
                  <time dateTime={latest.pubDate}>{formatDate(latest.pubDate, locale)}</time>
                  {latest.duration && (
                    <>
                      <span aria-hidden="true">&bull;</span>
                      <span>{latest.duration}</span>
                    </>
                  )}
                </div>
                <h2 className="font-display text-[2rem] leading-[1.1] md:text-[2.5rem]">{latest.title}</h2>
                <p className="line-clamp-3 text-[1.0625rem] leading-relaxed text-mauve">{latest.description}</p>
                <Link
                  href={episodePath(latest)}
                  className="btn-primary mt-3 self-start !py-2 !pl-2 !pr-6 after:absolute after:inset-0 after:content-['']"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-tangerine text-plum">
                    <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
                    </svg>
                  </span>
                  {t("listenNow")}
                </Link>
              </div>
            </article>

            {/* ===== ALL OTHER EPISODES ===== */}
            {remainingEpisodes.length > 0 && <EpisodesBrowser episodes={remainingEpisodes} />}
          </>
        ) : (
          <div className="rounded-md border-[1.5px] border-dashed border-plum/30 p-16 text-center">
            <h2 className="font-display text-3xl">{t("comingSoon")}</h2>
            <p className="mt-2 text-mauve">{t("episodesComingSoon")}</p>
            <p className="mx-auto mt-4 max-w-md rounded-2xl bg-bubblegum p-4 text-[0.9375rem]">{t("setRssUrl")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
