"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Multi-select state for an admin table. Tracks a Set of row ids and prunes
 * any that disappear from `allIds` (e.g. after a bulk delete) so "select all"
 * and the count stay accurate.
 */
export function useBulkSelection(allIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allKey = allIds.join("|");
  useEffect(() => {
    setSelected((prev) => {
      const live = new Set(allIds);
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (live.has(id)) next.add(id);
        else changed = true;
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allKey]);

  return useMemo(() => {
    const allChecked = allIds.length > 0 && selected.size === allIds.length;
    const someChecked = selected.size > 0 && !allChecked;
    return {
      ids: [...selected],
      count: selected.size,
      isSelected: (id: string) => selected.has(id),
      toggle: (id: string) =>
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      toggleAll: () =>
        setSelected(() => (allChecked ? new Set() : new Set(allIds))),
      clear: () => setSelected(new Set()),
      allChecked,
      someChecked,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, allKey]);
}

export function HeadCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label="Select all rows"
      className="h-4 w-4 rounded border-navy-900/30 text-gold-600 focus:ring-gold-500 cursor-pointer accent-gold-600"
    />
  );
}

export function RowCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label ?? "Select row"}
      onClick={(e) => e.stopPropagation()}
      className="h-4 w-4 rounded border-navy-900/30 text-gold-600 focus:ring-gold-500 cursor-pointer accent-gold-600"
    />
  );
}

/**
 * Sticky action bar shown when ≥1 row is selected. Renders the count, a
 * clear button, and whatever action controls the caller passes as children.
 */
export function BulkBar({
  count,
  noun,
  onClear,
  children,
}: {
  count: number;
  noun: string;
  onClear: () => void;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="sticky bottom-4 z-30 mx-auto max-w-[1100px]">
      <div className="rounded-2xl bg-navy-900 text-white shadow-xl shadow-navy-900/30 ring-1 ring-white/10 px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-500 text-navy-900 text-xs font-bold px-1.5 tabular-nums">
            {count}
          </span>
          {count === 1 ? noun : `${noun}s`} selected
        </span>
        <div className="h-5 w-px bg-white/15" />
        <div className="flex items-center gap-1.5 flex-wrap flex-1">{children}</div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-white/60 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
          Clear
        </button>
      </div>
    </div>
  );
}

/** Compact action button for the bulk bar. */
export function BulkBtn({
  onClick,
  children,
  tone = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "gold" | "rose" | "emerald";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] font-bold transition-colors whitespace-nowrap",
        tone === "gold" && "bg-gold-500 hover:bg-gold-400 text-navy-900",
        tone === "rose" && "bg-rose-500/90 hover:bg-rose-500 text-white",
        tone === "emerald" && "bg-emerald-500 hover:bg-emerald-400 text-white",
        tone === "default" && "bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/15"
      )}
    >
      {children}
    </button>
  );
}

/** Inline select for "assign / change" bulk actions (role, admin, stage…). */
export function BulkSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full bg-white/10 ring-1 ring-white/15 hover:ring-gold-500/60 text-white px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] font-bold transition-shadow [&>option]:text-navy-900"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
