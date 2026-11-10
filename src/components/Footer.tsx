import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { platformLabel } from "@/lib/format";
import { getSiteSettings } from "@/sanity/client";

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

  const listenLinks = (settings?.platformLinks ?? []).map(({ platform, url }) => ({
    label: platformLabel(platform),
    url,
  }));
  const socialLinks = (settings?.socialLinks ?? []).map(({ platform, url }) => ({ label: platform, url }));
  const outsideLinks = [...listenLinks, ...socialLinks].filter(
    (link, index, all) => link.url && all.findIndex((other) => other.label === link.label) === index
  );

  const siteLinks = [
    { href: "/episodes", label: t("allEpisodes") },
    { href: "/about", label: t("about") },
    { href: "/apply", label: t("beAGuest") },
    { href: "/collaborate", label: t("collaborate") },
    showShop && { href: "/shop", label: t("shop") },
    showProducts && { href: "/products", label: t("digitalProducts") },
    showCourses && { href: "/courses", label: t("courses") },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="bg-plum text-shell">
      <div className="page-container flex flex-col gap-14 pb-12 pt-20 md:pt-24">
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <p className="font-display text-[clamp(4rem,14vw,8rem)] leading-[0.85] tracking-[-0.035em] text-bubblegum">
              Love Mode
            </p>
            <p className="font-hand text-[1.375rem]">{t("tagline")}</p>
          </div>
          <nav aria-label="Love Mode" className="flex flex-col gap-3 text-[1.0625rem] font-medium md:items-end">
            {siteLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="underline-offset-[6px] hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-shell/20 pt-6 text-[0.9375rem] text-shell/75 md:flex-row md:justify-between">
          {outsideLinks.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {outsideLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-shell">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-shell">{t("privacy")}</Link>
            <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </div>
      <div className="airmail [--airmail-gap:#2d1530]" aria-hidden="true" />
    </footer>
  );
}
