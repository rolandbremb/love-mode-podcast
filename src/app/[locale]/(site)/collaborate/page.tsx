import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import BrandInquiryForm from "@/components/forms/BrandInquiryForm";
import PageHeader from "@/components/postal/PageHeader";
import { formatStat } from "@/lib/format";
import { getAllEpisodes } from "@/lib/rss";
import { getSiteSettings } from "@/sanity/client";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = (await getTranslations({ locale, namespace: "collaborate" }))("title");
  const description = t("brandsDescription");
  return pageMetadata(parent, { title, description, locale, path: "/collaborate" });
}

export const revalidate = 3600;

export default async function CollaboratePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collaborate" });
  const tHome = await getTranslations({ locale, namespace: "home" });

  const settings = await getSiteSettings({ locale });
  const episodes = await getAllEpisodes(settings?.podcastRssUrl);
  const platformCount = settings?.platformLinks?.length ?? 0;
  const totalViews = episodes.reduce((sum, episode) => sum + (episode.views || 0), 0);
  const stats = [
    episodes.length > 0 && { value: String(episodes.length), label: tHome("statEpisodes") },
    totalViews > 0 && { value: formatStat(totalViews), label: tHome("statViews") },
    platformCount > 0 && { value: String(platformCount), label: tHome("statPlatforms") },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} note={t("label")} />

      <div className="page-container grid items-start gap-10 pb-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:pb-32">
        <aside className="flex flex-col gap-6 rounded-[2.25rem] bg-plum p-8 text-shell sm:p-10 lg:sticky lg:top-28">
          <h2 className="font-display text-[2.25rem] leading-tight text-bubblegum">{t("sideTitle")}</h2>
          <p className="text-[1.0625rem] leading-relaxed text-shell/85">{tHome("brandsDescription")}</p>
          {stats.length > 0 && (
            <dl className="grid grid-cols-3 gap-4 border-t border-shell/20 pt-6">
              {stats.map(({ value, label }) => (
                <div key={label} className="flex flex-col-reverse gap-1">
                  <dt className="text-sm leading-snug text-shell/75">{label}</dt>
                  <dd className="font-display text-4xl text-bubblegum">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </aside>

        <BrandInquiryForm />
      </div>
    </div>
  );
}
