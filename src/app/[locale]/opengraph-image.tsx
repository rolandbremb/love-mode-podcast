import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The preview card shown when a link to the site is shared (WhatsApp, Instagram DMs, X, LinkedIn…)
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Love Mode Podcast";

const copy = {
  en: {
    sticker: "The podcast",
    tagline: "Real talk about love, dating, and relationships that actually last.",
    note: "new episodes every Friday",
  },
  es: {
    sticker: "El podcast",
    tagline: "Conversaciones reales sobre amor, citas y relaciones que sí duran.",
    note: "nuevos episodios cada viernes",
  },
};

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = copy[locale === "es" ? "es" : "en"];

  const root = process.cwd();
  const [extraBold, semiBold, caveat, photo] = await Promise.all([
    readFile(join(root, "src/app/fonts/BricolageGrotesque-ExtraBold.ttf")),
    readFile(join(root, "src/app/fonts/BricolageGrotesque-SemiBold.ttf")),
    readFile(join(root, "src/app/fonts/Caveat-Bold.ttf")),
    readFile(join(root, "public/images/hero.jpg")),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffe4ea",
          fontFamily: "Bricolage",
          color: "#3a0a18",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* Left: wordmark and tagline */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 640 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              alignSelf: "flex-start",
              background: "#ffd66b",
              border: "3px solid #3a0a18",
              borderRadius: 999,
              padding: "8px 22px",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              boxShadow: "4px 4px 0 #3a0a18",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#3a0a18"
                d="M12 0c.9 6.6 4.8 10.9 12 12-7.2 1.1-11.1 5.4-12 12-.9-6.6-4.8-10.9-12-12C7.2 10.9 11.1 6.6 12 0z"
              />
            </svg>
            {text.sticker}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 22,
              fontSize: 168,
              fontWeight: 800,
              lineHeight: 0.84,
              letterSpacing: -8,
              color: "#b01444",
            }}
          >
            <span>love</span>
            <span>mode</span>
          </div>
          <svg width="300" height="20" viewBox="0 0 280 16" style={{ marginTop: 14 }}>
            <path
              d="M3 9c20-8 40 8 60 0s40-8 60 0 40 8 60 0 40-8 54 0"
              stroke="#f75f8c"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div style={{ display: "flex", marginTop: 22, fontSize: 32, fontWeight: 600, lineHeight: 1.25, maxWidth: 560 }}>
            {text.tagline}
          </div>
        </div>

        {/* Right: arch photo with a butter backing */}
        <div style={{ display: "flex", position: "relative", width: 420, height: 518, marginLeft: "auto" }}>
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              width: 404,
              height: 502,
              background: "#ffd66b",
              border: "4px solid #3a0a18",
              borderRadius: "202px 202px 40px 40px",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: 404,
              height: 502,
              border: "4px solid #3a0a18",
              borderRadius: "202px 202px 40px 40px",
              overflow: "hidden",
              background: "#ffc2d3",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoSrc} width={404} height={502} style={{ objectFit: "cover", width: "100%", height: "100%" }} alt="" />
          </div>
          <div
            style={{
              position: "absolute",
              left: -60,
              bottom: 28,
              display: "flex",
              transform: "rotate(-4deg)",
              background: "#d41f55",
              color: "#fff7f0",
              border: "3px solid #3a0a18",
              borderRadius: 999,
              padding: "6px 24px 10px",
              fontFamily: "Caveat",
              fontSize: 38,
              boxShadow: "4px 4px 0 #3a0a18",
            }}
          >
            {text.note}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: extraBold, weight: 800, style: "normal" },
        { name: "Bricolage", data: semiBold, weight: 600, style: "normal" },
        { name: "Caveat", data: caveat, weight: 700, style: "normal" },
      ],
    }
  );
}
