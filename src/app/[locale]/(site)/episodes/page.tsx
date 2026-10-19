import Image from "next/image";
import { getTranslations } from "next-intl/server";
import EpisodesBrowser from "@/components/EpisodesBrowser";
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

function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c.9 6.6 4.8 10.9 12 12-7.2 1.1-11.1 5.4-12 12-.9-6.6-4.8-10.9-12-12C7.2 10.9 11.1 6.6 12 0z" />
    </svg>
  );
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

  const latest = episodes[0];
  const remainingEpisodes = episodes.slice(1);

  return (
    <div>
      {/* ===== HEADER ===== */}
      <section className="theme-soft relative overflow-hidden border-b-2 border-ink">
        <Sparkle className="absolute right-[12%] top-12 hidden h-10 w-10 text-butter motion-safe:animate-float md:block" />
        <Sparkle className="absolute bottom-10 right-[30%] hidden h-6 w-6 text-brand-400 md:block" />
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 md:pb-16 md:pt-16 lg:px-8">
          {episodes.length > 0 && (
            <span className="sticker motion-safe:animate-rise">
              <Sparkle className="h-3 w-3" />
              {t("count", { count: episodes.length })}
            </span>
          )}
          <h1 className="mt-5 font-display text-6xl font-extrabold lowercase leading-[0.85] tracking-[-0.04em] text-brand-700 motion-safe:animate-rise [animation-delay:80ms] md:text-8xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75 motion-safe:animate-rise [animation-delay:160ms]">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="section-padding">
        <div className="mx-auto max-w-7xl">
          {latest ? (
            <>
              {/* ===== LATEST EPISODE ===== */}
              <article className="group relative mb-20 grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-[2.5rem] border-2 border-ink bg-white shadow-pop-lg md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="relative aspect-video border-b-2 border-ink bg-brand-200 md:aspect-auto md:min-h-[22rem] md:border-b-0 md:border-r-2">
                  {latest.image && (
                    <Image
                      src={latest.image}
                      alt={latest.title}
                      fill
                      priority
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>

                <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">
                  <span className="sticker self-start">
                    <Sparkle className="h-3 w-3" />
                    {t("latest")}
                  </span>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink/60">
                    <time dateTime={latest.pubDate}>{formatDate(latest.pubDate, locale)}</time>
                    {latest.duration && (
                      <>
                        <span className="text-brand-400">&bull;</span>
                        <span>{latest.duration}</span>
                      </>
                    )}
                  </div>

                  <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink md:text-4xl">
                    {latest.title}
                  </h2>

                  <p className="mt-4 line-clamp-3 leading-relaxed text-ink/70">{latest.description}</p>

                  <a
                    href={latest.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-7 self-start after:absolute after:inset-0 after:content-['']"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
                    </svg>
                    {t("listenNow")}
                  </a>
                </div>
              </article>

              {/* ===== ALL OTHER EPISODES ===== */}
              {remainingEpisodes.length > 0 && <EpisodesBrowser episodes={remainingEpisodes} />}
            </>
          ) : (
            <div className="editorial-panel border-dashed p-16 text-center">
              <h2 className="font-display text-3xl font-extrabold lowercase text-ink">{t("comingSoon")}</h2>
              <p className="mt-2 text-ink/70">{t("episodesComingSoon")}</p>
              <p className="mx-auto mt-4 max-w-md rounded-2xl bg-blush p-4 text-sm text-ink/70">
                {t("setRssUrl")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
