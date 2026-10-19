import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
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
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            {t("title")}
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
          <p className="mt-4 text-lg text-stone-600">{t("subtitle")}</p>
          <p className="mt-2 text-xs text-stone-400">{t("affiliateNote")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((item) => (
            <a
              key={item._id}
              href={item.link || "#"}
              target={item.link && item.link !== "#" ? "_blank" : undefined}
              rel={item.link && item.link !== "#" ? "noopener noreferrer" : undefined}
              className="card group text-center"
            >
              <div className="text-4xl">{item.emoji}</div>
              <h3 className="mt-4 font-serif text-lg font-bold text-stone-900 group-hover:text-brand-600">{item.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{item.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-brand-600">{t("browseCollection")}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
