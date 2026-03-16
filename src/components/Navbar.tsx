"use client";

import Link from "next/link";
import { useState } from "react";

const navigation = [
  { name: "Episodes", href: "/episodes" },
  { name: "Be a Guest", href: "/apply" },
  { name: "Collaborate", href: "/collaborate" },
  { name: "Shop", href: "/shop" },
  { name: "Products", href: "/products" },
  { name: "Courses", href: "/courses" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">&#10084;&#65039;</span>
          <span className="font-serif text-xl font-bold text-brand-700">
            Love Mode
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-brand-600"
            >
              {item.name}
            </Link>
          ))}
          <a
            href="#support"
            className="btn-gold !px-4 !py-2 !text-xs"
          >
            Support the Show
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 text-stone-700"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 9h16.5m-16.5 6.75h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-brand-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-brand-50 hover:text-brand-600"
              >
                {item.name}
              </Link>
            ))}
            <a
              href="#support"
              className="btn-gold mt-2 block w-full text-center !text-xs"
              onClick={() => setMobileOpen(false)}
            >
              Support the Show
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
