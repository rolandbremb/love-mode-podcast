import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/postal/PageHeader";
import { redirect } from "@/i18n/navigation";
import { getShopCollections, getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

const defaultCollections = [
  { _id: "1", title: "Relationship Books", description: "Our favorite reads on love, attachment, and communication.", emoji: "\uD83D\uDCDA", link: "#" },
  { _id: "2", title: "Self-Care Essentials", description: "Products we love for looking and feeling your best.", emoji: "\u2728", link: "#" },
  { _id: "3", title: "Date Night Picks", description: "Everything you need for an unforgettable date night.", emoji: "\uD83C\uDF77", link: "#" },
  { _id: "4", title: "Journal & Reflection", description: "Journals and prompts for self-discovery and growth.", emoji: "\uD83D\uDCDD", link: "#" },
];

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: preview } = await draftMode();
  const settings = await getSiteSettings({ preview, locale });

  if ((settings?.showShop ?? true) === false) {
    redirect({ href: "/", locale });
  }

  const [t, cmsCollections] = await Promise.all([
    getTranslations({ locale, namespace: "shop" }),
    getShopCollections({ preview, locale }),
  ]);
  const collections = cmsCollections.length > 0 ? cmsCollections : defaultCollections;

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="page-container pb-24 lg:pb-32">
        <p className="-mt-6 mb-10 text-[0.9375rem] text-mauve">{t("affiliateNote")}</p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((item) => (
            <a
              key={item._id}
              href={item.link || "#"}
              target={item.link && item.link !== "#" ? "_blank" : undefined}
              rel={item.link && item.link !== "#" ? "noopener noreferrer" : undefined}
              className="flex flex-col items-center rounded-md bg-white p-7 text-center shadow-postal"
            >
              <div className="text-4xl">{item.emoji}</div>
              <h3 className="mt-4 font-display text-2xl leading-tight">{item.title}</h3>
              <p className="mt-2 text-base text-mauve">{item.description}</p>
              <span className="mt-4 inline-block text-base font-semibold underline underline-offset-4">{t("browseCollection")}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
