import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The preview card shown when a link to the site is shared (WhatsApp, Instagram DMs, X, LinkedIn…)
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Love Mode Podcast";

const copy = {
  en: {
    dear: "Dear you,",
    tagline: "Your love & dating bestie, by Andrea Moreno",
    note: "New episode every Friday",
  },
  es: {
    dear: "Querida tú,",
    tagline: "Your love & dating bestie, por Andrea Moreno",
    note: "Nuevo episodio cada viernes",
  },
};

const PLUM = "#2d1530";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = copy[locale === "es" ? "es" : "en"];

  const root = process.cwd();
  const [gloock, figtree, hand, photo] = await Promise.all([
    readFile(join(root, "src/app/fonts/Gloock-Regular.woff")),
    readFile(join(root, "src/app/fonts/Figtree-SemiBold.woff")),
    readFile(join(root, "src/app/fonts/NothingYouCouldDo-Regular.woff")),
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
        <div style={{ display: "flex", flex: 1, padding: "28px 72px 60px", alignItems: "center" }}>
          {/* Left: the letter */}
          <div style={{ display: "flex", flexDirection: "column", width: 620 }}>
            <span style={{ fontFamily: "Hand", fontSize: 44 }}>{text.dear}</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 18,
                fontFamily: "Gloock",
                fontSize: 176,
                lineHeight: 0.86,
                letterSpacing: -6,
              }}
            >
              <span>Love</span>
              <span>Mode</span>
            </div>
            <span style={{ marginTop: 30, fontSize: 28, width: 680 }}>{text.tagline}</span>
          </div>

          {/* Right: the stamp */}
          <div style={{ display: "flex", position: "relative", marginLeft: "auto", width: 380, height: 470 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 380,
                height: 470,
                padding: 14,
                background: "#ffffff",
                transform: "rotate(3deg)",
                boxShadow: "0 24px 40px rgba(45, 21, 48, 0.16)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "#ffcafd", padding: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoSrc} width={324} height={378} style={{ objectFit: "cover", objectPosition: "58% center" }} alt="" />
                <span style={{ marginTop: 10, fontFamily: "Gloock", fontSize: 30 }}>Love Mode</span>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: -70,
                top: -26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 136,
                height: 136,
                borderRadius: 999,
                border: "3px solid #ff6339",
                background: "rgba(255, 242, 236, 0.75)",
                transform: "rotate(-12deg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 92,
                  height: 92,
                  borderRadius: 999,
                  border: "2px solid #ff6339",
                }}
              >
                <svg width="44" height="40" viewBox="0 0 66 60">
                  <path
                    d="M33 56C16 45 5 36 6 23c1-10 14-14 23-5l4 4 4-4c9-9 22-5 23 5 1 13-10 22-27 33z"
                    fill="none"
                    stroke="#ff6339"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                right: -24,
                bottom: -52,
                display: "flex",
                transform: "rotate(-4deg)",
                background: PLUM,
                color: "#ffcafd",
                borderRadius: 999,
                padding: "12px 26px 14px",
                fontFamily: "Hand",
                fontSize: 28,
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
