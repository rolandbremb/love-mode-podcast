"use client";

import { useEffect, useState, useTransition } from "react";
import { updateStatus } from "@/lib/dashboard/actions";
import { STATUSES, type InboxType } from "@/lib/dashboard/shared";

// A dot beside each status so a list can be scanned: needs attention, in progress, done
const TONE: Record<string, string> = {
  new: "bg-tangerine",
  paid: "bg-tangerine",
  replied: "bg-plum",
  contacted: "bg-plum",
  inProgress: "bg-plum",
  answered: "bg-plum/25",
  booked: "bg-plum/25",
  closed: "bg-plum/25",
  pending: "bg-plum/10 ring-1 ring-plum/30",
  refunded: "bg-plum/10 ring-1 ring-plum/30",
  notAFit: "bg-plum/10 ring-1 ring-plum/30",
};

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

  // Follow changes made elsewhere (the Studio, another tab) once the page refreshes
  useEffect(() => setValue(status), [status]);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex items-center">
        <span className={`pointer-events-none absolute left-3 h-2 w-2 rounded-full ${TONE[value] ?? "bg-plum/25"}`} aria-hidden="true" />
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
          className="min-h-10 rounded-full border-[1.5px] border-plum/20 bg-white py-2 pl-7 pr-8 text-sm font-semibold text-plum transition-colors hover:border-plum/40 disabled:opacity-60"
        >
          {STATUSES[type].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
      {failed && (
        <span role="alert" className="text-sm font-semibold text-tangerine-ink">
          Not saved
        </span>
      )}
    </span>
  );
}
