import type { Metadata } from "next";
import Image from "next/image";
import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NewsletterForm from "@/components/forms/NewsletterForm";
import ArrowLink, { ArrowIcon } from "@/components/postal/ArrowLink";
import {
  BrokenHeart,
  CoffeeCup,
  CoffeeDate,
  Envelope,
  Microphone,
  Rings,
  Sailboat,
  Telephone,
} from "@/components/postal/Doodles";
import Postmark, { CancelWaves, HostPostmark } from "@/components/postal/Postmark";
import JsonLd from "@/components/JsonLd";
import ListenerReviews from "@/components/ListenerReviews";
import LatestEpisodePostcard from "@/components/LatestEpisodePostcard";
import { localeAlternates } from "@/lib/metadata";
import { episodePath, guestLine, splitEpisodeTitle } from "@/lib/episodes";
import { stopPath } from "@/lib/journey";
import { platformLabel } from "@/lib/format";
import { withPreviewSample } from "@/lib/socialProof";
import { paidEmailReady } from "@/lib/stripe";
import { getAllEpisodes } from "@/lib/rss";
import { host, podcastSeries, website } from "@/lib/structuredData";
import { getAboutPage, getSiteSettings, getSocialProof } from "@/sanity/client";

export const revalidate = 3600;

// Sections for services that aren't connected yet (the paid sessions)
// stay hidden until they work. Set SHOW_UPCOMING_SECTIONS=true on a deployment
// to review them; they always show in local development.
const showUpcoming =
  process.env.SHOW_UPCOMING_SECTIONS === "true" || process.env.NODE_ENV === "development";

const stopDoodles = [CoffeeDate, Rings, BrokenHeart, Sailboat];
// Stamps are peach and bubblegum; tangerine is kept for things you press
const stopFields = ["bg-peach", "bg-bubblegum", "bg-bubblegum", "bg-peach"];
const stampFields = ["bg-peach", "bg-bubblegum", "bg-peach"];

