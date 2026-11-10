import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { CoffeeCup, Envelope, Microphone, PaperPlane } from "@/components/postal/Doodles";
import { HostPostmark } from "@/components/postal/Postmark";
import { Link } from "@/i18n/navigation";
import { platformLabel } from "@/lib/format";
import { host } from "@/lib/structuredData";
import { getAboutPage, getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

const defaultBio = [
  "Hi, I'm the host of Love Mode — a podcast born from a simple belief: real love starts with real conversations.",
  "I've spent years navigating the messy, beautiful, and sometimes confusing world of modern relationships — and I wanted to create a space where we could talk about it all, honestly and without judgment.",
  "Every episode, I sit down with guests and explore the full spectrum of love: dating, heartbreak, self-worth, communication, and everything in between. No scripts, no sugarcoating — just truth.",
];


export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("aboutTitle");
  const description = t("aboutDescription");
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
  const tHome = await getTranslations({ locale, namespace: "home" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });

  const [data, settings] = await Promise.all([
    getAboutPage({ preview, locale }),
    getSiteSettings({ preview, locale }),
  ]);

  const hostName = data?.hostName ?? "Your Host";
  const hostFirstName = hostName.split(" ")[0];
  const savedBio = (data?.hostBio ?? []).filter((p) => p.trim());
  const hostBio = savedBio.length ? savedBio : defaultBio;
  // The first line introduces her at the top; the rest is the letter
  const [intro, ...story] = hostBio;
  const showMission = data?.showMission?.trim();
  const photoUrl = data?.hostPhoto?.asset?.url ?? "/images/host.jpg";
  const buyMeCoffeeUrl = settings?.buyMeCoffeeUrl;

  // Her socials and the listening apps, once each
  const findLinks = [
    ...(settings?.socialLinks ?? []).map(({ platform, url }) => ({ label: platform, url })),
    ...(settings?.platformLinks ?? []).map(({ platform, url }) => ({ label: platformLabel(platform), url })),
  ].filter((link, index, all) => link.url && all.findIndex((other) => other.label === link.label) === index);

  const steps = [
    {
      href: "/episodes",
      title: t("listenTitle"),
      description: t("listenDesc"),
      cta: t("listenCta"),
      Doodle: PaperPlane,
    },
    {
      href: "/apply",
      title: t("guestTitle"),
      description: t("guestDesc"),
      cta: t("guestCta"),
      Doodle: Microphone,
    },
    // The coffee step only shows once a Buy Me a Coffee link is set in the Studio
    ...(buyMeCoffeeUrl
      ? [
          {
            href: buyMeCoffeeUrl,
            external: true,
            title: t("supportTitle"),
            description: t("supportDesc"),
            cta: t("supportCta"),
            Doodle: CoffeeCup,
          },
        ]
      : []),
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@type": "ProfilePage",
          mainEntity: host({ name: hostName, photo: photoUrl, description: tMeta("aboutDescription"), locale }),
        }}
      />

      {/* ===== HOST: photo, name, one line and where to find her ===== */}
      <section className="page-container grid items-center gap-14 pb-20 pt-8 md:pt-14 lg:grid-cols-[5fr_7fr] lg:gap-24 lg:pb-28">
        <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-[24.5rem] lg:mx-0">
          <div className="relative aspect-[39/51] overflow-hidden rounded-b-lg rounded-t-full bg-bubblegum">
            <Image src={photoUrl} alt={hostName} fill priority sizes="(min-width: 1024px) 24.5rem, 90vw" className="object-cover" />
          </div>
          <HostPostmark
            id="about-postmark"
            text={tHome("hostPostmark")}
            className="absolute -bottom-6 right-0 h-32 w-32 rotate-[10deg] sm:-right-10 sm:h-36 sm:w-36"
          />
        </div>
        <div className="flex flex-col gap-6">
          <p className="font-hand text-[1.5rem]">{t("meetYourHost")}</p>
          <h1 className="font-display text-[clamp(3.25rem,8vw,6rem)] leading-[0.92] tracking-[-0.03em] motion-safe:animate-rise">
            {hostName}
          </h1>
          {intro && <p className="max-w-[34rem] text-[1.3125rem] font-semibold leading-snug">{intro}</p>}
          {findLinks.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9375rem]">
              <span className="text-mauve">{t("findMe")}</span>
              {findLinks.map((link) => (
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
      </section>

      {/* ===== HER STORY: a postcard, signed ===== */}
      {story.length > 0 && (
        <section className="page-container pb-24 lg:pb-32">
          <div className="relative overflow-hidden rounded-md bg-white px-6 pb-12 pt-14 shadow-postal [--stamp-cut:#ffffff] sm:px-12 lg:px-20 lg:pb-16 lg:pt-20">
            <div className="airmail absolute inset-x-0 top-0 [--airmail-gap:#ffffff]" aria-hidden="true" />
            <span className="stamp stamp-sm absolute right-6 top-8 hidden w-[5.5rem] rotate-[4deg] sm:block lg:right-14 lg:top-12" aria-hidden="true">
              <span className="grid h-[5.5rem] place-items-center bg-bubblegum">
                <Envelope className="h-10 w-12" />
              </span>
            </span>
            <div className="flex max-w-[40rem] flex-col gap-6">
              <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.02em]">{t("storyTitle")}</h2>
              {story.map((paragraph, i) => (
                <p key={i} className="text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">
                  {paragraph}
                </p>
              ))}
              <p className="font-hand text-[1.625rem] leading-snug">
                {t("signOff")}
                <br />
                {hostFirstName}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===== MISSION (only when written in the Studio) ===== */}
      {showMission && (
        <section className="mb-24 bg-plum py-24 text-shell lg:mb-32 lg:py-32">
          <div className="page-container flex flex-col gap-8">
            <p className="text-[1.0625rem] font-semibold text-bubblegum">{t("ourMission")}</p>
            <p className="max-w-[22ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08] tracking-[-0.02em]">
              {showMission}
            </p>
          </div>
        </section>
      )}

      {/* ===== NEXT STEPS: one tear-off ticket ===== */}
      <section className="page-container pb-24 lg:pb-32">
        <div className="grid rounded-md bg-white shadow-postal md:auto-cols-fr md:grid-flow-col">
          {steps.map(({ Doodle, ...step }, index) => (
            <div
              key={step.title}
              className={`relative flex flex-col gap-4 p-8 sm:p-10 ${
                index > 0
                  ? "border-t-2 border-dashed border-plum/25 md:border-l-2 md:border-t-0"
                  : ""
              }`}
            >
              <Doodle className="h-12 w-14" />
              <h2 className="font-display text-[2rem] leading-tight">{step.title}</h2>
              <p className="text-[1.0625rem] leading-relaxed text-mauve">{step.description}</p>
              {step.external ? (
                <a href={step.href} target="_blank" rel="noopener noreferrer" className="btn-tangerine mt-auto self-start">
                  {step.cta}
                </a>
              ) : (
                <Link href={step.href} className="btn-outline mt-auto self-start">
                  {step.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
