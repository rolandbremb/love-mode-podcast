import type Stripe from "stripe";
import { getTranslations } from "next-intl/server";
import { escapeHtml, inboxClient, sendMail, teamAddresses, teamEmail } from "@/lib/inbox";
import { getStripe } from "@/lib/stripe";

/* Stripe calls this after a payment. For "Cuéntamelo por email" it marks the saved
   story as paid, sends it to the team and confirms to the person who wrote it.
   Stripe retries until it gets a 200, so this must be safe to run twice. */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    console.error("[stripe webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.");
    return new Response("Not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch (error) {
    console.error("[stripe webhook] Signature check failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.metadata?.inboxId) {
      try {
        await markEmailSessionPaid(session);
      } catch (error) {
        console.error("[stripe webhook] Handling the payment failed:", error);
        // A 500 makes Stripe try again later
        return new Response("Failed", { status: 500 });
      }
    }
  }

  return new Response("ok");
}

type EmailSessionDoc = {
  _rev: string;
  status: string;
  name: string;
  email: string;
  story: string;
  locale: "es" | "en";
};

async function markEmailSessionPaid(session: Stripe.Checkout.Session) {
  const inbox = inboxClient();
  if (!inbox) throw new Error("SANITY_WRITE_TOKEN is not set");

  const id = session.metadata!.inboxId;
  const doc = await inbox.getDocument<EmailSessionDoc>(id);
  if (!doc) throw new Error(`No saved story for ${id}`);
  if (doc.status !== "pending") return; // already handled on an earlier try

  // Only the first delivery wins the revision check, so the emails go out once
  try {
    await inbox
      .patch(id)
      .ifRevisionId(doc._rev)
      .set({ status: "paid", paidAt: new Date().toISOString(), amountPaid: (session.amount_total ?? 0) / 100 })
      .commit();
  } catch {
    return;
  }

  const paid = `US$${((session.amount_total ?? 0) / 100).toFixed(2)}`;
  const t = await getTranslations({ locale: doc.locale, namespace: "emailSession" });
  const body = t("confirmBody", { name: doc.name });

  // Once marked paid a retry won't come back here, so send both and log failures
  // (the story is always in the Studio inbox either way)
  const results = await Promise.allSettled([
    sendMail({
      to: teamAddresses(),
      replyTo: doc.email,
      subject: `Paid email from ${doc.name} (${paid})`,
      ...teamEmail(`New paid email (${paid})`, [
        ["Name", doc.name],
        ["Email", doc.email],
        ["Their story", doc.story],
        ["Site language", doc.locale.toUpperCase()],
        ["Reply by", replyBy(3)],
      ]),
    }),
    sendMail({
      to: [doc.email],
      replyTo: teamAddresses()[0],
      subject: t("confirmSubject"),
      text: body,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#2d1530;max-width:560px;font-size:16px;line-height:1.6;white-space:pre-wrap">${escapeHtml(body)}</div>`,
    }),
  ]);
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[stripe webhook] Sending the ${i === 0 ? "team" : "confirmation"} email failed:`, result.reason);
    }
  });
}

// The date three business days from now, so the team sees the deadline at a glance
function replyBy(businessDays: number) {
  const date = new Date();
  let left = businessDays;
  while (left > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) left--;
  }
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" });
}
