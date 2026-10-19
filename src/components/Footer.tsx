import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteSettings } from "@/sanity/client";

const defaultSocialLinks = [
  { platform: "Instagram", url: "#" },
  { platform: "TikTok", url: "#" },
  { platform: "YouTube", url: "#" },
  { platform: "Spotify", url: "#" },
];

interface FooterProps {
  locale: string;
  showShop?: boolean;
  showProducts?: boolean;
  showCourses?: boolean;
}

export default async function Footer({
  locale,
  showShop = true,
  showProducts = true,
  showCourses = true,
}: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const settings = await getSiteSettings({ locale });
  const socialLinks =
    settings?.socialLinks && settings.socialLinks.length > 0
      ? settings.socialLinks
      : defaultSocialLinks;

  const podcastLinks = [
    { href: "/about", label: t("about") },
    { href: "/episodes", label: t("allEpisodes") },
    { href: "/apply", label: t("beAGuest") },
    { href: "/collaborate", label: t("collaborate") },
  ];
  const resourceLinks = [
    showShop && { href: "/shop", label: t("shop") },
    showProducts && { href: "/products", label: t("digitalProducts") },
    showCourses && { href: "/courses", label: t("courses") },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="relative overflow-hidden border-t-2 border-ink bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.1fr)]">
          <div>
            <p className="max-w-sm -rotate-1 font-hand text-3xl font-medium leading-tight text-brand-300">
              {t("tagline")}
            </p>
            <h3 className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-cream/50">
              {t("followUs")}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {socialLinks.map((link) => {
                const external = link.url && link.url !== "#";
                return (
                  <a
                    key={link.platform}
                    href={link.url || "#"}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="rounded-full border-2 border-cream/30 px-4 py-1.5 text-sm font-semibold transition-colors hover:border-butter hover:bg-butter hover:text-ink"
                  >
                    {link.platform}
                  </a>
                );
              })}
            </div>
          </div>

          <nav aria-label={t("podcast")}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cream/50">{t("podcast")}</h3>
            <ul className="mt-4 space-y-2">
              {podcastLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="font-display text-xl font-bold transition-colors hover:text-brand-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {resourceLinks.length > 0 ? (
            <nav aria-label={t("resources")}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cream/50">{t("resources")}</h3>
              <ul className="mt-4 space-y-2">
                {resourceLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="font-display text-xl font-bold transition-colors hover:text-brand-300">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="hidden lg:block" />
          )}

          <div className="self-start rounded-3xl border-2 border-cream/20 p-6 md:col-span-2 lg:col-span-1">
            <p className="font-display text-2xl font-extrabold lowercase leading-tight tracking-tight">
              {t("brandsTitle")}
            </p>
            <Link href="/collaborate" className="btn-primary mt-5">
              {t("workWithUs")}
            </Link>
          </div>
        </div>

        <p className="mt-14 border-t border-cream/15 pt-6 text-xs text-cream/50">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>

      <p
        className="-mb-[0.18em] select-none whitespace-nowrap text-center font-display text-[23vw] font-extrabold lowercase leading-none tracking-[-0.06em] text-brand-600 xl:text-[18rem]"
        aria-hidden="true"
      >
        love mode
      </p>
    </footer>
  );
}
