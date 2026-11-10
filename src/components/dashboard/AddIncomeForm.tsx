"use client";

import { useActionState, useEffect, useRef } from "react";
import { addIncome } from "@/lib/dashboard/actions";
import { INCOME_STREAMS } from "@/lib/dashboard/shared";

const fieldClass = "rounded-xl border-[1.5px] border-plum/25 bg-white px-3 py-2 text-[0.9375rem] text-plum";

// Income paid outside Stripe: brand deals, affiliates, payouts and (until connected) coffee
export default function AddIncomeForm({ today, disabled }: { today: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState(addIncome, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <p className="font-semibold">Add income paid outside Stripe</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 flex flex-col gap-1 text-sm font-semibold">
          Stream
          <select name="stream" required defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Choose…
            </option>
            {INCOME_STREAMS.filter((stream) => stream.manual).map((stream) => (
              <option key={stream.value} value={stream.value}>
                {stream.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Amount (USD)
          <input name="amount" required inputMode="decimal" placeholder="250" className={`${fieldClass} min-w-0`} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Date received
          <input name="date" type="date" required defaultValue={today} className={`${fieldClass} min-w-0`} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Note (optional)
        <input name="note" maxLength={200} placeholder="Per'la, October commission" className={fieldClass} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending || disabled} className="btn-primary !py-2.5 !text-[0.9375rem] disabled:opacity-60">
          {pending ? "Adding…" : "Add income"}
        </button>
        {state?.ok && (
          <span role="status" className="text-sm font-semibold">
            Added
          </span>
        )}
        {state?.error && (
          <span role="alert" className="text-sm font-semibold text-tangerine-ink">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
