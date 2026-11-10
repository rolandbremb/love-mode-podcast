import type { Episode } from "@/lib/rss";

// Lowercase and strip accents so "corazón" and "corazon" read the same
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/* "41. Volver al dating | Gabriela Zuluaga" -> number, title and guest */
export function splitEpisodeTitle(episode: Pick<Episode, "title">) {
  const match = episode.title.match(/^(\d+)\.?\s*(.*)$/);
  const [rest, guest] = (match ? match[2] : episode.title).split(/\s+\|\s+/);
  return { number: match?.[1], title: rest.trim(), guest: guest?.trim() };
}

/* The episode's address on the site, built from its YouTube title without the number:
   "41. Volver al dating | Gabriela Zuluaga" -> "volver-al-dating-gabriela-zuluaga".
   Renaming the video on YouTube changes the address too. */
export function episodeSlug(episode: Pick<Episode, "title" | "videoId">) {
  const { title, guest } = splitEpisodeTitle(episode);
  const words = (text = "") =>
    normalize(text).replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);

  // Keep addresses readable: whole words, about 90 characters at most
  let slug = "";
  for (const word of words(title)) {
    if (slug && slug.length + word.length + 1 > 90) break;
    slug = slug ? `${slug}-${word}` : word;
  }
  // The guest's name goes on the end only when it fits whole
  const guestSlug = words(guest).join("-");
  if (guestSlug && slug.length + guestSlug.length + 1 <= 90) slug = `${slug}-${guestSlug}`;
  return slug || episode.videoId || "episodio";
}

export function episodePath(episode: Pick<Episode, "title" | "videoId">) {
  return `/episodes/${episodeSlug(episode)}`;
}

export function findEpisode(episodes: Episode[], slug: string) {
  return episodes.find((episode) => episodeSlug(episode) === slug);
}

// Search results and previews show a short summary: the opening, cut at a word
export function summarize(text: string, max = 200) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", max))}…`;
}

const STOP_WORDS = new Set(
  "sobre desde hasta cuando donde porque tambien episodio conversacion hablamos love mode pareja despues antes otra otro todos todas siempre puede pueden tienes estas cuenta como".split(" ")
);

function keywords(episode: Episode) {
  const text = normalize(`${episode.title} ${episode.description.slice(0, 600)}`);
  return new Set(text.split(/[^a-z]+/).filter((word) => word.length >= 5 && !STOP_WORDS.has(word)));
}

/* Episodes to suggest after this one: the ones sharing the most words with it,
   then the closest in time, so there's always something to play next. */
export function relatedEpisodes(episodes: Episode[], current: Episode, count = 3) {
  const own = keywords(current);
  const index = episodes.indexOf(current);
  return episodes
    .map((episode, i) => ({
      episode,
      shared: [...keywords(episode)].filter((word) => own.has(word)).length,
      distance: Math.abs(i - index),
    }))
    .filter(({ episode }) => episode !== current)
    .sort((a, b) => b.shared - a.shared || a.distance - b.distance)
    .slice(0, count)
    .map(({ episode }) => episode);
}
