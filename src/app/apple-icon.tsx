import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Home-screen icon for phones (iOS rounds the corners itself)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const gloock = await readFile(join(process.cwd(), "src/app/fonts/Gloock-Regular.woff"));

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
          background: "#2d1530",
          color: "#ffcafd",
          fontFamily: "Gloock",
          fontSize: 60,
          lineHeight: 0.88,
          letterSpacing: -2,
        }}
      >
        <span>Love</span>
        <span>Mode</span>
      </div>
    ),
    { ...size, fonts: [{ name: "Gloock", data: gloock, weight: 400, style: "normal" }] }
  );
}
