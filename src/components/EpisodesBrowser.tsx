"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import EpisodeCard from "@/components/EpisodeCard";
import type { Episode } from "@/lib/rss";

// Lowercase and strip accents so "corazon" matches "corazón"
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export type EpisodeFilter = { label: string; search: string };

export default function EpisodesBrowser({ episodes, filters = [] }: { episodes: Episode[]; filters?: EpisodeFilter[] }) {
  const t = useTranslations("episodes");
  const [query, setQuery] = useState("");

  // Links like /episodes?q=soltar (the love journey stops and topics) open with that search filled in
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

  // A topic chip fills the search; pressing the active one clears it
  function toggleFilter(search: string) {
    setQuery((current) => (normalize(current) === normalize(search) ? "" : search));
  }

  return (
    <div>
      <div className="mb-12 flex flex-col gap-5">
        <label className="relative block max-w-xl">
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

        {filters.length > 0 && (
          <ul className="flex flex-wrap gap-2.5" aria-label={t("filtersLabel")}>
            {filters.map((filter) => {
              const active = query.trim() !== "" && normalize(query.trim()) === normalize(filter.search);
              return (
                <li key={filter.label}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleFilter(filter.search)}
                    className={`chip transition-colors ${active ? "bg-plum text-shell" : "hover:bg-plum hover:text-shell"}`}
                  >
                    {filter.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((episode, index) => (
            <EpisodeCard key={episode.link} episode={episode} index={index} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-lg text-mauve">
          {t("noResults", { query })}
        </p>
      )}
    </div>
  );
}
