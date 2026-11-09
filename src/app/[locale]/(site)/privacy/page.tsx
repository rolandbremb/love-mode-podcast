import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/postal/PageHeader";
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

/* Section text from the Studio: blank lines separate paragraphs, "- " lines form a list */
function SectionBody({ body }: { body: string }) {
  return body.split(/\n\s*\n/).map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
      return (
        <ul key={index} className="flex list-disc flex-col gap-2 pl-6 marker:text-tangerine">
          {lines.map((line) => (
            <li key={line}>{line.slice(2)}</li>
          ))}
        </ul>
      );
    }
    return <p key={index}>{lines.join(" ")}</p>;
  });
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
