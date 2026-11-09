import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ArrowLink from "@/components/postal/ArrowLink";
import Postmark, { CancelWaves } from "@/components/postal/Postmark";

// Kit sends people here after they click the button in the confirmation email
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "confirmed" });
  return { title: t("title"), robots: { index: false, follow: true } };
}

export default async function ConfirmedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "confirmed" });

  return (
    <section className="page-container flex justify-center pb-24 pt-10 md:pb-32 md:pt-16">
      <div className="relative w-full max-w-[40rem]">
        <Postmark
          id="confirmed-postmark"
          text={t("postmark")}
          className="absolute -top-12 right-2 z-10 h-32 w-32 rotate-12 sm:-right-12 sm:h-40 sm:w-40"
        />
        <CancelWaves lines={3} className="absolute -right-56 top-4 hidden h-28 w-56 lg:block" />
        <div className="stamp">
          <div className="flex flex-col items-start gap-6 bg-bubblegum px-6 py-12 sm:px-12 sm:py-16">
            <h1 className="max-w-[12ch] font-display text-[clamp(3rem,9vw,5.25rem)] leading-[0.95] tracking-[-0.03em] motion-safe:animate-rise">
              {t("title")}
            </h1>
            <p className="max-w-[30rem] text-lg leading-relaxed sm:text-[1.1875rem]">{t("body")}</p>
            <p className="font-hand text-[1.375rem]">{t("note")}</p>
            <div className="mt-2 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
              <ArrowLink href="/episodes" className="max-w-full !whitespace-normal text-left sm:!whitespace-nowrap">{t("cta")}</ArrowLink>
              <Link href="/" className="text-[1.0625rem] font-semibold underline underline-offset-[5px]">
                {t("home")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
