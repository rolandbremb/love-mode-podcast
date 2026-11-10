// Saved automatically from "Cuéntamelo por email"; becomes "Paid" once Stripe confirms
const emailSession = {
  name: "emailSession",
  title: "Paid Email",
  type: "document" as const,
  fields: [
    {
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "pending",
      description: "Waiting for payment means they started but didn't pay; you don't need to answer those.",
      options: {
        list: [
          { title: "Waiting for payment", value: "pending" },
          { title: "Paid, to answer", value: "paid" },
          { title: "Answered", value: "answered" },
          { title: "Refunded", value: "refunded" },
        ],
        layout: "radio",
      },
    },
    { name: "name", title: "Name", type: "string", readOnly: true },
    { name: "email", title: "Email", type: "string", readOnly: true },
    { name: "story", title: "Their Story", type: "text", rows: 12, readOnly: true },
    { name: "consent", title: "Accepted the disclaimer", type: "boolean", readOnly: true },
    { name: "locale", title: "Site Language", type: "string", readOnly: true },
    { name: "submittedAt", title: "Submitted", type: "datetime", readOnly: true },
    { name: "paidAt", title: "Paid", type: "datetime", readOnly: true },
    { name: "amountPaid", title: "Amount Paid (USD)", type: "number", readOnly: true },
    { name: "checkoutSessionId", title: "Stripe Checkout Session", type: "string", readOnly: true },
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
    select: { title: "name", status: "status", date: "paidAt", submitted: "submittedAt" },
    prepare: ({ title, status, date, submitted }: Record<string, string | undefined>) => ({
      title: `${status === "paid" ? "🟢 " : ""}${title ?? "Unnamed"}`,
      subtitle: [
        { pending: "Waiting for payment", paid: "Paid, to answer", answered: "Answered", refunded: "Refunded" }[status ?? ""],
        new Date(date ?? submitted ?? Date.now()).toLocaleDateString(),
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
};

export default emailSession;
