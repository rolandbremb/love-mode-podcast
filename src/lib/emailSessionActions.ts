"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { inboxClient, newInboxId } from "@/lib/inbox";
import { siteUrl } from "@/lib/siteUrl";
import { EMAIL_SESSION_MAX_WORDS, EMAIL_SESSION_PRICE_CENTS, countWords } from "@/lib/emailSession";
import { getStripe } from "@/lib/stripe";

export type CheckoutState =
  | { status: "redirect"; url: string }
  | { status: "error"; reason: "invalid" | "tooLong" | "failed" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, name: string, max = 200) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Stripe sends people back to the address they paid from (localhost while testing)
async function currentOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/* "Cuéntamelo por email": saves the story privately as waiting for payment, then
   opens Stripe Checkout. The Stripe webhook marks it paid and sends the emails. */
export async function startEmailSession(formData: FormData): Promise<CheckoutState> {
  // Bots fill every field; quietly send them nowhere
  if (field(formData, "company_website")) return { status: "error", reason: "invalid" };

  const name = field(formData, "name", 120);
  const email = field(formData, "email");
  const story = field(formData, "story", 8000);
  const consent = formData.get("consent") === "on";
  const locale = field(formData, "locale", 5) === "en" ? "en" : "es";

  if (!name || !EMAIL_PATTERN.test(email) || story.length < 20 || !consent) {
    return { status: "error", reason: "invalid" };
  }
  if (countWords(story) > EMAIL_SESSION_MAX_WORDS) return { status: "error", reason: "tooLong" };

  const stripe = getStripe();
  const inbox = inboxClient();
  if (!stripe || !inbox) {
    console.error("[email session] Missing STRIPE_SECRET_KEY or SANITY_WRITE_TOKEN.");
    return { status: "error", reason: "failed" };
  }

  try {
    const t = await getTranslations({ locale, namespace: "emailSession" });
    const origin = await currentOrigin();
    const inboxId = newInboxId();

    await inbox.create({
      _id: inboxId,
      _type: "emailSession",
      status: "pending",
      name,
      email,
      story,
      locale,
      consent,
      submittedAt: new Date().toISOString(),
    });

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      locale: locale === "es" ? "es-419" : "en",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: EMAIL_SESSION_PRICE_CENTS,
            product_data: { name: t("productName") },
          },
        },
      ],
      metadata: { inboxId, locale },
      payment_intent_data: { metadata: { inboxId } },
      success_url: `${origin}/${locale}/cuentamelo/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/cuentamelo?cancelado=1`,
    });

    await inbox.patch(inboxId).set({ checkoutSessionId: checkout.id }).commit();
    if (!checkout.url) throw new Error("Stripe returned no checkout URL");
    return { status: "redirect", url: checkout.url };
  } catch (error) {
    console.error("[email session] Starting checkout failed:", error);
    return { status: "error", reason: "failed" };
  }
}
