import type { Call } from "@/lib/dashboard/data";
import { dayKey, formatDay } from "@/lib/dashboard/summary";

/* Small building blocks for the dashboard. Dashboard cards use a tighter, layered
   shadow than the site's postcards: many cards on one page would otherwise haze. */

export const cardShadow = "shadow-[0_1px_2px_rgba(45,21,48,0.06),0_8px_24px_-12px_rgba(45,21,48,0.18)]";

// A subtle press for buttons; colour and transform only, never "all"
export const pressable = "transition-[background-color,color,transform] duration-150 active:scale-[0.97]";

export function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-20 flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={`${id}-title`} className="text-balance font-display text-[2rem] leading-tight">
          {title}
        </h2>
        {note}
      </div>
      {children}
    </section>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-md bg-white p-6 ${cardShadow} ${className}`}>{children}</div>;
}

// While a section's data is on its way
export function SectionSkeleton({ id, title, height = "h-48" }: { id: string; title: string; height?: string }) {
  return (
    <Section id={id} title={title}>
      <div className={`${height} animate-pulse rounded-md bg-white/60 motion-reduce:animate-none`} aria-hidden="true" />
      <span className="sr-only">Loading {title}…</span>
    </Section>
  );
}

// A big count; zero is muted so the tiles that need attention stand out
export function Count({ value }: { value: number }) {
  return (
    <p className={`font-display text-5xl leading-none tabular-nums ${value === 0 ? "text-plum/25" : ""}`}>{value}</p>
  );
}

export function SourceNote({
  status,
  envName,
  sample,
  detail,
}: {
  status: string;
  envName?: string;
  sample: boolean;
  detail?: string;
}) {
  if (sample) {
    return (
      <span className="rounded-full bg-plum px-3 py-1 text-xs font-semibold text-shell">Sample data until {envName} is set</span>
    );
  }
  if (status === "missing") {
    return <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold">Not connected: add {envName} in Vercel</span>;
  }
  if (status === "error") {
    return (
      <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold">
        Couldn&apos;t load{detail ? `: ${detail}` : " right now"}
      </span>
    );
  }
  // Loaded, but some parts failed
  if (detail) {
    return <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold">Partly loaded: {detail}</span>;
  }
  return null;
}

// "Overdue", "Due today", "Due tomorrow" or the date, for a reply deadline
export function DuePill({ deadline, today }: { deadline: Date; today: string }) {
  const key = dayKey(deadline);
  const tomorrow = dayKey(new Date(Date.now() + 86_400_000));
  const text =
    key < today ? "Overdue" : key === today ? "Due today" : key === tomorrow ? "Due tomorrow" : `Due ${formatDay(deadline)}`;
  const urgent = key <= tomorrow;
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        urgent ? "bg-tangerine text-plum" : "bg-shell text-plum/80"
      }`}
    >
      {text}
    </span>
  );
}

export function JoinButton({ call }: { call: Call }) {
  if (!call.joinUrl) return null;
  return (
    <a
      href={call.joinUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-tangerine min-h-10 shrink-0 whitespace-nowrap !px-4 !py-2 !text-sm ${pressable}`}
    >
      Join call
    </a>
  );
}

// A text link with a 40px-tall hit area
export function TextLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex min-h-10 items-center font-semibold underline decoration-plum/30 underline-offset-4 hover:decoration-plum"
    >
      {children}
    </a>
  );
}

// A small chevron for "back" links, nudged left so it sits optically in line with the text
export function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" className="-ml-0.5 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </svg>
  );
}
