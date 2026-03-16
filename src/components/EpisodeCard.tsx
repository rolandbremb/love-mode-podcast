import type { Episode } from "@/lib/rss";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <article className="card group flex flex-col">
      <div className="mb-3 flex items-center gap-3 text-xs text-stone-500">
        <time dateTime={episode.pubDate}>{formatDate(episode.pubDate)}</time>
        {episode.duration && (
          <>
            <span className="text-brand-300">&bull;</span>
            <span>{episode.duration}</span>
          </>
        )}
      </div>

      <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-brand-600">
        {episode.title}
      </h3>

      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">
        {episode.description}
      </p>

      <a
        href={episode.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
      >
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        Listen Now
      </a>
    </article>
  );
}
