import Link from "next/link";
import { pressable } from "@/components/dashboard/ui";
import { signOut } from "@/lib/dashboard/actions";

/* The bar at the top of every dashboard page: the pages on the first row, and on
   the overview a second row that jumps between its sections. */

const PAGES = [
  ["Overview", "/dashboard"],
  ["Episodes", "/dashboard/episodes"],
  ["Content", "/dashboard/content"],
  ["Contacts", "/dashboard/contacts"],
] as const;

const linkClass = "inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold";

export default function DashboardNav({
  current,
  sections,
  wide = false,
}: {
  current: (typeof PAGES)[number][1];
  sections?: readonly (readonly [string, string])[];
  // The board and calendar pages are wider; the bar lines up with them
  wide?: boolean;
}) {
  const width = wide ? "max-w-[86rem]" : "max-w-[78rem]";
  return (
    <nav aria-label="Dashboard" className="sticky top-0 z-20 border-b border-plum/10 bg-shell/90 backdrop-blur supports-[backdrop-filter]:bg-shell/75">
      <div className={`mx-auto flex ${width} items-center gap-4 px-4 sm:px-8`}>
        <span className="hidden shrink-0 font-display text-xl sm:block">Love Mode</span>
        <ul className="-mx-1 flex flex-1 gap-1 overflow-x-auto py-1.5 [scrollbar-width:none]">
          {PAGES.map(([label, href]) => (
            <li key={href} className="shrink-0">
              <Link href={href} aria-current={href === current ? "page" : undefined} className={`${linkClass} ${href === current ? "bg-plum text-shell" : "hover:bg-white"}`}>
                {label}
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <a href="/studio" className={`${linkClass} hover:bg-white`}>
              Studio
            </a>
          </li>
        </ul>
        <form action={signOut} className="shrink-0">
          <button type="submit" className={`min-h-10 rounded-full border-[1.5px] border-plum/25 px-4 text-sm font-semibold hover:bg-white ${pressable}`}>
            Sign out
          </button>
        </form>
      </div>
      {sections && (
        <div className={`mx-auto ${width} px-4 sm:px-8`}>
          <ul aria-label="Sections on this page" className="-mx-1 flex gap-1 overflow-x-auto pb-1.5 [scrollbar-width:none]">
            {sections.map(([label, href]) => (
              <li key={href} className="shrink-0">
                <a href={href} className="inline-flex min-h-10 items-center rounded-full px-3 text-[0.8125rem] font-semibold text-mauve hover:bg-white hover:text-plum">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

// The header each planner page opens with
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-[0.9375rem] font-semibold text-mauve">{eyebrow}</p>}
        <h1 className="text-balance font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-none">{title}</h1>
      </div>
      {children}
    </header>
  );
}
