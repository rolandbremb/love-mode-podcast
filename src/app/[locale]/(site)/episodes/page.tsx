import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import EpisodesBrowser from "@/components/EpisodesBrowser";
import JsonLd from "@/components/JsonLd";
import LatestEpisodePostcard from "@/components/LatestEpisodePostcard";
import PageHeader from "@/components/postal/PageHeader";
import { getAllEpisodes } from "@/lib/rss";
import { podcastEpisode, podcastSeries } from "@/lib/structuredData";
import { getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("episodesTitle");
  const description = t("episodesDescription");
  return pageMetadata(parent, { title, description, locale, path: "/episodes" });
}

export default async function EpisodesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "episodes" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const tEpisode = await getTranslations({ locale, namespace: "episode" });
  const tHome = await getTranslations({ locale, namespace: "home" });

  const settings = await getSiteSettings({ locale });
  const episodes = await getAllEpisodes(settings?.podcastRssUrl);

  const latest = episodes[0];
  const remainingEpisodes = episodes.slice(1);

  // The same topics as on the home page; each searches for its Spanish word
  const topics = tHome.raw("topics") as string[];
  const topicSearches = tHome.raw("topicSearches") as string[];
  const filters = topics.map((label, index) => ({ label, search: topicSearches[index] || label }));

  return (
    <div>
      <JsonLd
        data={{
          ...podcastSeries({ name: tMeta("title"), description: tMeta("description"), locale, settings }),
          episode: episodes.map((episode) => podcastEpisode(episode, locale)),
        }}
      />
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        note={episodes.length > 0 ? t("count", { count: episodes.length }) : undefined}
      />

      <div className="page-container pb-24 lg:pb-32">
        {latest ? (
          <>
            {/* ===== LATEST EPISODE ===== */}
            <div className="mb-20">
              <LatestEpisodePostcard
                episode={latest}
                locale={locale}
                label={t("latest")}
                cta={t("listenNow")}
                withGuest={(guest) => tEpisode("withGuest", { guest })}
              />
            </div>

            {/* ===== ALL OTHER EPISODES ===== */}
            {remainingEpisodes.length > 0 && <EpisodesBrowser episodes={remainingEpisodes} filters={filters} />}
          </>
        ) : (
          <div className="rounded-md border-[1.5px] border-dashed border-plum/30 p-16 text-center">
            <h2 className="font-display text-3xl">{t("comingSoon")}</h2>
            <p className="mt-2 text-mauve">{t("episodesComingSoon")}</p>
            <p className="mx-auto mt-4 max-w-md rounded-2xl bg-bubblegum p-4 text-[0.9375rem]">{t("setRssUrl")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
