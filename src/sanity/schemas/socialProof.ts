// Proof for brands and listeners: audience numbers, partners, a brand quote, the media
// kit and listener reviews. Each part only shows on the site once it's filled in.
const socialProof = {
  name: "socialProof",
  title: "Brands & Reviews",
  type: "document" as const,
  fields: [
    {
      name: "audienceStats",
      title: "Audience numbers",
      description:
        "Shown on the For brands page after the episode, YouTube view and subscriber counts (those update by themselves). E.g. 78% / mujeres, 25–40 / años, EE. UU., Colombia y México / países principales.",
      type: "array",
      of: [
        {
          type: "object",
          name: "audienceStat",
          fields: [
            { name: "value", title: "Number", type: "string", description: "Short: 78%, 12K, 25–40" },
            { name: "label", title: "What it means", type: "localeString" },
          ],
          preview: { select: { title: "value", subtitle: "label.es" } },
        },
      ],
    },
    {
      name: "partners",
      title: "Brands we've worked with",
      description: "Their logos show on the For brands page. Use a logo on a transparent or white background.",
      type: "array",
      of: [
        {
          type: "object",
          name: "partner",
          fields: [
            { name: "name", title: "Brand name", type: "string" },
            { name: "logo", title: "Logo", type: "image" },
            { name: "url", title: "Website", type: "url" },
          ],
          preview: { select: { title: "name", media: "logo" } },
        },
      ],
    },
    {
      name: "brandQuote",
      title: "Quote from a brand",
      type: "object",
      fields: [
        { name: "quote", title: "Quote", type: "localeText" },
        { name: "name", title: "Person's name", type: "string" },
        { name: "role", title: "Role and brand", type: "localeString", description: "E.g. Fundadora, Per'la Coffee" },
      ],
    },
    {
      name: "mediaKit",
      title: "Media kit (PDF)",
      type: "file",
      options: { accept: "application/pdf" },
      description: "Brands can download it from the For brands page.",
    },
    {
      name: "reviews",
      title: "Listener reviews",
      description:
        "Shown on the home and For brands pages. Only quote people who agreed to it, and keep their words as written.",
      type: "array",
      of: [
        {
          type: "object",
          name: "review",
          fields: [
            { name: "quote", title: "What they said", type: "text", rows: 3 },
            { name: "name", title: "Name as it should appear", type: "string", description: "E.g. Laura, Bogotá" },
            {
              name: "source",
              title: "Where they said it",
              type: "string",
              options: { list: ["Apple Podcasts", "Spotify", "YouTube", "Instagram", "TikTok", "Email"] },
            },
          ],
          preview: { select: { title: "name", subtitle: "quote" } },
        },
      ],
    },
  ],
  preview: {
    prepare: () => ({ title: "Brands & Reviews" }),
  },
};

export default socialProof;
