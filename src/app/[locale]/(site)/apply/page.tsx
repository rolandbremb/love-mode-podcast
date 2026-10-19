import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import GuestApplicationForm from "@/components/forms/GuestApplicationForm";

function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c.9 6.6 4.8 10.9 12 12-7.2 1.1-11.1 5.4-12 12-.9-6.6-4.8-10.9-12-12C7.2 10.9 11.1 6.6 12 0z" />
    </svg>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apply" });
  const title = t("title");
  const description = t("subtitle");
  return pageMetadata(parent, { title, description, locale, path: "/apply" });
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apply" });
  const perks = t.raw("perks") as string[];

  return (
    <div>
      {/* ===== HEADER ===== */}
      <section className="theme-soft relative overflow-hidden border-b-2 border-ink">
        <Sparkle className="absolute right-[10%] top-12 hidden h-10 w-10 text-butter motion-safe:animate-float md:block" />
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 md:pb-16 md:pt-16 lg:px-8">
          <span className="sticker motion-safe:animate-rise">
            <Sparkle className="h-3 w-3" />
            {t("label")}
          </span>
          <h1 className="mt-5 font-display text-[clamp(2.75rem,13vw,3.75rem)] font-extrabold lowercase leading-[0.85] tracking-[-0.04em] text-brand-700 motion-safe:animate-rise [animation-delay:80ms] md:text-8xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75 motion-safe:animate-rise [animation-delay:160ms]">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="section-padding">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          {/* ===== FORM ===== */}
          <GuestApplicationForm />

          {/* ===== WHAT WE LOOK FOR ===== */}
          <aside className="rounded-[2rem] border-2 border-ink bg-butter p-8 shadow-pop lg:sticky lg:top-28 lg:rotate-1">
            <h2 className="font-display text-3xl font-extrabold lowercase tracking-tight text-ink">
              {t("perksTitle")}
            </h2>
            <ul className="mt-6 space-y-4">
              {perks.map((perk) => (
                <li key={perk} className="flex gap-3 leading-relaxed text-ink/85">
                  <Sparkle className="mt-1 h-4 w-4 shrink-0 text-brand-600" />
                  {perk}
                </li>
              ))}
            </ul>
            <p className="mt-8 -rotate-2 font-hand text-3xl font-medium text-brand-600">{t("handNote")}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
