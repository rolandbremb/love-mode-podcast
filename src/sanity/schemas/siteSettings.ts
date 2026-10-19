import {
  BODY_FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  SITE_THEME_DEFAULTS,
} from "../../lib/siteTheme";
import HexColorInput from "../inputs/HexColorInput";

const hexColorRule = (Rule: {
  custom: (
    validator: (value: unknown) => true | string
  ) => { warning: (message: string) => unknown };
}) =>
  Rule.custom((value) => {
    if (
      typeof value === "undefined" ||
      value === null ||
      value === "" ||
      /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value))
    ) {
      return true;
    }

    return "Enter a hex color like #FFF8F1";
  }).warning("Use a hex color like #FFF8F1");

const siteSettings = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document" as const,
  groups: [
    { name: "content", title: "Content (EN)" },
    { name: "es", title: "Spanish (ES)" },
    { name: "general", title: "General" },
    { name: "design", title: "Design" },
  ],
  fields: [
    // ---- English content ----
    {
      name: "heroTagline",
      title: "Hero Tagline",
      type: "string",
      group: "content",
      description: 'Small text above the title (e.g. "The Podcast")',
    },
    {
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      group: "content",
    },
    {
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 3,
      group: "content",
    },
    {
      name: "aboutTitle",
      title: "About Section Title",
      type: "string",
      group: "content",
    },
    {
      name: "aboutParagraphs",
      title: "About Paragraphs",
      type: "array",
      of: [{ type: "text" }],
      group: "content",
      description: "Each entry becomes a separate paragraph",
    },

    // ---- Spanish translations ----
    {
      name: "es",
      title: "Spanish Translations",
      type: "object",
      group: "es",
      fields: [
        { name: "heroTagline", title: "Hero Tagline (ES)", type: "string" },
        { name: "heroTitle", title: "Hero Title (ES)", type: "string" },
        { name: "heroDescription", title: "Hero Description (ES)", type: "text", rows: 3 },
        { name: "aboutTitle", title: "About Title (ES)", type: "string" },
        {
          name: "aboutParagraphs",
          title: "About Paragraphs (ES)",
          type: "array",
          of: [{ type: "text" }],
        },
        { name: "episodeSchedule", title: "Episode Schedule (ES)", type: "string" },
      ],
    },

    // ---- Hero extras ----
    {
      name: "episodeSchedule",
      title: "Episode Schedule",
      type: "string",
      group: "content",
      description: 'Shown in the hero, e.g. "New episodes every Friday"',
    },
    {
      name: "platformLinks",
      title: "Listening Platform Links",
      type: "array",
      group: "general",
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

    // ---- Navigation visibility ----
    {
      name: "showShop",
      title: "Show Shop page",
      type: "boolean",
      group: "general",
      initialValue: true,
    },
    {
      name: "showProducts",
      title: "Show Products page",
      type: "boolean",
      group: "general",
      initialValue: true,
    },
    {
      name: "showCourses",
      title: "Show Courses page",
      type: "boolean",
      group: "general",
      initialValue: true,
    },

    // ---- Design ----
    {
      name: "bodyFont",
      title: "Body Font",
      type: "string",
      group: "design",
      initialValue: SITE_THEME_DEFAULTS.bodyFont,
      description: "Main font used for paragraphs, navigation, and buttons.",
      options: {
        list: BODY_FONT_OPTIONS,
        layout: "dropdown",
      },
    },
    {
      name: "headingFont",
      title: "Heading Font",
      type: "string",
      group: "design",
      initialValue: SITE_THEME_DEFAULTS.headingFont,
      description: "Font used for headlines and other serif-styled text.",
      options: {
        list: HEADING_FONT_OPTIONS,
        layout: "dropdown",
      },
    },
    {
      name: "pageBackgroundColor",
      title: "Page Background Color",
      type: "string",
      group: "design",
      initialValue: SITE_THEME_DEFAULTS.pageBackgroundColor,
      description: "Base background for the site.",
      components: { input: HexColorInput },
      validation: hexColorRule,
    },
    {
      name: "sectionBackgroundColor",
      title: "Soft Section Background Color",
      type: "string",
      group: "design",
      initialValue: SITE_THEME_DEFAULTS.sectionBackgroundColor,
      description: "Used for softer highlighted sections and panels.",
      components: { input: HexColorInput },
      validation: hexColorRule,
    },
    {
      name: "surfaceBackgroundColor",
      title: "Card Background Color",
      type: "string",
      group: "design",
      initialValue: SITE_THEME_DEFAULTS.surfaceBackgroundColor,
      description: "Used for cards, forms, and content surfaces.",
      components: { input: HexColorInput },
      validation: hexColorRule,
    },

    // ---- General ----
    {
      name: "podcastRssUrl",
      title: "Podcast RSS Feed URL",
      type: "url",
      group: "general",
      description: "Your YouTube channel RSS feed or Spotify/Anchor feed URL",
    },
    {
      name: "buyMeCoffeeUrl",
      title: "Buy Me a Coffee URL",
      type: "url",
      group: "general",
    },
    {
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      group: "general",
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
    { name: "seo", title: "SEO", type: "seo", group: "general" },
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
};

export default siteSettings;
