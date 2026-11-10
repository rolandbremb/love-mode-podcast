"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { Honeypot, useFormSubmit } from "./FormParts";
import { rememberSignup } from "./QuickSignupForm";

// One value per interest tag in Kit, in the same order as the "newsOptions" text
const INTEREST_VALUES = ["news", "community", "divorce"];

export default function NewsletterForm() {
  const t = useTranslations("home");
  const tForms = useTranslations("forms");
  const { state, pending, onSubmit } = useFormSubmit(subscribeToNewsletter);
  const successRef = useRef<HTMLHeadingElement>(null);
  const options = t.raw("newsOptions") as string[];
  const error = state?.status === "error" ? state.reason : null;

  useEffect(() => {
    if (state?.status !== "success") return;
    rememberSignup();
    successRef.current?.focus();
  }, [state]);

  if (state?.status === "success") {
    return (
      <div className="flex flex-col gap-3 rounded-md bg-shell p-8" aria-live="polite">
        <h3 ref={successRef} tabIndex={-1} className="font-display text-[2rem] leading-tight focus:outline-none">
          {t("newsSuccessTitle")}
        </h3>
        <p className="text-[1.0625rem] leading-relaxed text-mauve">{t("newsSuccessBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-4" noValidate>
      <Honeypot />
      <input type="hidden" name="page" value="https://lovemodepod.com" />
      <label className="flex flex-col gap-1.5 text-[0.9375rem] font-semibold">
        {t("newsName")}
        <input type="text" name="name" autoComplete="given-name" maxLength={80} className="field border-plum bg-shell" />
      </label>
      <label className="flex flex-col gap-1.5 text-[0.9375rem] font-semibold">
        {t("newsEmail")}
        <input type="email" name="email" autoComplete="email" required maxLength={254} className="field border-plum bg-shell" />
      </label>
      <fieldset className="mt-1 flex flex-wrap gap-2">
        <legend className="mb-2 text-[0.9375rem] font-semibold">{t("newsInterests")}</legend>
        {options.map((option, index) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-plum px-3.5 py-2 text-[0.9375rem] font-medium has-[:checked]:bg-plum has-[:checked]:text-shell"
          >
            <input
              type="checkbox"
              name="interests"
              value={INTEREST_VALUES[index] ?? ""}
              defaultChecked={index === 0}
              className="h-4 w-4 accent-tangerine"
            />
            {option}
          </label>
        ))}
      </fieldset>
      {error && (
        <p role="alert" className="rounded-2xl bg-shell px-4 py-3 text-[0.9375rem] font-semibold">
          {error === "invalid" ? tForms("errorInvalid") : tForms("errorFailed")}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-1.5 self-start disabled:cursor-wait disabled:opacity-70">
        {pending ? tForms("sending") : t("newsCta")}
      </button>
      <p className="text-sm leading-relaxed">
        {t("newsFinePrint")}{" "}
        <Link href="/privacy" className="font-semibold underline underline-offset-2">
          {t("newsPrivacy")}
        </Link>
      </p>
    </form>
  );
}
