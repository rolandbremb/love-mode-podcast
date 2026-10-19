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

  return (
    <footer className="border-t border-brand-100 bg-brand-950 text-brand-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-white">Love Mode</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brand-300">{t("tagline")}</p>
          </div>

          <div>
            <h3 className="font-semibold text-white">{t("podcast")}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">{t("about")}</Link></li>
              <li><Link href="/episodes" className="hover:text-white">{t("allEpisodes")}</Link></li>
              <li><Link href="/apply" className="hover:text-white">{t("beAGuest")}</Link></li>
              <li><Link href="/collaborate" className="hover:text-white">{t("collaborate")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">{t("resources")}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {showShop && <li><Link href="/shop" className="hover:text-white">{t("shop")}</Link></li>}
              {showProducts && <li><Link href="/products" className="hover:text-white">{t("digitalProducts")}</Link></li>}
              {showCourses && <li><Link href="/courses" className="hover:text-white">{t("courses")}</Link></li>}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">{t("connect")}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {socialLinks.map((link) => (
                <li key={link.platform}>
                  <a
                    href={link.url || "#"}
                    target={link.url && link.url !== "#" ? "_blank" : undefined}
                    rel={link.url && link.url !== "#" ? "noopener noreferrer" : undefined}
                    className="hover:text-white"
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-800 pt-6 text-center text-xs text-brand-400">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
