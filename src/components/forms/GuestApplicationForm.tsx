"use client";

import { useLocale, useTranslations } from "next-intl";
import { submitGuestApplication } from "@/lib/formActions";
import { Honeypot, SubmitArea, SuccessCard, labelClass, useFormSubmit } from "./FormParts";

export default function GuestApplicationForm() {
  const t = useTranslations("apply");
  const locale = useLocale();
  const { state, pending, onSubmit, reset } = useFormSubmit(submitGuestApplication);

  if (state?.status === "success") {
    return <SuccessCard title={t("successTitle")} body={t("successBody")} onReset={reset} />;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative space-y-6 rounded-md bg-white p-6 shadow-postal sm:p-8 md:p-10"
    >
      <Honeypot />
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {t("fullName")} <span className="text-mauve">*</span>
          </label>
          <input type="text" id="name" name="name" required maxLength={120} autoComplete="name" className="field" />
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
            className="field"
            placeholder={t("emailPlaceholder")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="social" className={labelClass}>
          {t("socialLinks")}
        </label>
        <input type="text" id="social" name="social" maxLength={300} className="field" placeholder={t("socialPlaceholder")} />
      </div>

      <div>
        <label htmlFor="expertise" className={labelClass}>
          {t("expertise")} <span className="text-mauve">*</span>
        </label>
        <input
          type="text"
          id="expertise"
          name="expertise"
          required
          maxLength={300}
          className="field"
          placeholder={t("expertisePlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {t("whyGuest")} <span className="text-mauve">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          className="field"
          placeholder={t("whyGuestPlaceholder")}
        />
      </div>

      <SubmitArea pending={pending} state={state} label={t("submit")} note={t("note")} />
    </form>
  );
}
