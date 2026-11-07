import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/postal/PageHeader";
import { redirect } from "@/i18n/navigation";
import { getProducts, getSiteSettings } from "@/sanity/client";

export const revalidate = 3600;

const defaultProducts = [
  { _id: "1", title: "The Love Mode Guide to Modern Dating", description: "A no-BS guide to navigating the modern dating landscape.", price: "$19", badge: "Ebook", link: "#" },
  { _id: "2", title: "Red Flags vs. Green Flags Workbook", description: "An interactive workbook to help you identify patterns and set boundaries.", price: "$14", badge: "Workbook", link: "#" },
  { _id: "3", title: "The Self-Love Starter Kit", description: "30 days of prompts, exercises, and reflections to build a stronger relationship with yourself.", price: "$12", badge: "Digital Kit", link: "#" },
];

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: preview } = await draftMode();
  const settings = await getSiteSettings({ preview, locale });

  if ((settings?.showProducts ?? true) === false) {
    redirect({ href: "/", locale });
  }

  const [t, cmsProducts] = await Promise.all([
    getTranslations({ locale, namespace: "products" }),
    getProducts({ preview, locale }),
  ]);
  const products = cmsProducts.length > 0 ? cmsProducts : defaultProducts;

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="page-container pb-24 lg:pb-32">

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="flex flex-col rounded-md bg-white p-7 shadow-postal">
              <span className="mb-3 inline-block w-fit rounded-full bg-bubblegum px-3 py-1 text-sm font-semibold">
                {product.badge}
              </span>
              <h3 className="font-display text-[1.75rem] leading-tight">{product.title}</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-mauve">{product.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-display text-3xl">{product.price}</span>
                <a
                  href={product.link || "#"}
                  target={product.link && product.link !== "#" ? "_blank" : undefined}
                  rel={product.link && product.link !== "#" ? "noopener noreferrer" : undefined}
                  className="btn-primary !py-2.5"
                >
                  {t("getItNow")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
