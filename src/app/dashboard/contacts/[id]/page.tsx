import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardNav, { PageHeader } from "@/components/dashboard/DashboardNav";
import { BackChevron, Card, SourceNote, TextLink } from "@/components/dashboard/ui";
import { DeleteButton } from "@/components/planner/client";
import { ContactForm } from "@/components/planner/forms";
import { requireSignIn } from "@/lib/dashboard/auth";
import { loadPlanner } from "@/lib/planner/data";
import { CONTACT_KINDS, EPISODE_STAGES, idFromSlug, labelFor, slugFromId } from "@/lib/planner/shared";

export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSignIn();
  const id = idFromSlug((await params).id);
  const { status, data, sample } = await loadPlanner();
  const contact = id && data.contacts.find((c) => c._id === id);
  if (!contact) notFound();
  const episodes = data.episodes.filter((e) => e.guestIds.includes(contact._id));
  const website = contact.website && (contact.website.startsWith("http") ? contact.website : `https://${contact.website}`);
  const handle = contact.social?.match(/^@?([\w.]+)$/)?.[1];

  return (
    <>
      <DashboardNav current="/dashboard/contacts" />
      <main className="mx-auto flex max-w-[78rem] flex-col gap-8 px-4 pb-24 pt-8 sm:px-8">
        <Link href="/dashboard/contacts" className="-ml-1 inline-flex min-h-10 w-fit items-center gap-1 rounded-full pl-1 pr-3 text-sm font-semibold text-mauve transition-colors hover:text-plum">
          <BackChevron />
          All contacts
        </Link>
        <PageHeader eyebrow={[labelFor(CONTACT_KINDS, contact.kind), contact.company].filter(Boolean).join(", ")} title={contact.name}>
          <SourceNote status={status} envName="SANITY_WRITE_TOKEN" sample={sample} />
        </PageHeader>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Card>
            <ContactForm contact={contact} disabled={status !== "ok"} />
          </Card>
          <div className="flex flex-col gap-5">
            <Card className="flex flex-col gap-1">
              <p className="mb-1 font-display text-2xl">Reach them</p>
              {contact.email && <TextLink href={`mailto:${contact.email}`}>{contact.email}</TextLink>}
              {contact.phone && (
                <TextLink href={`https://wa.me/${contact.phone.replace(/[^\d]/g, "")}`} external>
                  WhatsApp {contact.phone}
                </TextLink>
              )}
              {handle && (
                <TextLink href={`https://instagram.com/${handle}`} external>
                  Instagram @{handle}
                </TextLink>
              )}
              {website && (
                <TextLink href={website} external>
                  {contact.website}
                </TextLink>
              )}
              {!contact.email && !contact.phone && !handle && !website && <p className="text-mauve">No contact details yet.</p>}
            </Card>
            <Card className="flex flex-col gap-2">
              <p className="font-display text-2xl">Episodes</p>
              <ul className="flex flex-col divide-y divide-plum/10">
                {episodes.map((e) => (
                  <li key={e._id} className="flex items-center justify-between gap-3 py-2">
                    <Link href={`/dashboard/episodes/${slugFromId(e._id)}`} className="font-semibold underline decoration-plum/20 underline-offset-4 hover:decoration-plum">
                      {e.number ? `${e.number}. ` : ""}
                      {e.title}
                    </Link>
                    <span className="shrink-0 text-sm text-mauve">{labelFor(EPISODE_STAGES, e.stage)}</span>
                  </li>
                ))}
                {episodes.length === 0 && <li className="py-2 text-mauve">Not on an episode yet. Add them from an episode&apos;s page.</li>}
              </ul>
            </Card>
            <div>
              <DeleteButton type="contact" id={contact._id} what={contact.name} returnTo="/dashboard/contacts" disabled={status !== "ok"} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
