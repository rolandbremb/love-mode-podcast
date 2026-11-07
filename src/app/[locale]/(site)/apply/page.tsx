import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import GuestApplicationForm from "@/components/forms/GuestApplicationForm";
import { Heart, Microphone } from "@/components/postal/Doodles";
import PageHeader from "@/components/postal/PageHeader";

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
      <PageHeader title={t("title")} subtitle={t("subtitle")} note={t("label")} />

      <div className="page-container grid items-start gap-10 pb-24 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:pb-32">
        <GuestApplicationForm />

        <aside className="flex flex-col gap-6 rounded-[2.25rem] bg-bubblegum p-8 sm:p-10 lg:sticky lg:top-28">
          <Microphone className="h-14 w-14" />
          <h2 className="font-display text-[2rem] leading-tight">{t("perksTitle")}</h2>
          <ul className="flex flex-col gap-4">
            {perks.map((perk) => (
              <li key={perk} className="flex gap-3 text-[1.0625rem] leading-relaxed">
                <Heart className="mt-1 h-4 w-5 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
          <p className="font-hand text-[1.375rem]">{t("handNote")}</p>
        </aside>
      </div>
    </div>
  );
}
