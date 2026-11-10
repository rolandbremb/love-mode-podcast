import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import ListenerReviews from "@/components/ListenerReviews";
import BrandInquiryForm from "@/components/forms/BrandInquiryForm";
import { Heart } from "@/components/postal/Doodles";
import PageHeader from "@/components/postal/PageHeader";
import { formatStat } from "@/lib/format";
import { getAllEpisodes, getYouTubeSubscribers } from "@/lib/rss";
import { withPreviewSample } from "@/lib/socialProof";
import { getSiteSettings, getSocialProof } from "@/sanity/client";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("brandsTitle");
  const description = t("brandsDescription");
  return pageMetadata(parent, { title, description, locale, path: "/collaborate" });
}

export const revalidate = 3600;

const statFields = ["bg-peach", "bg-bubblegum"];

export default async function CollaboratePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collaborate" });
  const tHome = await getTranslations({ locale, namespace: "home" });

  const settings = await getSiteSettings({ locale });
  const [episodes, subscribers, savedProof] = await Promise.all([
    getAllEpisodes(settings?.podcastRssUrl),
    getYouTubeSubscribers(settings?.podcastRssUrl),
    getSocialProof({ locale }),
  ]);
  const { proof, usesSample } = withPreviewSample(savedProof);

  // Numbers that update by themselves, then the audience numbers from the Studio
  const totalViews = episodes.reduce((sum, episode) => sum + (episode.views || 0), 0);
  const stats = [
    episodes.length > 0 && { value: String(episodes.length), label: tHome("statEpisodes") },
    totalViews > 0 && { value: formatStat(totalViews), label: tHome("statViews") },
    subscribers > 0 && { value: formatStat(subscribers), label: tHome("statSubscribers") },
    ...proof.audienceStats,
  ].filter(Boolean) as { value: string; label: string }[];

  const offers = [t("podcastSponsorship"), t("brandPartnership"), t("contentCollab"), t("affiliatePartnership")];

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} note={t("label")} />

      {usesSample && (
        <p className="page-container -mt-4 mb-10">
          <span className="inline-block rounded-full bg-plum px-4 py-1.5 text-sm font-semibold text-shell">
            Preview: parts marked “ejemplo” are samples until Brands &amp; Reviews is filled in the Studio
          </span>
        </p>
      )}

      {/* ===== THE NUMBERS, as stamps ===== */}
      {stats.length > 0 && (
        <section className="page-container pb-16 lg:pb-20" aria-label={t("statsLabel")}>
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map(({ value, label }, index) => (
              <div key={`${label}-${index}`} className="stamp stamp-sm">
                <div className={`flex h-full flex-col-reverse justify-end gap-1.5 p-4 ${statFields[index % statFields.length]}`}>
                  <dt className="text-sm leading-snug text-plum/80">{label}</dt>
                  <dd className="font-display text-[2.25rem] leading-none">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ===== BRANDS THAT HAVE WORKED WITH LOVE MODE ===== */}
      {proof.partners.length > 0 && (
        <section className="page-container flex flex-col gap-6 pb-16 lg:pb-20">
          <h2 className="text-[1.0625rem] font-semibold">{t("partnersTitle")}</h2>
          <ul className="flex flex-wrap items-center gap-x-12 gap-y-6">
            {proof.partners.map((partner) => {
              const mark = partner.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.logo} alt={partner.name} className="h-10 w-auto max-w-[10rem] object-contain" />
              ) : (
                <span className="font-display text-[1.75rem]">{partner.name}</span>
              );
              return (
                <li key={partner.name}>
                  {partner.url ? (
                    <a href={partner.url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">
                      {mark}
                    </a>
                  ) : (
                    mark
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ===== WHY LOVE MODE (a postcard) AND THE FORM ===== */}
      <div className="page-container grid items-start gap-10 pb-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:pb-32">
        <aside className="relative flex flex-col gap-6 overflow-hidden rounded-md bg-white px-8 pb-10 pt-12 shadow-postal sm:px-10 lg:sticky lg:top-28">
          <span className="airmail absolute inset-x-0 top-0 [--airmail-gap:#ffffff]" aria-hidden="true" />
          <h2 className="font-display text-[2.25rem] leading-tight">{t("sideTitle")}</h2>
          <p className="text-[1.0625rem] leading-relaxed text-mauve">{tHome("brandsDescription")}</p>
          <div className="flex flex-col gap-3">
            <p className="font-semibold">{t("offersTitle")}</p>
            <ul className="flex flex-col gap-2.5">
              {offers.map((offer) => (
                <li key={offer} className="flex gap-3 text-[1.0625rem]">
                  <Heart className="mt-1 h-4 w-5 shrink-0" />
                  {offer}
                </li>
              ))}
            </ul>
          </div>
          {proof.brandQuote && (
            <figure className="flex flex-col gap-3 border-t-[1.5px] border-plum/10 pt-6">
              <blockquote className="font-display text-[1.375rem] leading-[1.35]">“{proof.brandQuote.quote}”</blockquote>
              <figcaption className="text-[0.9375rem] text-mauve">
                <span className="font-semibold text-plum">{proof.brandQuote.name}</span>
                {proof.brandQuote.role && <span>, {proof.brandQuote.role}</span>}
              </figcaption>
            </figure>
          )}
          {proof.mediaKitUrl && (
            <a href={proof.mediaKitUrl} target="_blank" rel="noopener noreferrer" className="btn-outline self-start">
              {t("mediaKit")}
            </a>
          )}
        </aside>

        <BrandInquiryForm />
      </div>

      <ListenerReviews title={tHome("reviewsTitle")} reviews={proof.reviews} />
    </div>
  );
}
