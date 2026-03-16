const course = {
  name: "course",
  title: "Course",
  type: "document" as const,
  fields: [
    { name: "title", title: "Title", type: "string" },
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
    { name: "order", title: "Sort Order", type: "number" },
  ],
  orderings: [
    {
      title: "Sort Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
};

export default course;
