import { ActionForm } from "@/components/planner/client";
import { CheckboxGroup, SelectField, TextArea, TextField } from "@/components/planner/fields";
import { saveContact, saveEpisode, savePost } from "@/lib/planner/actions";
import {
  CONTACT_KINDS,
  CONTACT_STAGES,
  EPISODE_STAGES,
  PLATFORMS,
  POST_FORMATS,
  POST_STAGES,
  type Contact,
  type Episode,
  type Post,
} from "@/lib/planner/shared";

/* One form per kind of item, used both to add a new one and to edit it. */

function Hidden({ id, returnTo }: { id?: string; returnTo?: string }) {
  return (
    <>
      {id && <input type="hidden" name="id" value={id} />}
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
    </>
  );
}

export function ContactForm({ contact, returnTo, disabled, compact = false }: { contact?: Contact; returnTo?: string; disabled?: boolean; compact?: boolean }) {
  return (
    <ActionForm action={saveContact} submitLabel={contact ? "Save changes" : "Add contact"} disabled={disabled}>
      <Hidden id={contact?._id} returnTo={returnTo} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Name" name="name" value={contact?.name} required maxLength={120} className="sm:col-span-2" />
        <SelectField label="Type" name="kind" value={contact?.kind ?? "guest"} options={CONTACT_KINDS} />
        <SelectField label="Stage" name="stage" value={contact?.stage ?? "idea"} options={CONTACT_STAGES} />
        <TextField label="Email" name="email" type="email" value={contact?.email} maxLength={200} />
        <TextField label="Phone / WhatsApp" name="phone" type="tel" value={contact?.phone} maxLength={60} />
        <TextField label="Instagram / TikTok" name="social" value={contact?.social} placeholder="@handle" maxLength={200} />
        {!compact && <TextField label="Website" name="website" value={contact?.website} maxLength={300} />}
        {!compact && <TextField label="Company / role" name="company" value={contact?.company} maxLength={120} />}
        {!compact && <TextField label="Tags" name="tags" value={contact?.tags?.join(", ")} hint="Separate with commas: dating, coach, Miami" maxLength={300} />}
        <TextField label="Last contacted" name="lastContacted" type="date" value={contact?.lastContacted} />
        <TextField label="Follow up on" name="followUp" type="date" value={contact?.followUp} hint="Shows on the overview when it's due" />
      </div>
      <TextArea label="Notes" name="notes" value={contact?.notes} rows={compact ? 3 : 6} />
    </ActionForm>
  );
}

export function EpisodeForm({ episode, contacts, returnTo, disabled, compact = false }: { episode?: Episode; contacts: Contact[]; returnTo?: string; disabled?: boolean; compact?: boolean }) {
  // Guests to choose from: guests and experts first, then everyone already on this episode
  const chosen = new Set(episode?.guestIds ?? []);
  const options = contacts
    .filter((c) => chosen.has(c._id) || ["guest", "expert"].includes(c.kind))
    .map((c) => ({ value: c._id, label: c.name }));
  return (
    <ActionForm action={saveEpisode} submitLabel={episode ? "Save changes" : "Add episode"} disabled={disabled}>
      <Hidden id={episode?._id} returnTo={returnTo} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <TextField label="Working title" name="title" value={episode?.title} required maxLength={200} />
        <TextField label="Number" name="number" value={episode?.number} inputMode="numeric" placeholder="43" maxLength={6} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label="Stage" name="stage" value={episode?.stage ?? "idea"} options={EPISODE_STAGES} className="sm:col-span-2" />
        <TextField label="Recording date" name="recordDate" type="date" value={episode?.recordDate} />
        <TextField label="Recording time" name="recordTime" type="time" value={episode?.recordTime} hint="Miami time" />
        <TextField label="Release date" name="publishDate" type="date" value={episode?.publishDate} />
        {!compact && <TextField label="Link once it's live" name="link" type="url" value={episode?.link} placeholder="https://youtube.com/…" maxLength={300} />}
      </div>
      <CheckboxGroup legend="Guests" name="guests" options={options} values={episode?.guestIds} />
      <TextArea label="What it's about" name="summary" value={episode?.summary} rows={compact ? 2 : 3} />
      {!compact && <TextArea label="Questions & outline" name="questions" value={episode?.questions} rows={10} placeholder={"1. How did you know you were ready?\n2. …"} />}
      {!compact && <TextArea label="Notes" name="notes" value={episode?.notes} rows={4} />}
    </ActionForm>
  );
}

export function PostForm({ post, episodes, returnTo, disabled, defaults, compact = false }: { post?: Post; episodes: Episode[]; returnTo?: string; disabled?: boolean; defaults?: Partial<Post>; compact?: boolean }) {
  const value = { ...defaults, ...post };
  return (
    <ActionForm action={savePost} submitLabel={post ? "Save changes" : "Add post"} disabled={disabled}>
      <Hidden id={post?._id} returnTo={returnTo} />
      <TextField label="Hook / working title" name="title" value={value.title} required maxLength={200} placeholder="5 signs you're ready to date again" />
      <CheckboxGroup legend="Where" name="platforms" options={PLATFORMS} values={value.platforms ?? []} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label="Format" name="format" value={value.format} options={POST_FORMATS} empty="Choose…" />
        <SelectField label="Stage" name="stage" value={value.stage ?? "idea"} options={POST_STAGES} />
        <TextField label="Date" name="date" type="date" value={value.date} hint="Leave empty to keep it as an idea" />
        <TextField label="Time" name="time" type="time" value={value.time} hint="Miami time" />
        <SelectField
          label="From episode"
          name="episode"
          value={value.episodeId}
          options={episodes.map((e) => ({ value: e._id, label: `${e.number ? `${e.number}. ` : ""}${e.title}` }))}
          empty="None"
          className="sm:col-span-2"
        />
      </div>
      <TextArea label="Caption / script" name="caption" value={value.caption} rows={compact ? 3 : 8} />
      {!compact && <TextField label="Link once it's posted" name="link" type="url" value={value.link} maxLength={300} />}
      {!compact && <TextArea label="Notes" name="notes" value={value.notes} rows={3} placeholder="Music, b-roll, who to tag…" />}
    </ActionForm>
  );
}
