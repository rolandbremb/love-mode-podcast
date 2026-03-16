const shopCollection = {
  name: "shopCollection",
  title: "Shop Collection",
  type: "document" as const,
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "description", title: "Description", type: "text", rows: 2 },
    {
      name: "emoji",
      title: "Emoji",
      type: "string",
      description: "A single emoji character (e.g. 📚)",
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

export default shopCollection;
