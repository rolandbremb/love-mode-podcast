const seo = {
  name: "seo",
  title: "SEO",
  type: "object" as const,
  fields: [
    {
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      description: "Overrides the page title in search results (50–60 chars recommended)",
    },
    {
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 3,
      description: "Shown in search results (150–160 chars recommended)",
    },
    {
      name: "ogImage",
      title: "Social Share Image",
      type: "image",
      description: "Image shown when shared on social media (1200×630px recommended)",
      options: { hotspot: true },
    },
  ],
};

export default seo;
