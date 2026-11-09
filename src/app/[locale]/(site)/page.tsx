import type { Metadata } from "next";
import Image from "next/image";
import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NewsletterForm from "@/components/forms/NewsletterForm";
import ArrowLink from "@/components/postal/ArrowLink";
import {
  BrokenHeart,
  CoffeeCup,
  CoffeeDate,
  Envelope,
  Heart,
  LetterAndPlane,
  Microphone,
  PaperPlane,
  Rings,
  Sailboat,
  Telephone,
} from "@/components/postal/Doodles";
import Postmark, { CancelWaves } from "@/components/postal/Postmark";
import { localeAlternates } from "@/lib/metadata";
import { getAllEpisodes, type Episode } from "@/lib/rss";
import { getAboutPage, getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

// Sections for services that aren't connected yet (the paid sessions)
// stay hidden until they work. Set SHOW_UPCOMING_SECTIONS=true on a deployment
// to review them; they always show in local development.
const showUpcoming =
  process.env.SHOW_UPCOMING_SECTIONS === "true" || process.env.NODE_ENV === "development";

const stopDoodles = [CoffeeDate, Rings, BrokenHeart, Sailboat];
const episodeDoodles = [CoffeeDate, PaperPlane, Heart];
const stampFields = ["bg-peach", "bg-bubblegum", "bg-tangerine"];

// Desktop positions for the four journey stamps along the winding route
const stopPlacement = [
  "lg:left-0 lg:top-0 lg:-rotate-2",
  "lg:left-[318px] lg:top-[70px] lg:rotate-[1.5deg]",
  "lg:left-0 lg:top-[270px] lg:rotate-1",
  "lg:left-[318px] lg:top-[340px] lg:-rotate-[1.5deg]",
];
const postmarkTilt = ["rotate-[10deg]", "-rotate-[8deg]", "rotate-6", "-rotate-[10deg]"];

/* "41. Volver al dating | Gabriela Zuluaga" -> number, title and guest */
function splitEpisodeTitle(episode: Episode) {
  const match = episode.title.match(/^(\d+)\.?\s*(.*)$/);
  const [rest, guest] = (match ? match[2] : episode.title).split(/\s+\|\s+/);
  return { number: match?.[1], title: rest.trim(), guest: guest?.trim() };
}

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

  const heroTitle = t("heroTitle");
  const heroTagline = t("heroTagline");
  const heroDescription = t("heroDescription");
  const aboutTitle = t("welcomeTitle");
  const aboutParagraphs = (t.raw("welcomeParagraphs") as string[]).filter((p) => p.trim());
  const buyMeCoffeeUrl = settings?.buyMeCoffeeUrl;

  const hostName = aboutData?.hostName ?? "Andrea Moreno";
  const hostFirstName = hostName.split(" ")[0];
  const hostBio = (aboutData?.hostBio ?? []).filter((p) => p.trim()).slice(0, 2);
  const hostPhoto = aboutData?.hostPhoto?.asset?.url ?? "/images/host.jpg";

  const topics = t.raw("topics") as string[];
  const stops = t.raw("journeyStops") as { title: string; description: string; search: string }[];
  const episodesIntro = t.raw("episodesIntro") as string[];
  const guestParagraphs = t.raw("guestParagraphs") as string[];

  // The welcome reads like a letter: questions first, then the reply
  const [welcomeQuestions, ...welcomeReply] = aboutParagraphs;
  const welcomeClosing = welcomeReply.length > 1 ? welcomeReply.pop() : undefined;

  return (
    <>
      {/* ===== HERO: a stamp, its postmark and the cancel waves ===== */}
      <section className="relative overflow-hidden">
        <div className="page-container grid items-center gap-12 pb-16 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:pb-24 lg:pt-14">
          <div className="relative z-10 flex flex-col gap-6 motion-safe:animate-rise">
            <p className="font-hand text-[1.75rem] leading-tight sm:text-[2.125rem]">{t("dearYou")}</p>
            <h1 className="max-w-[9ch] font-display text-[clamp(5.5rem,22vw,10.5rem)] font-normal leading-[0.86] tracking-[-0.035em]">
              {heroTitle}
            </h1>
            <p className="mt-1 text-lg font-semibold sm:text-[1.3125rem]">
              {t("heroBy", { tagline: heroTagline, name: hostName })}
            </p>
            {heroDescription && (
              <p className="max-w-[30rem] text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">{heroDescription}</p>
            )}
            <div className="mt-1 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
              <ArrowLink href="/episodes">{t("listenNow")}</ArrowLink>
              <span className="whitespace-nowrap font-hand text-[1.1875rem]">{t("heroHome")}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[25.5rem] pb-10 lg:mr-10 lg:max-w-[26rem]">
            <CancelWaves className="absolute -left-48 top-24 hidden h-40 w-64 lg:block" />
            <div className="stamp relative rotate-[3deg]">
              <div className="flex flex-col gap-3 bg-bubblegum p-3.5">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src="/images/hero.jpg"
                    alt={t("heroPhotoAlt")}
                    fill
                    priority
                    sizes="(min-width: 1024px) 26rem, 90vw"
                    className="object-cover object-[58%_center]"
                  />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl leading-none">Love Mode</span>
                  <span className="text-sm font-semibold">{t("stampFrom")}</span>
                </div>
              </div>
            </div>
            <Postmark
              id="hero-postmark"
              text={t("postmark")}
              className="absolute -left-6 -top-10 h-32 w-32 -rotate-12 sm:-left-14 sm:h-[10.5rem] sm:w-[10.5rem]"
            />
            <p className="absolute -right-2 bottom-0 -rotate-[4deg] rounded-full bg-plum px-6 py-3 font-hand text-[1.0625rem] text-bubblegum sm:-right-12 sm:text-[1.3125rem]">
              {t("photoNote")}
            </p>
          </div>
        </div>
      </section>

      {/* ===== TOPICS ===== */}
      <ul className="page-container flex flex-wrap gap-2.5" aria-label={t("topicsLabel")}>
        {topics.map((topic, index) => (
          <li
            key={topic}
            className={index === topics.length - 1 ? "chip border-tangerine bg-tangerine font-semibold" : "chip"}
          >
            {topic}
          </li>
        ))}
      </ul>

      {/* ===== WELCOME, written like a letter ===== */}
      {aboutTitle && (
        <section className="page-container grid gap-12 py-24 lg:grid-cols-[5fr_7fr] lg:gap-[5.5rem] lg:py-32">
          <div className="flex flex-col gap-10">
            <h2 className="font-display text-[clamp(2.75rem,6vw,4rem)] leading-none tracking-[-0.02em]">{aboutTitle}</h2>
            <LetterAndPlane className="hidden h-[12.5rem] w-80 lg:block" />
          </div>
          <div className="flex max-w-[40rem] flex-col gap-6">
            {welcomeQuestions && (
              <p className="font-display text-[1.5rem] leading-[1.4] sm:text-[1.6875rem]">{welcomeQuestions}</p>
            )}
            {welcomeReply.map((paragraph) => {
              const gotYou = paragraph.match(/^(I got ya!)\s*(.*)$/);
              return (
                <p key={paragraph} className="text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">
                  {gotYou ? (
                    <>
                      <span className="font-hand text-2xl text-plum">{gotYou[1]}</span> {gotYou[2]}
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              );
            })}
            {welcomeClosing && <p className="text-lg font-semibold leading-relaxed sm:text-[1.1875rem]">{welcomeClosing}</p>}
          </div>
        </section>
      )}

      {/* ===== THE LOVE JOURNEY: four stops along a route ===== */}
      <section className="page-container pb-24 lg:pb-32">
        <div className="grid items-center gap-12 rounded-[2.25rem] bg-bubblegum px-6 py-12 [--stamp-cut:#ffcafd] sm:px-10 lg:grid-cols-[23.75rem_minmax(0,1fr)] lg:gap-14 lg:py-[4.5rem] lg:pl-[4.5rem] lg:pr-16">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.02em]">{t("journeyTitle")}</h2>
            <p className="text-lg leading-relaxed">{t("journeyIntro")}</p>
            <p className="mt-2 font-hand text-[1.1875rem] leading-normal">{t("journeyNote")}</p>
          </div>

          <div className="relative lg:h-[35rem]">
            <svg className="absolute inset-0 hidden h-full w-[36.25rem] lg:block" viewBox="0 0 580 560" aria-hidden="true">
              <path
                d="M130 120C270 30 360 110 450 190S270 280 130 380 340 540 450 450"
                fill="none"
                stroke="#2d1530"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="2 9"
              />
            </svg>
            <ol className="flex flex-col gap-8 sm:grid sm:grid-cols-2 lg:block">
              {stops.map((stop, index) => {
                const Doodle = stopDoodles[index];
                return (
                  <li key={stop.title} className={`relative lg:absolute lg:w-[16.375rem] ${stopPlacement[index]}`}>
                    <Link href={`/episodes?q=${encodeURIComponent(stop.search)}`} className="stamp stamp-sm block">
                      <span className="flex flex-col gap-2 bg-shell px-[1.375rem] pb-6 pt-[1.375rem]">
                        <Doodle className="h-10 w-14" />
                        <span className="mt-1.5 whitespace-nowrap font-display text-[1.4375rem] leading-tight">{stop.title}</span>
                        <span className="text-base leading-normal text-mauve">{stop.description}</span>
                      </span>
                    </Link>
                    <span
                      className={`absolute -right-3.5 -top-4 grid h-[2.875rem] w-[2.875rem] place-items-center rounded-full border-2 border-tangerine bg-shell font-display text-[1.375rem] text-plum ${postmarkTilt[index]}`}
                    >
                      <span className="sr-only">{t("stopLabel")} </span>
                      {index + 1}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ===== FEATURED EPISODES AS STAMPS ===== */}
      {topEpisodes.length > 0 && (
        <section className="page-container flex flex-col gap-12 pb-24 lg:pb-32">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-[42.5rem] flex-col gap-4">
              <h2 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] tracking-[-0.02em]">
                {t("mostViewedEpisodes")}
              </h2>
              <p className="text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">
                {[episodesIntro[0], episodesIntro[episodesIntro.length - 1]].join(" ")}
              </p>
            </div>
            <Link href="/episodes" className="shrink-0 text-[1.0625rem] font-semibold underline underline-offset-[5px]">
              {t("viewAllEpisodes")}
            </Link>
          </div>

          <div className="grid items-start gap-9 md:grid-cols-3">
            {topEpisodes.map((episode, index) => {
              const { number, title, guest } = splitEpisodeTitle(episode);
              const Doodle = episodeDoodles[index % episodeDoodles.length];
              const tilt = ["-rotate-[1.5deg]", "rotate-1 md:translate-y-5", "-rotate-[0.5deg]"][index % 3];
              return (
                <a
                  key={episode.link}
                  href={episode.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`stamp block ${tilt}`}
                >
                  <span className={`flex min-h-[22rem] flex-col gap-3.5 p-7 ${stampFields[index % stampFields.length]}`}>
                    <span className="flex items-start justify-between">
                      {number && <span className="font-display text-7xl leading-[0.8]">{number}</span>}
                      <Doodle className="h-12 w-16" />
                    </span>
                    <span className="mt-auto font-display text-[1.75rem] leading-[1.15]">{title}</span>
                    {guest && (
                      <span className={index % 3 === 2 ? "text-base" : "text-base text-mauve"}>
                        {t("withGuest", { guest })}
                      </span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
          <p className="mt-4 flex items-center gap-3.5 font-hand text-2xl">
            <CoffeeCup className="h-9 w-12 shrink-0" />
            {t("episodesNote")}
          </p>
        </section>
      )}

      {/* ===== ¿LO HABLAMOS? (preview only until booking and payments are connected) ===== */}
      {showUpcoming && (
        <section className="bg-plum py-24 text-shell lg:py-32">
          <div className="page-container flex flex-col gap-14">
            <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-end lg:gap-[5.5rem]">
              <h2 className="font-display text-[clamp(3.5rem,8vw,6rem)] leading-[0.92] tracking-[-0.03em] text-bubblegum">
                {t("talkTitle")}
              </h2>
              <p className="max-w-[37.5rem] text-lg leading-relaxed text-shell/85 sm:text-[1.1875rem]">{t("talkIntro")}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="grid gap-8 rounded-md bg-shell p-8 text-plum sm:grid-cols-[1fr_7.5rem] sm:p-11">
                <div className="flex flex-col gap-4">
                  <Telephone className="h-14 w-14" />
                  <h3 className="font-display text-[2.25rem] leading-[1.08]">{t("callTitle")}</h3>
                  <p className="text-[1.0625rem] leading-relaxed text-mauve">{t("callBody")}</p>
                  <a href="#" className="btn-primary mt-auto self-start !text-base">{t("callCta")}</a>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start sm:border-l-[1.5px] sm:border-plum/15 sm:pl-6">
                  <span className="stamp stamp-sm block w-24 rotate-[4deg] [--stamp-cut:#fff2ec]">
                    <span className="flex h-[6.25rem] flex-col items-center justify-center bg-tangerine">
                      <span className="font-display text-[2.125rem] leading-none">30</span>
                      <span className="text-xs font-bold">min</span>
                    </span>
                  </span>
                  <span className="font-display text-4xl">{t("callPrice")}</span>
                </div>
              </div>
              <div className="relative grid gap-8 overflow-hidden rounded-md bg-bubblegum p-8 text-plum sm:grid-cols-[1fr_7.5rem] sm:p-11">
                <svg className="absolute inset-x-0 top-0 h-[4.75rem] w-full" viewBox="0 0 600 76" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 0L300 72 600 0" fill="none" stroke="rgba(45,21,48,0.28)" strokeWidth="1.5" />
                </svg>
                <div className="relative flex flex-col gap-4 pt-5">
                  <h3 className="font-display text-[2.25rem] leading-[1.08]">{t("emailTitle")}</h3>
                  <p className="text-[1.0625rem] leading-relaxed">{t("emailBody")}</p>
                  <a href="#" className="btn-primary mt-auto self-start !text-base">{t("emailCta")}</a>
                </div>
                <div className="relative flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-end">
                  <svg className="h-20 w-20" viewBox="0 0 104 104" aria-hidden="true">
                    <path d="M52 4c6 0 8 5 12 6s9-2 12 2-2 9 0 13 7 6 4 11-8 4-10 8-1 10-6 12-9-2-13-1-7 6-12 3-2-8-6-10-10-2-12-7 4-8 3-12-7-6-4-11 9-3 12-5 3-9 8-12 7 4 10 3z" fill="#ff6339" />
                    <path d="M52 70C40 61 32 55 32 46c0-6 4-10 10-10 4 0 8 2 10 6 2-4 6-6 10-6 6 0 10 4 10 10 0 9-8 15-20 24z" fill="none" stroke="#2d1530" strokeWidth="3" strokeLinejoin="round" />
                  </svg>
                  <span className="font-display text-4xl">{t("emailPrice")}</span>
                </div>
              </div>
            </div>
            <p className="max-w-[51rem] text-[0.9375rem] leading-relaxed text-shell/70">{t("talkDisclaimer")}</p>
          </div>
        </section>
      )}

      {/* ===== HOST ===== */}
      <section className="page-container grid items-center gap-14 py-24 lg:grid-cols-[5fr_7fr] lg:gap-24 lg:py-32">
        <div className="relative mx-auto w-full max-w-[24.5rem] lg:mx-0">
          <div className="relative aspect-[39/51] overflow-hidden rounded-b-lg rounded-t-full bg-bubblegum">
            <Image src={hostPhoto} alt={hostName} fill sizes="(min-width: 1024px) 24.5rem, 90vw" className="object-cover" />
          </div>
          <Postmark
            id="host-postmark"
            text={t("hostPostmark")}
            color="#2d1530"
            textColor="#2d1530"
            className="absolute -bottom-6 right-0 h-32 w-32 rotate-[10deg] sm:-right-10 sm:h-36 sm:w-36"
          >
            <g transform="translate(50 46) scale(0.5)" fill="none" stroke="#2d1530" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M26 50c-2 22 10 34 24 34s26-12 24-34c-4-10-44-10-48 0z" />
              <path d="M30 46c-8-5-13-14-10-23 9 0 17 7 20 16M70 46c8-5 13-14 10-23-9 0-17 7-20 16" />
              <circle cx="40" cy="57" r="3.5" />
              <circle cx="60" cy="57" r="3.5" />
              <path d="M44 66c3-3 9-3 12 0-3 4-9 4-12 0z" />
            </g>
          </Postmark>
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-[clamp(3.25rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.03em]">
            {t("hostTitle", { name: hostFirstName })}
          </h2>
          {hostBio[0] && <p className="text-[1.3125rem] font-semibold">{hostBio[0]}</p>}
          {hostBio[1] && <p className="max-w-[36rem] text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">{hostBio[1]}</p>}
          <div className="mt-2 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
            <Link href="/about" className="btn-outline">{t("meetHostCta")}</Link>
            <span className="font-hand text-[1.375rem]">{t("hostNote")}</span>
          </div>
        </div>
      </section>

      {/* ===== SHARE YOUR STORY: a postcard ===== */}
      <section className="page-container pb-24 lg:pb-32">
        <div className="relative grid gap-12 overflow-hidden rounded-md bg-white px-6 pb-12 pt-14 shadow-postal [--stamp-cut:#ffffff] sm:px-12 lg:grid-cols-[1fr_1.5px_1fr] lg:gap-14 lg:px-14 lg:pb-14 lg:pt-16">
          <div className="airmail absolute inset-x-0 top-0 [--airmail-gap:#ffffff]" aria-hidden="true" />
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-[clamp(2.5rem,5vw,3.375rem)] leading-[1.02] tracking-[-0.02em]">{t("wantToBeAGuest")}</h2>
            <p className="text-lg leading-relaxed text-mauve">{guestParagraphs.join(" ")}</p>
            <ArrowLink href="/apply" className="mt-2 self-start">{t("applyNow")}</ArrowLink>
          </div>
          <div className="hidden bg-plum/15 lg:block" />
          <div className="relative flex flex-col justify-end pt-40">
            <span className="stamp stamp-sm absolute right-0 top-0 block w-[6.875rem] rotate-[4deg] [--stamp-cut:#ffffff]">
              <span className="grid h-[6.75rem] place-items-center bg-plum">
                <Microphone className="h-14 w-14" stroke="#ffcafd" />
              </span>
            </span>
            <svg className="absolute right-[4.5rem] top-6 h-[7.5rem] w-48 opacity-80" viewBox="0 0 190 120" aria-hidden="true">
              <g fill="none" stroke="#ff6339" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="60" cy="60" r="44" />
                <path d="M112 36c13-9 26 9 39 0s26 9 39 0M112 60c13-9 26 9 39 0s26 9 39 0M112 84c13-9 26 9 39 0s26 9 39 0" />
              </g>
            </svg>
            <p className="border-b-[1.5px] border-plum/20 py-3 font-hand text-[1.375rem]">{t("postcardTo", { name: hostFirstName })}</p>
            <p className="border-b-[1.5px] border-plum/20 py-3 font-hand text-[1.375rem] text-mauve">{t("postcardLine")}</p>
            <div className="h-12 border-b-[1.5px] border-plum/20" />
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-mauve">{t("guestNote")}</p>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER (signups go to Kit) ===== */}
      <section className="page-container pb-24 lg:pb-32">
        <div className="grid items-center gap-12 rounded-[2.25rem] bg-tangerine px-6 py-12 sm:px-12 lg:grid-cols-[6fr_5fr] lg:gap-[4.5rem] lg:p-[4.5rem]">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] tracking-[-0.02em]">{t("newsTitle")}</h2>
            <p className="max-w-[32.5rem] text-lg leading-relaxed sm:text-[1.1875rem]">{t("newsBody")}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* ===== COFFEE + BRANDS: one tear-off ticket ===== */}
      <section className="page-container pb-24 lg:pb-32">
        <div className="grid rounded-md bg-white shadow-postal md:grid-cols-[1fr_2px_1fr]">
          <div className="flex flex-col gap-4 p-8 sm:p-[3.25rem]">
            <CoffeeCup className="h-11 w-[3.75rem]" />
            <h3 className="font-display text-[2.5rem] leading-[1.05]">{t("supportTheShow")}</h3>
            <p className="text-[1.0625rem] leading-relaxed text-mauve">{t("supportDescription")}</p>
            <p className="font-hand text-xl">{t("supportThanks")}</p>
            {buyMeCoffeeUrl && (
              <a href={buyMeCoffeeUrl} target="_blank" rel="noopener noreferrer" className="btn-tangerine mt-1.5 self-start">
                {t("buyMeCoffee")}
              </a>
            )}
          </div>
          <div className="mx-8 h-0.5 bg-[repeating-linear-gradient(to_right,rgba(45,21,48,0.3)_0_8px,transparent_8px_16px)] md:mx-0 md:my-8 md:h-auto md:bg-[repeating-linear-gradient(to_bottom,rgba(45,21,48,0.3)_0_8px,transparent_8px_16px)]" aria-hidden="true" />
          <div className="flex flex-col gap-4 p-8 sm:p-[3.25rem]">
            <Envelope className="h-11 w-[3.75rem]" />
            <h3 className="font-display text-[2.5rem] leading-[1.05]">{t("brandsTitle")}</h3>
            <p className="text-[1.0625rem] leading-relaxed text-mauve">{t("brandsShort")}</p>
            <Link href="/collaborate" className="btn-outline mt-auto self-start">{t("brandsCta")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
