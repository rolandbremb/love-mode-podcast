"use server";

import type { FormState } from "@/lib/formActions";

// Kit (kit.com): the "Web Love Mode" form collects every website signup and sends
// the confirmation email; tags record which emails each person asked for.
const KIT_FORM_ID = "10167084";
// The checkboxes send these values (see NewsletterForm)
const NEWSLETTER_INTERESTS = {
  news: 25642835, // Episodios y novedades
  community: 25642836, // Encuentros y comunidad
  divorce: 25642837, // Volver al ruedo
} as const;

// Which signup form someone used ("source"), recorded as a tag
const SOURCE_TAGS: Record<string, number> = {
  popup: 25644053, // Fuente: pop-up
  lista: 25644054, // Fuente: Esto apenas empieza
};
const WHATSAPP_CONSENT_TAG = 25644055; // WhatsApp: acepta mensajes

const PHONE_PATTERN = /^\+?[0-9][0-9\s().-]{6,19}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, name: string, max = 200) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function kit(path: string, body: Record<string, unknown>, apiKey: string) {
  return fetch(`https://api.kit.com/v4/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Kit-Api-Key": apiKey },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

/* With an API key: create the subscriber as unconfirmed, add them to the form
   (Kit then emails them to confirm) and tag their interests. */
async function subscribeWithApi(
  email: string,
  firstName: string,
  tags: number[],
  referrer: string,
  apiKey: string,
  whatsapp?: string
) {
  const created = await kit(
    "subscribers",
    {
      email_address: email,
      first_name: firstName || undefined,
      state: "inactive",
      fields: whatsapp ? { whatsapp } : undefined,
    },
    apiKey
  );
  if (!created.ok) return created.status;

  const added = await kit(`forms/${KIT_FORM_ID}/subscribers`, { email_address: email, referrer }, apiKey);
  if (!added.ok) return added.status;

  // A missing tag shouldn't undo the signup, so tag failures are only logged
  await Promise.all(
    tags.map(async (tagId) => {
      const tagged = await kit(`tags/${tagId}/subscribers`, { email_address: email }, apiKey);
      if (!tagged.ok) console.error(`Kit: tagging ${tagId} failed with ${tagged.status}`);
    })
  );
  return 200;
}

/* Without a working API key: Kit's public form endpoint, the same one an embedded
   Kit form posts to. The signup and confirmation email still work; tags don't. */
async function subscribeWithForm(email: string, firstName: string) {
  const res = await fetch(`https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({ email_address: email, first_name: firstName }),
    cache: "no-store",
  });
  return res.ok;
}

export async function subscribeToNewsletter(formData: FormData): Promise<FormState> {
  // Bots fill every field; people never see this one
  if (field(formData, "company_website")) return { status: "success" };

  const email = field(formData, "email", 254).toLowerCase();
  const firstName = field(formData, "name", 80);
  if (!EMAIL_PATTERN.test(email)) return { status: "error", reason: "invalid" };

  // WhatsApp is optional, but a number only counts with the consent box ticked
  const phone = field(formData, "whatsapp", 40);
  const whatsappConsent = formData.get("whatsapp_consent") === "yes";
  if (phone && (!PHONE_PATTERN.test(phone) || !whatsappConsent)) return { status: "error", reason: "invalid" };
  const whatsapp = phone && whatsappConsent ? phone : undefined;

  const interests = formData
    .getAll("interests")
    .map((value) => NEWSLETTER_INTERESTS[value as keyof typeof NEWSLETTER_INTERESTS])
    .filter(Boolean);
  const sourceTag = SOURCE_TAGS[field(formData, "source", 20)];
  const tags = [...interests, ...(sourceTag ? [sourceTag] : []), ...(whatsapp ? [WHATSAPP_CONSENT_TAG] : [])];
  const referrer = field(formData, "page", 300) || "https://lovemodepod.com";

  try {
    const apiKey = process.env.KIT_API_KEY;
    if (apiKey) {
      const status = await subscribeWithApi(email, firstName, tags, referrer, apiKey, whatsapp);
      if (status === 200) return { status: "success" };
      console.error(`Kit API signup failed with ${status}; trying the public form`);
    }
    return (await subscribeWithForm(email, firstName)) ? { status: "success" } : { status: "error", reason: "failed" };
  } catch (error) {
    console.error("Kit signup failed", error);
    return { status: "error", reason: "failed" };
  }
}
