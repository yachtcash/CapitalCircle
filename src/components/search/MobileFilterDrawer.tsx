"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import FilterSidebar from "@/components/filters/FilterSidebar";
import type { FacetCounts, SearchFilters } from "@/lib/search/types";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  facetCounts: FacetCounts;
  onUpdate: (partial: Partial<SearchFilters>) => void;
  onClearAll: () => void;
  totalCount: number;
};

export default function MobileFilterDrawer({
  open,
  onClose,
  filters,
  facetCounts,
  onUpdate,
  onClearAll,
  totalCount,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-navy-900/55 backdrop-blur-sm z-40 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[88vw] max-w-md bg-cream z-50 shadow-2xl lg:hidden flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full invisible"
        )}
      >
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-navy-900/[0.08]">
          <h2 className="text-sm font-semibold text-navy-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-bone text-navy-900 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FilterSidebar
            filters={filters}
            facetCounts={facetCounts}
            onUpdate={onUpdate}
            onClearAll={onClearAll}
            showHeader={false}
          />
        </div>

        <footer className="flex items-center gap-3 px-5 py-4 border-t border-navy-900/[0.08] bg-white">
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold text-sm px-5 py-2.5 transition-colors"
          >
            Show {totalCount} {totalCount === 1 ? "result" : "results"}
          </button>
        </footer>
      </aside>
    </>
  );
}
