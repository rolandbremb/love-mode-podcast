import Image from "next/image";
import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import EpisodeCard from "@/components/EpisodeCard";
import FadeIn from "@/components/FadeIn";
import { Link } from "@/i18n/navigation";
import { getTopEpisodesByViews } from "@/lib/rss";
import { getAboutPage, getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

/* ---- Platform icon SVGs ---- */

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function ApplePodcastsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c4.988 0 8.94 3.756 9.168 8.676a8.737 8.737 0 01-1.878 5.988c-.36.48-.756.912-1.176 1.308-.12.12-.24.228-.372.348-.12.108-.252.228-.384.336l-.072.06-.036.036c-.012 0-.024.012-.036.024-.024.012-.06.036-.096.06a.444.444 0 01-.252.084.39.39 0 01-.18-.048.354.354 0 01-.18-.312c0-.084.024-.156.048-.228.024-.084.06-.156.084-.228.024-.06.036-.132.06-.192l.012-.06c.024-.108.036-.204.06-.312.012-.096.024-.192.024-.288 0-.156-.012-.312-.048-.456a1.404 1.404 0 00-.396-.684 1.57 1.57 0 00-.552-.348 1.608 1.608 0 00-.636-.132c-.072 0-.132 0-.2.012a8.394 8.394 0 00-2.088-.552v-.036c.012-.06.036-.108.06-.168.108-.24.288-.468.504-.66.204-.18.432-.3.648-.42.144-.084.288-.168.42-.264.552-.384.996-.912 1.272-1.536.3-.648.42-1.38.312-2.124-.108-.624-.396-1.2-.828-1.668a3.652 3.652 0 00-1.596-1.008 3.65 3.65 0 00-1.884-.084c-.624.132-1.188.444-1.644.888-.456.456-.768 1.02-.888 1.644a3.628 3.628 0 00.084 1.884c.216.612.588 1.152 1.08 1.56.096.084.204.156.312.228.132.084.264.168.396.264a3.2 3.2 0 01.648.492c.192.204.36.432.468.696.024.06.048.12.06.18v.024a8.352 8.352 0 00-2.016.564l-.048-.012a1.62 1.62 0 00-.636.132 1.584 1.584 0 00-.552.348 1.404 1.404 0 00-.396.684c-.036.144-.048.3-.048.456 0 .096.012.192.024.288.024.108.036.204.06.312l.012.06c.024.06.036.12.06.192.024.072.06.144.084.228.024.072.048.144.048.228a.354.354 0 01-.18.312.39.39 0 01-.18.048.444.444 0 01-.252-.084.813.813 0 01-.096-.06c-.012-.012-.024-.024-.036-.024l-.036-.036-.072-.06c-.132-.108-.264-.228-.384-.336a10.017 10.017 0 01-.372-.348 9.45 9.45 0 01-1.176-1.308 8.737 8.737 0 01-1.878-5.988c.228-4.92 4.18-8.676 9.168-8.676z" />
    </svg>
  );
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: YouTubeIcon,
  spotify: SpotifyIcon,
  apple: ApplePodcastsIcon,
};

