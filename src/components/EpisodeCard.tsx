"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Episode } from "@/lib/rss";

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  if (views > 0) return `${views.toLocaleString()} views`;
  return "";
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface EpisodeCardProps {
  episode: Episode;
  variant?: "grid" | "row";
}

export default function EpisodeCard({ episode, variant = "grid" }: EpisodeCardProps) {
  const t = useTranslations("episodeCard");

  if (variant === "row") {
    return (
      <article className="group flex gap-5 border-b border-stone-100 py-6 last:border-b-0">
        {episode.image && (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-44">
            <Image
              src={episode.image}
              alt={episode.title}
              fill
              sizes="(min-width: 640px) 176px, 112px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-stone-400">
            <time dateTime={episode.pubDate}>{formatDate(episode.pubDate)}</time>
            {episode.duration && (
              <>
                <span>&bull;</span>
                <span>{episode.duration}</span>
              </>
            )}
            {episode.views > 0 && (
              <>
                <span>&bull;</span>
                <span>{formatViews(episode.views)}</span>
              </>
            )}
          </div>

          <h3 className="mt-2 font-serif text-xl font-bold text-stone-900 transition-transform duration-200 group-hover:translate-x-0.5 sm:text-2xl">
            {episode.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
            {episode.description}
          </p>

          <a
            href={episode.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            {t("listenNow")}
            <svg
              className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className="card group flex flex-col">
      {episode.image && (
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={episode.image}
            alt={episode.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="mb-2 flex items-center gap-3 text-xs text-stone-500">
        <time dateTime={episode.pubDate}>{formatDate(episode.pubDate)}</time>
        {episode.duration && (
          <>
            <span className="text-brand-300">&bull;</span>
            <span>{episode.duration}</span>
          </>
        )}
        {episode.views > 0 && (
          <>
            <span className="text-brand-300">&bull;</span>
            <span>{formatViews(episode.views)}</span>
          </>
        )}
      </div>

      <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-brand-600">
        {episode.title}
      </h3>

      <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-600">
        {episode.description}
      </p>

      <a
        href={episode.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
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
        {t("listenNow")}
      </a>
    </article>
  );
}
