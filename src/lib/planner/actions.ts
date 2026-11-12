"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSignIn } from "@/lib/dashboard/auth";
import { inboxClient } from "@/lib/inbox";
import {
  CONTACT_KINDS,
  CONTACT_STAGES,
  DEFAULT_CHECKLIST,
  EPISODE_STAGES,
  PLANNER_PREFIX,
  PLATFORMS,
  POST_FORMATS,
  POST_STAGES,
  STAGES,
  slugFromId,
  type Option,
  type PlannerType,
} from "@/lib/planner/shared";

/* Saving the planner from the dashboard. Every action checks the sign-in first, and
   only ever touches "planner." documents of the type it expects. */

export type FormState = { ok: boolean; error?: string } | null;

const NOT_CONNECTED = "The Studio isn't connected (SANITY_WRITE_TOKEN), so nothing can be saved yet.";

function key() {
  return crypto.randomUUID().slice(0, 12);
}

function text(formData: FormData, name: string, max = 200) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

function choice(formData: FormData, name: string, options: Option[], fallback: string) {
  const value = text(formData, name);
  return options.some((option) => option.value === value) ? value : fallback;
}

function date(formData: FormData, name: string) {
  const value = text(formData, name);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function time(formData: FormData, name: string) {
  const value = text(formData, name);
  return /^\d{2}:\d{2}$/.test(value) ? value : "";
}

function plannerId(value: unknown) {
  const id = String(value ?? "");
  return id.startsWith(PLANNER_PREFIX) && id.length < 80 ? id : "";
}

// Where to go after saving: only pages inside the dashboard
function returnPath(formData: FormData, fallback: string) {
  const path = text(formData, "returnTo", 300);
  return path.startsWith("/dashboard") && !path.startsWith("//") ? path : fallback;
}

function refreshAll() {
  revalidatePath("/dashboard", "layout");
}

/* Creates the document, or updates it if the form carried an id. Empty fields are
   removed rather than saved as empty text. */
async function save(type: PlannerType, formData: FormData, fields: Record<string, unknown>, onCreate: Record<string, unknown> = {}) {
  const client = inboxClient();
  if (!client) return { error: NOT_CONNECTED };

  const filled = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== "" && value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)));
  const empty = Object.keys(fields).filter((name) => !(name in filled));
  const existing = plannerId(formData.get("id"));

  if (existing) {
    const doc = await client.getDocument<{ _type: string }>(existing);
    if (doc?._type !== type) return { error: "That item no longer exists. It may have been deleted." };
    await client.patch(existing).set(filled).unset(empty).commit();
    return { id: existing };
  }
  const id = `${PLANNER_PREFIX}${crypto.randomUUID()}`;
  await client.create({ _id: id, _type: type, ...onCreate, ...filled });
  return { id };
}

async function guarded(run: () => Promise<{ error?: string; id?: string }>, after: (id: string) => string): Promise<FormState> {
  await requireSignIn();
  let result: { error?: string; id?: string };
  try {
    result = await run();
  } catch (error) {
    console.error("[planner] save:", error);
    return { ok: false, error: "Couldn't save just now. Try again in a moment." };
  }
  if (result.error || !result.id) return { ok: false, error: result.error ?? "Couldn't save." };
  refreshAll();
  redirect(after(result.id));
}

// ---------- Contacts ----------

export async function saveContact(_previous: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name", 120);
  if (!name) return { ok: false, error: "Add a name." };
  const tags = text(formData, "tags", 300)
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
  return guarded(
    () =>
      save("contact", formData, {
        name,
        kind: choice(formData, "kind", CONTACT_KINDS, "other"),
        stage: choice(formData, "stage", CONTACT_STAGES, "idea"),
        company: text(formData, "company", 120),
        email: text(formData, "email", 200),
        phone: text(formData, "phone", 60),
        social: text(formData, "social", 200),
        website: text(formData, "website", 300),
        tags,
        notes: text(formData, "notes", 5000),
        lastContacted: date(formData, "lastContacted"),
        followUp: date(formData, "followUp"),
      }),
    () => returnPath(formData, "/dashboard/contacts")
  );
}

/* Saves each guest application and brand inquiry from the website as a contact,
   once: a submission that already has a contact is skipped. */
export async function importFromInbox(): Promise<{ ok: boolean; added: number; error?: string }> {
  await requireSignIn();
  const client = inboxClient();
  if (!client) return { ok: false, added: 0, error: NOT_CONNECTED };
  type Submission = { _id: string; _type: string; name?: string; email?: string; phone?: string; social?: string; website?: string; expertise?: string; collaborationType?: string; message?: string; submittedAt?: string };
  const submissions = await client.fetch<Submission[]>(
    `*[_type in ["guestApplication", "brandInquiry"] && !(_id in *[_type == "contact"].sourceId)]{
      _id, _type, name, email, phone, social, website, expertise, collaborationType, message, submittedAt
    }`
  );
  if (submissions.length === 0) return { ok: true, added: 0 };

  const transaction = client.transaction();
  for (const s of submissions) {
    const guest = s._type === "guestApplication";
    const fields = {
      name: (s.name || s.email || "No name").slice(0, 120),
      kind: guest ? "guest" : "brand",
      stage: "idea",
      email: s.email,
      phone: s.phone,
      social: s.social,
      website: s.website,
      tags: [guest ? s.expertise : s.collaborationType].filter(Boolean).map((tag) => String(tag).toLowerCase().slice(0, 40)),
      notes: [`From the website's ${guest ? "guest application" : "brand inquiry"} form${s.submittedAt ? ` (${s.submittedAt.slice(0, 10)})` : ""}:`, s.message]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 5000),
      sourceId: s._id,
    };
    const filled = Object.fromEntries(Object.entries(fields).filter(([, v]) => v && !(Array.isArray(v) && v.length === 0)));
    transaction.create({ _id: `${PLANNER_PREFIX}${crypto.randomUUID()}`, _type: "contact", ...filled });
  }
  await transaction.commit();
  refreshAll();
  return { ok: true, added: submissions.length };
}

