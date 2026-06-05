"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, Check, ChevronDown } from "lucide-react";
import { SORT_KEYS, type SortKey } from "@/lib/search/types";
import { SORT_LABELS } from "@/lib/search/options";
import { cn } from "@/lib/cn";

type Props = {
  value: SortKey;
  onChange: (next: SortKey) => void;
};

export default function SortControl({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-navy-900/[0.08] hover:ring-navy-900/20 text-navy-900 text-sm font-medium px-4 py-2 transition-shadow"
      >
        <ArrowDownUp className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        <span className="hidden sm:inline text-navy-700/70 text-xs uppercase tracking-wider">Sort</span>
        <span className="font-semibold">{SORT_LABELS[value]}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-navy-700/55 transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2.2}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-2 min-w-[180px] bg-white ring-1 ring-navy-900/[0.08] shadow-lg shadow-navy-900/10 rounded-xl py-1.5 z-30"
        >
          {SORT_KEYS.map((key) => {
            const active = key === value;
            return (
              <li key={key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors",
                    active
                      ? "text-navy-900 font-semibold bg-gold-500/[0.08]"
                      : "text-navy-900/85 hover:bg-bone"
                  )}
                >
                  <span>{SORT_LABELS[key]}</span>
                  {active ? <Check className="h-4 w-4 text-gold-600" strokeWidth={2.5} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
