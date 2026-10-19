import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import FadeIn from "@/components/FadeIn";
import { Link } from "@/i18n/navigation";
import { getAboutPage, getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

const defaultBio = [
  "Hi, I'm the host of Love Mode — a podcast born from a simple belief: real love starts with real conversations.",
  "I've spent years navigating the messy, beautiful, and sometimes confusing world of modern relationships — and I wanted to create a space where we could talk about it all, honestly and without judgment.",
  "Every episode, I sit down with guests and explore the full spectrum of love: dating, heartbreak, self-worth, communication, and everything in between. No scripts, no sugarcoating — just truth.",
];

const defaultMission =
  "Love Mode exists to make people feel less alone in their relationship journeys. Whether you're single, partnered, healing, or searching — this podcast is for you.";

function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c.9 6.6 4.8 10.9 12 12-7.2 1.1-11.1 5.4-12 12-.9-6.6-4.8-10.9-12-12C7.2 10.9 11.1 6.6 12 0z" />
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

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("aboutTitle");
  const description = t("description");
  return pageMetadata(parent, { title, description, locale, path: "/about" });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: preview } = await draftMode();
  const t = await getTranslations({ locale, namespace: "about" });

  const [data, settings] = await Promise.all([
    getAboutPage({ preview, locale }),
    getSiteSettings({ preview, locale }),
  ]);

  const hostName = data?.hostName ?? "Your Host";
  const savedBio = (data?.hostBio ?? []).filter((p) => p.trim());
  const hostBio = savedBio.length ? savedBio : defaultBio;
  const showMission = data?.showMission?.trim() || defaultMission;
  const photoUrl = data?.hostPhoto?.asset?.url ?? "/images/host.jpg";
  const buyMeCoffeeUrl = settings?.buyMeCoffeeUrl;

  const cards = [
    {
      href: "/episodes",
      title: t("listenTitle"),
      description: t("listenDesc"),
      cta: t("listenCta"),
      style: "bg-white -rotate-1",
    },
    {
      href: "/apply",
      title: t("guestTitle"),
      description: t("guestDesc"),
      cta: t("guestCta"),
      style: "bg-butter rotate-1",
    },
    {
      href: buyMeCoffeeUrl || "/#support",
      external: Boolean(buyMeCoffeeUrl),
      title: t("supportTitle"),
      description: t("supportDesc"),
      cta: t("supportCta"),
      style: "bg-blush -rotate-1",
    },
  ];

  return (
    <div>
      {/* ===== HOST ===== */}
      <section className="theme-soft relative overflow-hidden border-b-2 border-ink">
        <Sparkle className="absolute right-[8%] top-14 hidden h-10 w-10 text-butter motion-safe:animate-float md:block" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-20 pt-12 sm:px-6 md:pt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:px-8">
          <div className="relative mx-auto w-full max-w-sm motion-safe:animate-rise lg:max-w-md">
            <div
              className="absolute inset-0 rotate-3 rounded-[2.5rem] border-2 border-ink bg-brand-400"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] -rotate-2 overflow-hidden rounded-[2.5rem] border-2 border-ink bg-brand-200">
              <Image
                src={photoUrl}
                alt={hostName}
                fill
                priority
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="object-cover"
              />
            </div>
            <span className="sticker absolute -bottom-4 left-1/2 -translate-x-1/2 -rotate-3 whitespace-nowrap">
              <Sparkle className="h-3 w-3" />
              {t("meetYourHost")}
            </span>
          </div>

          <div>
            <p className="-rotate-2 font-hand text-3xl font-medium text-brand-500 motion-safe:animate-rise md:text-4xl">
              {t("hello")}
            </p>
            <h1 className="mt-1 font-display text-[clamp(2.75rem,13vw,3.75rem)] font-extrabold lowercase leading-[0.85] tracking-[-0.04em] text-brand-700 motion-safe:animate-rise [animation-delay:80ms] md:text-8xl">
              {hostName}
            </h1>
            <div className="mt-8 space-y-5 motion-safe:animate-rise [animation-delay:160ms]">
              {hostBio.map((paragraph, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "font-display text-2xl font-semibold leading-snug tracking-tight text-ink"
                      : "text-lg leading-relaxed text-ink/75"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <section className="section-padding theme-page">
        <FadeIn className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border-2 border-ink bg-brand-600 px-8 py-14 text-center text-cream shadow-pop-lg md:px-16 md:py-20">
          <Sparkle className="absolute left-10 top-10 h-8 w-8 text-butter motion-safe:animate-spin-slow" />
          <Sparkle className="absolute bottom-10 right-12 h-6 w-6 text-brand-300" />
          <span className="sticker">{t("ourMission")}</span>
          <p className="mx-auto mt-8 max-w-3xl font-display text-3xl font-bold leading-snug tracking-tight md:text-5xl md:leading-[1.1]">
            {showMission}
          </p>
          <p className="mt-8 -rotate-2 font-hand text-3xl font-medium text-butter">{t("missionNote")}</p>
        </FadeIn>
      </section>

      {/* ===== NEXT STEPS ===== */}
      <section className="section-padding theme-page pt-0 md:pt-0">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {cards.map((card, index) => (
            <FadeIn key={card.title} delay={index * 0.1}>
              <div
                className={`group relative h-full rounded-[2rem] border-2 border-ink p-8 text-ink shadow-pop transition-transform duration-200 hover:-translate-y-1 hover:rotate-0 ${card.style}`}
              >
                <h2 className="font-display text-3xl font-extrabold lowercase tracking-tight">{card.title}</h2>
                <p className="mt-3 leading-relaxed text-ink/75">{card.description}</p>
                {card.external ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 font-bold text-brand-700 after:absolute after:inset-0 after:content-['']"
                  >
                    {card.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                ) : (
                  <Link
                    href={card.href}
                    className="mt-6 inline-flex items-center gap-2 font-bold text-brand-700 after:absolute after:inset-0 after:content-['']"
                  >
                    {card.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
