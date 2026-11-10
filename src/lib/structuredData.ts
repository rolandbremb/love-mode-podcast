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

// Search results show a short summary, so keep the first couple of sentences
function summary(text: string, max = 200) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", max))}…`;
}

export function podcastEpisode(episode: Episode) {
  const published = new Date(episode.pubDate);
  return {
    "@type": "PodcastEpisode",
    name: episode.title,
    url: episode.link,
    description: summary(episode.description),
    ...(Number.isNaN(published.getTime()) ? {} : { datePublished: published.toISOString() }),
    ...(episode.image ? { image: episode.image } : {}),
    partOfSeries: { "@id": podcastId },
  };
}
