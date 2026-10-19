import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Home-screen icon for phones (iOS rounds the corners itself)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const bricolage = await readFile(join(process.cwd(), "src/app/fonts/BricolageGrotesque-ExtraBold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#d41f55",
          color: "#fff7f0",
          fontFamily: "Bricolage",
          fontSize: 56,
          lineHeight: 0.86,
          letterSpacing: -2.5,
        }}
      >
        <span>love</span>
        <span>mode</span>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: bricolage, weight: 800, style: "normal" }] }
  );
}
