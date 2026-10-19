"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Episode } from "@/lib/rss";

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  if (views > 0) return `${views.toLocaleString()} views`;
  return "";
}

function formatDate(dateStr: string, locale = "en") {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface EpisodeCardProps {
  episode: Episode;
  variant?: "grid" | "row";
  rank?: number;
}

export default function EpisodeCard({ episode, variant = "grid", rank }: EpisodeCardProps) {
  const t = useTranslations("episodeCard");
  const locale = useLocale();

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
            <time dateTime={episode.pubDate}>{formatDate(episode.pubDate, locale)}</time>
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
    <article className="group relative flex h-full flex-col rounded-[1.75rem] border-2 border-ink bg-white p-4 shadow-pop transition-all duration-200 hover:-translate-y-1 hover:shadow-pop-lg">
      {episode.image && (
        <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-2xl border-2 border-ink">
          <Image
            src={episode.image}
            alt={episode.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {rank && (
            <span className="absolute left-3 top-3 grid h-11 w-11 -rotate-6 place-items-center rounded-full border-2 border-ink bg-butter font-display text-lg font-extrabold text-ink shadow-pop-sm">
              #{rank}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-1 text-xs font-semibold text-ink/60">
        <time dateTime={episode.pubDate}>{formatDate(episode.pubDate, locale)}</time>
        {episode.duration && (
          <>
            <span className="text-brand-400">&bull;</span>
            <span>{episode.duration}</span>
          </>
        )}
        {episode.views > 0 && (
          <span className="ml-auto rounded-full bg-blush px-2.5 py-1 text-brand-700">
            {formatViews(episode.views)}
          </span>
        )}
      </div>

      <h3 className="mt-3 px-1 font-display text-xl font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand-600">
        {episode.title}
      </h3>

      <p className="mt-2 line-clamp-2 flex-1 px-1 text-sm leading-relaxed text-ink/70">
        {episode.description}
      </p>

      <a
        href={episode.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 self-start rounded-full border-2 border-ink bg-brand-600 py-1.5 pl-1.5 pr-4 text-sm font-bold text-white transition-colors after:absolute after:inset-0 after:content-[''] hover:bg-brand-500"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand-600">
          <svg className="ml-0.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
          </svg>
        </span>
        {t("listenNow")}
      </a>
    </article>
  );
}
