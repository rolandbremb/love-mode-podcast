"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { pressable } from "@/components/dashboard/ui";
import { changeChecklist, deleteItem, importFromInbox, setStage, type FormState } from "@/lib/planner/actions";
import { STAGES, type ChecklistItem, type PlannerType } from "@/lib/planner/shared";

/* The planner's interactive bits. Forms post to server actions, which save to the
   Studio and come back to the page (or say what went wrong). */

export function ActionForm({
  action,
  submitLabel,
  disabled = false,
  children,
}: {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending || disabled} className={`btn-primary min-h-10 !py-2.5 !text-[0.9375rem] disabled:opacity-60 ${pressable}`}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {disabled && <span className="text-sm text-mauve">Saving is off until the Studio is connected.</span>}
        {state?.error && (
          <span role="alert" className="text-pretty text-sm font-semibold text-tangerine-ink">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}

// A dot beside each stage: needs doing, moving, done, parked
const TONE: Record<string, string> = {
  idea: "bg-plum/10 ring-1 ring-plum/30",
  booking: "bg-tangerine",
  contacted: "bg-tangerine",
  drafting: "bg-tangerine",
  scheduled: "bg-plum",
  talking: "bg-plum",
  recorded: "bg-plum",
  editing: "bg-tangerine",
  ready: "bg-[#1baf7a]",
  confirmed: "bg-[#1baf7a]",
  published: "bg-plum/25",
  posted: "bg-plum/25",
  worked: "bg-plum/25",
  notAFit: "bg-plum/10 ring-1 ring-plum/30",
};

export function StageSelect({ type, id, stage, label, disabled = false }: { type: PlannerType; id: string; stage: string; label: string; disabled?: boolean }) {
  const [value, setValue] = useState(stage);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  useEffect(() => setValue(stage), [stage]);

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
              const result = await setStage(type, id, next);
              if (!result.ok) {
                setValue(previous);
                setFailed(true);
              }
            });
          }}
          className="min-h-10 rounded-full border-[1.5px] border-plum/20 bg-white py-2 pl-7 pr-8 text-sm font-semibold text-plum transition-colors hover:border-plum/40 disabled:opacity-60"
        >
          {STAGES[type].map((option) => (
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

export function DeleteButton({ type, id, what, returnTo, disabled = false }: { type: PlannerType; id: string; what: string; returnTo: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => {
          if (!window.confirm(`Delete ${what}? This can't be undone.`)) return;
          setFailed(false);
          startTransition(async () => {
            const result = await deleteItem(type, id, returnTo);
            if (result && !result.ok) setFailed(true);
          });
        }}
        className={`min-h-10 rounded-full border-[1.5px] border-tangerine-ink/40 px-4 text-sm font-semibold text-tangerine-ink hover:bg-peach disabled:opacity-60 ${pressable}`}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {failed && (
        <span role="alert" className="text-sm font-semibold text-tangerine-ink">
          Couldn&apos;t delete
        </span>
      )}
    </span>
  );
}

export function ChecklistEditor({ episodeId, items, disabled = false }: { episodeId: string; items: ChecklistItem[]; disabled?: boolean }) {
  const [list, setList] = useState(items);
  const [newLabel, setNewLabel] = useState("");
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  useEffect(() => setList(items), [items]);

  const run = (change: Parameters<typeof changeChecklist>[1], optimistic: ChecklistItem[]) => {
    const previous = list;
    setList(optimistic);
    setFailed(false);
    startTransition(async () => {
      const result = await changeChecklist(episodeId, change);
      if (!result.ok) {
        setList(previous);
        setFailed(true);
      }
    });
  };

  const done = list.filter((item) => item.done).length;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-2xl">Checklist</p>
        <span className="text-sm tabular-nums text-mauve">
          {done} of {list.length} done
        </span>
      </div>
      <span className="h-2 rounded-full bg-shell" aria-hidden="true">
        <span className="block h-2 rounded-full bg-[#1baf7a] transition-[width] duration-300" style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} />
      </span>
      <ul className="flex flex-col">
        {list.map((item) => (
          <li key={item._key} className="group flex items-center justify-between gap-2">
            <label className="flex min-h-10 flex-1 cursor-pointer items-center gap-3 text-[0.9375rem]">
              <input
                type="checkbox"
                checked={item.done}
                disabled={disabled}
                onChange={(event) =>
                  run(
                    { op: "toggle", key: item._key, done: event.target.checked },
                    list.map((i) => (i._key === item._key ? { ...i, done: event.target.checked } : i))
                  )
                }
                className="h-5 w-5 accent-plum"
              />
              <span className={item.done ? "text-mauve line-through decoration-plum/40" : ""}>{item.label}</span>
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => run({ op: "remove", key: item._key }, list.filter((i) => i._key !== item._key))}
              aria-label={`Remove “${item.label}”`}
              className="min-h-10 min-w-10 rounded-full text-mauve opacity-60 hover:bg-shell hover:opacity-100 focus-visible:opacity-100"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const label = newLabel.trim();
          if (!label) return;
          setNewLabel("");
          run({ op: "add", label }, [...list, { _key: `new-${Date.now()}`, label, done: false }]);
        }}
      >
        <input
          value={newLabel}
          onChange={(event) => setNewLabel(event.target.value)}
          placeholder="Add a step"
          aria-label="Add a step to the checklist"
          maxLength={120}
          disabled={disabled}
          className="min-h-10 min-w-0 flex-1 rounded-xl border-[1.5px] border-plum/25 bg-white px-3 py-2 text-[0.9375rem]"
        />
        <button type="submit" disabled={disabled || pending} className={`min-h-10 rounded-full border-[1.5px] border-plum/25 px-4 text-sm font-semibold hover:bg-shell disabled:opacity-60 ${pressable}`}>
          Add
        </button>
      </form>
      {failed && (
        <p role="alert" className="text-sm font-semibold text-tangerine-ink">
          That change wasn&apos;t saved. Try again.
        </p>
      )}
    </div>
  );
}

export function ImportButton({ waiting, disabled = false }: { waiting: number; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={disabled || pending || waiting === 0}
        onClick={() =>
          startTransition(async () => {
            const result = await importFromInbox();
            setMessage(result.ok ? (result.added ? `Added ${result.added}` : "Nothing new") : result.error ?? "Couldn't import");
          })
        }
        className={`min-h-10 rounded-full border-[1.5px] border-plum/25 px-4 text-sm font-semibold hover:bg-white disabled:opacity-60 ${pressable}`}
      >
        {pending ? "Saving…" : waiting ? `Save ${waiting} from the website forms` : "Website forms all saved"}
      </button>
      {message && (
        <span role="status" className="text-sm font-semibold">
          {message}
        </span>
      )}
    </span>
  );
}
