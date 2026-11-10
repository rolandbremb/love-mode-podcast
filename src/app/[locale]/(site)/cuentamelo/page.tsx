import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import EmailSessionForm from "@/components/forms/EmailSessionForm";
import PageHeader from "@/components/postal/PageHeader";
import { pageMetadata } from "@/lib/metadata";
import { paidEmailReady } from "@/lib/stripe";

// Unfinished sections show in local development and where SHOW_UPCOMING_SECTIONS is on
const showUpcoming =
  process.env.SHOW_UPCOMING_SECTIONS === "true" || process.env.NODE_ENV === "development";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailSession" });
  return pageMetadata(parent, { title: t("title"), description: t("metaDescription"), locale, path: "/cuentamelo" });
}

// "Cuéntamelo por email": write your story, pay on Stripe, get Andrea's reply
export default async function EmailSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cancelado?: string }>;
}) {
  // The page only exists once payments work (or while previewing)
  if (!paidEmailReady() && !showUpcoming) notFound();

  const { locale } = await params;
  const { cancelado } = await searchParams;
  const t = await getTranslations({ locale, namespace: "emailSession" });
  const steps = t.raw("steps") as string[];

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("intro")} note={t("label")} />

      <div className="page-container grid items-start gap-10 pb-24 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:pb-32">
        <div className="flex flex-col gap-6">
          {cancelado && (
            <p role="status" className="rounded-2xl border-[1.5px] border-plum/20 bg-white px-5 py-4 text-[1.0625rem]">
              {t("cancelled")}
            </p>
          )}
          <EmailSessionForm />
        </div>

        <aside className="flex flex-col gap-6 rounded-md bg-white p-8 shadow-postal sm:p-10 lg:sticky lg:top-28">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[2rem] leading-tight">{t("asideTitle")}</h2>
            <span className="font-display text-[2rem] leading-none">{t("price")}</span>
          </div>
          <ol className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-[1.0625rem] leading-relaxed">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bubblegum text-sm font-semibold">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="border-t-[1.5px] border-plum/10 pt-6 text-[0.9375rem] leading-relaxed text-mauve">{t("privacyNote")}</p>
        </aside>
      </div>
    </div>
  );
}
