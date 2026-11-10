import Stripe from "stripe";

// True once STRIPE_SECRET_KEY is set, which is what makes the paid email work
export function paidEmailReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}
