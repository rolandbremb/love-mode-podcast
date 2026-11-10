"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/dashboard/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="password" className="text-[0.9375rem] font-semibold">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        aria-describedby={state?.error ? "password-error" : undefined}
        className="field"
      />
      {state?.error && (
        <p id="password-error" role="alert" className="text-[0.9375rem] font-semibold text-tangerine-ink">
          That password didn't work. Try again.
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-2 disabled:cursor-wait disabled:opacity-70">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
