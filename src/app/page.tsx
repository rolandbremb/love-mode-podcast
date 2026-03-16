import Link from "next/link";
import EpisodeCard from "@/components/EpisodeCard";
import { getLatestEpisodes } from "@/lib/rss";
import { getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

export default async function Home() {
  const [latestEpisodes, settings] = await Promise.all([
    getLatestEpisodes(3),
    getSiteSettings(),
  ]);

  const heroTagline = settings?.heroTagline ?? "The Podcast";
  const heroTitle = settings?.heroTitle ?? "Love Mode";
  const heroDescription =
    settings?.heroDescription ??
    "Real conversations about love, dating, and building relationships that actually last. No sugarcoating, no games \u2014 just honest talk and real advice.";
  const aboutTitle = settings?.aboutTitle ?? "What is Love Mode?";
  const aboutParagraphs = settings?.aboutParagraphs ?? [
    "Love Mode is more than a podcast \u2014 it\u2019s a movement. We dive deep into the messy, beautiful, complicated world of modern love and relationships. Whether you\u2019re single and navigating the dating scene, in a relationship and looking to grow, or just trying to figure out what love even means to you \u2014 this is your space.",
    "Every episode brings raw, unfiltered conversations with real people and experts who get it. We talk attachment styles, communication, red flags, green flags, self-love, intimacy, and everything in between.",
  ];
  const buyMeCoffeeUrl = settings?.buyMeCoffeeUrl ?? "#";

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#e11d48_0%,_transparent_50%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-500">
              {heroTagline}
            </p>
            <h1 className="font-serif text-5xl font-bold leading-tight text-stone-900 md:text-6xl lg:text-7xl">
              {heroTitle}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone-600 md:text-xl">
              {heroDescription}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/episodes" className="btn-primary">
                Listen to Episodes
              </Link>
              <Link href="/apply" className="btn-secondary">
                Be a Guest
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold text-stone-900 md:text-4xl">
              {aboutTitle}
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
            {aboutParagraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`${i === 0 ? "mt-8" : "mt-6"} text-lg leading-relaxed text-stone-600`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST EPISODES ===== */}
      <section className="section-padding bg-brand-50/50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-stone-900 md:text-4xl">
              Latest Episodes
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
          </div>

          {latestEpisodes.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestEpisodes.map((episode, i) => (
                <EpisodeCard key={i} episode={episode} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-brand-200 p-12 text-center">
              <p className="text-lg font-medium text-stone-500">
                Episodes are on the way! Set your{" "}
                <code className="rounded bg-brand-100 px-2 py-0.5 text-sm text-brand-700">
                  PODCAST_RSS_URL
                </code>{" "}
                environment variable to connect your feed.
              </p>
            </div>
          )}

          {latestEpisodes.length > 0 && (
            <div className="mt-10 text-center">
              <Link href="/episodes" className="btn-secondary">
                View All Episodes
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA SECTIONS ===== */}
      <section className="section-padding bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          {/* Guest CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white md:p-10">
            <h3 className="font-serif text-2xl font-bold">
              Want to Be a Guest?
            </h3>
            <p className="mt-4 leading-relaxed text-brand-100">
              Got a story to share? A unique perspective on love and
              relationships? We want to hear from you. Apply to be a guest on
              Love Mode.
            </p>
            <Link
              href="/apply"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-50"
            >
              Apply Now
            </Link>
          </div>

          {/* Collaborate CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-stone-800 to-stone-950 p-8 text-white md:p-10">
            <h3 className="font-serif text-2xl font-bold">
              Let&rsquo;s Collaborate
            </h3>
            <p className="mt-4 leading-relaxed text-stone-300">
              Brands, creators, and coaches &mdash; let&rsquo;s build something
              together. Sponsorships, partnerships, and creative
              collaborations.
            </p>
            <Link
              href="/collaborate"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-stone-900 transition-all hover:bg-gold-400"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BUY ME A COFFEE / SUPPORT ===== */}
      <section
        id="support"
        className="section-padding bg-gradient-to-br from-brand-50 to-brand-100"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-4xl">&#9749;</span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-stone-900 md:text-4xl">
            Support the Show
          </h2>
          <p className="mt-4 text-lg text-stone-600">
            Love the podcast? Help keep Love Mode going! Every coffee fuels
            another episode of real talk about love and relationships.
          </p>
          <a
            href={buyMeCoffeeUrl}
            target={buyMeCoffeeUrl !== "#" ? "_blank" : undefined}
            rel={buyMeCoffeeUrl !== "#" ? "noopener noreferrer" : undefined}
            className="btn-gold mt-8"
          >
            &#9749;&nbsp; Buy Me a Coffee
          </a>
        </div>
      </section>
    </>
  );
}
