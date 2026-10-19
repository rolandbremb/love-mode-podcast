import Image from "next/image";
import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAboutPage } from "@/sanity/client";

export const revalidate = 3600;

const defaultBio = [
  "Hi, I'm the host of Love Mode — a podcast born from a simple belief: real love starts with real conversations.",
  "I've spent years navigating the messy, beautiful, and sometimes confusing world of modern relationships — and I wanted to create a space where we could talk about it all, honestly and without judgment.",
  "Every episode, I sit down with guests and explore the full spectrum of love: dating, heartbreak, self-worth, communication, and everything in between. No scripts, no sugarcoating — just truth.",
];

const defaultMission =
  "Love Mode exists to make people feel less alone in their relationship journeys. Whether you're single, partnered, healing, or searching — this podcast is for you.";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: preview } = await draftMode();
  const t = await getTranslations({ locale, namespace: "about" });

  const data = await getAboutPage({ preview, locale });

  const hostName = data?.hostName ?? "Your Host";
  const hostBio = data?.hostBio?.length ? data.hostBio : defaultBio;
  const showMission = data?.showMission ?? defaultMission;
  const photoUrl = data?.hostPhoto?.asset?.url ?? "/images/host.jpg";

  return (
    <div>
      {/* ===== HOST SECTION — Asymmetric ===== */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-16">
            {/* Photo — left, tall aspect */}
            <div className="relative -mx-4 aspect-[3/4] sm:mx-0">
              <Image
                src={photoUrl}
                alt={hostName}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="rounded-none object-cover shadow-lg sm:rounded-2xl"
              />
            </div>

            {/* Bio — right, anchored */}
            <div>
              <p className="section-label">{t("meetYourHost")}</p>
              <h1 className="mt-4 font-serif text-5xl font-bold leading-[0.94] text-stone-900 md:text-6xl">
                {hostName}
              </h1>
              <div className="mt-6 h-px w-16 bg-brand-400" />
              <div className="mt-6 space-y-4">
                {hostBio.map((paragraph, i) => (
                  <p key={i} className="text-base leading-relaxed text-stone-600 md:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION SECTION ===== */}
      <section className="section-padding theme-soft">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-8 py-14 text-white md:px-16">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/60">
              Love Mode
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold md:text-4xl">
              {t("ourMission")}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              {showMission}
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION — Asymmetric 2-col ===== */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            {/* Left — Listen card (tall) */}
            <Link
              href="/episodes"
              className="editorial-panel flex flex-col justify-between p-8 transition-transform duration-200 hover:-translate-y-1 lg:p-10"
            >
              <div>
                <p className="section-label">{t("listenTitle")}</p>
                <h3 className="mt-4 font-serif text-3xl font-bold text-stone-900 md:text-4xl">
                  {t("listenTitle")}
                </h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-stone-500">
                  {t("listenDesc")}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center text-sm font-semibold text-brand-600">
                {t("listenCta")}
                <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </span>
            </Link>

            {/* Right — Stacked cards */}
            <div className="grid gap-6">
              <Link
                href="/apply"
                className="rounded-[1.75rem] bg-brand-600 p-8 text-white shadow-[0_8px_30px_-12px_rgba(160,81,103,0.4)] transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/60">
                  {t("guestTitle")}
                </p>
                <h3 className="mt-3 font-serif text-2xl font-bold">
                  {t("guestTitle")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {t("guestDesc")}
                </p>
                <span className="mt-5 inline-flex items-center text-sm font-semibold text-white">
                  {t("guestCta")}
                  <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </span>
              </Link>

              <div className="rounded-[1.75rem] bg-stone-900 p-8 text-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/50">
                  {t("supportTitle")}
                </p>
                <h3 className="mt-3 font-serif text-2xl font-bold">
                  {t("supportTitle")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {t("supportDesc")}
                </p>
                <a
                  href="#support"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-white"
                >
                  {t("supportCta")}
                  <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
