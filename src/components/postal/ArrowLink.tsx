import { Link } from "@/i18n/navigation";

export function ArrowIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2 9h13M10 4l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* The primary call to action: a plum pill ending in a tangerine arrow. */
export default function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = `btn-primary whitespace-nowrap !py-2 !pr-2 !pl-6 ${className}`;
  const arrow = (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tangerine text-plum">
      <ArrowIcon />
    </span>
  );

  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        {arrow}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {arrow}
    </Link>
  );
}
