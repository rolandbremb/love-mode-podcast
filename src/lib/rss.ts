import Parser from "rss-parser";

export interface Episode {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  duration: string;
  image?: string;
}

// ============================================================
// CONFIGURE YOUR RSS FEED URL HERE
// Find it in Spotify for Podcasters > Settings > Distribution
// It looks like: https://anchor.fm/s/XXXXXXXX/podcast/rss
// ============================================================
const RSS_FEED_URL =
  process.env.PODCAST_RSS_URL ||
  "https://anchor.fm/s/XXXXXXXX/podcast/rss";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parser = new (Parser as any)({
  customFields: {
    item: [["itunes:duration", "duration"], ["itunes:image", "itunesImage"]],
    feed: [["itunes:image", "itunesImage"]],
  },
});

export async function getEpisodes(): Promise<Episode[]> {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);

    return (feed.items || []).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "Untitled Episode",
      description: (item.contentSnippet as string) || (item.content as string) || "",
      pubDate: (item.pubDate as string) || "",
      link: (item.link as string) || (item.enclosure as { url?: string })?.url || "#",
      duration: (item.duration as string) || "",
      image:
        (item.itunesImage as { href?: string })?.href ||
        (feed.itunesImage as { href?: string })?.href ||
        undefined,
    }));
  } catch {
    // Return empty array if feed is not configured yet
    return [];
  }
}

export async function getLatestEpisodes(count = 3): Promise<Episode[]> {
  const episodes = await getEpisodes();
  return episodes.slice(0, count);
}
