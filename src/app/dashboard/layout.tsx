import type { Metadata } from "next";
import { Figtree, Gloock } from "next/font/google";
import "../globals.css";

const display = Gloock({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-sans" });

// Andrea's private dashboard: never indexed, never in the sitemap
export const metadata: Metadata = {
  title: "Dashboard · Love Mode",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-shell text-plum">{children}</body>
    </html>
  );
}
