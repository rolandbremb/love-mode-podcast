"use client";

import { useState, useTransition } from "react";
import { updateStatus } from "@/lib/dashboard/actions";
import { STATUSES, type InboxType } from "@/lib/dashboard/shared";

// A status dropdown that saves as soon as it changes
export default function StatusSelect({
  type,
  id,
  status,
  label,
  disabled = false,
}: {
  type: InboxType;
  id: string;
  status: string;
  label: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <span className="inline-flex items-center gap-2">
      <select
        aria-label={label}
        value={value}
        disabled={disabled || pending}
        onChange={(event) => {
          const next = event.target.value;
          const previous = value;
          setValue(next);
          setFailed(false);
          startTransition(async () => {
            const result = await updateStatus(type, id, next);
            if (!result.ok) {
              setValue(previous);
              setFailed(true);
            }
          });
        }}
        className="rounded-full border-[1.5px] border-plum/25 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-plum disabled:opacity-60"
      >
        {STATUSES[type].map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {failed && (
        <span role="alert" className="text-sm font-semibold text-tangerine-ink">
          Not saved
        </span>
      )}
    </span>
  );
}
