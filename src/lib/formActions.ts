"use server";

import { inboxClient, newInboxId, sendMail, teamAddresses, teamEmail } from "@/lib/inbox";

export type FormState =
  | { status: "success" }
  | { status: "error"; reason: "invalid" | "failed" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Bots fill every field; people never see this one
const HONEYPOT_FIELD = "company_website";

const COLLAB_TYPES: Record<string, string> = {
  sponsorship: "Podcast sponsorship",
  "brand-partnership": "Brand partnership",
  "content-collab": "Content collaboration",
  affiliate: "Affiliate partnership",
  other: "Other",
};

const BUDGETS: Record<string, string> = {
  "": "Prefer not to say",
  "under-500": "Under $500",
  "500-2000": "$500 - $2,000",
  "2000-5000": "$2,000 - $5,000",
  "5000+": "$5,000+",
};

function field(formData: FormData, name: string, max = 200) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function saveToStudio(doc: Record<string, unknown>) {
  const client = inboxClient();
  if (!client) return false;
  await client.create({ _id: newInboxId(), ...(doc as { _type: string }) });
  return true;
}

async function sendEmail(heading: string, subject: string, replyTo: string, rows: [string, string][]) {
  return sendMail({ to: teamAddresses(), replyTo, subject, ...teamEmail(heading, rows) });
}

// Saves and emails in parallel; the visitor sees success if at least one worked
async function deliver(
  doc: Record<string, unknown>,
  email: { heading: string; subject: string; replyTo: string; rows: [string, string][] }
): Promise<FormState> {
  const [saved, sent] = await Promise.allSettled([
    saveToStudio(doc),
    sendEmail(email.heading, email.subject, email.replyTo, email.rows),
  ]);

  if (saved.status === "rejected") console.error("[forms] Saving to Sanity failed:", saved.reason);
  if (sent.status === "rejected") console.error("[forms] Sending email failed:", sent.reason);

  const delivered =
    (saved.status === "fulfilled" && saved.value) || (sent.status === "fulfilled" && sent.value);
  if (!delivered) {
    console.error(
      "[forms] Submission was not delivered. Check SANITY_WRITE_TOKEN, RESEND_API_KEY and CONTACT_TO_EMAIL."
    );
    return { status: "error", reason: "failed" };
  }
  return { status: "success" };
}

export async function submitBrandInquiry(formData: FormData): Promise<FormState> {
  if (field(formData, HONEYPOT_FIELD)) return { status: "success" };

  const name = field(formData, "name", 120);
  const email = field(formData, "email");
  const type = field(formData, "type", 40);
  const website = field(formData, "website", 300);
  const budget = field(formData, "budget", 40);
  const message = field(formData, "proposal", 5000);
  const locale = field(formData, "locale", 5) || "en";

  if (!name || !EMAIL_PATTERN.test(email) || !(type in COLLAB_TYPES) || !(budget in BUDGETS) || !message) {
    return { status: "error", reason: "invalid" };
  }

  return deliver(
    {
      _type: "brandInquiry",
      status: "new",
      name,
      email,
      collaborationType: COLLAB_TYPES[type],
      website,
      budget: BUDGETS[budget],
      message,
      locale,
      submittedAt: new Date().toISOString(),
    },
    {
      heading: "New brand inquiry",
      subject: `New brand inquiry: ${name}`,
      replyTo: email,
      rows: [
        ["Name / company", name],
        ["Email", email],
        ["Type", COLLAB_TYPES[type]],
        ["Website / social", website],
        ["Budget", BUDGETS[budget]],
        ["Their idea", message],
        ["Site language", locale.toUpperCase()],
      ],
    }
  );
}

export async function submitGuestApplication(formData: FormData): Promise<FormState> {
  if (field(formData, HONEYPOT_FIELD)) return { status: "success" };

  const name = field(formData, "name", 120);
  const email = field(formData, "email");
  const social = field(formData, "social", 300);
  const expertise = field(formData, "expertise", 300);
  const message = field(formData, "message", 5000);
  const locale = field(formData, "locale", 5) || "en";

  if (!name || !EMAIL_PATTERN.test(email) || !expertise || !message) {
    return { status: "error", reason: "invalid" };
  }

  return deliver(
    {
      _type: "guestApplication",
      status: "new",
      name,
      email,
      social,
      expertise,
      message,
      locale,
      submittedAt: new Date().toISOString(),
    },
    {
      heading: "New guest application",
      subject: `New guest application: ${name}`,
      replyTo: email,
      rows: [
        ["Name", name],
        ["Email", email],
        ["Social links", social],
        ["Expertise / topic", expertise],
        ["Why they'd be a great guest", message],
        ["Site language", locale.toUpperCase()],
      ],
    }
  );
}
