"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, passwordMatches, requireSignIn, startSession } from "@/lib/dashboard/auth";
import { INCOME_STREAMS, STATUSES, type InboxType } from "@/lib/dashboard/shared";
import { inboxClient, newInboxId } from "@/lib/inbox";

export async function signIn(_previous: { error: boolean } | null, formData: FormData) {
  const input = String(formData.get("password") ?? "");
  if (!passwordMatches(input)) {
    // A short pause makes guessing slow
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: true };
  }
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
