/* The opening of an inner page: an optional handwritten line, the title and a short intro. */
export default function PageHeader({
  title,
  subtitle,
  note,
}: {
  title: string;
  subtitle?: string;
  note?: string;
}) {
  return (
    <section className="page-container pb-12 pt-8 md:pb-16 md:pt-14">
      {note && <p className="font-hand text-[1.375rem] sm:text-[1.5rem]">{note}</p>}
      <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] tracking-[-0.03em] motion-safe:animate-rise">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-mauve sm:text-[1.1875rem]">{subtitle}</p>
      )}
    </section>
  );
}
