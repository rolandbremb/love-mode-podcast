import type { Metadata, ResolvingMetadata } from "next";
import { routing } from "@/i18n/routing";

// Points search engines at this page's main address and its other-language version
export function localeAlternates(locale: string, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}

// A page's openGraph replaces the layout's, so carry over the shared share image and settings
export async function pageMetadata(
  parent: ResolvingMetadata,
  { title, description, locale, path }: { title: string; description: string; locale: string; path: string }
): Promise<Metadata> {
  const og = (await parent).openGraph;
  return {
    title,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: {
      type: "website",
      title,
      description,
      siteName: og?.siteName ?? undefined,
      locale: og?.locale ?? undefined,
      images: og?.images,
    },
  };
}
