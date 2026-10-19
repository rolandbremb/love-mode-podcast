import { draftMode } from "next/headers";
import {
  Bricolage_Grotesque,
  Caveat,
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Inter,
  Manrope,
  Playfair_Display,
} from "next/font/google";
import type { CSSProperties } from "react";
import { VisualEditing } from "@/components/VisualEditingClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getBodyFontStack,
  getHeadingFontStack,
  resolveSiteThemeSettings,
} from "@/lib/siteTheme";
import { getSiteSettings } from "@/sanity/client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["500", "700"],
});

const fontVariables = [
  inter.variable,
  manrope.variable,
  dmSans.variable,
  playfair.variable,
  cormorant.variable,
  fraunces.variable,
  bricolage.variable,
  caveat.variable,
].join(" ");

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { isEnabled: preview } = await draftMode();
  const { locale } = await params;
  const settings = await getSiteSettings({ preview, locale });
  const theme = resolveSiteThemeSettings(settings ?? undefined);

  const navVisibility = {
    showShop: settings?.showShop ?? true,
    showProducts: settings?.showProducts ?? true,
    showCourses: settings?.showCourses ?? true,
  };

  const themeStyle = {
    "--theme-body-font": getBodyFontStack(theme.bodyFont),
    "--theme-heading-font": getHeadingFontStack(
      theme.headingFont,
      theme.bodyFont
    ),
    "--theme-page-bg": theme.pageBackgroundColor,
    "--theme-soft-bg": theme.sectionBackgroundColor,
    "--theme-surface-bg": theme.surfaceBackgroundColor,
  } as CSSProperties;

  return (
    <div className={`${fontVariables} site-theme`} style={themeStyle}>
      <Navbar {...navVisibility} />
      <main className="min-h-screen">{children}</main>
      <Footer locale={locale} {...navVisibility} />
      {preview && <VisualEditing zIndex={1000} />}
    </div>
  );
}
