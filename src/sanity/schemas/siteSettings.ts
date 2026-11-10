/* Links and switches for the whole site. The words on each page live under "Website text". */
const siteSettings = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document" as const,
  fields: [
    {
      name: "platformLinks",
      title: "Listening Platform Links",
      type: "array",
      description: "Links to your podcast on YouTube, Spotify, Apple Podcasts, etc.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "YouTube", value: "youtube" },
                  { title: "Spotify", value: "spotify" },
                  { title: "Apple Podcasts", value: "apple" },
                ],
              },
            },
            { name: "url", title: "URL", type: "url" },
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        },
      ],
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
          preview: { select: { title: "platform", subtitle: "url" } },
        },
      ],
    },
    {
      name: "buyMeCoffeeUrl",
      title: "Buy Me a Coffee URL",
      type: "url",
    },
    {
      name: "callBookingUrl",
      title: "Call booking URL (Cal.com)",
      type: "url",
      description: "The public link of the paid call event, e.g. https://cal.com/…/una-llamada-con-tu-love-bestie",
    },
    {
      name: "podcastRssUrl",
      title: "Podcast RSS Feed URL",
      type: "url",
      description: "Your YouTube channel RSS feed or Spotify/Anchor feed URL",
    },

    // ---- Navigation visibility ----
    {
      name: "showShop",
      title: "Show Shop page",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "showProducts",
      title: "Show Products page",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "showCourses",
      title: "Show Courses page",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "showSessions",
      title: "Show paid sessions on the home page",
      type: "boolean",
      initialValue: false,
      description: "The ¿Lo hablamos? section with the paid call and email. Turn on once booking and payments are ready.",
    },
    { name: "seo", title: "SEO", type: "seo" },
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
};

export default siteSettings;
