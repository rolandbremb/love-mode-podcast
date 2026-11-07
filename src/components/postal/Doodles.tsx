/* Single-line doodles for the postcard look. Strokes are plum, with a
   tangerine detail where the doodle has one. Sized with a className. */

type DoodleProps = { className?: string };

const PLUM = "#2d1530";
const TANGERINE = "#ff6339";

const line = {
  fill: "none",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CoffeeDate({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 80 50" aria-hidden="true">
      <g {...line} stroke={PLUM}>
        <path d="M6 14l3 22c1 3 3 5 6 5h12c3 0 5-2 6-5l3-22z" />
        <path d="M40 18l2 18c1 3 2 4 5 4h9c3 0 4-1 5-4l2-18z" />
      </g>
      <path {...line} stroke={TANGERINE} d="M36 6c-3-4-8-1-5 2l5 4 5-4c3-3-2-6-5-2z" />
    </svg>
  );
}

export function Rings({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 70 60" aria-hidden="true">
      <g {...line} stroke={PLUM}>
        <circle cx="26" cy="38" r="14" />
        <circle cx="44" cy="38" r="14" />
      </g>
      <path {...line} stroke={TANGERINE} d="M40 16l5-7 5 7-5 7z" />
    </svg>
  );
}

export function BrokenHeart({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 66 60" aria-hidden="true">
      <g {...line} stroke={PLUM}>
        <path d="M30 56C14 45 4 36 6 24c2-10 14-13 22-4l2 3" />
        <path d="M36 24l2-3c8-9 20-6 22 4 2 12-8 21-24 32" />
      </g>
      <path {...line} stroke={TANGERINE} d="M32 22l-5 10 8 6-6 12" />
    </svg>
  );
}

export function Sailboat({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 70 60" aria-hidden="true">
      <g {...line} stroke={PLUM}>
        <path d="M34 6v40M34 10l22 34H34M30 18L16 44h14" />
        <path d="M8 48h52l-8 10H16z" />
      </g>
      <path {...line} stroke={TANGERINE} d="M30 2c-3-3-7 0-4 2l4 4 4-4c3-2-1-5-4-2z" />
    </svg>
  );
}

export function PaperPlane({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 70 70" aria-hidden="true">
      <g {...line} stroke={PLUM}>
        <path d="M4 30L62 8 44 62 32 42z" />
        <path d="M32 42L62 8M32 42l-3 15 9-9" />
      </g>
    </svg>
  );
}

export function Heart({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 66 60" aria-hidden="true">
      <path {...line} stroke={PLUM} d="M33 56C16 45 5 36 6 23c1-10 14-14 23-5l4 4 4-4c9-9 22-5 23 5 1 13-10 22-27 33z" />
    </svg>
  );
}

export function Telephone({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 70 70" aria-hidden="true">
      <g {...line} stroke={PLUM}>
        <path d="M10 64l6-24h36l6 24z" />
        <circle cx="34" cy="52" r="7" />
        <path d="M4 32c0-12 60-12 60 0v5H49v-5H19v5H4z" />
      </g>
    </svg>
  );
}

export function Envelope({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 100 80" aria-hidden="true">
      <g {...line} strokeWidth={3} stroke={PLUM}>
        <path d="M10 26h80v44H10z" />
        <path d="M10 26l40 28 40-28" />
      </g>
      <path {...line} strokeWidth={3} stroke={TANGERINE} d="M50 44c-4-6-11-2-7 3l7 6 7-6c4-5-3-9-7-3z" />
    </svg>
  );
}

export function CoffeeCup({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 60 44" aria-hidden="true">
      <g {...line} strokeWidth={2.2} stroke={TANGERINE}>
        <path d="M6 18l3 18c1 3 2 4 5 4h12c3 0 4-1 5-4l3-18z" />
        <path d="M34 22c7 0 7 10-1 10" />
        <path d="M16 12c-3-4 3-6 0-10M26 12c-3-4 3-6 0-10" />
      </g>
    </svg>
  );
}

export function Microphone({ className, stroke = PLUM }: DoodleProps & { stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <g {...line} strokeWidth={4} stroke={stroke}>
        <path d="M38 15c0-9 24-9 24 0v29c0 10-24 10-24 0z" />
        <path d="M30 37c0 25 40 25 40 0M50 59v19M36 83c8-4 20-4 28 0" />
      </g>
    </svg>
  );
}

export function LetterAndPlane({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 360 240" aria-hidden="true">
      <g {...line} stroke={PLUM}>
        <path d="M30 110h150v96H30z" />
        <path d="M30 110l75 56 75-56" />
        <path d="M30 206l56-46M180 206l-56-46" />
        <path d="M196 100c40-30 60-60 100-62" strokeDasharray="2 8" />
        <g transform="translate(286 14)">
          <path d="M2 26L52 6 36 50 26 34z" />
          <path d="M26 34L52 6M26 34l-3 12 8-8" />
        </g>
      </g>
      <g {...line} stroke={TANGERINE}>
        <path d="M105 180c-6-9-17-3-11 5l11 9 11-9c6-8-5-14-11-5z" />
        <path d="M220 160c-4-6-12-2-8 3l8 7 8-7c4-5-4-9-8-3zM250 196c-3-4-9-1-6 3l6 5 6-5c3-4-3-7-6-3z" />
      </g>
    </svg>
  );
}
