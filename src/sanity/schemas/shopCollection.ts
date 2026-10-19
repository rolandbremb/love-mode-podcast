import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

const shopCollection = {
  name: "shopCollection",
  title: "Shop Collection",
  type: "document" as const,
  fields: [
    orderRankField({ type: "shopCollection" }),
    { name: "title", title: "Title", type: "string" },
    { name: "description", title: "Description", type: "text", rows: 2 },
    {
      name: "emoji",
      title: "Emoji",
      type: "string",
      description: "A single emoji character (e.g. 📚)",
    },
    { name: "link", title: "Link", type: "url" },
    {
      name: "es",
      title: "Spanish (ES)",
      type: "object",
      fields: [
        { name: "title", title: "Title (ES)", type: "string" },
        { name: "description", title: "Description (ES)", type: "text", rows: 2 },
      ],
    },
  ],
  orderings: [orderRankOrdering],
};

export default shopCollection;
