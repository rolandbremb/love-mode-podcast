"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import EpisodeCard from "@/components/EpisodeCard";
import type { Episode } from "@/lib/rss";

// Lowercase and strip accents so "corazon" matches "corazón"
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function EpisodesBrowser({ episodes }: { episodes: Episode[] }) {
  const t = useTranslations("episodes");
  const [query, setQuery] = useState("");

  // Links like /episodes?q=soltar (the love journey stops) open with that search filled in
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQuery(initial);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return episodes;
    return episodes.filter((episode) =>
      normalize(`${episode.title} ${episode.description}`).includes(q)
    );
  }, [episodes, query]);

  return (
    <div>
      <label className="relative mb-10 block max-w-xl">
        <span className="sr-only">{t("searchLabel")}</span>
        <svg
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-mauve"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-full border-[1.5px] border-plum bg-white py-3.5 pl-14 pr-6 text-[1.0625rem] text-plum placeholder:text-mauve/70"
        />
      </label>

      {results.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((episode) => (
            <EpisodeCard key={episode.link} episode={episode} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center font-hand text-2xl">
          {t("noResults", { query })}
        </p>
      )}
    </div>
  );
}
