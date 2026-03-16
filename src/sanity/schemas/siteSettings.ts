const siteSettings = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document" as const,
  fields: [
    {
      name: "heroTagline",
      title: "Hero Tagline",
      type: "string",
      description: 'Small text above the title (e.g. "The Podcast")',
    },
    {
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      description: 'Main hero heading (e.g. "Love Mode")',
    },
    {
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 3,
      description: "The paragraph below the hero title",
    },
    {
      name: "aboutTitle",
      title: "About Section Title",
      type: "string",
    },
    {
      name: "aboutParagraphs",
      title: "About Paragraphs",
      type: "array",
      of: [{ type: "text" }],
      description: "Each entry becomes a separate paragraph in the About section",
    },
    {
      name: "buyMeCoffeeUrl",
      title: "Buy Me a Coffee URL",
      type: "url",
    },
    {
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "platform", title: "Platform", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
          preview: {
            select: { title: "platform", subtitle: "url" },
          },
        },
      ],
    },
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
};

export default siteSettings;