// ---------- Episodes ----------

export async function saveEpisode(_previous: FormState, formData: FormData): Promise<FormState> {
  const title = text(formData, "title", 200);
  if (!title) return { ok: false, error: "Add a working title." };
  const numberText = text(formData, "number", 6);
  const number = numberText ? Number(numberText) : "";
  if (number !== "" && !(Number.isInteger(number) && number > 0)) return { ok: false, error: "The episode number should be a whole number." };
  const guests = formData
    .getAll("guests")
    .map(plannerId)
    .filter(Boolean)
    .slice(0, 10)
    .map((ref) => ({ _key: key(), _type: "reference", _ref: ref, _weak: true }));

  return guarded(
    () =>
      save(
        "plannerEpisode",
        formData,
        {
          title,
          number,
          stage: choice(formData, "stage", EPISODE_STAGES, "idea"),
          guests,
          recordDate: date(formData, "recordDate"),
          recordTime: time(formData, "recordTime"),
          publishDate: date(formData, "publishDate"),
          summary: text(formData, "summary", 2000),
          questions: text(formData, "questions", 10000),
          notes: text(formData, "notes", 5000),
          link: text(formData, "link", 300),
        },
        { checklist: DEFAULT_CHECKLIST.map((label) => ({ _key: key(), label, done: false })) }
      ),
    (id) => returnPath(formData, `/dashboard/episodes/${slugFromId(id)}`)
  );
}

type ChecklistChange = { op: "toggle"; key: string; done: boolean } | { op: "add"; label: string } | { op: "remove"; key: string };

export async function changeChecklist(episodeId: string, change: ChecklistChange) {
  await requireSignIn();
  const client = inboxClient();
  const id = plannerId(episodeId);
  if (!client || !id) return { ok: false };
  try {
    const doc = await client.getDocument<{ _type: string }>(id);
    if (doc?._type !== "plannerEpisode") return { ok: false };
    const safeKey = (k: string) => k.replace(/[^\w-]/g, "");
    if (change.op === "toggle") {
      await client.patch(id).set({ [`checklist[_key=="${safeKey(change.key)}"].done`]: Boolean(change.done) }).commit();
    } else if (change.op === "remove") {
      await client.patch(id).unset([`checklist[_key=="${safeKey(change.key)}"]`]).commit();
    } else {
      const label = change.label.trim().slice(0, 120);
      if (!label) return { ok: false };
      await client.patch(id).setIfMissing({ checklist: [] }).append("checklist", [{ _key: key(), label, done: false }]).commit();
    }
  } catch (error) {
    console.error("[planner] checklist:", error);
    return { ok: false };
  }
  refreshAll();
  return { ok: true };
}

// ---------- Social posts ----------

export async function savePost(_previous: FormState, formData: FormData): Promise<FormState> {
  const title = text(formData, "title", 200);
  if (!title) return { ok: false, error: "Add a working title or hook." };
  const platforms = formData
    .getAll("platforms")
    .map(String)
    .filter((value) => PLATFORMS.some((p) => p.value === value));
  const episode = plannerId(formData.get("episode"));
  return guarded(
    () =>
      save("contentPost", formData, {
        title,
        platforms: [...new Set(platforms)],
        format: choice(formData, "format", POST_FORMATS, ""),
        stage: choice(formData, "stage", POST_STAGES, "idea"),
        date: date(formData, "date"),
        time: time(formData, "time"),
        caption: text(formData, "caption", 5000),
        notes: text(formData, "notes", 3000),
        link: text(formData, "link", 300),
        episode: episode ? { _type: "reference", _ref: episode, _weak: true } : "",
      }),
    () => returnPath(formData, "/dashboard/content")
  );
}

// ---------- Shared ----------

// The stage dropdowns on the planner lists save as soon as they change
export async function setStage(type: PlannerType, id: string, stage: string) {
  await requireSignIn();
  const client = inboxClient();
  if (!client || !plannerId(id) || !STAGES[type]?.some((option) => option.value === stage)) return { ok: false };
  try {
    const doc = await client.getDocument<{ _type: string }>(id);
    if (doc?._type !== type) return { ok: false };
    await client.patch(id).set({ stage }).commit();
  } catch (error) {
    console.error("[planner] stage:", error);
    return { ok: false };
  }
  refreshAll();
  return { ok: true };
}

export async function deleteItem(type: PlannerType, id: string, returnTo: string) {
  await requireSignIn();
  const client = inboxClient();
  if (!client || !plannerId(id)) return { ok: false };
  try {
    const doc = await client.getDocument<{ _type: string }>(id);
    if (doc?._type !== type) return { ok: false };
    await client.delete(id);
  } catch (error) {
    console.error("[planner] delete:", error);
    return { ok: false };
  }
  refreshAll();
  redirect(returnTo.startsWith("/dashboard") && !returnTo.startsWith("//") ? returnTo : "/dashboard");
}
