import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

const course = {
  name: "course",
  title: "Course",
  type: "document" as const,
  fields: [
    orderRankField({ type: "course" }),
    { name: "title", title: "Title", type: "string" },
    {
      name: "image",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    },
    { name: "description", title: "Description", type: "text", rows: 3 },
    {
      name: "duration",
      title: "Duration",
      type: "string",
      description: 'e.g. "6 weeks"',
    },
    {
      name: "format",
      title: "Format",
      type: "string",
      description: 'e.g. "Self-paced video"',
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Coming Soon", value: "coming-soon" },
          { title: "Available", value: "available" },
        ],
      },
    },
    { name: "link", title: "Link", type: "url" },
    {
      name: "es",
      title: "Spanish (ES)",
      type: "object",
      fields: [
        { name: "title", title: "Title (ES)", type: "string" },
        { name: "description", title: "Description (ES)", type: "text", rows: 3 },
        { name: "format", title: "Format (ES)", type: "string" },
      ],
    },
    { name: "seo", title: "SEO", type: "seo" },
  ],
  orderings: [orderRankOrdering],
};

export default course;
