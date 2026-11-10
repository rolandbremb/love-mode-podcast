import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { findEpisode, isPersonName, splitEpisodeTitle } from "@/lib/episodes";
import { getAllEpisodes } from "@/lib/rss";
import { getSiteSettings } from "@/sanity/client";

// The preview card for a shared episode link: its number, title, guest and thumbnail
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Love Mode Podcast";
export const revalidate = 3600;

const copy = {
  en: { episode: "Episode", with: "with", note: "New episode every Friday" },
  es: { episode: "Episodio", with: "con", note: "Nuevo episodio cada viernes" },
};

const PLUM = "#2d1530";

async function thumbnail(url?: string) {
  if (!url) return undefined;
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return undefined;
  }
}

export default async function EpisodeImage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const text = copy[locale === "es" ? "es" : "en"];

  const settings = await getSiteSettings({ locale });
  const episode = findEpisode(await getAllEpisodes(settings?.podcastRssUrl), slug);
  const { number, title, guest } = episode ? splitEpisodeTitle(episode) : { number: undefined, title: "Love Mode", guest: undefined };

  const root = process.cwd();
  const [gloock, figtree, hand, photo] = await Promise.all([
    readFile(join(root, "src/app/fonts/Gloock-Regular.woff")),
    readFile(join(root, "src/app/fonts/Figtree-SemiBold.woff")),
    readFile(join(root, "src/app/fonts/NothingYouCouldDo-Regular.woff")),
    thumbnail(episode?.image),
  ]);

  // Long titles get a smaller size so they still fit in four lines
  const titleSize = title.length > 75 ? 50 : title.length > 50 ? 58 : 68;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fff2ec",
          color: PLUM,
          fontFamily: "Figtree",
        }}
      >
        {/* Airmail edge, drawn as blocks because share images can't repeat a gradient */}
        <div style={{ display: "flex", height: 12, gap: 8 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{ display: "flex", width: 22, background: i % 2 ? "#ffcafd" : "#ff6339" }} />
          ))}
        </div>

        <div style={{ display: "flex", flex: 1, padding: "44px 64px 52px", gap: 48 }}>
          {/* Left: the episode */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontFamily: "Gloock", fontSize: 40 }}>Love Mode</span>
            {number && (
              <span style={{ marginTop: 34, fontFamily: "Hand", fontSize: 38 }}>
                {text.episode} {number}
              </span>
            )}
            {/* One box per word with a set gap: the renderer spaces Gloock's words unevenly */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                columnGap: Math.round(titleSize * 0.24),
                marginTop: 14,
                fontFamily: "Gloock",
                fontSize: titleSize,
                lineHeight: 1.04,
              }}
            >
              {title.split(/\s+/).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </div>
            {guest && (
              <span style={{ marginTop: "auto", fontSize: 30 }}>
                {isPersonName(guest) ? `${text.with} ${guest}` : guest}
              </span>
            )}
          </div>

          {/* Right: the thumbnail as a stamp */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 440 }}>
            <div
              style={{
                display: "flex",
                padding: 12,
                background: "#ffffff",
                transform: "rotate(3deg)",
                boxShadow: "0 24px 40px rgba(45, 21, 48, 0.16)",
              }}
            >
              <div style={{ display: "flex", width: 416, height: 234, background: "#ffcafd" }}>
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} width={416} height={234} style={{ objectFit: "cover" }} alt="" />
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-end",
                marginTop: 44,
                transform: "rotate(-4deg)",
                background: PLUM,
                color: "#ffcafd",
                borderRadius: 999,
                padding: "12px 26px 14px",
                fontFamily: "Hand",
                fontSize: 26,
              }}
            >
              {text.note}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Gloock", data: gloock, weight: 400, style: "normal" },
        { name: "Figtree", data: figtree, weight: 600, style: "normal" },
        { name: "Hand", data: hand, weight: 400, style: "normal" },
      ],
    }
  );
}
