"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { FormState } from "@/lib/formActions";

export const labelClass = "mb-2 block text-[0.9375rem] font-semibold text-plum";

// Submits without a page reload and keeps what was typed if sending fails
export function useFormSubmit(action: (formData: FormData) => Promise<FormState>) {
  const [state, setState] = useState<FormState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        setState(await action(formData));
      } catch {
        setState({ status: "error", reason: "failed" });
      }
    });
  }

  return { state, pending, onSubmit, reset: () => setState(null) };
}

// Hidden from people; bots that fill it in are quietly ignored
export function Honeypot() {
  const t = useTranslations("forms");
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
      <label>
        {t("honeypot")}
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function SubmitArea({
  pending,
  state,
  label,
  note,
}: {
  pending: boolean;
  state: FormState | null;
  label: string;
  note: string;
}) {
  const t = useTranslations("forms");
  const error = state?.status === "error" ? state.reason : null;

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="rounded-2xl border-[1.5px] border-tangerine bg-peach px-4 py-3 text-[0.9375rem] font-semibold text-plum">
          {error === "invalid" ? t("errorInvalid") : t("errorFailed")}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full !py-4 disabled:cursor-wait disabled:opacity-70"
      >
        {pending && (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {pending ? t("sending") : label}
      </button>
      <p className="text-center text-[0.9375rem] text-mauve">{note}</p>
    </div>
  );
}

export function SuccessCard({
  title,
  body,
  onReset,
}: {
  title: string;
  body: string;
  onReset: () => void;
}) {
  const t = useTranslations("forms");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="rounded-md bg-white p-8 text-center shadow-postal motion-safe:animate-rise sm:p-12">
      <span className="mx-auto grid h-20 w-20 -rotate-6 place-items-center rounded-full bg-bubblegum text-tangerine">
        <svg className="h-9 w-9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.1 4 6.3 4c2.4 0 4 1.4 5.7 3.4C13.7 5.4 15.3 4 17.7 4 21.9 4 23.7 8.4 22 11.7 19.5 16.4 12 21 12 21z" />
        </svg>
      </span>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 font-display text-4xl leading-tight focus:outline-none md:text-5xl"
      >
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-mauve">{body}</p>
      <button type="button" onClick={onReset} className="btn-outline mt-8">
        {t("sendAnother")}
      </button>
    </div>
  );
}
