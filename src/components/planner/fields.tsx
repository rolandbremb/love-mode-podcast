import { PLATFORMS, labelFor, type Option } from "@/lib/planner/shared";

/* Form fields for the planner, in the dashboard's style. Plain components with no
   state, so pages can build their forms on the server. */

export const fieldClass =
  "min-h-10 w-full min-w-0 rounded-[10px] bg-white px-3 py-2 text-[0.9375rem] text-plum shadow-[inset_0_0_0_1.5px_rgba(45,21,48,0.18)] transition-[box-shadow] duration-150 placeholder:text-plum/40 hover:shadow-[inset_0_0_0_1.5px_rgba(45,21,48,0.32)] focus:shadow-[inset_0_0_0_2px_#2d1530,0_0_0_4px_rgba(255,99,57,0.35)] focus:outline-none focus-visible:outline-none";

export function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-semibold ${className}`}>
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-mauve">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  name,
  value,
  hint,
  className,
  ...rest
}: { label: string; name: string; value?: string | number; hint?: string; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue">) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input name={name} defaultValue={value ?? ""} className={fieldClass} {...rest} />
    </Field>
  );
}

export function TextArea({ label, name, value, rows = 4, hint, className, placeholder }: { label: string; name: string; value?: string; rows?: number; hint?: string; className?: string; placeholder?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea name={name} defaultValue={value ?? ""} rows={rows} placeholder={placeholder} className={`${fieldClass} leading-relaxed`} />
    </Field>
  );
}

export function SelectField({ label, name, value, options, empty, className }: { label: string; name: string; value?: string; options: Option[]; empty?: string; className?: string }) {
  return (
    <Field label={label} className={className}>
      <select name={name} defaultValue={value ?? ""} className={fieldClass}>
        {empty !== undefined && <option value="">{empty}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

// Tick several; used for platforms and an episode's guests
export function CheckboxGroup({ legend, name, options, values = [], className = "" }: { legend: string; name: string; options: Option[]; values?: string[]; className?: string }) {
  return (
    <fieldset className={`flex flex-col gap-1 ${className}`}>
      <legend className="mb-1 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-plum/20 bg-white px-3 text-sm font-semibold has-[:checked]:border-plum has-[:checked]:bg-plum has-[:checked]:text-shell"
          >
            <input type="checkbox" name={name} value={option.value} defaultChecked={values.includes(option.value)} className="sr-only" />
            {option.label}
          </label>
        ))}
        {options.length === 0 && <span className="text-sm text-mauve">None yet.</span>}
      </div>
    </fieldset>
  );
}

export function PlatformPills({ platforms }: { platforms: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {platforms.map((value) => {
        const platform = PLATFORMS.find((p) => p.value === value);
        return (
          <span key={value} className="whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: platform?.color ?? "#d9cbd6", color: platform?.ink ?? "#2d1530" }}>
            {labelFor(PLATFORMS, value)}
          </span>
        );
      })}
    </span>
  );
}
