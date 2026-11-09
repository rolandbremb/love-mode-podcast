"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/mobile";

/* Optional WhatsApp number with a country picker. It's checked against the
   numbering rules of the chosen country (mobile numbers only), so typos like a
   missing digit are caught before signing up, and the number is shown back in
   full so a wrong digit is easy to spot. Sends the number as +573001234567. */

// Where most listeners are; shown first in the list
const COMMON: CountryCode[] = ["US", "CO", "MX", "ES", "VE", "AR", "PE", "CL", "EC", "DO", "PR", "PA", "CR", "GT"];

const flag = (country: string) =>
  String.fromCodePoint(...[...country].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));

// The visitor's country from their browser language (es-CO -> CO), if it has one
function browserCountry(countries: Set<string>): CountryCode | null {
  for (const language of navigator.languages ?? [navigator.language]) {
    const region = language.split("-")[1]?.toUpperCase();
    if (region && countries.has(region)) return region as CountryCode;
  }
  return null;
}

export default function PhoneField({ labelClass }: { labelClass: string }) {
  const t = useTranslations("lista");
  const locale = useLocale();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [country, setCountry] = useState<CountryCode>("US");
  const [value, setValue] = useState("");
  // Errors show once someone leaves the field or tries to submit, and clear as soon as the number is valid
  const [touched, setTouched] = useState(false);

  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: "region" });
    const name = (code: CountryCode) => {
      try {
        return names.of(code) ?? code;
      } catch {
        return code;
      }
    };
    const all = getCountries().map((code) => ({ code, name: name(code) }));
    return {
      common: COMMON.map((code) => all.find((entry) => entry.code === code)!).filter(Boolean),
      rest: all.filter((entry) => !COMMON.includes(entry.code)).sort((a, b) => a.name.localeCompare(b.name, locale)),
      name,
    };
  }, [locale]);

  useEffect(() => {
    const guess = browserCountry(new Set(getCountries()));
    if (guess) setCountry(guess);
  }, []);

  const phone = value.trim() ? parsePhoneNumberFromString(value, country) : undefined;
  const valid = Boolean(phone?.isValid());
  const countryName = countries.name(phone?.country ?? country);
  const showError = touched && Boolean(value.trim()) && !valid;

  // Lets the browser block the submit while the number is wrong
  useEffect(() => {
    inputRef.current?.setCustomValidity(value.trim() && !valid ? t("phoneInvalid", { country: countryName }) : "");
  }, [value, valid, countryName, t]);

  function onChange(next: string) {
    // A number typed with its +code picks the matching country
    if (next.trim().startsWith("+")) {
      const typed = new AsYouType();
      typed.input(next);
      const detected = typed.getCountry();
      if (detected) setCountry(detected);
    }
    setValue(next);
  }

  const describedBy = [`${id}-hint`, showError && `${id}-error`, valid && `${id}-check`].filter(Boolean).join(" ");

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-number`} className={labelClass}>
          {t("phone")}
        </label>
        <div className="flex gap-2">
          {/* Native select for the picking; the flag and code are what shows */}
          <div className="relative flex shrink-0 items-center gap-1.5 rounded-2xl border-[1.5px] border-plum/25 bg-white px-3.5 text-[1.0625rem] focus-within:border-plum">
            <span aria-hidden="true">{flag(country)}</span>
            <span aria-hidden="true">+{getCountryCallingCode(country)}</span>
            <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <select
              aria-label={t("country")}
              value={country}
              onChange={(event) => setCountry(event.target.value as CountryCode)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {countries.common.map(({ code, name }) => (
                <option key={code} value={code}>
                  {flag(code)} {name} (+{getCountryCallingCode(code)})
                </option>
              ))}
              <option disabled>──────────</option>
              {countries.rest.map(({ code, name }) => (
                <option key={code} value={code}>
                  {flag(code)} {name} (+{getCountryCallingCode(code)})
                </option>
              ))}
            </select>
          </div>
          <input
            ref={inputRef}
            id={`${id}-number`}
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            maxLength={30}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={() => setTouched(true)}
            onInvalid={() => setTouched(true)}
            aria-invalid={showError || undefined}
            aria-describedby={describedBy}
            className="field min-w-0 flex-1"
          />
        </div>
        <input type="hidden" name="whatsapp" value={valid && phone ? phone.number : ""} />
        <span id={`${id}-hint`} className="text-sm text-mauve">
          {t("phoneHint")}
        </span>
        {showError && (
          <span id={`${id}-error`} className="text-sm font-semibold text-[#c2361b]">
            {t("phoneInvalid", { country: countryName })}
          </span>
        )}
        {valid && phone && (
          <span id={`${id}-check`} className="flex items-center gap-1.5 text-sm font-semibold" aria-live="polite">
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-[#2f8f5b]" aria-hidden="true">
              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("phoneConfirm", { number: phone.formatInternational() })}
          </span>
        )}
      </div>
      {value.trim() && (
        <label className="flex items-start gap-2.5 text-[0.9375rem]">
          <input type="checkbox" name="whatsapp_consent" value="yes" required className="mt-1 h-4 w-4 shrink-0 accent-plum" />
          {t("consent")}
        </label>
      )}
    </>
  );
}
