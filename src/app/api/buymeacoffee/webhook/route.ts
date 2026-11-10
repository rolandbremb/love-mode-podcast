import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { inboxClient } from "@/lib/inbox";

/* Buy Me a Coffee calls this for each payment (it replaced its old API with webhooks).
   Each coffee, shop purchase, commission or wishlist payment becomes a private income
   entry for the dashboard's revenue; a refund sets that entry to zero.
   Set up in Buy Me a Coffee → Integrations → New webhook; the signing secret goes in
   BMC_WEBHOOK_SECRET. */

// Payments that count as income, and the refunds that undo them
const PAYMENTS: Record<string, string> = {
  "donation.created": "donation",
  "extra_purchase.created": "extra",
  "commission_order.created": "commission",
  "wishlist_payment.created": "wishlist",
};
const REFUNDS: Record<string, string> = {
  "donation.refunded": "donation",
  "extra_purchase.refunded": "extra",
  "commission_order.refunded": "commission",
  "wishlist_payment.refunded": "wishlist",
};
const KIND_LABEL: Record<string, string> = {
  donation: "coffee",
  extra: "shop purchase",
  commission: "commission",
  wishlist: "wishlist",
};

type BmcEvent = {
  type: string;
  live_mode: boolean;
  data?: {
    id?: number;
    amount?: number;
    currency?: string;
    coffee_count?: number;
    supporter_name?: string;
    created_at?: number;
  };
};

// HMAC-SHA256 of the raw body with the signing secret, as a hex digest
function validSignature(body: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  const given = Buffer.from(signature, "utf8");
  const wanted = Buffer.from(expected, "utf8");
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

// "2026-11-10" for a payment, on Miami's calendar like the rest of the dashboard
function miamiDate(unixSeconds?: number) {
  const date = unixSeconds ? new Date(unixSeconds * 1000) : new Date();
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(date);
}

export async function POST(request: Request) {
  const secret = process.env.BMC_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[buymeacoffee] BMC_WEBHOOK_SECRET is not set.");
    return new Response("Not configured", { status: 500 });
  }

  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-signature-sha256") ?? "", secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: BmcEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // "Send test event" in Buy Me a Coffee: say it arrived, but don't count it as income
  if (!event.live_mode) return Response.json({ ok: true, test: true });

  const kind = PAYMENTS[event.type] ?? REFUNDS[event.type];
  const paymentId = event.data?.id;
  // Memberships, monthly support and anything else aren't counted yet
  if (!kind || !paymentId) return Response.json({ ok: true, ignored: event.type });

  const client = inboxClient();
  if (!client) return new Response("Studio not configured", { status: 500 });

  // One entry per payment, so a retried delivery can't count twice. The "inbox." prefix
  // keeps it private in the public dataset.
  const id = `inbox.bmc-${kind}-${paymentId}`;
  try {
    if (PAYMENTS[event.type]) {
      const data = event.data!;
      const who = data.supporter_name?.trim() || "Someone";
      const what = kind === "donation" && data.coffee_count ? `${data.coffee_count} coffee${data.coffee_count === 1 ? "" : "s"}` : KIND_LABEL[kind];
      await client.createIfNotExists({
        _id: id,
        _type: "incomeEntry",
        stream: "coffee",
        amount: Number(data.amount ?? 0),
        date: miamiDate(data.created_at),
        note: `${who}, ${what}${data.currency && data.currency !== "USD" ? ` (${data.currency})` : ""} via Buy Me a Coffee`,
      });
    } else {
      const existing = await client.getDocument<{ note?: string }>(id);
      if (existing && !existing.note?.endsWith("(refunded)")) {
        await client.patch(id).set({ amount: 0, note: `${existing.note ?? ""} (refunded)`.trim() }).commit();
      }
    }
    revalidatePath("/dashboard");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[buymeacoffee] Saving the payment failed:", error);
    // A 500 makes Buy Me a Coffee retry later
    return new Response("Failed", { status: 500 });
  }
}
