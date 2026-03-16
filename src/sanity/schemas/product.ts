const product = {
  name: "product",
  title: "Digital Product",
  type: "document" as const,
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "description", title: "Description", type: "text", rows: 3 },
    {
      name: "price",
      title: "Price",
      type: "string",
      description: 'Display price (e.g. "$19")',
    },
    {
      name: "badge",
      title: "Badge",
      type: "string",
      description: 'Tag label (e.g. "Ebook", "Workbook")',
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

export default product;
