// Options shared by the dashboard's server code and its forms (safe in the browser)

export type InboxType = "emailSession" | "brandInquiry" | "guestApplication";

export const STATUSES: Record<InboxType, { value: string; label: string }[]> = {
  emailSession: [
    { value: "pending", label: "Waiting for payment" },
    { value: "paid", label: "To answer" },
    { value: "answered", label: "Answered" },
    { value: "refunded", label: "Refunded" },
  ],
  brandInquiry: [
    { value: "new", label: "New" },
    { value: "replied", label: "Replied" },
    { value: "inProgress", label: "In progress" },
    { value: "closed", label: "Closed" },
  ],
  guestApplication: [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "booked", label: "Booked" },
    { value: "notAFit", label: "Not a fit" },
  ],
};

/* Income streams in their fixed chart order; each keeps its colour wherever it
   appears. "manual" ones are entered by hand on the dashboard or in the Studio. */
export const INCOME_STREAMS = [
  { value: "email", label: "Paid emails", color: "#2a78d6", manual: false },
  { value: "calls", label: "Calls", color: "#eb6834", manual: false },
  { value: "coffee", label: "Buy Me a Coffee", color: "#1baf7a", manual: true },
  { value: "brandDeal", label: "Brand deals", color: "#eda100", manual: true },
  { value: "affiliate", label: "Affiliates", color: "#e87ba4", manual: true },
  { value: "payout", label: "YouTube & Spotify", color: "#008300", manual: true },
] as const;

export type IncomeStream = (typeof INCOME_STREAMS)[number]["value"];
