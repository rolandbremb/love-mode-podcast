/* Hand-drawn line doodles. Single-colour strokes that follow `currentColor`,
   so each one is coloured with a text-* class where it is placed. */

const doodles = {
  cocktail: (
    <>
      <path d="M28 20c-1 22 5 37 22 39 17-2 23-17 22-39z" />
      <path d="M30 31c10 3 30-3 40 0" />
      <path d="M38 39l8-2 2 8-8 2z" />
      <path d="M53 43l7 1-1 7-7-1z" />
      <path d="M50 59v25" />
      <path d="M36 87c8-3 20-3 28 0" />
      <path d="M61 15a9 9 0 1 0 18 0 9 9 0 1 0-18 0" />
      <path d="M70 6v18M61 15h18" />
    </>
  ),
  coffeeDate: (
    <>
      <path d="M14 48l4 30c1 4 4 6 8 6h15c4 0 7-2 8-6l4-30z" />
      <path d="M15 56c-9-1-10 14 2 14" />
      <path d="M56 54l3 26c1 3 3 5 6 5h12c3 0 5-2 6-5l3-26z" />
      <path d="M86 60c7-1 8 11-1 11" />
      <path d="M48 30c-4-6-12-2-8 4l8 8 8-8c4-6-4-10-8-4z" />
      <path d="M30 42c-4-6 4-10 0-16M71 46c-4-6 4-10 0-16" />
    </>
  ),
  microphone: (
    <>
      <path d="M38 15c0-9 24-9 24 0v29c0 10-24 10-24 0z" />
      <path d="M38 24h24M38 32h24M38 40h24" />
      <path d="M30 37c0 25 40 25 40 0" />
      <path d="M50 59v19" />
      <path d="M36 83c8-4 20-4 28 0" />
      <path d="M20 27c-4 6-4 14 0 20M80 27c4 6 4 14 0 20" />
    </>
  ),
  loveLetter: (
    <>
      <path d="M14 31h72v45H14z" />
      <path d="M14 31l36 26 36-26" />
      <path d="M14 76l27-23M86 76L59 53" />
      <path d="M50 61c-4-6-10-2-6 3l6 5 6-5c4-5-2-9-6-3z" />
      <path d="M74 12c-2-3-7-1-5 3l5 5 5-5c2-4-3-6-5-3z" />
    </>
  ),
  heart: (
    <>
      <path d="M50 82C30 66 14 52 16 36c2-14 20-18 32-4 1 2 3 2 4 0 10-14 30-10 32 4 2 16-14 30-34 46z" />
      <path d="M25 35c1-5 5-8 10-8" />
    </>
  ),
  palm: (
    <>
      <path d="M50 90c2-20 0-38-4-54M58 90c2-20-2-38-8-54" />
      <path d="M51 80l7-1M50 68l7-1M49 56l6-1M48 46l5-1" />
      <path d="M48 34C38 22 24 22 14 30M48 34c-12-4-24 2-28 14M48 34c10-14 26-14 36-6M48 34c14-4 26 2 30 14M48 34c-2-12 2-20 10-24" />
      <path d="M43 40a3 3 0 1 0 6 0 3 3 0 1 0-6 0M51 41a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
      <path d="M30 92c14-3 34-3 46 0" />
    </>
  ),
  frenchie: (
    <>
      <path d="M26 50c-2 22 10 34 24 34s26-12 24-34c-4-10-44-10-48 0z" />
      <path d="M30 46c-8-10-10-22-6-29 8 2 16 12 18 24M70 46c8-10 10-22 6-29-8 2-16 12-18 24" />
      <path d="M36.5 57a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0M56.5 57a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0" />
      <path d="M44 66c3-3 9-3 12 0-3 4-9 4-12 0z" />
      <path d="M50 70v3M42 75c3 3 8 1 8-2 0 3 5 5 8 2" />
      <path d="M44 47c4 2 8 2 12 0" />
    </>
  ),
};

export type DoodleName = keyof typeof doodles;

export default function Doodle({
  name,
  className,
  strokeWidth = 3,
}: {
  name: DoodleName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {doodles[name]}
    </svg>
  );
}
