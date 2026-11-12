import Link from "next/link";
import DashboardNav, { PageHeader } from "@/components/dashboard/DashboardNav";
import { Card, SourceNote, pressable } from "@/components/dashboard/ui";
import { ImportButton, StageSelect } from "@/components/planner/client";
import { fieldClass } from "@/components/planner/fields";
import { ContactForm } from "@/components/planner/forms";
import { requireSignIn } from "@/lib/dashboard/auth";
import { loadPlanner, loadUnsavedSubmissions } from "@/lib/planner/data";
import { CONTACT_KINDS, CONTACT_STAGES, labelFor, slugFromId } from "@/lib/planner/shared";
import { dayKey, formatDay } from "@/lib/dashboard/summary";

export const dynamic = "force-dynamic";

// Lowercase and without accents, so "Andrés" is found by "andres"
const plain = (text = "") => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; kind?: string; stage?: string }> }) {
  await requireSignIn();
  const params = await searchParams;
  const [{ status, data, sample }, unsaved] = await Promise.all([loadPlanner(), loadUnsavedSubmissions()]);
  const q = plain(params.q?.trim());
  const kind = CONTACT_KINDS.some((k) => k.value === params.kind) ? params.kind : "";
  const stage = CONTACT_STAGES.some((s) => s.value === params.stage) ? params.stage : "";
  const today = dayKey(new Date());

  const contacts = data.contacts.filter(
    (c) =>
      (!kind || c.kind === kind) &&
      (!stage || c.stage === stage) &&
      (!q || plain([c.name, c.company, c.email, c.social, c.notes, ...(c.tags ?? [])].join(" ")).includes(q))
  );
  const episodesOf = (id: string) => data.episodes.filter((e) => e.guestIds.includes(id));
  const filtered = Boolean(q || kind || stage);

  return (
    <>
      <DashboardNav current="/dashboard/contacts" />
      <main className="mx-auto flex max-w-[78rem] flex-col gap-8 px-4 pb-24 pt-8 sm:px-8">
        <PageHeader eyebrow="Guests, brands, experts and press" title="Contacts">
          <span className="flex flex-wrap items-center gap-3">
            <SourceNote status={status} envName="SANITY_WRITE_TOKEN" sample={sample} />
            <ImportButton waiting={unsaved} disabled={status !== "ok"} />
          </span>
        </PageHeader>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Card className="flex flex-col gap-4 !p-4 sm:!p-6">
            {/* Filters are a plain GET form, so a filtered list can be bookmarked */}
            <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]" role="search">
              <input name="q" defaultValue={params.q} placeholder="Search name, tag, notes…" aria-label="Search contacts" className={fieldClass} />
              <select name="kind" defaultValue={kind} aria-label="Type" className={fieldClass}>
                <option value="">All types</option>
                {CONTACT_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
              <select name="stage" defaultValue={stage} aria-label="Stage" className={fieldClass}>
                <option value="">All stages</option>
                {CONTACT_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button type="submit" className={`min-h-10 rounded-full bg-plum px-4 text-sm font-semibold text-shell hover:bg-mauve ${pressable}`}>
                Filter
              </button>
            </form>
            <p className="flex flex-wrap items-center gap-3 text-sm text-mauve">
              {contacts.length} of {data.contacts.length} contacts
              {filtered && (
                <Link href="/dashboard/contacts" className="font-semibold text-plum underline underline-offset-4">
                  Clear filters
                </Link>
              )}
            </p>
            <ul className="flex flex-col divide-y divide-plum/10">
              {contacts.map((c) => {
                const episodes = episodesOf(c._id);
                return (
                  <li key={c._id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Link href={`/dashboard/contacts/${slugFromId(c._id)}`} className="truncate font-semibold underline decoration-plum/20 underline-offset-4 hover:decoration-plum">
                        {c.name}
                      </Link>
                      <span className="truncate text-sm text-mauve">
                        {[labelFor(CONTACT_KINDS, c.kind), c.company, c.social, c.email].filter(Boolean).join(", ")}
                      </span>
                      {(episodes.length > 0 || c.followUp || (c.tags?.length ?? 0) > 0) && (
                        <span className="flex flex-wrap items-center gap-1.5 text-xs">
                          {c.followUp && (
                            <span className={`rounded-full px-2 py-0.5 font-semibold ${c.followUp <= today ? "bg-tangerine" : "bg-shell"}`}>
                              Follow up {c.followUp < today ? "(overdue)" : c.followUp === today ? "today" : formatDay(`${c.followUp}T12:00:00Z`)}
                            </span>
                          )}
                          {episodes.map((e) => (
                            <span key={e._id} className="rounded-full bg-bubblegum/70 px-2 py-0.5 font-semibold">
                              Ep. {e.number ?? "?"}
                            </span>
                          ))}
                          {c.tags?.map((tag) => (
                            <Link key={tag} href={`/dashboard/contacts?q=${encodeURIComponent(tag)}`} className="relative rounded-full bg-shell px-2 py-0.5 text-plum/80 before:absolute before:-inset-x-1 before:-inset-y-2.5 before:content-[''] hover:bg-peach">
                              #{tag}
                            </Link>
                          ))}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold hover:bg-shell">
                          Email
                        </a>
                      )}
                      <StageSelect type="contact" id={c._id} stage={c.stage} label={`Stage for ${c.name}`} disabled={sample} />
                    </div>
                  </li>
                );
              })}
              {contacts.length === 0 && (
                <li className="py-6 text-pretty text-mauve">
                  {filtered ? "No one matches those filters." : "No contacts yet. Add one, or save the people who wrote in through the website forms."}
                </li>
              )}
            </ul>
          </Card>

          <Card className="flex flex-col gap-4 lg:sticky lg:top-20">
            <p className="font-display text-2xl">Add a contact</p>
            <ContactForm disabled={status !== "ok"} compact returnTo="/dashboard/contacts" />
          </Card>
        </div>
      </main>
    </>
  );
}
