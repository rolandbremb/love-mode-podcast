const BODY_FONT_VALUES = ["inter", "manrope", "dmSans"] as const;
const HEADING_FONT_VALUES = [
  "bricolage",
  "playfair",
  "cormorant",
  "fraunces",
  "matchBody",
] as const;

export type BodyFontValue = (typeof BODY_FONT_VALUES)[number];
export type HeadingFontValue = (typeof HEADING_FONT_VALUES)[number];

export const BODY_FONT_OPTIONS = [
  { title: "Inter", value: "inter" },
  { title: "Manrope", value: "manrope" },
  { title: "DM Sans", value: "dmSans" },
] as const;

export const HEADING_FONT_OPTIONS = [
  { title: "Bricolage Grotesque", value: "bricolage" },
  { title: "Playfair Display", value: "playfair" },
  { title: "Cormorant Garamond", value: "cormorant" },
  { title: "Fraunces", value: "fraunces" },
  { title: "Match Body Font", value: "matchBody" },
] as const;

export const SITE_THEME_DEFAULTS = {
  bodyFont: "inter" as BodyFontValue,
  headingFont: "bricolage" as HeadingFontValue,
  pageBackgroundColor: "#fff7f0",
  sectionBackgroundColor: "#ffe4ea",
  surfaceBackgroundColor: "#ffffff",
};

export interface SiteThemeSettings {
  bodyFont?: string;
  headingFont?: string;
  pageBackgroundColor?: string;
  sectionBackgroundColor?: string;
  surfaceBackgroundColor?: string;
}

const BODY_FONT_STACKS: Record<BodyFontValue, string> = {
  inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  manrope: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
  dmSans: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif",
};

const HEADING_FONT_STACKS: Record<Exclude<HeadingFontValue, "matchBody">, string> = {
  bricolage: "var(--font-bricolage), ui-sans-serif, system-ui, sans-serif",
  playfair: "var(--font-playfair), Georgia, serif",
  cormorant: "var(--font-cormorant), Georgia, serif",
  fraunces: "var(--font-fraunces), Georgia, serif",
};

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isBodyFontValue(value: string): value is BodyFontValue {
  return (BODY_FONT_VALUES as readonly string[]).includes(value);
}

function isHeadingFontValue(value: string): value is HeadingFontValue {
  return (HEADING_FONT_VALUES as readonly string[]).includes(value);
}

export function normalizeThemeColor(value: string | undefined, fallback: string) {
  const nextValue = value?.trim();
  return nextValue && HEX_COLOR_PATTERN.test(nextValue) ? nextValue : fallback;
}

export function resolveSiteThemeSettings(settings?: SiteThemeSettings) {
  const bodyFontValue = settings?.bodyFont ?? "";
  const headingFontValue = settings?.headingFont ?? "";

  const bodyFont = isBodyFontValue(bodyFontValue)
    ? bodyFontValue
    : SITE_THEME_DEFAULTS.bodyFont;
  const headingFont = isHeadingFontValue(headingFontValue)
    ? headingFontValue
    : SITE_THEME_DEFAULTS.headingFont;

  return {
    bodyFont,
    headingFont,
    pageBackgroundColor: normalizeThemeColor(
      settings?.pageBackgroundColor,
      SITE_THEME_DEFAULTS.pageBackgroundColor
    ),
    sectionBackgroundColor: normalizeThemeColor(
      settings?.sectionBackgroundColor,
      SITE_THEME_DEFAULTS.sectionBackgroundColor
    ),
    surfaceBackgroundColor: normalizeThemeColor(
      settings?.surfaceBackgroundColor,
      SITE_THEME_DEFAULTS.surfaceBackgroundColor
    ),
  };
}

export function getBodyFontStack(bodyFont: BodyFontValue) {
  return BODY_FONT_STACKS[bodyFont];
}

export function getHeadingFontStack(
  headingFont: HeadingFontValue,
  bodyFont: BodyFontValue
) {
  if (headingFont === "matchBody") {
    return BODY_FONT_STACKS[bodyFont];
  }

  return HEADING_FONT_STACKS[headingFont];
}
