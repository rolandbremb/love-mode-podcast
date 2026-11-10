/* A round postmark with text running around its ring. Each postmark on a page
   needs its own `id` so the text path doesn't collide with another one. */

export default function Postmark({
  id,
  text,
  color = "#ff6339",
  textColor = "#e5482a",
  className,
  children,
}: {
  id: string;
  text: string;
  color?: string;
  textColor?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <svg className={className} viewBox="0 0 150 150" aria-hidden="true">
      <defs>
        <path id={id} d="M75 75m-53 0a53 53 0 1 1 106 0a53 53 0 1 1-106 0" />
      </defs>
      <circle cx="75" cy="75" r="65" fill="#fff2ec" fillOpacity="0.6" stroke={color} strokeWidth="2.5" />
      <circle cx="75" cy="75" r="41" fill="none" stroke={color} strokeWidth="1.5" />
      <text fill={textColor} style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "11.5px", letterSpacing: "2px" }}>
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
      {children ?? (
        <path
          d="M75 92C63 83 55 77 55 68c0-6 4-10 10-10 4 0 8 2 10 6 2-4 6-6 10-6 6 0 10 4 10 10 0 9-8 15-20 24z"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/* Wavy cancellation lines that run out from a postmark. */
export function CancelWaves({ className, lines = 4 }: { className?: string; lines?: number }) {
  return (
    <svg className={className} viewBox={`0 0 260 ${lines * 40}`} preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="#ff6339" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        {Array.from({ length: lines }, (_, i) => (
          <path key={i} d={`M4 ${20 + i * 40}c28-18 56 18 84 0s56 18 84 0 56 18 84 0`} />
        ))}
      </g>
    </svg>
  );
}

/* Andrea's postmark: plum, with the Frenchie in the middle. */
export function HostPostmark({ id, text, className }: { id: string; text: string; className?: string }) {
  return (
    <Postmark id={id} text={text} color="#2d1530" textColor="#2d1530" className={className}>
      <g transform="translate(50 46) scale(0.5)" fill="none" stroke="#2d1530" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 50c-2 22 10 34 24 34s26-12 24-34c-4-10-44-10-48 0z" />
        <path d="M30 46c-8-5-13-14-10-23 9 0 17 7 20 16M70 46c8-5 13-14 10-23-9 0-17 7-20 16" />
        <circle cx="40" cy="57" r="3.5" />
        <circle cx="60" cy="57" r="3.5" />
        <path d="M44 66c3-3 9-3 12 0-3 4-9 4-12 0z" />
      </g>
    </Postmark>
  );
}
