"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { startEmailSession, type CheckoutState } from "@/lib/emailSessionActions";
import { EMAIL_SESSION_MAX_WORDS, countWords } from "@/lib/emailSession";
import { Honeypot, labelClass } from "./FormParts";

// The story form for "Cuéntamelo por email"; sending it opens Stripe Checkout
export default function EmailSessionForm() {
  const t = useTranslations("emailSession");
  const tForms = useTranslations("forms");
  const locale = useLocale();
  const [words, setWords] = useState(0);
  const [state, setState] = useState<CheckoutState | null>(null);
  const [pending, startTransition] = useTransition();
  const tooLong = words > EMAIL_SESSION_MAX_WORDS;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tooLong) return;
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const result = await startEmailSession(formData);
        setState(result);
        if (result.status === "redirect") window.location.assign(result.url);
      } catch {
        setState({ status: "error", reason: "failed" });
      }
    });
  }

  const redirecting = state?.status === "redirect";
  const error = state?.status === "error" ? state.reason : null;

  return (
    <form onSubmit={onSubmit} className="relative space-y-6 rounded-md bg-white p-6 shadow-postal sm:p-8 md:p-10">
      <Honeypot />
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {t("name")} <span className="text-mauve">*</span>
          </label>
          <input type="text" id="name" name="name" required maxLength={120} autoComplete="given-name" className="field" />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {t("email")} <span className="text-mauve">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            aria-describedby="email-hint"
            className="field"
            placeholder={t("emailPlaceholder")}
          />
          <p id="email-hint" className="mt-2 text-sm text-mauve">{t("emailHint")}</p>
        </div>
      </div>

      <div>
        <label htmlFor="story" className={labelClass}>
          {t("story")} <span className="text-mauve">*</span>
        </label>
        <textarea
          id="story"
          name="story"
          required
          minLength={20}
          rows={12}
          maxLength={8000}
          aria-describedby="story-count"
          onChange={(event) => setWords(countWords(event.target.value))}
          className="field"
          placeholder={t("storyPlaceholder")}
        />
        <p
          id="story-count"
          aria-live="polite"
          className={`mt-2 text-right text-sm tabular-nums ${tooLong ? "font-semibold text-tangerine-ink" : "text-mauve"}`}
        >
          {tooLong ? t("tooLong") : t("wordCount", { count: words, max: EMAIL_SESSION_MAX_WORDS })}
        </p>
      </div>

      <label className="flex cursor-pointer gap-3 rounded-2xl bg-shell p-4 text-[0.9375rem] leading-relaxed">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-tangerine" />
        <span>{t("consent")}</span>
      </label>

      <div className="space-y-4">
        {error && (
          <p role="alert" className="rounded-2xl border-[1.5px] border-tangerine bg-peach px-4 py-3 text-[0.9375rem] font-semibold text-plum">
            {error === "tooLong" ? t("tooLong") : error === "invalid" ? tForms("errorInvalid") : tForms("errorFailed")}
          </p>
        )}
        <button
          type="submit"
          disabled={pending || redirecting || tooLong}
          className="btn-primary w-full !py-4 disabled:cursor-wait disabled:opacity-70"
        >
          {pending || redirecting ? t("redirecting") : t("submit")}
        </button>
        <p className="text-center text-[0.9375rem] text-mauve">
          {t.rich("termsNote", {
            terms: (chunks) => (
              <Link href="/terms" className="font-semibold underline underline-offset-2">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="font-semibold underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </form>
  );
}
