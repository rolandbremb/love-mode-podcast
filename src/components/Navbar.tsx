"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

type NavKey = "about" | "episodes" | "beAGuest" | "collaborate" | "shop" | "products" | "courses";

const allNavItems: { key: NavKey; href: string }[] = [
  { key: "about", href: "/about" },
  { key: "episodes", href: "/episodes" },
  { key: "beAGuest", href: "/apply" },
  { key: "collaborate", href: "/collaborate" },
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

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-serif text-xl font-bold text-stone-900">Love Mode</span>
          <span className="hidden text-[0.8rem] text-brand-400 sm:inline" style={{ fontFamily: "var(--font-dancing), cursive" }}>
            Conversaciones de amor, dating y relaciones
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-brand-600"
            >
              {t(key)}
            </Link>
          ))}
          <a href="#support" className="btn-accent !px-4 !py-2 !text-xs">
            {t("support")}
          </a>
          <button
            onClick={switchLocale}
            className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600 transition-colors hover:border-brand-400 hover:text-brand-600"
            aria-label={`Switch to ${otherLocale === "en" ? "English" : "Spanish"}`}
          >
            {otherLocale.toUpperCase()}
          </button>
        </div>

        {/* Mobile: locale toggle + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={switchLocale}
            className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600"
          >
            {otherLocale.toUpperCase()}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6 text-stone-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={`overflow-hidden border-t border-brand-100 transition-all duration-300 ease-in-out md:hidden ${
          mobileOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 border-t-transparent opacity-0"
        }`}
      >
        <div className="theme-surface space-y-1 px-4 py-4">
          {navItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-brand-50 hover:text-brand-600"
            >
              {t(key)}
            </Link>
          ))}
          <a
            href="#support"
            className="btn-accent mt-2 block w-full text-center !text-xs"
            onClick={() => setMobileOpen(false)}
          >
            {t("support")}
          </a>
        </div>
      </div>
    </nav>
  );
}
