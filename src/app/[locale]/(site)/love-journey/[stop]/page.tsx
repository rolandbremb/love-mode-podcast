import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import EpisodeCard from "@/components/EpisodeCard";
import JsonLd from "@/components/JsonLd";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { BrokenHeart, CoffeeDate, Rings, Sailboat } from "@/components/postal/Doodles";
import PageHeader from "@/components/postal/PageHeader";
import { Link } from "@/i18n/navigation";
import { episodePath, summarize } from "@/lib/episodes";
import { stopEpisodes, stopPath, stopSlug, type JourneyStop } from "@/lib/journey";
import { pageMetadata } from "@/lib/metadata";
import { getAllEpisodes } from "@/lib/rss";
import { siteUrl } from "@/lib/siteUrl";
import { breadcrumbs } from "@/lib/structuredData";
import { getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

const stopDoodles = [CoffeeDate, Rings, BrokenHeart, Sailboat];
const stopFields = ["bg-peach", "bg-bubblegum", "bg-bubblegum", "bg-peach"];

type Params = Promise<{ locale: string; stop: string }>;

/* Finds the stop by its address (from the Spanish names) and returns it in the page's
   language, with its intro and keywords, which share the stops' order. */
async function loadStop(locale: string, slug: string) {
  const t = await getTranslations({ locale, namespace: "home" });
  const tEs = await getTranslations({ locale: "es", namespace: "home" });
  const spanishStops = tEs.raw("journeyStops") as JourneyStop[];
  const index = spanishStops.findIndex((stop) => stopSlug(stop.title) === slug);
  if (index < 0) return null;

  const stops = t.raw("journeyStops") as JourneyStop[];
  const intros = t.raw("journeyIntros") as string[];
  const keywords = t.raw("journeyKeywords") as string[];
  return {
    index,
    stop: stops[index] ?? spanishStops[index],
    intro: intros[index] ?? "",
    keywords: keywords[index],
    others: spanishStops
      .map((spanish, i) => ({ path: stopPath(spanish.title), stop: stops[i] ?? spanish, index: i }))
      .filter(({ index: i }) => i !== index),
  };
}

export async function generateStaticParams() {
  const t = await getTranslations({ locale: "es", namespace: "home" });
  return (t.raw("journeyStops") as JourneyStop[]).map((stop) => ({ stop: stopSlug(stop.title) }));
}

export async function generateMetadata({ params }: { params: Params }, parent: ResolvingMetadata): Promise<Metadata> {
  const { locale, stop: slug } = await params;
  const data = await loadStop(locale, slug);
  if (!data) return {};
  const description = data.stop.description.replace(/\.$/, "");
  return pageMetadata(parent, {
    title: `${data.stop.title}: ${description.charAt(0).toLowerCase()}${description.slice(1)}`,
    description: summarize(data.intro || data.stop.description, 155),
    locale,
    path: `/love-journey/${slug}`,
  });
}

export default async function JourneyStopPage({ params }: { params: Params }) {
  const { locale, stop: slug } = await params;
  const data = await loadStop(locale, slug);
  if (!data) notFound();

  const t = await getTranslations({ locale, namespace: "home" });
  const tEpisodes = await getTranslations({ locale, namespace: "episodes" });
  const settings = await getSiteSettings({ locale });
  const episodes = stopEpisodes(await getAllEpisodes(settings?.podcastRssUrl), data.keywords, data.stop.search);
  const Doodle = stopDoodles[data.index % stopDoodles.length];

  return (
    <div>
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "CollectionPage",
              name: data.stop.title,
              description: data.intro || data.stop.description,
              url: `${siteUrl}/${locale}/love-journey/${slug}`,
              inLanguage: locale,
              mainEntity: {
                "@type": "ItemList",
                itemListElement: episodes.map((episode, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: episode.title,
                  url: `${siteUrl}/${locale}${episodePath(episode)}`,
                })),
              },
            },
            breadcrumbs(
              [
                { name: tEpisodes("title"), path: "/episodes" },
                { name: data.stop.title, path: `/love-journey/${slug}` },
              ],
              locale
            ),
          ],
        }}
      />

      <div className="relative">
        <PageHeader title={data.stop.title} subtitle={data.intro || data.stop.description} note={t("journeyPageNote")} />
        <span className="stamp stamp-sm absolute right-[max(1.5rem,calc((100vw-80rem)/2+2rem))] top-16 hidden w-32 rotate-[5deg] md:block" aria-hidden="true">
          <span className={`grid h-32 place-items-center ${stopFields[data.index % stopFields.length]}`}>
            <Doodle className="h-14 w-16" />
          </span>
        </span>
      </div>

      {/* ===== THIS STOP'S EPISODES ===== */}
      <section className="page-container flex flex-col gap-8 pb-24 lg:pb-32">
        <p className="text-[1.0625rem] font-semibold">{t("journeyEpisodes", { count: episodes.length })}</p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.map((episode, index) => (
            <EpisodeCard key={episode.link} episode={episode} index={index} />
          ))}
        </div>
      </section>

      {/* ===== THE OTHER STOPS ===== */}
      <section className="page-container flex flex-col gap-8 pb-24 lg:pb-32">
        <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.02em]">{t("journeyOther")}</h2>
        <ul className="grid gap-8 sm:grid-cols-3">
          {data.others.map(({ path, stop, index }) => {
            const OtherDoodle = stopDoodles[index % stopDoodles.length];
            return (
              <li key={path}>
                <Link href={path} className="stamp stamp-sm block h-full transition-transform hover:-translate-y-1">
                  <span className={`flex h-full flex-col gap-2 px-[1.375rem] pb-6 pt-[1.375rem] ${stopFields[index % stopFields.length]}`}>
                    <OtherDoodle className="h-10 w-14" />
                    <span className="mt-1.5 font-display text-[1.4375rem] leading-tight">{stop.title}</span>
                    <span className="text-base leading-normal text-plum/80">{stop.description}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="mb-24 bg-bubblegum py-20 [&_:focus-visible]:outline-plum lg:mb-32 lg:py-28">
        <div className="page-container grid items-center gap-12 lg:grid-cols-[6fr_5fr] lg:gap-[4.5rem]">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] tracking-[-0.02em]">{t("newsTitle")}</h2>
            <p className="max-w-[32.5rem] text-lg leading-relaxed sm:text-[1.1875rem]">{t("newsBody")}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