// Desktop positions for the four journey stamps along the winding route
const stopPlacement = [
  "lg:left-0 lg:top-0 lg:-rotate-2",
  "lg:left-[318px] lg:top-[70px] lg:rotate-[1.5deg]",
  "lg:left-0 lg:top-[270px] lg:rotate-1",
  "lg:left-[318px] lg:top-[340px] lg:-rotate-[1.5deg]",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  // The full title skips the " · Love Mode Podcast" suffix the other pages get
  return { title: { absolute: t("homeTitle") }, alternates: localeAlternates(locale, "") };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: preview } = await draftMode();
  const t = await getTranslations({ locale, namespace: "home" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const tEpisode = await getTranslations({ locale, namespace: "episode" });

  const [settings, aboutData, savedProof] = await Promise.all([
    getSiteSettings({ preview, locale }),
    getAboutPage({ preview, locale }),
    getSocialProof({ preview, locale }),
  ]);
  const { proof } = withPreviewSample(savedProof);
  const allEpisodes = await getAllEpisodes(settings?.podcastRssUrl);
  const latest = allEpisodes[0];
  // The most listened, leaving out the latest so it isn't shown twice
  const topEpisodes = allEpisodes
    .filter((episode) => episode !== latest)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);
  const followLinks = (settings?.platformLinks ?? [])
    .filter((link) => link.url)
    .map(({ platform, url }) => ({ label: platformLabel(platform), url }));

  const heroTitle = t("heroTitle");
  const heroTagline = t("heroTagline");
  const heroDescription = t("heroDescription");
  const aboutTitle = t("welcomeTitle");
  const aboutParagraphs = (t.raw("welcomeParagraphs") as string[]).filter((p) => p.trim());
  const buyMeCoffeeUrl = settings?.buyMeCoffeeUrl;
  // ¿Lo hablamos? goes live when it's switched on in the Studio and the Cal.com link is set.
  // The email card needs Stripe (STRIPE_SECRET_KEY); without it only the call shows.
  const callBookingUrl = settings?.callBookingUrl;
  const showSessions = showUpcoming || Boolean(settings?.showSessions && callBookingUrl);
  const emailReady = showUpcoming || paidEmailReady();

  const hostName = aboutData?.hostName ?? "Andrea Moreno";
  const hostFirstName = hostName.split(" ")[0];
  const hostPhoto = aboutData?.hostPhoto?.asset?.url ?? "/images/host.jpg";

  const topics = t.raw("topics") as string[];
  // Episodes are in Spanish, so each pill searches for its Spanish word (same order as the topics)
  const topicSearches = t.raw("topicSearches") as string[];
  const stops = t.raw("journeyStops") as { title: string; description: string; search: string }[];
  // Each stop has its own page, addressed by its Spanish name in both languages
  const stopPaths = (
    (await getTranslations({ locale: "es", namespace: "home" })).raw("journeyStops") as { title: string }[]
  ).map((stop) => stopPath(stop.title));
  const episodesIntro = t.raw("episodesIntro") as string[];
  const guestParagraphs = t.raw("guestParagraphs") as string[];

  // The welcome reads like a letter: questions first, then the reply (its first two
  // paragraphs keep it short; the rest of Andrea's story lives on the About page)
  const [welcomeQuestions, ...welcomeReply] = aboutParagraphs;
  const welcomeClosing = welcomeReply.length > 1 ? welcomeReply.pop() : undefined;
  const letterParagraphs = welcomeReply.slice(0, 2);

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            website({ name: tMeta("title"), locale }),
            podcastSeries({ name: tMeta("title"), description: tMeta("description"), locale, settings }),
            host({ name: hostName, photo: hostPhoto, description: tMeta("aboutDescription"), locale }),
          ],
        }}
      />
      {/* ===== HERO: the one bold moment. On phones the photo stamp sits between the title and the text ===== */}
      <section className="relative overflow-hidden">
        <div className="page-container grid items-center gap-x-8 gap-y-10 pb-16 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pb-24 lg:pt-14">
          <div className="relative z-10 flex flex-col gap-6 motion-safe:animate-rise lg:col-start-1 lg:row-start-1 lg:self-end">
            <p className="font-hand text-[1.75rem] leading-tight sm:text-[2.125rem]">{t("dearYou")}</p>
            <h1 className="max-w-[9ch] font-display text-[clamp(5.5rem,22vw,10.5rem)] font-normal leading-[0.86] tracking-[-0.035em]">
              {heroTitle}
            </h1>
            <p className="mt-1 text-lg font-semibold sm:text-[1.3125rem]">
              {t("heroBy", { tagline: heroTagline, name: hostName })}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[17rem] pb-4 sm:max-w-[22rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mr-10 lg:max-w-[26rem] lg:pb-0">
            <CancelWaves className="absolute -left-48 top-24 hidden h-40 w-64 lg:block" />
            <div className="stamp relative rotate-[3deg]">
              <div className="flex flex-col gap-3 bg-bubblegum p-3.5">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src="/images/hero.jpg"
                    alt={t("heroPhotoAlt")}
                    fill
                    priority
                    sizes="(min-width: 1024px) 26rem, (min-width: 640px) 22rem, 17rem"
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
              className="absolute -left-10 -top-10 h-28 w-28 -rotate-12 sm:-left-14 sm:h-[10.5rem] sm:w-[10.5rem]"
            />
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:self-start">
            {heroDescription && (
              <p className="max-w-[30rem] text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">{heroDescription}</p>
            )}
            <ArrowLink href={latest ? episodePath(latest) : "/episodes"} className="self-start">
              {t("listenLatest")}
            </ArrowLink>
            {followLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9375rem]">
                <span className="text-mauve">{t("followOn")}</span>
                {followLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-plum/30 underline-offset-[5px] transition-colors hover:decoration-plum"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== LATEST EPISODE: a postcard, so it's clear the show is alive ===== */}
      {latest && (
        <section className="page-container pb-24 lg:pb-32">
          <LatestEpisodePostcard
            episode={latest}
            locale={locale}
            label={t("latestLabel")}
            cta={t("latestCta")}
            withGuest={(guest) => t("withGuest", { guest })}
          />
        </section>
      )}

      {/* ===== THE LOVE JOURNEY: four stops along a route (any order), then topics ===== */}
      <section className="page-container grid items-center gap-12 pb-24 lg:grid-cols-[23.75rem_minmax(0,1fr)] lg:gap-14 lg:pb-32">
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.02em]">{t("journeyTitle")}</h2>
          <p className="text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">{t("journeyIntro")}</p>
          <p className="text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">{t("journeyNote")}</p>
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
          <ul className="flex flex-col gap-8 sm:grid sm:grid-cols-2 lg:block">
            {stops.map((stop, index) => {
              const Doodle = stopDoodles[index % stopDoodles.length];
              return (
                <li key={stop.title} className={`relative lg:absolute lg:w-[16.375rem] ${stopPlacement[index] ?? ""}`}>
                  <Link href={stopPaths[index] ?? `/episodes?q=${encodeURIComponent(stop.search)}`} className="stamp stamp-sm block transition-transform hover:-translate-y-1">
                    <span className={`flex flex-col gap-2 px-[1.375rem] pb-6 pt-[1.375rem] ${stopFields[index % stopFields.length]}`}>
                      <Doodle className="h-10 w-14" />
                      <span className="mt-1.5 whitespace-nowrap font-display text-[1.4375rem] leading-tight">{stop.title}</span>
                      <span className="text-base leading-normal text-plum/80">{stop.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <p className="text-[1.0625rem] font-semibold">{t("topicsIntro")}</p>
          <ul className="flex flex-wrap gap-2.5" aria-label={t("topicsLabel")}>
            {topics.map((topic, index) => (
              <li key={topic}>
                <Link
                  href={`/episodes?q=${encodeURIComponent(topicSearches[index] || topic)}`}
                  className="chip transition-colors hover:bg-plum hover:text-shell"
                >
                  {topic}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== MOST LISTENED, as stamps with their thumbnails ===== */}
      {topEpisodes.length > 0 && (
        <section className="page-container flex flex-col gap-12 pb-24 lg:pb-32">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-[42.5rem] flex-col gap-4">
              <h2 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] tracking-[-0.02em]">
                {t("topEpisodesTitle")}
              </h2>
              {episodesIntro.length > 0 && (
                <p className="text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">{episodesIntro[episodesIntro.length - 1]}</p>
              )}
            </div>
            <Link href="/episodes" className="shrink-0 text-[1.0625rem] font-semibold underline underline-offset-[5px]">
              {t("viewAllEpisodes")}
            </Link>
          </div>

          <div className="grid items-start gap-9 md:grid-cols-3">
            {topEpisodes.map((episode, index) => {
              const { number, title, guest } = splitEpisodeTitle(episode);
              const tilt = ["-rotate-[1.5deg]", "rotate-1 md:translate-y-5", "-rotate-[0.5deg]"][index % 3];
              return (
                <Link key={episode.link} href={episodePath(episode)} className={`stamp block transition-transform hover:-translate-y-1 ${tilt}`}>
                  <span className={`flex flex-col ${stampFields[index % stampFields.length]}`}>
                    <span className="relative block aspect-video overflow-hidden bg-plum/10">
                      {episode.image && (
                        <Image src={episode.image} alt="" fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover" />
                      )}
                    </span>
                    <span className="flex min-h-[12.5rem] flex-col gap-3 p-6">
                      {number && <span className="text-[0.9375rem] font-semibold text-plum/70">{tEpisode("number", { number })}</span>}
                      <span className="font-display text-[1.625rem] leading-[1.15]">{title}</span>
                      {guest && (
                        <span className="mt-auto text-base text-plum/80">{guestLine(guest, (name) => t("withGuest", { guest: name }))}</span>
                      )}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <ListenerReviews title={t("reviewsTitle")} reviews={proof.reviews} />

      {/* ===== A LETTER FROM ANDREA: the welcome and the host in one postcard, signed ===== */}
      <section className="page-container pb-24 lg:pb-32">
        <div className="relative grid gap-12 overflow-hidden rounded-md bg-white px-6 pb-12 pt-14 shadow-postal sm:px-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:px-16 lg:pb-16 lg:pt-20">
          <div className="airmail absolute inset-x-0 top-0 [--airmail-gap:#ffffff]" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-[16rem] sm:max-w-[22rem] lg:mx-0 lg:self-start">
            <div className="relative aspect-[39/51] overflow-hidden rounded-b-lg rounded-t-full bg-bubblegum">
              <Image src={hostPhoto} alt={hostName} fill sizes="(min-width: 1024px) 22rem, 90vw" className="object-cover" />
            </div>
            <HostPostmark
              id="host-postmark"
              text={t("hostPostmark")}
              className="absolute -bottom-6 right-0 h-32 w-32 rotate-[10deg] sm:-right-10 sm:h-36 sm:w-36"
            />
          </div>
          <div className="flex max-w-[38rem] flex-col gap-6">
            {aboutTitle && (
              <h2 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] tracking-[-0.02em]">{aboutTitle}</h2>
            )}
            {welcomeQuestions && <p className="font-display text-[1.375rem] leading-[1.4] sm:text-[1.5rem]">{welcomeQuestions}</p>}
            {letterParagraphs.map((paragraph) => {
              const gotYou = paragraph.match(/^(I got ya!)\s*(.*)$/);
              return (
                <p key={paragraph} className="text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">
                  {gotYou ? (
                    <>
                      <strong className="font-semibold text-plum">{gotYou[1]}</strong> {gotYou[2]}
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              );
            })}
            {welcomeClosing && <p className="text-lg font-semibold leading-relaxed sm:text-[1.1875rem]">{welcomeClosing}</p>}
            <p className="font-hand text-[1.625rem] leading-snug">
              {t("hostNote")}
              <br />
              {hostFirstName}
            </p>
            <Link href="/about" className="btn-outline self-start">{t("meetHostCta")}</Link>
          </div>
        </div>
      </section>

      {/* ===== ¿LO HABLAMOS? Paid sessions: the call books and charges on Cal.com ===== */}
      {showSessions && (
        <section className="mb-24 bg-plum py-24 text-shell lg:mb-32 lg:py-32">
          <div className="page-container flex flex-col gap-14">
            <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-end lg:gap-[5.5rem]">
              <h2 className="font-display text-[clamp(3.5rem,8vw,6rem)] leading-[0.92] tracking-[-0.03em] text-bubblegum">
                {t("talkTitle")}
              </h2>
              <p className="max-w-[37.5rem] text-lg leading-relaxed text-shell/85 sm:text-[1.1875rem]">{t("talkIntro")}</p>
            </div>
            <div className={`grid gap-8 ${emailReady ? "md:grid-cols-2" : "max-w-[40rem]"}`}>
              <div className="grid gap-8 rounded-md bg-shell p-8 text-plum sm:grid-cols-[1fr_7.5rem] sm:p-11">
                <div className="flex flex-col gap-4">
                  <Telephone className="h-14 w-14" />
                  <h3 className="font-display text-[2.25rem] leading-[1.08]">{t("callTitle")}</h3>
                  <p className="text-[1.0625rem] leading-relaxed text-mauve">{t("callBody")}</p>
                  <a
                    href={callBookingUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-auto self-start !text-base"
                  >
                    {t("callCta")}
                  </a>
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
              {emailReady && (
                <div className="relative grid gap-8 overflow-hidden rounded-md bg-bubblegum p-8 text-plum sm:grid-cols-[1fr_7.5rem] sm:p-11">
                  <svg className="absolute inset-x-0 top-0 h-[4.75rem] w-full" viewBox="0 0 600 76" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 0L300 72 600 0" fill="none" stroke="rgba(45,21,48,0.28)" strokeWidth="1.5" />
                  </svg>
                  <div className="relative flex flex-col gap-4 pt-5">
                    <h3 className="font-display text-[2.25rem] leading-[1.08]">{t("emailTitle")}</h3>
                    <p className="text-[1.0625rem] leading-relaxed">{t("emailBody")}</p>
                    <Link href="/cuentamelo" className="btn-primary mt-auto self-start !text-base">{t("emailCta")}</Link>
                  </div>
                  <div className="relative flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-end">
                    <svg className="h-20 w-20" viewBox="0 0 104 104" aria-hidden="true">
                      <path d="M52 4c6 0 8 5 12 6s9-2 12 2-2 9 0 13 7 6 4 11-8 4-10 8-1 10-6 12-9-2-13-1-7 6-12 3-2-8-6-10-10-2-12-7 4-8 3-12-7-6-4-11 9-3 12-5 3-9 8-12 7 4 10 3z" fill="#ff6339" />
                      <path d="M52 70C40 61 32 55 32 46c0-6 4-10 10-10 4 0 8 2 10 6 2-4 6-6 10-6 6 0 10 4 10 10 0 9-8 15-20 24z" fill="none" stroke="#2d1530" strokeWidth="3" strokeLinejoin="round" />
                    </svg>
                    <span className="font-display text-4xl">{t("emailPrice")}</span>
                  </div>
                </div>
              )}
            </div>
            <p className="max-w-[51rem] text-[0.9375rem] leading-relaxed text-shell/70">{t("talkDisclaimer")}</p>
          </div>
        </section>
      )}

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
          {/* The postcard itself opens the form too (the button beside it is the keyboard route) */}
          <Link
            href="/apply"
            tabIndex={-1}
            aria-hidden="true"
            className="group relative flex flex-col justify-end pt-40"
          >
            <span className="stamp stamp-sm absolute right-0 top-0 block w-[6.875rem] rotate-[4deg] [--stamp-cut:#ffffff]">
              <span className="grid h-[6.75rem] place-items-center bg-plum">
                <Microphone className="h-14 w-14" stroke="#ffcafd" />
              </span>
            </span>
            <Postmark id="postcard-postmark" text={t("postcardPostmark")} className="absolute right-[9.5rem] top-2 h-32 w-32 -rotate-12" />
            <CancelWaves lines={3} className="absolute right-[4.5rem] top-10 h-16 w-28" />
            <p className="border-b-[1.5px] border-plum/20 py-3 font-hand text-[1.375rem]">{t("postcardTo", { name: hostFirstName })}</p>
            <p className="flex items-center justify-between border-b-[1.5px] border-plum/20 py-3 font-hand text-[1.375rem] text-mauve transition-colors group-hover:text-plum">
              {t("postcardLine")}
              <ArrowIcon className="h-[18px] w-[18px] text-tangerine opacity-0 transition-opacity group-hover:opacity-100" />
            </p>
            <div className="h-12 border-b-[1.5px] border-plum/20" />
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-mauve">{t("guestNote")}</p>
          </Link>
        </div>
      </section>

      {/* ===== NEWSLETTER (signups go to Kit) ===== */}
      <section className="mb-24 bg-bubblegum py-20 [&_:focus-visible]:outline-plum lg:mb-32 lg:py-28">
        <div className="page-container grid items-center gap-12 lg:grid-cols-[6fr_5fr] lg:gap-[4.5rem]">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] tracking-[-0.02em]">{t("newsTitle")}</h2>
            <p className="max-w-[32.5rem] text-lg leading-relaxed sm:text-[1.1875rem]">{t("newsBody")}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* ===== COFFEE + BRANDS: one tear-off ticket =====
          The coffee half only shows once a Buy Me a Coffee link is set in the Studio */}
      <section className="page-container pb-24 lg:pb-32">
        <div className={`grid rounded-md bg-white shadow-postal ${buyMeCoffeeUrl ? "md:grid-cols-[1fr_2px_1fr]" : ""}`}>
          {buyMeCoffeeUrl && (
            <>
              <div className="flex flex-col gap-4 p-8 sm:p-[3.25rem]">
                <CoffeeCup className="h-11 w-[3.75rem]" />
                <h3 className="font-display text-[2.5rem] leading-[1.05]">{t("supportTheShow")}</h3>
                <p className="text-[1.0625rem] leading-relaxed text-mauve">{t("supportDescription")}</p>
                <p className="font-hand text-xl">{t("supportThanks")}</p>
                <a href={buyMeCoffeeUrl} target="_blank" rel="noopener noreferrer" className="btn-tangerine mt-1.5 self-start">
                  {t("buyMeCoffee")}
                </a>
              </div>
              <div className="mx-8 h-0.5 bg-[repeating-linear-gradient(to_right,rgba(45,21,48,0.3)_0_8px,transparent_8px_16px)] md:mx-0 md:my-8 md:h-auto md:bg-[repeating-linear-gradient(to_bottom,rgba(45,21,48,0.3)_0_8px,transparent_8px_16px)]" aria-hidden="true" />
            </>
          )}
          <div className={`flex flex-col gap-4 p-8 sm:p-[3.25rem] ${buyMeCoffeeUrl ? "" : "max-w-[44rem]"}`}>
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
