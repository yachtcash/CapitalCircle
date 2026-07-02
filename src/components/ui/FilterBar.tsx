"use client";

import { cn } from "@/lib/cn";

/**
 * Canonical filter row: pill selects / chips laid out with consistent gaps,
 * an optional result count, and an optional reset action.
 */
export function FilterBar({
  count,
  countNoun = "results",
  onReset,
  resetLabel = "Reset",
  className,
  children,
}: {
  count?: number;
  countNoun?: string;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {children}
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="rounded-full text-[11px] font-semibold text-navy-700/65 hover:text-navy-900 px-2.5 py-1.5 transition-colors"
        >
          {resetLabel}
        </button>
      ) : null}
      {typeof count === "number" ? (
        <span className="ml-auto text-xs text-navy-700/55 tabular-nums">
          {count} {countNoun}
        </span>
      ) : null}
    </div>
  );
}

/** Canonical pill <select> used inside filter bars. */
export function FilterSelect({
  value,
  onChange,
  options,
  labels,
  allLabel = "All",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
  allLabel?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "rounded-full bg-white ring-1 ring-navy-900/[0.1] hover:ring-navy-900/25 text-navy-900 text-[11px] font-semibold px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-gold-500 [&>option]:text-navy-900",
        className
      )}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? (o === "all" ? allLabel : o)}
        </option>
      ))}
    </select>
  );
}
