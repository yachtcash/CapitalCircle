"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  selectedCount?: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function FilterSection({
  title,
  selectedCount = 0,
  defaultOpen = true,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-navy-900/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
      >
        <span className="inline-flex items-center gap-2">
          <span className="text-[12px] uppercase tracking-[0.16em] font-semibold text-navy-900">
            {title}
          </span>
          {selectedCount > 0 ? (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold">
              {selectedCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-navy-700/60 transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90"
          )}
          strokeWidth={2.2}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-200",
          open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pb-4">{children}</div>
      </div>
    </section>
  );
}