const platformLabels: Record<string, string> = {
  youtube: "YouTube",
  spotify: "Spotify",
  apple: "Apple Podcasts",
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: preview } = await draftMode();
  const t = await getTranslations({ locale, namespace: "home" });

  const [settings, aboutData] = await Promise.all([
    getSiteSettings({ preview, locale }),
    getAboutPage({ preview, locale }),
  ]);
  const topEpisodes = await getTopEpisodesByViews(3, settings?.podcastRssUrl);

  const heroTagline = settings?.heroTagline ?? "The Podcast";
  const heroTitle = settings?.heroTitle ?? "Love Mode";
  const heroDescription =
    settings?.heroDescription ??
    "Real conversations about love, dating, and building relationships that actually last. No sugarcoating, no games — just honest talk and real advice.";
  const episodeSchedule = settings?.episodeSchedule ?? "New episodes every Friday";
  const platforms = settings?.platformLinks ?? [];
  const aboutTitle = settings?.aboutTitle ?? "What is Love Mode?";
  const aboutParagraphs = settings?.aboutParagraphs ?? [
    "Love Mode is more than a podcast — it's a movement. We dive deep into the messy, beautiful, complicated world of modern love and relationships.",
    "Every episode brings raw, unfiltered conversations with real people and experts who get it.",
  ];
  const buyMeCoffeeUrl = settings?.buyMeCoffeeUrl ?? "#";
  const supportTarget = buyMeCoffeeUrl !== "#" ? "_blank" : undefined;
  const supportRel =
    buyMeCoffeeUrl !== "#" ? "noopener noreferrer" : undefined;

  const hostName = aboutData?.hostName ?? "Your Host";
  const hostBio = aboutData?.hostBio?.[0] ?? "";
  const hostPhoto = aboutData?.hostPhoto?.asset?.url ?? "/images/host.jpg";

  return (
    <>
      {/* ===== FULL-BLEED PHOTO HERO ===== */}
      <section className="relative">
        <div className="relative min-h-[70vh] overflow-hidden md:min-h-[85vh]">
          <Image
            src="/images/hero.jpg"
            alt="Love Mode Podcast studio"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />

          <div className="relative flex min-h-[70vh] items-end md:min-h-[85vh]">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 md:flex-row md:items-end md:justify-between md:pb-24 lg:px-8">
              {/* Left — headline + CTAs */}
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/60">
                  {heroTagline}
                </p>
                <h1 className="mt-4 max-w-2xl font-serif text-5xl font-bold leading-[0.94] text-white md:text-6xl lg:text-7xl">
                  {heroTitle}
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 md:text-lg">
                  {heroDescription}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/episodes"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition-all active:scale-[0.98] hover:bg-stone-100"
                  >
                    {t("listenToEpisodes")}
                  </Link>
                  <Link
                    href="/apply"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/50 px-6 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:border-white/80 hover:bg-white/10"
                  >
                    {t("beAGuest")}
                  </Link>
                </div>
              </div>

              {/* Right — schedule + platform icons */}
              <div className="flex items-center gap-4 rounded-full border border-white/15 bg-white/5 px-5 py-3 backdrop-blur-sm md:self-end">
                <p className="text-xs font-medium tracking-wide text-white/80">
                  {episodeSchedule}
                </p>
                {platforms.length > 0 && (
                  <>
                    <div className="h-4 w-px bg-white/20" aria-hidden="true" />
                    <div className="flex items-center gap-2">
                      {platforms.map(({ platform, url }) => {
                        const Icon = platformIcons[platform];
                        if (!Icon) return null;
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={platformLabels[platform] ?? platform}
                            className="text-white/60 transition-colors hover:text-white"
                          >
                            <Icon className="h-[1.1rem] w-[1.1rem]" />
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT / EDITORIAL SECTION ===== */}
      <section className="section-padding theme-soft">
        <FadeIn className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <div className="self-start lg:sticky lg:top-28">
            <p className="section-label">{heroTagline}</p>
            <h2 className="mt-6 max-w-md font-serif text-4xl font-bold leading-tight text-stone-950 md:text-5xl">
              {aboutTitle}
            </h2>
            <div
              className="mt-8 h-px w-full max-w-xs bg-gradient-to-r from-brand-500 via-brand-200 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="grid gap-5">
            {aboutParagraphs.map((paragraph, index) => (
              <div
                key={index}
                className={`editorial-panel p-6 sm:p-8 ${
                  index % 2 === 0 ? "lg:mr-16" : "lg:ml-16"
                }`}
              >
                <p className="text-lg leading-relaxed text-stone-600">
                  {paragraph}
                </p>
              </div>
            ))}

            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/episodes"
                className="editorial-panel p-5 transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="section-label">{t("listenToEpisodes")}</p>
                <p className="mt-4 font-serif text-2xl font-bold text-stone-950">
                  {t("viewAllEpisodes")}
                </p>
              </Link>

              <Link
                href="/apply"
                className="rounded-[1.75rem] bg-brand-600 p-5 text-white shadow-[0_8px_30px_-12px_rgba(160,81,103,0.5)] transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/65">
                  {t("beAGuest")}
                </p>
                <p className="mt-4 font-serif text-2xl font-bold">
                  {t("applyNow")}
                </p>
              </Link>

              <Link
                href="/collaborate"
                className="rounded-[1.75rem] bg-stone-900 p-5 text-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/65">
                  {t("letsCollaborate")}
                </p>
                <p className="mt-4 font-serif text-2xl font-bold">
                  {t("getInTouch")}
                </p>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ===== MEET YOUR HOST ===== */}
      <section className="section-padding theme-page">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)] lg:gap-14">
            <div className="relative mx-auto h-48 w-48 shrink-0 overflow-hidden rounded-full md:h-56 md:w-56">
              <Image
                src={hostPhoto}
                alt={hostName}
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>

            <div className="text-center md:text-left">
              <p className="section-label">{t("meetYourHost")}</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-stone-950 md:text-4xl">
                {hostName}
              </h2>
              {hostBio && (
                <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600">
                  {hostBio}
                </p>
              )}
              <Link
                href="/about"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                {t("meetHostCta", { name: hostName })}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== MOST VIEWED EPISODES ===== */}
      <section className="section-padding theme-soft">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label">{heroTagline}</p>
              <h2 className="mt-4 font-serif text-3xl font-bold text-stone-950 md:text-4xl">
                {t("mostViewedEpisodes")}
              </h2>
            </div>

            {topEpisodes.length > 0 && (
              <Link href="/episodes" className="btn-secondary self-start md:self-auto">
                {t("viewAllEpisodes")}
              </Link>
            )}
          </FadeIn>

          {topEpisodes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topEpisodes.map((episode, index) => (
                <FadeIn key={index} delay={index * 0.12}>
                  <EpisodeCard episode={episode} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="editorial-panel rounded-[2rem] border-2 border-dashed border-brand-200 p-12 text-center">
              <p className="text-lg font-medium text-stone-500">
                {t("episodesComingSoon")}
              </p>
              <p className="mt-2 text-sm text-stone-400">{t("setRssUrl")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== SUPPORT / COLLABORATE ===== */}
      <section id="support" className="section-padding theme-page">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <FadeIn className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-8 text-white shadow-[0_12px_40px_-15px_rgba(160,81,103,0.4)] lg:p-12">
            <div
              className="absolute -right-10 -top-10 h-56 w-56 rounded-full border-[1.5px] border-white/15"
              aria-hidden="true"
            />
            <div
              className="absolute -right-20 top-8 h-36 w-36 rounded-full border border-white/10"
              aria-hidden="true"
            />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/70">
              {t("guestLabel")}
            </p>
            <h2 className="mt-6 max-w-lg font-serif text-4xl font-bold leading-tight md:text-5xl">
              {t("wantToBeAGuest")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">
              {t("guestDescription")}
            </p>
            <Link
              href="/apply"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition-all active:scale-[0.98] hover:bg-brand-50"
            >
              {t("applyNow")}
            </Link>
          </FadeIn>

          <FadeIn className="grid gap-6" delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] bg-stone-950 p-8 text-white shadow-[0_12px_40px_-15px_rgba(0,0,0,0.3)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/55">
                {t("collaborateLabel")}
              </p>
              <h3 className="mt-4 font-serif text-3xl font-bold">
                {t("letsCollaborate")}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/72">
                {t("collaborateDescription")}
              </p>
              <Link
                href="/collaborate"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-brand-400"
              >
                {t("getInTouch")}
              </Link>
            </div>

            <div className="editorial-panel p-8">
              <div>
                <p className="section-label">{t("supportLabel")}</p>
                <h3 className="mt-2 font-serif text-2xl font-bold text-stone-950">
                  {t("supportTheShow")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {t("supportDescription")}
                </p>
              </div>
              <a
                href={buyMeCoffeeUrl}
                target={supportTarget}
                rel={supportRel}
                className="btn-primary mt-6"
              >
                {t("buyMeCoffee")}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
