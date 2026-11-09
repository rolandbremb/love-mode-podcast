"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { Honeypot, useFormSubmit } from "./FormParts";

// Remembered so the pop-up never asks someone who already signed up
export const SIGNED_UP_KEY = "lm_signed_up";

export function rememberSignup() {
  try {
    localStorage.setItem(SIGNED_UP_KEY, "1");
  } catch {
    // Private browsing: the pop-up may simply ask again later
  }
}

/* Name and email (plus an optional WhatsApp number) for the pop-up and the
   /lista page. Signups go to Kit tagged with where they came from. */
export default function QuickSignupForm({
  namespace,
  source,
  withPhone = false,
  page = "https://lovemodepod.com",
  compact = false,
  onSuccess,
}: {
  namespace: "popup" | "lista";
  source: "popup" | "lista";
  withPhone?: boolean;
  /** Page the signup happened on, recorded in Kit */
  page?: string;
  /** Tighter spacing on phones, for the pop-up */
  compact?: boolean;
  onSuccess?: () => void;
}) {
  const t = useTranslations(namespace);
  const tForms = useTranslations("forms");
  const { state, pending, onSubmit } = useFormSubmit(subscribeToNewsletter);
  const [phone, setPhone] = useState("");
  const successRef = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const error = state?.status === "error" ? state.reason : null;
  const fieldClass = compact ? "field max-sm:py-2.5" : "field";

  useEffect(() => {
    if (state?.status !== "success") return;
    rememberSignup();
    successRef.current?.focus();
    onSuccess?.();
  }, [state, onSuccess]);

  if (state?.status === "success") {
    return (
      <div className="flex flex-col gap-2" aria-live="polite">
        <p ref={successRef} tabIndex={-1} className="font-display text-[1.75rem] leading-tight focus:outline-none">
          {t("successTitle")}
        </p>
        <p className="text-[1.0625rem] leading-relaxed text-mauve">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`relative flex flex-col ${compact ? "gap-2.5 sm:gap-3.5" : "gap-3.5"}`}>
      <Honeypot />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="interests" value="news" />
      <label className="flex flex-col gap-1.5 text-[0.9375rem] font-semibold">
        {t("name")}
        <input type="text" name="name" autoComplete="given-name" maxLength={80} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-[0.9375rem] font-semibold">
        {t("email")}
        <input type="email" name="email" autoComplete="email" required maxLength={254} className={fieldClass} />
      </label>
      {withPhone && (
        <>
          <label className="flex flex-col gap-1.5 text-[0.9375rem] font-semibold">
            {t("phone")}
            <input
              type="tel"
              name="whatsapp"
              autoComplete="tel"
              inputMode="tel"
              maxLength={40}
              pattern="\+?[0-9][0-9\s().\-]{6,19}"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              aria-describedby={`${id}-phone-hint`}
              className="field"
            />
            <span id={`${id}-phone-hint`} className="text-sm font-normal text-mauve">
              {t("phoneHint")}
            </span>
          </label>
          {phone.trim() && (
            <label className="flex items-start gap-2.5 text-[0.9375rem]">
              <input type="checkbox" name="whatsapp_consent" value="yes" required className="mt-1 h-4 w-4 shrink-0 accent-plum" />
              {t("consent")}
            </label>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="rounded-2xl bg-peach px-4 py-3 text-[0.9375rem] font-semibold">
          {error === "invalid" ? tForms("errorInvalid") : tForms("errorFailed")}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-1 self-start disabled:cursor-wait disabled:opacity-70">
        {pending ? tForms("sending") : t("cta")}
      </button>
      <p className="text-sm leading-relaxed text-mauve">
        {t("finePrint")}{" "}
        <Link href="/privacy" className="font-semibold text-plum underline underline-offset-2">
          {t("privacy")}
        </Link>
      </p>
    </form>
  );
}
