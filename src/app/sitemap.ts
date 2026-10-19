import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllEpisodes } from "@/lib/rss";
import { siteUrl } from "@/lib/siteUrl";
import { getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

type Page = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
  lastModified?: Date;
};

// Every page in both languages, each linked to its translation so Google shows the right one
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const episodes = await getAllEpisodes(settings?.podcastRssUrl);
  const latestEpisode = episodes[0]?.pubDate ? new Date(episodes[0].pubDate) : undefined;

  const pages: Page[] = [
    { path: "", priority: 1, changeFrequency: "weekly", lastModified: latestEpisode },
    { path: "/episodes", priority: 0.9, changeFrequency: "weekly", lastModified: latestEpisode },
    { path: "/collaborate", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/apply", priority: 0.6, changeFrequency: "monthly" },
  ];
  // Optional pages only appear once they're switched on in the Studio
  if (settings?.showShop) pages.push({ path: "/shop", priority: 0.5, changeFrequency: "monthly" });
  if (settings?.showProducts) pages.push({ path: "/products", priority: 0.5, changeFrequency: "monthly" });
  if (settings?.showCourses) pages.push({ path: "/courses", priority: 0.5, changeFrequency: "monthly" });

  return pages.flatMap(({ path, ...details }) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      ...details,
      alternates: {
        languages: {
          ...Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
          "x-default": `${siteUrl}/${routing.defaultLocale}${path}`,
        },
      },
    }))
  );
}
