// Income paid outside Stripe: added from the dashboard, which saves it under a
// private id (revenue shouldn't be readable from the public dataset)
const STREAM_TITLES: Record<string, string> = {
  coffee: "Buy Me a Coffee",
  brandDeal: "Brand deal",
  affiliate: "Affiliate",
  payout: "YouTube & Spotify payout",
};

const incomeEntry = {
  name: "incomeEntry",
  title: "Income Entry",
  type: "document" as const,
  fields: [
    {
      name: "stream",
      title: "Income stream",
      type: "string",
      options: { list: Object.entries(STREAM_TITLES).map(([value, title]) => ({ title, value })) },
    },
    { name: "amount", title: "Amount (USD)", type: "number" },
    { name: "date", title: "Date received", type: "date" },
    { name: "note", title: "Note", type: "string", description: "E.g. Per'la, October commission" },
  ],
  orderings: [{ title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { stream: "stream", amount: "amount", date: "date", note: "note" },
    prepare: ({ stream, amount, date, note }: Record<string, string | number | undefined>) => ({
      title: `US$${Number(amount ?? 0).toFixed(2)}, ${STREAM_TITLES[String(stream)] ?? stream}`,
      subtitle: [date, note].filter(Boolean).join(" · "),
    }),
  },
};

export default incomeEntry;
