"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

type NavKey = "about" | "episodes" | "beAGuest" | "shop" | "products" | "courses";

const allNavItems: { key: NavKey; href: string }[] = [
  { key: "about", href: "/about" },
  { key: "episodes", href: "/episodes" },
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

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-ink bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="whitespace-nowrap font-display text-2xl font-extrabold lowercase leading-none tracking-tight text-brand-700 transition-colors group-hover:text-brand-500">
            Love Mode
          </span>
          <span className="hidden -rotate-2 font-hand text-xl font-medium leading-none text-brand-500 xl:inline">
            Conversaciones de amor, dating y relaciones
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(({ key, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={key}
                href={href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-100 text-brand-700"
                    : "text-ink/75 hover:bg-brand-100 hover:text-brand-700"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
          <Link href="/collaborate" className="btn-primary ml-3 whitespace-nowrap !px-5 !py-2 !text-sm">
            {t("workWithUs")}
          </Link>
          <button
            onClick={switchLocale}
            className="ml-2 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-butter"
            aria-label={`Switch to ${otherLocale === "en" ? "English" : "Spanish"}`}
          >
            {otherLocale.toUpperCase()}
          </button>
        </div>

        {/* Mobile: locale toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={switchLocale}
            className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold text-ink"
            aria-label={`Switch to ${otherLocale === "en" ? "English" : "Spanish"}`}
          >
            {otherLocale.toUpperCase()}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("menu")}
            aria-expanded={mobileOpen}
            className="rounded-full border-2 border-ink bg-butter p-1.5 text-ink"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
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
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          mobileOpen ? "max-h-[32rem] border-t-2 border-ink opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 bg-cream px-4 py-4">
          {navItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl px-4 py-3 font-display text-xl font-bold text-ink hover:bg-brand-100 hover:text-brand-700"
            >
              {t(key)}
            </Link>
          ))}
          <Link
            href="/collaborate"
            onClick={() => setMobileOpen(false)}
            className="btn-primary mt-3 w-full"
          >
            {t("workWithUs")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
