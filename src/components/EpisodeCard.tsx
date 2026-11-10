"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { episodePath, guestLine, splitEpisodeTitle } from "@/lib/episodes";
import type { Episode } from "@/lib/rss";

// Stamps alternate peach and bubblegum; tangerine is kept for things you press
const stampFields = ["bg-peach", "bg-bubblegum"];

function formatDate(dateStr: string, locale: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(new Date(dateStr));
}

/* An episode as a postage stamp: thumbnail, number, title and guest. The whole
   stamp opens the episode page. */
export default function EpisodeCard({ episode, index = 0 }: { episode: Episode; index?: number }) {
  const t = useTranslations("episode");
  const locale = useLocale();
  const { number, title, guest } = splitEpisodeTitle(episode);

  return (
    <Link href={episodePath(episode)} className="stamp block h-full transition-transform hover:-translate-y-1">
      <span className={`flex h-full flex-col ${stampFields[index % stampFields.length]}`}>
        <span className="relative block aspect-video overflow-hidden bg-plum/10">
          {episode.image && (
            <Image
              src={episode.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover"
            />
          )}
        </span>
        <span className="flex flex-1 flex-col gap-2.5 p-5 sm:p-6">
          {number && <span className="text-[0.9375rem] font-semibold text-plum/70">{t("number", { number })}</span>}
          <span lang="es" className="font-display text-[1.5rem] leading-[1.15]">
            {title}
          </span>
          {guest && <span className="text-base text-plum/80">{guestLine(guest, (name) => t("withGuest", { guest: name }))}</span>}
          <span className="mt-auto flex flex-wrap gap-x-3 pt-2 text-sm text-plum/70">
            <time dateTime={episode.pubDate}>{formatDate(episode.pubDate, locale)}</time>
            {episode.duration && <span>{episode.duration}</span>}
          </span>
        </span>
      </span>
    </Link>
  );
}
