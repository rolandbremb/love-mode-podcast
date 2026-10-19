// Saved automatically from the Be a Guest form on the website
const guestApplication = {
  name: "guestApplication",
  title: "Guest Application",
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
          { title: "Contacted", value: "contacted" },
          { title: "Booked", value: "booked" },
          { title: "Not a fit", value: "notAFit" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    },
    { name: "name", title: "Full Name", type: "string", readOnly: true },
    { name: "email", title: "Email", type: "string", readOnly: true },
    { name: "social", title: "Social Media Links", type: "string", readOnly: true },
    { name: "expertise", title: "Expertise / Topic", type: "string", readOnly: true },
    { name: "message", title: "Why They'd Be a Great Guest", type: "text", rows: 6, readOnly: true },
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
    select: { title: "name", expertise: "expertise", status: "status", date: "submittedAt" },
    prepare: ({ title, expertise, status, date }: Record<string, string | undefined>) => ({
      title: `${status === "new" ? "🟢 " : ""}${title ?? "Unnamed"}`,
      subtitle: [expertise, date ? new Date(date).toLocaleDateString() : null].filter(Boolean).join(" · "),
    }),
  },
};

export default guestApplication;
