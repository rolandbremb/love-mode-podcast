import { getTranslations } from "next-intl/server";
import BrandInquiryForm from "@/components/forms/BrandInquiryForm";
import { formatStat } from "@/lib/format";
import { getAllEpisodes } from "@/lib/rss";
import { getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c.9 6.6 4.8 10.9 12 12-7.2 1.1-11.1 5.4-12 12-.9-6.6-4.8-10.9-12-12C7.2 10.9 11.1 6.6 12 0z" />
    </svg>
  );
}

export default async function CollaboratePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collaborate" });
  const tHome = await getTranslations({ locale, namespace: "home" });

  const settings = await getSiteSettings({ locale });
  const episodes = await getAllEpisodes(settings?.podcastRssUrl);
  const platformCount = settings?.platformLinks?.length ?? 0;
  const totalViews = episodes.reduce((sum, episode) => sum + (episode.views || 0), 0);
  const stats = [
    episodes.length > 0 && { value: String(episodes.length), label: tHome("statEpisodes") },
    totalViews > 0 && { value: formatStat(totalViews), label: tHome("statViews") },
    platformCount > 0 && { value: String(platformCount), label: tHome("statPlatforms") },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div>
      {/* ===== HEADER ===== */}
      <section className="theme-soft relative overflow-hidden border-b-2 border-ink">
        <Sparkle className="absolute right-[10%] top-12 hidden h-10 w-10 text-butter motion-safe:animate-float md:block" />
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 md:pb-16 md:pt-16 lg:px-8">
          <span className="sticker motion-safe:animate-rise">
            <Sparkle className="h-3 w-3" />
            {t("label")}
          </span>
          <h1 className="mt-5 font-display text-6xl font-extrabold lowercase leading-[0.85] tracking-[-0.04em] text-brand-700 motion-safe:animate-rise [animation-delay:80ms] md:text-8xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/75 motion-safe:animate-rise [animation-delay:160ms]">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="section-padding">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          {/* ===== WHY LOVE MODE ===== */}
          <aside className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-brand-600 p-8 text-cream shadow-pop-lg md:p-10 lg:sticky lg:top-28">
            <Sparkle className="absolute right-8 top-8 h-8 w-8 text-butter motion-safe:animate-spin-slow" />
            <h2 className="font-display text-4xl font-extrabold lowercase tracking-tight">{t("sideTitle")}</h2>
            <p className="mt-4 leading-relaxed text-cream/85">{tHome("brandsDescription")}</p>

            {stats.length > 0 && (
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t-2 border-cream/25 pt-6">
                {stats.map(({ value, label }) => (
                  <div key={label}>
                    <dt className="sr-only">{label}</dt>
                    <dd className="font-display text-3xl font-extrabold tracking-tight text-butter md:text-4xl">
                      {value}
                    </dd>
                    <dd className="mt-1 text-xs font-semibold leading-snug text-cream/80">{label}</dd>
                  </div>
                ))}
              </dl>
            )}

            <p className="mt-8 -rotate-2 font-hand text-2xl font-medium text-butter">{tHome("brandsReply")}</p>
          </aside>

          {/* ===== FORM ===== */}
          <BrandInquiryForm />
        </div>
      </div>
    </div>
  );
}
