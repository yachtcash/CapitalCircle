import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  required?: boolean;
  hint?: string;
  optional?: boolean;
  counter?: { current: number; min?: number; max?: number };
  children: ReactNode;
  className?: string;
};

export default function WizardField({
  label,
  required,
  hint,
  optional,
  counter,
  children,
  className,
}: Props) {
  const counterBad = counter && counter.min ? counter.current < counter.min : false;
  return (
    <label className={cn("block", className)}>
      <span className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold">
          {label}
          {required ? <span className="text-gold-600 ml-1">*</span> : null}
          {optional ? (
            <span className="ml-2 text-[10px] tracking-wider text-navy-700/40 font-medium normal-case">
              (optional)
            </span>
          ) : null}
        </span>
        {counter ? (
          <span
            className={cn(
              "text-[11px] tabular-nums font-medium",
              counterBad ? "text-rose-600" : "text-navy-700/55"
            )}
          >
            {counter.current}
            {counter.max ? ` / ${counter.max}` : ""}
            {counter.min && !counter.max ? ` / ${counter.min} min` : ""}
          </span>
        ) : null}
      </span>
      {children}
      {hint ? (
        <span className="block mt-1.5 text-xs text-navy-700/55 leading-relaxed">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow";

export const textareaClass = `${inputClass} resize-none leading-relaxed`;

export const selectClass = `${inputClass} appearance-none pr-9 bg-[image:var(--chev)] bg-no-repeat bg-[length:1rem] bg-[position:right_0.75rem_center]`;
