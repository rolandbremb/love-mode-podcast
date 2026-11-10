import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/postal/PageHeader";
import SectionBody from "@/components/SectionBody";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const description = (await getTranslations({ locale, namespace: "meta" }))("privacyDescription");
  return pageMetadata(parent, { title: t("title"), description, locale, path: "/privacy" });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const sections = t.raw("sections") as { heading: string; body: string }[];

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("intro")} note={t("updated")} />
      <div className="page-container pb-24 lg:pb-32">
        <div className="flex max-w-[44rem] flex-col gap-12">
          {sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-4">
              <h2 className="font-display text-[2rem] leading-tight">{section.heading}</h2>
              <div className="flex flex-col gap-4 text-[1.0625rem] leading-relaxed text-mauve">
                <SectionBody body={section.body} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
