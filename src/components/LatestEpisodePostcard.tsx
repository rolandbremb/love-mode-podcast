import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { episodePath, guestLine, splitEpisodeTitle } from "@/lib/episodes";
import type { Episode } from "@/lib/rss";

/* The newest episode as a postcard (thumbnail stamp, date, title, guest and a play
   button), so it's clear the show is alive. Used on the home and episodes pages. */
export default function LatestEpisodePostcard({
  episode,
  locale,
  label,
  cta,
  withGuest,
}: {
  episode: Episode;
  locale: string;
  label: string;
  cta: string;
  withGuest: (guest: string) => string;
}) {
  const { title, guest } = splitEpisodeTitle(episode);
  const date = episode.pubDate
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(new Date(episode.pubDate))
    : "";

  return (
    <Link
      href={episodePath(episode)}
      className="group relative grid items-center gap-6 overflow-hidden rounded-md bg-white p-5 pt-8 shadow-postal [--stamp-cut:#ffffff] sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_auto] sm:gap-10 sm:p-8 sm:pt-10"
    >
      <span className="airmail absolute inset-x-0 top-0 [--airmail-gap:#ffffff]" aria-hidden="true" />
      <span className="stamp stamp-sm block -rotate-2">
        <span className="relative block aspect-video overflow-hidden bg-bubblegum">
          {episode.image && (
            <Image src={episode.image} alt="" fill priority sizes="(min-width: 640px) 17rem, 90vw" className="object-cover" />
          )}
        </span>
      </span>
      <span className="flex flex-col gap-2">
        <span className="text-[0.9375rem] font-semibold text-mauve">
          {label}
          {date && <span className="font-normal">, {date}</span>}
        </span>
        <span lang="es" className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08]">
          {title}
        </span>
        {guest && <span className="text-[1.0625rem] text-mauve">{guestLine(guest, withGuest)}</span>}
      </span>
      <span className="btn-primary self-start !py-2 !pl-6 !pr-2 sm:self-center">
        {cta}
        <span className="grid h-11 w-11 place-items-center rounded-full bg-tangerine text-plum transition-transform group-hover:translate-x-0.5">
          <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
          </svg>
        </span>
      </span>
    </Link>
  );
}
