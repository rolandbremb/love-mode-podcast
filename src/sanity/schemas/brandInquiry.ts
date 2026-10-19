// Saved automatically from the Collaborate form on the website
const brandInquiry = {
  name: "brandInquiry",
  title: "Brand Inquiry",
  type: "document" as const,
  fields: [
    {
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Replied", value: "replied" },
          { title: "In progress", value: "inProgress" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    },
    { name: "name", title: "Name / Company", type: "string", readOnly: true },
    { name: "email", title: "Email", type: "string", readOnly: true },
    { name: "collaborationType", title: "Type of Collaboration", type: "string", readOnly: true },
    { name: "website", title: "Website / Social Links", type: "string", readOnly: true },
    { name: "budget", title: "Budget Range", type: "string", readOnly: true },
    { name: "message", title: "Their Idea", type: "text", rows: 6, readOnly: true },
    { name: "locale", title: "Site Language", type: "string", readOnly: true },
    { name: "submittedAt", title: "Submitted", type: "datetime", readOnly: true },
    { name: "notes", title: "Internal Notes", type: "text", rows: 3 },
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", type: "collaborationType", status: "status", date: "submittedAt" },
    prepare: ({ title, type, status, date }: Record<string, string | undefined>) => ({
      title: `${status === "new" ? "🟢 " : ""}${title ?? "Unnamed"}`,
      subtitle: [type, date ? new Date(date).toLocaleDateString() : null].filter(Boolean).join(" · "),
    }),
  },
};

export default brandInquiry;
