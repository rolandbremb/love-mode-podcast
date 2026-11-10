"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endSession, passwordMatches, requireSignIn, startSession } from "@/lib/dashboard/auth";
import { INCOME_STREAMS, STATUSES, type InboxType } from "@/lib/dashboard/shared";
import { inboxClient, newInboxId } from "@/lib/inbox";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type LoginState = { error: "wrong" | "locked" } | null;

// Failed logins are counted per visitor (a hash of their IP, never the IP itself),
// privately in the Studio, so guessing stops after a few tries from one place
async function attemptsRecord() {
  const client = inboxClient();
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = createHash("sha256").update(`love-mode-login:${ip}`).digest("hex").slice(0, 24);
  return { client, id: `inbox.dashboard-login-${key}` };
}

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const { client, id } = await attemptsRecord();
  const record = client ? await client.getDocument<{ count: number; firstAt: number }>(id) : null;
  const windowOpen = record && Date.now() - record.firstAt < LOCKOUT_MS;
  if (windowOpen && record.count >= MAX_FAILED_ATTEMPTS) return { error: "locked" };

  const input = String(formData.get("password") ?? "");
  if (!passwordMatches(input)) {
    // A short pause on top makes guessing slow
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (client) {
      // Start a fresh window if the last one ran out, then count atomically, so guesses
      // sent at the same time can't slip past the limit
      const fresh = { _id: id, _type: "dashboardLoginAttempts", count: 0, firstAt: Date.now() };
      if (record && !windowOpen) await client.createOrReplace(fresh);
      else await client.createIfNotExists(fresh);
      const updated = await client.patch(id).inc({ count: 1 }).commit<{ count: number }>();
      if (updated.count >= MAX_FAILED_ATTEMPTS) return { error: "locked" };
    }
    return { error: "wrong" };
  }
  if (record && client) await client.delete(id);
  await startSession();
  redirect("/dashboard");
}

export async function signOut() {
  await endSession();
  redirect("/dashboard/login");
}

// Changes the status of a paid email, brand inquiry or guest application
export async function updateStatus(type: InboxType, id: string, status: string) {
  await requireSignIn();
  if (!STATUSES[type]?.some((option) => option.value === status) || !id.startsWith("inbox.")) {
    return { ok: false };
  }
  const client = inboxClient();
  if (!client) return { ok: false };
  const doc = await client.getDocument<{ _type: string }>(id);
  if (doc?._type !== type) return { ok: false };
  await client.patch(id).set({ status }).commit();
  revalidatePath("/dashboard");
  return { ok: true };
}

// Income paid outside Stripe and Buy Me a Coffee: brand deals, affiliates, payouts
export async function addIncome(_previous: { ok: boolean; error?: string } | null, formData: FormData) {
  await requireSignIn();
  const stream = String(formData.get("stream") ?? "");
  const amount = Number(String(formData.get("amount") ?? "").replace(",", "."));
  const date = String(formData.get("date") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 200);

  if (!INCOME_STREAMS.some((option) => option.value === stream && option.manual) || !(amount > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: "Pick a stream, a date and an amount above zero." };
  }
  const client = inboxClient();
  if (!client) return { ok: false, error: "The Studio isn't connected (SANITY_WRITE_TOKEN)." };

  // Saved under a private id: the dataset is public, but income isn't
  await client.create({ _id: newInboxId(), _type: "incomeEntry", stream, amount, date, note });
  revalidatePath("/dashboard");
  return { ok: true };
}
