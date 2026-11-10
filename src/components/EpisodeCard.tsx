"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { episodePath } from "@/lib/episodes";
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
    <article className="group relative flex h-full flex-col rounded-md bg-white p-4 shadow-postal">
      {episode.image && (
        <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-sm bg-bubblegum">
          <Image
            src={episode.image}
            alt={episode.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          {rank && (
            <span className="absolute left-3 top-3 grid h-12 w-12 -rotate-6 place-items-center rounded-full border-2 border-tangerine bg-shell font-display text-xl text-plum">
              #{rank}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-1 text-sm text-mauve">
        <time dateTime={episode.pubDate}>{formatDate(episode.pubDate, locale)}</time>
        {episode.duration && (
          <>
            <span aria-hidden="true">&bull;</span>
            <span>{episode.duration}</span>
          </>
        )}
        {episode.views > 0 && (
          <span className="ml-auto rounded-full bg-shell px-2.5 py-1">
            {t("views", { count: formatViews(episode.views, locale) })}
          </span>
        )}
      </div>

      <h3 className="mt-3 px-1 font-display text-[1.5rem] leading-[1.15]">
        {episode.title}
      </h3>

      <p className="mt-2 line-clamp-2 flex-1 px-1 text-base leading-relaxed text-mauve">
        {episode.description}
      </p>

      <Link
        href={episodePath(episode)}
        className="btn-outline mt-5 self-start !py-2 !pl-2 !pr-5 after:absolute after:inset-0 after:content-['']"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-tangerine text-plum">
          <svg className="ml-0.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
          </svg>
        </span>
        {t("listenNow")}
      </Link>
    </article>
  );
}
