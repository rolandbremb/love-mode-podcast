"use client";

import { useLocale, useTranslations } from "next-intl";
import { submitBrandInquiry } from "@/lib/formActions";
import { Honeypot, SubmitArea, SuccessCard, labelClass, useFormSubmit } from "./FormParts";

const pillClass =
  "inline-block rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-semibold text-ink transition-all hover:bg-blush peer-checked:bg-brand-600 peer-checked:text-white peer-checked:shadow-pop-sm peer-focus-visible:ring-4 peer-focus-visible:ring-butter";

export default function BrandInquiryForm() {
  const t = useTranslations("collaborate");
  const locale = useLocale();
  const { state, pending, onSubmit, reset } = useFormSubmit(submitBrandInquiry);

  if (state?.status === "success") {
    return <SuccessCard title={t("successTitle")} body={t("successBody")} onReset={reset} />;
  }

  const collabTypes = [
    { value: "sponsorship", label: t("podcastSponsorship") },
    { value: "brand-partnership", label: t("brandPartnership") },
    { value: "content-collab", label: t("contentCollab") },
    { value: "affiliate", label: t("affiliatePartnership") },
    { value: "other", label: t("other") },
  ];
  const budgets = [
    { value: "", label: t("preferNotToSay") },
    { value: "under-500", label: t("under500") },
    { value: "500-2000", label: t("500to2000") },
    { value: "2000-5000", label: t("2000to5000") },
    { value: "5000+", label: t("5000plus") },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="relative space-y-7 rounded-[2rem] border-2 border-ink bg-white p-6 shadow-pop-lg sm:p-8 md:p-10"
    >
      <Honeypot />
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {t("nameCompany")} <span className="text-brand-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={120}
            autoComplete="organization"
            className="theme-field"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {t("email")} <span className="text-brand-600">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className="theme-field"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-bold text-ink">
          {t("typeOfCollaboration")} <span className="text-brand-600">*</span>
        </legend>
        <p className="mb-3 mt-1 text-xs text-ink/60">{t("typeHint")}</p>
        <div className="flex flex-wrap gap-2.5">
          {collabTypes.map(({ value, label }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="type" value={value} required className="peer sr-only" />
              <span className={pillClass}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="website" className={labelClass}>
          {t("websiteSocial")}
        </label>
        <input type="text" id="website" name="website" maxLength={300} className="theme-field" placeholder="https://..." />
      </div>

      <fieldset>
        <legend className="text-sm font-bold text-ink">{t("budgetRange")}</legend>
        <p className="mb-3 mt-1 text-xs text-ink/60">{t("budgetHint")}</p>
        <div className="flex flex-wrap gap-2.5">
          {budgets.map(({ value, label }) => (
            <label key={value || "none"} className="cursor-pointer">
              <input
                type="radio"
                name="budget"
                value={value}
                defaultChecked={value === ""}
                className="peer sr-only"
              />
              <span className={pillClass}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="proposal" className={labelClass}>
          {t("tellUsIdea")} <span className="text-brand-600">*</span>
        </label>
        <textarea
          id="proposal"
          name="proposal"
          required
          rows={5}
          maxLength={5000}
          className="theme-field"
          placeholder={t("tellUsPlaceholder")}
        />
      </div>

      <SubmitArea pending={pending} state={state} label={t("submit")} note={t("note")} />
    </form>
  );
}
