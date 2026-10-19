import Parser from "rss-parser";

export interface Episode {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  duration: string;
  image?: string;
  views: number;
  videoId?: string;
}

const FALLBACK_RSS_URL = process.env.PODCAST_RSS_URL || "";
const MIN_EPISODE_SECONDS = 5 * 60; // 5 minutes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parser = new (Parser as any)({
  customFields: {
    item: [
      ["yt:videoId", "videoId"],
      ["media:group", "mediaGroup"],
    ],
  },
});

// ---------- Helpers ----------

function parseISODuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || "0") * 3600) +
         (parseInt(m[2] || "0") * 60) +
          parseInt(m[3] || "0");
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  return `${s}s`;
}

function extractVideoIdFromUrl(url: string): string | undefined {
  return url.match(/[?&]v=([^&]+)/)?.[1];
}

function extractChannelId(rssUrl: string): string | undefined {
  return rssUrl.match(/channel_id=([^&]+)/)?.[1];
}

// Uploads playlist ID is the channel ID with 'UC' replaced by 'UU'
function uploadsPlaylistId(channelId: string): string {
  return "UU" + channelId.slice(2);
}

// ---------- YouTube API: full channel history ----------

async function getAllChannelEpisodes(
  channelId: string,
  apiKey: string
): Promise<Episode[]> {
  const playlistId = uploadsPlaylistId(channelId);
  const videoIds: string[] = [];
  let pageToken: string | undefined;
  let pages = 0;

  // Paginate through the uploads playlist (max 10 pages = 500 videos)
  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) break;
    const data = await res.json();

    for (const item of data.items || []) {
      const id = item.snippet?.resourceId?.videoId;
      if (id) videoIds.push(id);
    }

    pageToken = data.nextPageToken;
    pages++;
  } while (pageToken && pages < 10);

  // Batch fetch snippet + contentDetails + statistics (50 per request)
  const episodes: Episode[] = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50).join(",");
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${batch}&key=${apiKey}`
    );
    if (!res.ok) continue;
    const data = await res.json();

    for (const item of data.items || []) {
      const durationSecs = parseISODuration(item.contentDetails?.duration || "");
      if (durationSecs < MIN_EPISODE_SECONDS) continue; // skip shorts

      const videoId = item.id;
      const views = parseInt(item.statistics?.viewCount || "0", 10);
      const thumbnail =
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.standard?.url ||
        item.snippet?.thumbnails?.high?.url ||
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      episodes.push({
        title: item.snippet?.title || "Untitled",
        description: item.snippet?.description || "",
        pubDate: item.snippet?.publishedAt || "",
        link: `https://www.youtube.com/watch?v=${videoId}`,
        duration: formatDuration(durationSecs),
        image: thumbnail,
        views,
        videoId,
      });
    }
  }

  return episodes;
}

// ---------- YouTube API: durations for RSS items ----------

async function fetchYouTubeDurations(
  videoIds: string[]
): Promise<Record<string, number>> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || videoIds.length === 0) return {};
  try {
    const ids = videoIds.slice(0, 50).join(",");
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${apiKey}`
    );
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, number> = {};
    for (const item of data.items || []) {
      result[item.id] = parseISODuration(item.contentDetails.duration);
    }
    return result;
  } catch {
    return {};
  }
}

// ---------- RSS parsers ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseYouTubeItem(item: Record<string, unknown>, feed: any): Episode {
  const videoId =
    (item.videoId as string) ||
    extractVideoIdFromUrl((item.link as string) || "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mg = item.mediaGroup as any;
  const thumbnail =
    mg?.["media:thumbnail"]?.[0]?.$?.url ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined);
  const views = parseInt(
    mg?.["media:community"]?.[0]?.["media:statistics"]?.[0]?.$?.views || "0",
    10
  );
  const description =
    mg?.["media:description"]?.[0] ||
    (item.contentSnippet as string) ||
    (item.content as string) ||
    "";

  return {
    title: (item.title as string) || "Untitled",
    description,
    pubDate: (item.pubDate as string) || "",
    link: (item.link as string) || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "#"),
    duration: "",
    image: thumbnail,
    views: isNaN(views) ? 0 : views,
    videoId,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSpotifyItem(item: Record<string, unknown>, feed: any): Episode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractImage(raw: any): string | undefined {
    return raw?.href || raw?.$?.href || undefined;
  }
  const feedImage =
    extractImage(feed.itunesImage) ||
    (feed.image as { url?: string })?.url ||
    undefined;

  return {
    title: (item.title as string) || "Untitled Episode",
    description: (item.contentSnippet as string) || (item.content as string) || "",
    pubDate: (item.pubDate as string) || "",
    link: (item.link as string) || (item.enclosure as { url?: string })?.url || "#",
    duration: (item.duration as string) || "",
    image: extractImage(item.itunesImage) || feedImage,
    views: 0,
  };
}

// ---------- Public API ----------

// Returns latest episodes from RSS (used on /episodes page)
export async function getEpisodes(rssUrl?: string | null): Promise<Episode[]> {
  const url = rssUrl || FALLBACK_RSS_URL;
  if (!url) return [];

  try {
    const feed = await parser.parseURL(url);
    const isYouTube = url.includes("youtube.com");

    const episodes: Episode[] = (feed.items || []).map(
      (item: Record<string, unknown>) =>
        isYouTube ? parseYouTubeItem(item, feed) : parseSpotifyItem(item, feed)
    );

    if (!isYouTube) return episodes;

    // Filter out shorts using duration API
    const videoIds = episodes.map((e) => e.videoId).filter(Boolean) as string[];
    const durations = await fetchYouTubeDurations(videoIds);
    const apiAvailable = Object.keys(durations).length > 0;

    return episodes
      .filter((e) => {
        if (!apiAvailable || !e.videoId) return true;
        return (durations[e.videoId] ?? 0) >= MIN_EPISODE_SECONDS;
      })
      .map((e) => ({
        ...e,
        duration: e.videoId && durations[e.videoId]
          ? formatDuration(durations[e.videoId])
          : e.duration,
      }));
  } catch {
    return [];
  }
}

export async function getLatestEpisodes(
  count = 3,
  rssUrl?: string | null
): Promise<Episode[]> {
  const episodes = await getEpisodes(rssUrl);
  return episodes.slice(0, count);
}

// Returns full channel history sorted by publish date (newest first)
export async function getAllEpisodes(rssUrl?: string | null): Promise<Episode[]> {
  const url = rssUrl || FALLBACK_RSS_URL;
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = url ? extractChannelId(url) : undefined;

  if (apiKey && channelId && url?.includes("youtube.com")) {
    try {
      const allEpisodes = await getAllChannelEpisodes(channelId, apiKey);
      return allEpisodes.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
    } catch {
      // fall through to RSS fallback
    }
  }

  return getEpisodes(rssUrl);
}

// Returns all-time top episodes by views using full channel history
export async function getTopEpisodesByViews(
  count = 3,
  rssUrl?: string | null
): Promise<Episode[]> {
  const url = rssUrl || FALLBACK_RSS_URL;
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = url ? extractChannelId(url) : undefined;

  if (apiKey && channelId && url?.includes("youtube.com")) {
    try {
      const allEpisodes = await getAllChannelEpisodes(channelId, apiKey);
      return allEpisodes.sort((a, b) => b.views - a.views).slice(0, count);
    } catch {
      // fall through to RSS fallback
    }
  }

  // Fallback: sort RSS results by views
  const episodes = await getEpisodes(rssUrl);
  return [...episodes].sort((a, b) => b.views - a.views).slice(0, count);
}
