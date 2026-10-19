import type { Metadata, ResolvingMetadata } from "next";

// A page's openGraph replaces the layout's, so carry over the shared share image and settings
export async function pageMetadata(
  parent: ResolvingMetadata,
  title: string,
  description: string
): Promise<Metadata> {
  const og = (await parent).openGraph;
  return {
    title,
    description,
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
