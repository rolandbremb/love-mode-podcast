import EpisodeCard from "@/components/EpisodeCard";
import { getEpisodes } from "@/lib/rss";

export const revalidate = 3600;

export const metadata = {
  title: "Episodes | Love Mode Podcast",
  description: "Browse all Love Mode podcast episodes about love, dating, and relationships.",
};

export default async function EpisodesPage() {
  const episodes = await getEpisodes();

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            All Episodes
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
          <p className="mt-4 text-lg text-stone-600">
            Catch up on every conversation. New episodes drop weekly.
          </p>
        </div>

        {episodes.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode, i) => (
              <EpisodeCard key={i} episode={episode} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-brand-200 p-16 text-center">
            <span className="text-5xl">&#127897;&#65039;</span>
            <h2 className="mt-4 font-serif text-2xl font-bold text-stone-700">
              Coming Soon
            </h2>
            <p className="mt-2 text-stone-500">
              Episodes will appear here automatically once you connect your RSS
              feed.
            </p>
            <p className="mt-4 rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
              Set the <code className="font-mono font-bold">PODCAST_RSS_URL</code>{" "}
              environment variable to your Spotify for Podcasters RSS feed URL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
