import type { Episode } from "@/lib/rss";

/* The four love journey stops each get a page with their episodes. An episode belongs
   to a stop when one of the stop's keywords appears in its title or opening paragraph
   (not the sponsor and sign-off lines further down, which mention everything). */

export type JourneyStop = { title: string; description: string; search: string };

// Lowercase and strip accents so "relación" and "relacion" read the same
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Stop addresses come from the Spanish names, so both languages share them
export function stopSlug(spanishTitle: string) {
  return normalize(spanishTitle).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function stopPath(spanishTitle: string) {
  return `/love-journey/${stopSlug(spanishTitle)}`;
}

// The episode's opening paragraph, skipping a leading "Suscríbete…" line
function opening(description: string) {
  return description.split(/\n\s*\n/).find((paragraph) => !/^suscr[ií]bete/i.test(paragraph.trim())) ?? "";
}

// "primera cita, citas, dating" -> ["primera cita", "citas", "dating"], with the stop's search word as fallback
function keywordList(keywords: string | undefined, fallback: string) {
  const list = (keywords ?? "").split(",").map((word) => normalize(word.trim())).filter(Boolean);
  return list.length > 0 ? list : [normalize(fallback)];
}

export function stopEpisodes(episodes: Episode[], keywords: string | undefined, fallbackSearch: string) {
  const words = keywordList(keywords, fallbackSearch);
  return episodes.filter((episode) => {
    const text = normalize(`${episode.title} ${opening(episode.description)}`);
    return words.some((word) => text.includes(word));
  });
}
