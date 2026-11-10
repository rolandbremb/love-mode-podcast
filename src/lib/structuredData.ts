import { episodePath, splitEpisodeTitle, summarize } from "@/lib/episodes";
import type { Episode } from "@/lib/rss";
import { siteUrl } from "@/lib/siteUrl";
import type { SiteSettings } from "@/sanity/client";

/* Structured data (schema.org) tells search engines what the site is: a podcast,
   its host and its episodes. The show and host share one id across pages and
   languages, so Google treats them as the same thing wherever they appear. */

const podcastId = `${siteUrl}/#podcast`;
const hostId = `${siteUrl}/#host`;

const absolute = (src: string) => (src.startsWith("http") ? src : `${siteUrl}${src}`);

// The show's listening apps and social profiles, so Google can tie them to the site
function profileLinks(settings: SiteSettings | null) {
  const links = [...(settings?.platformLinks ?? []), ...(settings?.socialLinks ?? [])].map((link) => link.url);
  return [...new Set(links.filter(Boolean))];
}

export function website({ name, locale }: { name: string; locale: string }) {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/${locale}#website`,
    url: `${siteUrl}/${locale}`,
    name,
    inLanguage: locale,
    publisher: { "@id": hostId },
  };
}

export function podcastSeries({
  name,
  description,
  locale,
  settings,
}: {
  name: string;
  description: string;
  locale: string;
  settings: SiteSettings | null;
}) {
  return {
    "@type": "PodcastSeries",
    "@id": podcastId,
    name,
    description,
    url: `${siteUrl}/${locale}`,
    image: absolute("/images/hero.jpg"),
    // The episodes are in Spanish whichever language the site is read in
    inLanguage: "es",
    author: { "@id": hostId },
    sameAs: profileLinks(settings),
  };
}

export function host({
  name,
  photo,
  description,
  locale,
}: {
  name: string;
  photo: string;
  description: string;
  locale: string;
}) {
  return {
    "@type": "Person",
    "@id": hostId,
    name,
    description,
    image: absolute(photo),
    url: `${siteUrl}/${locale}/about`,
  };
}

// The video embedded on the episode page, so Google can show it as a video result
function video(episode: Episode) {
  if (!episode.videoId) return {};
  return {
    associatedMedia: {
      "@type": "VideoObject",
      name: episode.title,
      description: summarize(episode.description, 300) || episode.title,
      ...(episode.image ? { thumbnailUrl: episode.image } : {}),
      ...(isoDate(episode.pubDate) ? { uploadDate: isoDate(episode.pubDate) } : {}),
      ...(episode.durationSeconds ? { duration: `PT${episode.durationSeconds}S` } : {}),
      embedUrl: `https://www.youtube-nocookie.com/embed/${episode.videoId}`,
      contentUrl: episode.link,
    },
  };
}

function isoDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function podcastEpisode(episode: Episode, locale: string, { withVideo = false } = {}) {
  const { number } = splitEpisodeTitle(episode);
  return {
    "@type": "PodcastEpisode",
    "@id": `${siteUrl}${episodePath(episode)}#episode`,
    name: episode.title,
    url: `${siteUrl}/${locale}${episodePath(episode)}`,
    description: summarize(episode.description),
    ...(number ? { episodeNumber: Number(number) } : {}),
    ...(isoDate(episode.pubDate) ? { datePublished: isoDate(episode.pubDate) } : {}),
    ...(episode.image ? { image: episode.image } : {}),
    inLanguage: "es",
    sameAs: episode.link,
    partOfSeries: { "@id": podcastId },
    ...(withVideo ? video(episode) : {}),
  };
}

export function breadcrumbs(items: { name: string; path: string }[], locale: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}/${locale}${item.path}`,
    })),
  };
}
