import type { Metadata } from "next";
import Image from "next/image";
import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import EpisodeCard from "@/components/EpisodeCard";
import FadeIn from "@/components/FadeIn";
import { Link } from "@/i18n/navigation";
import { formatStat } from "@/lib/format";
import { localeAlternates } from "@/lib/metadata";
import { getAllEpisodes } from "@/lib/rss";
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

function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c.9 6.6 4.8 10.9 12 12-7.2 1.1-11.1 5.4-12 12-.9-6.6-4.8-10.9-12-12C7.2 10.9 11.1 6.6 12 0z" />
    </svg>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.1 4 6.3 4c2.4 0 4 1.4 5.7 3.4C13.7 5.4 15.3 4 17.7 4 21.9 4 23.7 8.4 22 11.7 19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function OutlineIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

// Microphone, sparkles, video camera, tag — one per brand offer
const offerIcons = [
  "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z",
  "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z",
];

const offerStyles = ["bg-cream -rotate-2", "bg-butter rotate-1", "bg-blush rotate-1", "bg-white -rotate-1"];

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localeAlternates(locale, "") };
}

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
  const allEpisodes = await getAllEpisodes(settings?.podcastRssUrl);
  const topEpisodes = [...allEpisodes].sort((a, b) => b.views - a.views).slice(0, 3);

  const heroTagline = settings?.heroTagline ?? "The Podcast";
  const heroTitle = settings?.heroTitle ?? "Love Mode";
  const heroDescription =
    settings?.heroDescription ??
    "Real conversations about love, dating, and building relationships that actually last. No sugarcoating, no games — just honest talk and real advice.";
  const episodeSchedule = settings?.episodeSchedule ?? "New episodes every Friday";
  const platforms = settings?.platformLinks ?? [];
  const aboutTitle = settings?.aboutTitle ?? "What is Love Mode?";
  const savedParagraphs = (settings?.aboutParagraphs ?? []).filter((p) => p.trim());
  const aboutParagraphs = savedParagraphs.length
    ? savedParagraphs
    : [
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
  const hostFirstName = hostName.split(" ")[0];
  const topics = t.raw("topics") as string[];
  const brandOffers = t.raw("brandOffers") as { title: string; description: string }[];

  const totalViews = allEpisodes.reduce((sum, episode) => sum + (episode.views || 0), 0);
  const stats = [
    allEpisodes.length > 0 && { value: String(allEpisodes.length), label: t("statEpisodes") },
    totalViews > 0 && { value: formatStat(totalViews), label: t("statViews") },
    platforms.length > 0 && { value: String(platforms.length), label: t("statPlatforms") },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <>
      {/* ===== SOFT POP HERO ===== */}
      <section className="theme-soft relative overflow-hidden">
        <Sparkle className="absolute left-[30%] top-28 hidden h-7 w-7 text-brand-400 motion-safe:animate-float md:block" />
        <Sparkle className="absolute right-[46%] top-24 hidden h-5 w-5 text-butter lg:block" />
        <Sparkle className="absolute bottom-16 left-[42%] hidden h-9 w-9 text-butter motion-safe:animate-float lg:block" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 md:pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:px-8 lg:pb-24">
          {/* Left — headline + CTAs */}
          <div>
            <div className="motion-safe:animate-rise">
              <span className="sticker">
                <Sparkle className="h-3 w-3" />
                {heroTagline}
              </span>
            </div>

            <div className="motion-safe:animate-rise [animation-delay:80ms]">
              <h1 className="mt-6 font-display text-[clamp(4.25rem,14vw,9.5rem)] font-extrabold lowercase leading-[0.82] tracking-[-0.045em] text-brand-700">
                {heroTitle}
              </h1>
              <svg
                className="mt-3 h-4 w-56 text-brand-400 md:w-72"
                viewBox="0 0 280 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 9c20-8 40 8 60 0s40-8 60 0 40 8 60 0 40-8 54 0"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="motion-safe:animate-rise [animation-delay:160ms]">
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/80">
                {heroDescription}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row motion-safe:animate-rise [animation-delay:240ms]">
              <Link href="/episodes" className="btn-primary !px-7 !py-3.5 !text-base">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
                </svg>
                {t("listenNow")}
              </Link>
              <Link href="/collaborate" className="btn-secondary !px-7 !py-3.5 !text-base">
                {t("workWithUs")}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {platforms.length > 0 && (
              <div className="mt-10 flex items-center gap-4 motion-safe:animate-rise [animation-delay:320ms]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
                  {t("listenOn")}
                </p>
                <div className="flex items-center gap-2.5">
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
                        className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-white text-ink shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-butter"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right — arch photo with stickers */}
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:mr-4 motion-safe:animate-rise [animation-delay:120ms]">
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-b-[2.5rem] rounded-t-full border-2 border-ink bg-butter"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-b-[2.5rem] rounded-t-full border-2 border-ink bg-brand-200">
              <Image
                src="/images/hero.jpg"
                alt="Love Mode Podcast studio"
                fill
                priority
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="object-cover object-[52%_center]"
              />
            </div>

            {/* Spinning schedule sticker */}
            <div className="absolute -bottom-6 -left-2 grid h-32 w-32 place-items-center rounded-full border-2 border-ink bg-brand-600 shadow-pop sm:-left-10 sm:h-36 sm:w-36">
              <svg
                className="absolute inset-0 h-full w-full motion-safe:animate-spin-slow"
                viewBox="0 0 120 120"
                aria-hidden="true"
              >
                <defs>
                  <path id="schedule-circle" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
                </defs>
                <text className="fill-cream text-[10px] font-bold uppercase tracking-[0.18em]">
                  <textPath href="#schedule-circle" textLength="272" lengthAdjust="spacing">
                    {`${episodeSchedule} ✶`}
                  </textPath>
                </text>
              </svg>
              <Heart className="h-9 w-9 text-butter" />
              <span className="sr-only">{episodeSchedule}</span>
            </div>

            {/* Host tag */}
            {aboutData?.hostName && (
              <div className="absolute right-2 top-12 rotate-6 sm:-right-3 motion-safe:animate-float">
                <span className="sticker bg-white normal-case tracking-normal">
                  {t("hostedBy", { name: hostName })}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== TOPIC MARQUEE ===== */}
      <div className="overflow-hidden bg-[linear-gradient(to_bottom,var(--theme-soft-bg)_50%,var(--theme-page-bg)_50%)] py-6">
        <div className="-mx-4 -rotate-1 border-y-2 border-ink bg-brand-600 py-3 text-cream">
          <div className="flex w-max motion-safe:animate-marquee">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                {topics.map((topic) => (
                  <li key={topic} className="flex items-center">
                    <span className="px-6 font-display text-2xl font-extrabold lowercase tracking-tight md:text-3xl">
                      {topic}
                    </span>
                    <Sparkle className="h-5 w-5 text-butter" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ABOUT ===== */}
      <section className="section-padding theme-page">
        <FadeIn className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2 className="font-display text-5xl font-extrabold lowercase leading-[0.9] tracking-tight text-brand-700 md:text-7xl">
              {aboutTitle}
            </h2>
            <p className="mt-6 inline-flex -rotate-2 items-center gap-2 font-hand text-2xl font-medium text-brand-500 md:text-3xl">
              {t("aboutSpoiler")}
              <svg className="h-6 w-12 shrink-0" viewBox="0 0 60 30" fill="none" aria-hidden="true">
                <path d="M2 22c14-14 32-18 52-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M45 6l9 8-11 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </p>
          </div>

          <div className="space-y-6 lg:pt-3">
            {aboutParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? "font-display text-2xl font-semibold leading-snug tracking-tight text-ink md:text-3xl"
                    : "text-lg leading-relaxed text-ink/75"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ===== MOST VIEWED EPISODES ===== */}
      <section className="section-padding theme-soft">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="sticker">
                <Sparkle className="h-3 w-3" />
                {t("mostViewedLabel")}
              </span>
              <h2 className="mt-5 font-display text-4xl font-extrabold lowercase leading-[0.95] tracking-tight text-ink md:text-6xl">
                {t("mostViewedEpisodes")}
              </h2>
            </div>

            {topEpisodes.length > 0 && (
              <Link href="/episodes" className="btn-secondary self-start md:self-auto">
                {t("viewAllEpisodes")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </FadeIn>

          {topEpisodes.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {topEpisodes.map((episode, index) => (
                <FadeIn key={episode.link} delay={index * 0.12}>
                  <EpisodeCard episode={episode} rank={index + 1} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="editorial-panel border-dashed p-12 text-center">
              <p className="text-lg font-semibold text-ink/70">{t("episodesComingSoon")}</p>
              <p className="mt-2 text-sm text-ink/50">{t("setRssUrl")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== WORK WITH LOVE MODE (BRANDS) ===== */}
      <section className="section-padding theme-page">
        <FadeIn className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border-2 border-ink bg-brand-600 p-8 text-cream shadow-pop-lg sm:p-10 lg:p-14">
          <Sparkle className="absolute right-10 top-10 hidden h-10 w-10 text-butter motion-safe:animate-spin-slow lg:block" />
          <Sparkle className="absolute bottom-10 left-[46%] hidden h-6 w-6 text-brand-300 lg:block" />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <span className="sticker">
                <Sparkle className="h-3 w-3" />
                {t("brandsLabel")}
              </span>
              <h2 className="mt-6 font-display text-4xl font-extrabold lowercase leading-[0.92] tracking-tight md:text-6xl">
                {t("brandsTitle")}
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/85">
                {t("brandsDescription")}
              </p>

              {stats.length > 0 && (
                <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t-2 border-cream/25 pt-8">
                  {stats.map(({ value, label }) => (
                    <div key={label}>
                      <dt className="sr-only">{label}</dt>
                      <dd className="font-display text-4xl font-extrabold tracking-tight text-butter md:text-5xl">
                        {value}
                      </dd>
                      <dd className="mt-1 text-sm font-semibold leading-snug text-cream/80">{label}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/collaborate" className="btn-secondary !px-7 !py-3.5 !text-base">
                  {t("brandsCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="-rotate-3 font-hand text-2xl font-medium text-butter">
                  {t("brandsReply")}
                </p>
              </div>
            </div>

            <ul className="grid content-center gap-5 sm:grid-cols-2">
              {brandOffers.map((offer, index) => (
                <li
                  key={offer.title}
                  className={`rounded-3xl border-2 border-ink p-6 text-ink shadow-pop transition-transform duration-200 hover:-translate-y-1 hover:rotate-0 ${offerStyles[index % offerStyles.length]}`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-white text-brand-600">
                    <OutlineIcon d={offerIcons[index % offerIcons.length]} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight">{offer.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{offer.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </section>

      {/* ===== MEET YOUR HOST ===== */}
      <section className="section-padding theme-soft overflow-hidden">
        <FadeIn className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="relative mx-auto w-full max-w-xs md:max-w-sm">
            <div
              className="absolute inset-0 rotate-3 rounded-[2.5rem] border-2 border-ink bg-brand-400"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] -rotate-2 overflow-hidden rounded-[2.5rem] border-2 border-ink bg-brand-200">
              <Image
                src={hostPhoto}
                alt={hostName}
                fill
                sizes="(min-width: 768px) 24rem, 80vw"
                className="object-cover"
              />
            </div>
            <span className="sticker absolute -bottom-4 left-1/2 -translate-x-1/2 -rotate-3 whitespace-nowrap">
              {t("meetYourHost")}
            </span>
          </div>

          <div className="text-center md:text-left">
            <p className="-rotate-2 font-hand text-3xl font-medium text-brand-500 md:text-4xl">
              {t("hostHello")}
            </p>
            <h2 className="mt-1 font-display text-5xl font-extrabold lowercase leading-[0.9] tracking-tight text-brand-700 md:text-7xl">
              {hostName}
            </h2>
            {hostBio && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80 md:mx-0">
                {hostBio}
              </p>
            )}
            <Link href="/about" className="btn-primary mt-8">
              {t("meetHostCta", { name: hostFirstName })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ===== BE A GUEST + SUPPORT ===== */}
      <section id="support" className="section-padding theme-page">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <FadeIn className="relative overflow-hidden rounded-[2.5rem] border-2 border-ink bg-butter p-8 shadow-pop-lg sm:p-10 lg:p-12">
            <Sparkle className="absolute right-8 top-8 h-10 w-10 text-brand-500 motion-safe:animate-spin-slow" />
            <span className="sticker bg-white">{t("guestLabel")}</span>
            <h2 className="mt-6 max-w-lg font-display text-4xl font-extrabold lowercase leading-[0.95] tracking-tight text-ink md:text-6xl">
              {t("wantToBeAGuest")}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/80">
              {t("guestDescription")}
            </p>
            <Link href="/apply" className="btn-primary mt-8">
              {t("applyNow")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <FadeIn
            delay={0.12}
            className="flex flex-col justify-between rounded-[2.5rem] border-2 border-ink bg-white p-8 shadow-pop-lg sm:p-10"
          >
            <div>
              <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-blush text-brand-600">
                <Heart className="h-6 w-6" />
              </span>
              <p className="section-label mt-6">{t("supportLabel")}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold lowercase tracking-tight text-ink">
                {t("supportTheShow")}
              </h3>
              <p className="mt-3 leading-relaxed text-ink/75">{t("supportDescription")}</p>
            </div>
            <a
              href={buyMeCoffeeUrl}
              target={supportTarget}
              rel={supportRel}
              className="btn-accent mt-8 self-start"
            >
              {t("buyMeCoffee")}
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
