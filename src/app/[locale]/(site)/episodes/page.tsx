import Image from "next/image";
import { getTranslations } from "next-intl/server";
import EpisodeCard from "@/components/EpisodeCard";
import { getAllEpisodes } from "@/lib/rss";
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

export default async function EpisodesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "episodes" });

  const settings = await getSiteSettings({ locale });
  const episodes = await getAllEpisodes(settings?.podcastRssUrl);

  const firstEpisode = episodes[0];
  const remainingEpisodes = episodes.slice(1);

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        {/* Left-aligned header */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-label">{t("title")}</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-stone-900 md:text-5xl">
              {t("title")}
            </h1>
          </div>
          <p className="max-w-md text-base text-stone-500 md:text-right">
            {t("subtitle")}
          </p>
        </div>

        {firstEpisode ? (
          <>
            {/* Featured first episode — full-width editorial row */}
            <article className="mb-12 overflow-hidden rounded-[2rem] bg-stone-50">
              <div className="grid md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
                <div className="relative min-h-[16rem] overflow-hidden bg-stone-200 md:min-h-[20rem]">
                  {firstEpisode.image ? (
                    <Image
                      src={firstEpisode.image}
                      alt={firstEpisode.title}
                      fill
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(184,107,124,0.2),_rgba(245,244,242,1))]" />
                  )}
                </div>

                <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-stone-400">
                    <span>{formatDate(firstEpisode.pubDate, locale)}</span>
                    {firstEpisode.duration && (
                      <>
                        <span>&bull;</span>
                        <span>{firstEpisode.duration}</span>
                      </>
                    )}
                  </div>

                  <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-stone-950 md:text-4xl">
                    {firstEpisode.title}
                  </h2>

                  <p className="mt-4 line-clamp-2 text-base leading-relaxed text-stone-600">
                    {firstEpisode.description}
                  </p>

                  <a
                    href={firstEpisode.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-6 self-start"
                  >
                    {t("listenNow") ?? "Listen Now"}
                  </a>
                </div>
              </div>
            </article>

            {/* Remaining episodes — row variant list */}
            {remainingEpisodes.length > 0 && (
              <div>
                {remainingEpisodes.map((episode, i) => (
                  <EpisodeCard key={i} episode={episode} variant="row" />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 p-16 text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-stone-200" />
            <h2 className="font-serif text-2xl font-bold text-stone-700">
              {t("comingSoon")}
            </h2>
            <p className="mt-2 text-stone-500">{t("episodesComingSoon")}</p>
            <p className="mx-auto mt-4 max-w-md rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
              {t("setRssUrl")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
