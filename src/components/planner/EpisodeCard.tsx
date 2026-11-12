import Link from "next/link";
import { StageSelect } from "@/components/planner/client";
import type { Contact, Episode } from "@/lib/planner/shared";
import { slugFromId } from "@/lib/planner/shared";

/* An episode on the production board: a little postcard with an airmail edge, and a
   postmark in the corner carrying its release date. */

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

export function DatePostmark({ date, today, soonUntil }: { date?: string; today: string; soonUntil: string }) {
  const soon = Boolean(date && date >= today && date <= soonUntil);
  const past = Boolean(date && date < today);
  const ink = soon ? "#e5482a" : past ? "rgba(45,21,48,0.35)" : "#2d1530";
  const label = date ? `Release ${MONTH.format(new Date(`${date}T12:00:00Z`))} ${Number(date.slice(8))}` : "No release date";
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0 -rotate-[8deg]" role="img" aria-label={label}>
      <circle cx="32" cy="32" r="29" fill="none" stroke={ink} strokeWidth="1.75" strokeDasharray={date ? undefined : "3 3"} />
      <circle cx="32" cy="32" r="23" fill="none" stroke={ink} strokeWidth="1" />
      {date ? (
        <>
          <text x="32" y="28" textAnchor="middle" fill={ink} style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "9px", letterSpacing: "1px" }}>
            {MONTH.format(new Date(`${date}T12:00:00Z`)).toUpperCase()}
          </text>
          <text x="32" y="44" textAnchor="middle" fill={ink} style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontVariantNumeric: "tabular-nums" }}>
            {Number(date.slice(8))}
          </text>
        </>
      ) : (
        <path d="M32 40c-6-4.5-10-7.5-10-12 0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 4.5-4 7.5-10 12z" fill="none" stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function EpisodeCard({
  episode,
  contacts,
  today,
  soonUntil,
  sample,
  index = 0,
}: {
  episode: Episode;
  contacts: Contact[];
  today: string;
  soonUntil: string;
  sample: boolean;
  index?: number;
}) {
  const guests = episode.guestIds.map((id) => contacts.find((c) => c._id === id)?.name).filter(Boolean);
  const done = episode.checklist.filter((item) => item.done).length;
  const total = episode.checklist.length;
  const recording = episode.recordDate && episode.recordDate >= today ? episode.recordDate : null;

  return (
    <article
      className="group relative animate-[rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both] overflow-hidden rounded-md bg-white shadow-[0_1px_2px_rgba(45,21,48,0.06),0_8px_24px_-12px_rgba(45,21,48,0.18)] transition-[box-shadow,transform] duration-200 focus-within:shadow-[0_1px_2px_rgba(45,21,48,0.08),0_14px_30px_-12px_rgba(45,21,48,0.28)] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(45,21,48,0.08),0_14px_30px_-12px_rgba(45,21,48,0.28)] motion-reduce:animate-none motion-reduce:hover:translate-y-0"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <span className="airmail block !h-[5px] [--airmail-gap:#ffffff]" aria-hidden="true" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            {episode.number && <span className="font-display text-sm tabular-nums text-mauve">Episode {episode.number}</span>}
            <h3 className="text-balance font-display text-[1.25rem] leading-[1.15]">
              {/* The whole card opens the episode; the stage dropdown sits above the link */}
              <Link href={`/dashboard/episodes/${slugFromId(episode._id)}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                {episode.title}
              </Link>
            </h3>
          </div>
          <DatePostmark date={episode.publishDate} today={today} soonUntil={soonUntil} />
        </div>
        {(guests.length > 0 || recording) && (
          <div className="flex flex-col gap-0.5 text-sm">
            {guests.length > 0 && <p className="text-pretty">With {guests.join(" and ")}</p>}
            {recording && (
              <p className="text-mauve">
                Recording {new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${recording}T12:00:00Z`))}
                {episode.recordTime ? ` at ${episode.recordTime}` : ""}
              </p>
            )}
          </div>
        )}
        {total > 0 && (
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 flex-1 rounded-full bg-shell" aria-hidden="true">
              <span className="block h-1.5 rounded-full bg-[#1baf7a]" style={{ width: `${(done / total) * 100}%` }} />
            </span>
            <span className="text-xs font-semibold tabular-nums text-mauve">
              {done}/{total}
              <span className="sr-only"> checklist steps done</span>
            </span>
          </div>
        )}
        <div className="relative z-10 w-fit">
          <StageSelect type="plannerEpisode" id={episode._id} stage={episode.stage} label={`Stage for ${episode.title}`} disabled={sample} />
        </div>
      </div>
    </article>
  );
}
