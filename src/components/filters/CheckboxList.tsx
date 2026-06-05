"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type CheckboxOption = {
  value: string;
  label: string;
  count?: number;
};

type Props = {
  options: readonly CheckboxOption[] | CheckboxOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  emptyMessage?: string;
  maxVisible?: number;
};

export default function CheckboxList({
  options,
  selected,
  onChange,
  emptyMessage = "No options available.",
  maxVisible,
}: Props) {
  if (options.length === 0) {
    return <p className="text-xs text-navy-700/55 px-1">{emptyMessage}</p>;
  }

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const visible =
    typeof maxVisible === "number" && options.length > maxVisible
      ? options.slice(0, maxVisible)
      : options;

  return (
    <ul className="space-y-1">
      {visible.map((option) => {
        const checked = selected.includes(option.value);
        const disabled = option.count === 0 && !checked;
        return (
          <li key={option.value}>
            <label
              className={cn(
                "group flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-bone/70"
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(option.value)}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors",
                  checked
                    ? "bg-gold-500 border-gold-500 text-navy-900"
                    : "bg-white border-navy-900/20 group-hover:border-navy-700/45"
                )}
              >
                {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm leading-snug",
                  checked ? "text-navy-900 font-medium" : "text-navy-900/85"
                )}
              >
                {option.label}
              </span>
              {typeof option.count === "number" ? (
                <span className="text-[11px] tabular-nums text-navy-700/55 font-medium">
                  {option.count}
                </span>
              ) : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
