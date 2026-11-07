"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

type NavKey = "about" | "episodes" | "beAGuest" | "shop" | "products" | "courses";

const allNavItems: { key: NavKey; href: string }[] = [
  { key: "episodes", href: "/episodes" },
  { key: "about", href: "/about" },
  { key: "beAGuest", href: "/apply" },
  { key: "shop", href: "/shop" },
  { key: "products", href: "/products" },
  { key: "courses", href: "/courses" },
];

interface NavbarProps {
  showShop?: boolean;
  showProducts?: boolean;
  showCourses?: boolean;
}

export default function Navbar({ showShop = true, showProducts = true, showCourses = true }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = allNavItems.filter(({ key }) => {
    if (key === "shop") return showShop;
    if (key === "products") return showProducts;
    if (key === "courses") return showCourses;
    return true;
  });

  const otherLocale = locale === "en" ? "es" : "en";
  const switchLabel = otherLocale === "en" ? "Switch to English" : "Cambiar a español";

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <nav className="sticky top-0 z-50 bg-shell/90 backdrop-blur-md">
      <div className="page-container flex h-[5.5rem] items-center justify-between">
        <Link href="/" className="font-display text-[1.75rem] leading-none tracking-[-0.01em] sm:text-3xl">
          Love Mode
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-9 md:flex">
          {navItems.map(({ key, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap text-base font-medium underline-offset-[6px] hover:underline ${
                  active ? "underline decoration-tangerine decoration-2" : ""
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
          <Link href="/collaborate" className="btn-outline !px-5 !py-2.5 whitespace-nowrap">
            {t("workWithUs")}
          </Link>
          <button
            type="button"
            onClick={switchLocale}
            aria-label={switchLabel}
            className="-ml-3 rounded-full px-2 py-1 text-sm font-semibold text-mauve hover:text-plum"
          >
            {otherLocale.toUpperCase()}
          </button>
        </div>

        {/* Mobile: locale toggle + menu */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={switchLocale}
            aria-label={switchLabel}
            className="h-12 rounded-full px-3 text-sm font-semibold text-mauve"
          >
            {otherLocale.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("menu")}
            aria-expanded={mobileOpen}
            className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-plum"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" aria-hidden="true">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="page-container flex flex-col gap-1 pb-6">
          {navItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="rounded-2xl py-3 font-display text-3xl"
            >
              {t(key)}
            </Link>
          ))}
          <Link href="/collaborate" onClick={() => setMobileOpen(false)} className="btn-primary mt-4">
            {t("workWithUs")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
