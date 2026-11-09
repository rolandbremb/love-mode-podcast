import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/components/postal/ArrowLink";
import Postmark from "@/components/postal/Postmark";
import { LetterAndPlane } from "@/components/postal/Doodles";
import QuickSignupForm from "@/components/forms/QuickSignupForm";

// "Esto apenas empieza": the signup page linked from Andrea's social bios
export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lista" });
  // The emoji reads well on the page but not in a browser tab or search result
  const title = t("title").replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, "").trim();
  return pageMetadata(parent, { title, description: t("metaDescription"), locale, path: "/lista" });
}

export default async function ListaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lista" });
  const intro = t.raw("intro") as string[];

  return (
    <section className="page-container flex justify-center pb-24 pt-10 md:pb-32 md:pt-16">
      <div className="relative w-full max-w-[64rem]">
        <Postmark
          id="lista-postmark"
          text={t("postmark")}
          className="absolute -top-12 right-2 z-10 h-28 w-28 rotate-12 sm:-right-10 sm:h-36 sm:w-36"
        />
        <div className="grid overflow-hidden rounded-md bg-white shadow-postal md:grid-cols-[1fr_2px_1fr]">
          <div className="flex flex-col gap-5 bg-bubblegum px-6 pb-10 pt-14 sm:px-12 sm:py-14">
            <h1 className="max-w-[12ch] font-display text-[clamp(2.75rem,7vw,4.5rem)] leading-[0.98] tracking-[-0.03em] motion-safe:animate-rise">
              {t("title")}
            </h1>
            {intro.map((paragraph) => (
              <p key={paragraph} className="max-w-[28rem] text-lg leading-relaxed sm:text-[1.1875rem]">
                {paragraph}
              </p>
            ))}
            <LetterAndPlane className="mt-auto hidden h-24 w-40 self-end md:block" />
          </div>
          <div
            className="hidden bg-[repeating-linear-gradient(to_bottom,rgba(45,21,48,0.3)_0_8px,transparent_8px_16px)] md:block"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-8 px-6 py-10 sm:px-12 sm:py-14">
            <QuickSignupForm namespace="lista" source="lista" page="https://lovemodepod.com/lista" withPhone />
            <Link
              href="/episodes"
              className="mt-auto inline-flex items-center gap-2 self-start text-[1.0625rem] font-semibold underline-offset-[5px] hover:underline"
            >
              {t("listen")}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
