import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

const product = {
  name: "product",
  title: "Digital Product",
  type: "document" as const,
  fields: [
    orderRankField({ type: "product" }),
    { name: "title", title: "Title", type: "string" },
    {
      name: "image",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    },
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
    {
      name: "es",
      title: "Spanish (ES)",
      type: "object",
      fields: [
        { name: "title", title: "Title (ES)", type: "string" },
        { name: "description", title: "Description (ES)", type: "text", rows: 3 },
        { name: "badge", title: "Badge (ES)", type: "string" },
      ],
    },
    { name: "seo", title: "SEO", type: "seo" },
  ],
  orderings: [orderRankOrdering],
};

export default product;
