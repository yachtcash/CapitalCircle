"use client";

import { X } from "lucide-react";
import { FUNDING_RANGES, type SearchFilters } from "@/lib/search/types";
import { cn } from "@/lib/cn";

type Chip = { id: string; label: string; remove: () => void };

type Props = {
  filters: SearchFilters;
  onUpdate: (partial: Partial<SearchFilters>) => void;
  onClearAll: () => void;
};

function fundingLabel(value: string): string {
  return FUNDING_RANGES.find((r) => r.value === value)?.label ?? value;
}

export default function ActiveFilterChips({ filters, onUpdate, onClearAll }: Props) {
  const chips: Chip[] = [];

  if (filters.q.trim()) {
    chips.push({
      id: `q:${filters.q}`,
      label: `“${filters.q.trim()}”`,
      remove: () => onUpdate({ q: "" }),
    });
  }

  const removeFromGroup = (
    key: keyof SearchFilters,
    value: string,
    current: string[]
  ): void => {
    onUpdate({ [key]: current.filter((v) => v !== value) } as Partial<SearchFilters>);
  };

  const multiGroups: { key: keyof SearchFilters; prefix?: string; labelFor?: (v: string) => string }[] = [
    { key: "category" },
    { key: "listingType" },
    { key: "dealType" },
    { key: "country" },
    { key: "city" },
    { key: "funding", labelFor: fundingLabel },
    { key: "status" },
  ];

  for (const group of multiGroups) {
    const values = filters[group.key] as string[];
    if (!Array.isArray(values)) continue;
    for (const v of values) {
      const label = group.labelFor ? group.labelFor(v) : v;
      chips.push({
        id: `${String(group.key)}:${v}`,
        label,
        remove: () => removeFromGroup(group.key, v, values),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.remove}
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-full bg-white text-navy-900 ring-1 ring-navy-900/[0.08] hover:ring-gold-500/60",
            "px-3 py-1.5 text-xs font-medium transition-all"
          )}
        >
          <span className="truncate max-w-[180px]">{chip.label}</span>
          <X
            className="h-3 w-3 text-navy-700/55 group-hover:text-navy-900 transition-colors"
            strokeWidth={2.4}
          />
        </button>
      ))}
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 px-2 py-1 transition-colors"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
