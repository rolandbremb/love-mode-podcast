import type { SocialProof } from "@/sanity/client";

// Unfinished sections show in local development and where SHOW_UPCOMING_SECTIONS is on
export const showUpcoming =
  process.env.SHOW_UPCOMING_SECTIONS === "true" || process.env.NODE_ENV === "development";

/* Placeholder proof so the brands and home pages can be reviewed before Andrea fills in
   Brands & Reviews. Only ever used where unfinished sections show, never on the live site. */
const SAMPLE: SocialProof = {
  audienceStats: [
    { value: "00%", label: "mujeres (ejemplo)" },
    { value: "25–40", label: "años, la mayoría (ejemplo)" },
    { value: "3", label: "países principales (ejemplo)" },
  ],
  partners: [{ name: "Per'la Coffee", logo: null, url: null }],
  brandQuote: {
    quote: "Aquí irá lo que diga una marca sobre trabajar con Love Mode (ejemplo).",
    name: "Nombre",
    role: "Cargo, marca",
  },
  mediaKitUrl: "#",
  reviews: [
    { quote: "Aquí irá una reseña real de una oyente, tal como la escribió (ejemplo).", name: "Nombre, ciudad", source: "Apple Podcasts" },
    { quote: "Otra reseña, de Spotify o Instagram, con su permiso (ejemplo).", name: "Nombre, ciudad", source: "Instagram" },
    { quote: "Una tercera reseña para completar la fila (ejemplo).", name: "Nombre, ciudad", source: "Spotify" },
  ],
};

// Fills each empty part with the sample while previewing; returns what's real otherwise
export function withPreviewSample(proof: SocialProof): { proof: SocialProof; usesSample: boolean } {
  if (!showUpcoming) return { proof, usesSample: false };
  const merged: SocialProof = {
    audienceStats: proof.audienceStats.length ? proof.audienceStats : SAMPLE.audienceStats,
    partners: proof.partners.length ? proof.partners : SAMPLE.partners,
    brandQuote: proof.brandQuote ?? SAMPLE.brandQuote,
    mediaKitUrl: proof.mediaKitUrl ?? SAMPLE.mediaKitUrl,
    reviews: proof.reviews.length ? proof.reviews : SAMPLE.reviews,
  };
  const usesSample =
    !proof.audienceStats.length || !proof.partners.length || !proof.brandQuote || !proof.mediaKitUrl || !proof.reviews.length;
  return { proof: merged, usesSample };
}
