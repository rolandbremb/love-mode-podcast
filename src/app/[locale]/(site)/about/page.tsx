import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import { CoffeeCup, Microphone, PaperPlane } from "@/components/postal/Doodles";
import { Link } from "@/i18n/navigation";
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
  const showMission = data?.showMission?.trim();
  const photoUrl = data?.hostPhoto?.asset?.url ?? "/images/host.jpg";
  const buyMeCoffeeUrl = settings?.buyMeCoffeeUrl;

  const cards = [
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
    {
      href: buyMeCoffeeUrl || "/#support",
      external: Boolean(buyMeCoffeeUrl),
      title: t("supportTitle"),
      description: t("supportDesc"),
      cta: t("supportCta"),
      Doodle: CoffeeCup,
    },
  ];

  return (
    <div>
      {/* ===== HOST ===== */}
      <section className="page-container grid items-center gap-14 pb-24 pt-8 md:pt-14 lg:grid-cols-[5fr_7fr] lg:gap-24 lg:pb-32">
        <div className="relative mx-auto aspect-[39/51] w-full max-w-[24.5rem] overflow-hidden rounded-b-lg rounded-t-full bg-bubblegum lg:mx-0">
          <Image src={photoUrl} alt={hostName} fill priority sizes="(min-width: 1024px) 24.5rem, 90vw" className="object-cover" />
        </div>
        <div className="flex flex-col gap-6">
          <p className="font-hand text-[1.5rem]">{t("meetYourHost")}</p>
          <h1 className="font-display text-[clamp(3.25rem,8vw,6rem)] leading-[0.92] tracking-[-0.03em] motion-safe:animate-rise">
            {hostName}
          </h1>
          <div className="mt-2 flex max-w-[38rem] flex-col gap-5">
            {hostBio.map((paragraph, i) => (
              <p
                key={i}
                className={i === 0 ? "text-[1.3125rem] font-semibold leading-snug" : "text-lg leading-relaxed text-mauve sm:text-[1.1875rem]"}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MISSION (only when written in the Studio) ===== */}
      {showMission && (
      <section className="bg-plum py-24 text-shell lg:py-32">
        <div className="page-container flex flex-col gap-8">
          <p className="font-hand text-[1.375rem] text-bubblegum">{t("ourMission")}</p>
          <p className="max-w-[22ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08] tracking-[-0.02em]">
            {showMission}
          </p>
        </div>
      </section>
      )}

      {/* ===== NEXT STEPS ===== */}
      <section className="page-container grid gap-8 py-24 md:grid-cols-3 lg:py-32">
        {cards.map(({ Doodle, ...card }) => (
          <div key={card.title} className="relative flex flex-col gap-4 rounded-md bg-white p-8 shadow-postal">
            <Doodle className="h-12 w-14" />
            <h2 className="font-display text-[2rem] leading-tight">{card.title}</h2>
            <p className="text-[1.0625rem] leading-relaxed text-mauve">{card.description}</p>
            {card.external ? (
              <a href={card.href} target="_blank" rel="noopener noreferrer" className="btn-outline mt-auto self-start after:absolute after:inset-0 after:content-['']">
                {card.cta}
              </a>
            ) : (
              <Link href={card.href} className="btn-outline mt-auto self-start after:absolute after:inset-0 after:content-['']">
                {card.cta}
              </Link>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
