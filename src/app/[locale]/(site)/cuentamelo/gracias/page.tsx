import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ArrowLink from "@/components/postal/ArrowLink";
import { getStripe } from "@/lib/stripe";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailSession" });
  return { title: t("thanksTitle"), robots: { index: false, follow: false } };
}

// Where Stripe sends people after paying for "Cuéntamelo por email"
export default async function EmailSessionThanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id: sessionId } = await searchParams;
  const t = await getTranslations({ locale, namespace: "emailSession" });

  // Ask Stripe whether the payment went through, so we never thank an unpaid visit
  let paidEmail: string | null = null;
  const stripe = getStripe();
  if (stripe && sessionId?.startsWith("cs_")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") paidEmail = session.customer_details?.email ?? session.customer_email ?? "";
    } catch {
      // Unknown session: show the "confirming" message
    }
  }

  return (
    <section className="page-container flex justify-center pb-24 pt-10 md:pb-32 md:pt-16">
      <div className="w-full max-w-[40rem] rounded-md bg-white px-6 py-12 text-center shadow-postal sm:px-12 sm:py-16">
        <h1 className="font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1] tracking-[-0.02em] motion-safe:animate-rise">
          {paidEmail !== null ? t("thanksTitle") : t("processingTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-mauve">
          {paidEmail !== null ? t("thanksBody", { email: paidEmail }) : t("processingBody")}
        </p>
        <div className="mt-10 flex justify-center">
          <ArrowLink href="/episodes">{t("thanksCta")}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
