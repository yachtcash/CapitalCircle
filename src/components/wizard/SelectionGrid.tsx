"use client";

import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type SelectionOption = {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

type Props = {
  options: SelectionOption[];
  value: string | null;
  onChange: (value: string) => void;
  columns?: string;
  compact?: boolean;
};

export default function SelectionGrid({
  options,
  value,
  onChange,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  compact = false,
}: Props) {
  return (
    <div className={cn("grid gap-3 md:gap-4", columns)}>
      {options.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={cn(
              "group relative text-left bg-white rounded-2xl ring-1 transition-all",
              compact ? "p-4" : "p-5",
              selected
                ? "ring-2 ring-gold-500 shadow-md shadow-gold-500/10 bg-gold-500/[0.04]"
                : "ring-navy-900/[0.06] hover:ring-gold-500/50 hover:shadow-sm"
            )}
          >
            <div className="flex items-start gap-3">
              {Icon ? (
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-navy-900/5 shrink-0 transition-colors",
                    selected
                      ? "bg-gold-500 text-navy-900"
                      : "bg-navy-900 text-gold-500 group-hover:bg-navy-800"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
              ) : null}
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "font-semibold leading-snug",
                    compact ? "text-sm" : "text-[15px] md:text-base",
                    "text-navy-900"
                  )}
                >
                  {option.label}
                </div>
                {option.description ? (
                  <div className="mt-1 text-xs md:text-sm text-navy-700/65 leading-snug">
                    {option.description}
                  </div>
                ) : null}
              </div>
              <span
                className={cn(
                  "shrink-0 h-5 w-5 rounded-full ring-1 flex items-center justify-center transition-all",
                  selected
                    ? "bg-gold-500 ring-gold-500 text-navy-900"
                    : "ring-navy-900/15 text-transparent group-hover:ring-navy-900/30"
                )}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
