"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Envelope } from "@/components/postal/Doodles";
import QuickSignupForm, { SIGNED_UP_KEY } from "@/components/forms/QuickSignupForm";

/* "¿Seguimos en contacto?": a small newsletter card that appears once someone
   has explored a bit (a second page, or most of one, and at least 30 seconds
   on the site). It shows once, then stays away for 30 days, and never appears
   for anyone who has already signed up. */

const SEEN_KEY = "lm_popup_seen";
const PAGES_KEY = "lm_pages";
const SESSION_START_KEY = "lm_session_start";
const MIN_TIME_MS = 30_000;
const SCROLL_DEPTH = 0.6;
const QUIET_DAYS = 30;

// Pages that already ask for something, or where a pop-up would get in the way
const QUIET_PATHS = ["/lista", "/confirmed", "/privacy", "/apply", "/collaborate"];

function read(storage: () => Storage, key: string) {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function write(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch {
    // Storage blocked: the pop-up just won't remember anything
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

function recentlySeen() {
  const seen = Number(read(local, SEEN_KEY));
  return seen > 0 && Date.now() - seen < QUIET_DAYS * 24 * 60 * 60 * 1000;
}

// Distinct pages visited this browsing session, counting the current one
function countPage(pathname: string) {
  let pages: string[] = [];
  try {
    pages = JSON.parse(read(session, PAGES_KEY) ?? "[]");
  } catch {
    // Unreadable value: start counting again
  }
  if (!pages.includes(pathname)) pages.push(pathname);
  write(session, PAGES_KEY, JSON.stringify(pages.slice(-20)));
  return pages.length;
}

function sessionStart() {
  const stored = Number(read(session, SESSION_START_KEY));
  if (stored > 0) return stored;
  const now = Date.now();
  write(session, SESSION_START_KEY, String(now));
  return now;
}

export default function NewsletterPopup() {
  const t = useTranslations("popup");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const pages = countPage(pathname);
    if (open || QUIET_PATHS.some((path) => pathname.startsWith(path))) return;
    if (read(local, SIGNED_UP_KEY) || recentlySeen()) return;

    const start = sessionStart();
    let explored = pages >= 2;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const show = () => {
      if (!explored || Date.now() - start < MIN_TIME_MS) return;
      // Check again in case another tab signed up or showed it meanwhile
      if (read(local, SIGNED_UP_KEY) || recentlySeen()) return;
      write(local, SEEN_KEY, String(Date.now()));
      setOpen(true);
      cleanup();
    };

    const onScroll = () => {
      const { scrollY, innerHeight } = window;
      const height = document.documentElement.scrollHeight;
      if (height > innerHeight && (scrollY + innerHeight) / height >= SCROLL_DEPTH) {
        explored = true;
        show();
      }
    };

    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    }

    timer = setTimeout(show, Math.max(0, start + MIN_TIME_MS - Date.now()));
    if (!explored) window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, [pathname, open]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 z-40 max-h-[88dvh] overflow-y-auto rounded-t-[1.75rem] bg-white shadow-postal motion-safe:animate-rise sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem] sm:rounded-md"
    >
      <div className="airmail" aria-hidden="true" />
      <button
        type="button"
        onClick={close}
        aria-label={t("close")}
        className="absolute right-2 top-4 flex sm:right-3 sm:top-5 h-10 w-10 items-center justify-center rounded-full text-plum transition-colors hover:bg-shell"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="flex flex-col gap-3 px-5 pb-6 pt-5 sm:gap-4 sm:px-6 sm:pb-7 sm:pt-6">
        <Envelope className="hidden h-9 w-12 sm:block" />
        <h2 id={titleId} className="pr-10 font-display text-[1.625rem] leading-[1.05] tracking-[-0.01em] sm:pr-8 sm:text-[1.875rem]">
          {t("title")}
        </h2>
        <p className="text-base leading-relaxed text-mauve sm:text-[1.0625rem]">{t("body")}</p>
        <QuickSignupForm namespace="popup" source="popup" page={`https://lovemodepod.com${pathname}`} compact />
      </div>
    </div>
  );
}
