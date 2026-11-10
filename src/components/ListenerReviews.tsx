import type { SocialProof } from "@/sanity/client";

// Listener reviews as postcards, in the words they were written in
export default function ListenerReviews({ title, reviews }: { title: string; reviews: SocialProof["reviews"] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="page-container flex flex-col gap-10 pb-24 lg:pb-32">
      <h2 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] tracking-[-0.02em]">{title}</h2>
      <ul className="grid gap-8 md:grid-cols-3">
        {reviews.slice(0, 6).map((review, index) => (
          <li
            key={`${review.name}-${index}`}
            className="relative flex flex-col gap-6 overflow-hidden rounded-md bg-white px-7 pb-7 pt-10 shadow-postal"
          >
            <span className="airmail absolute inset-x-0 top-0 [--airmail-gap:#ffffff]" aria-hidden="true" />
            <blockquote className="font-display text-[1.375rem] leading-[1.35]">“{review.quote}”</blockquote>
            <p className="mt-auto text-[0.9375rem] text-mauve">
              <span className="font-semibold text-plum">{review.name}</span>
              {review.source && <span>, {review.source}</span>}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
