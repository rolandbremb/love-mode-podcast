const about = {
  name: "about",
  title: "About Page",
  type: "document" as const,
  fields: [
    { name: "hostName", title: "Host Name", type: "string" },
    {
      name: "hostPhoto",
      title: "Host Photo",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "hostBio",
      title: "Host Bio",
      type: "array",
      of: [{ type: "text" }],
      description: "Each entry becomes a separate paragraph",
    },
    {
      name: "showMission",
      title: "Show Mission",
      type: "text",
      rows: 3,
      description: "One-liner or short paragraph about what Love Mode stands for",
    },
    {
      name: "es",
      title: "Spanish (ES)",
      type: "object",
      fields: [
        {
          name: "hostBio",
          title: "Host Bio (ES)",
          type: "array",
          of: [{ type: "text" }],
        },
        {
          name: "showMission",
          title: "Show Mission (ES)",
          type: "text",
          rows: 3,
        },
      ],
    },
    { name: "seo", title: "SEO", type: "seo" },
  ],
  preview: {
    prepare: () => ({ title: "About Page" }),
  },
};

export default about;
