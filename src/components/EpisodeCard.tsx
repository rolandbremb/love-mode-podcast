"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Episode } from "@/lib/rss";

function formatViews(views: number, locale: string): string {
  if (views <= 0) return "";
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(views);
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
  rank?: number;
}

export default function EpisodeCard({ episode, rank }: EpisodeCardProps) {
  const t = useTranslations("episodeCard");
  const locale = useLocale();

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
            {t("views", { count: formatViews(episode.views, locale) })}
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
