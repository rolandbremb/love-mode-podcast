"use client";

import Image from "next/image";
import { useState } from "react";

const PLAY_ICON = "M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z";

/* Shows the episode thumbnail and loads YouTube's (heavy) player only once someone
   presses play, so the page opens fast. */
export default function YouTubePlayer({
  videoId,
  title,
  image,
  playLabel,
}: {
  videoId: string;
  title: string;
  image?: string;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-plum shadow-postal">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={playLabel} className="group absolute inset-0">
          {image && (
            <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 60rem, 100vw" className="object-cover" />
          )}
          <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-tangerine text-plum shadow-postal transition-transform group-hover:scale-105 group-focus-visible:scale-105">
            <svg className="ml-1 h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={PLAY_ICON} />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
