"use client";

import Link from "next/link";
import { LayoutGrid, PlusCircle, Search, Table2, X } from "lucide-react";
import type { ListingStatus } from "@/data/listings";
import { cn } from "@/lib/cn";

export type ViewMode = "table" | "cards";

const ALL_STATUSES: ListingStatus[] = [
  "Draft",
  "Active",
  "Seeking Capital",
  "Negotiating",
  "Under Review",
  "Closed",
  "Archived",
];

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  selectedStatuses: ListingStatus[];
  onToggleStatus: (status: ListingStatus) => void;
  onClearStatuses: () => void;
  viewMode: ViewMode;
  onViewModeChange: (next: ViewMode) => void;
  statusCounts?: Partial<Record<ListingStatus, number>>;
};

export default function ListingsToolbar({
  query,
  onQueryChange,
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
  viewMode,
  onViewModeChange,
  statusCounts,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 md:max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/55"
            strokeWidth={2.2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by listing title or LST ID"
            className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white ring-1 ring-navy-900/[0.08] text-navy-900 text-sm placeholder:text-navy-700/45 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 inline-flex items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-navy-900/[0.06]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="View mode"
            className="inline-flex items-center bg-white ring-1 ring-navy-900/[0.08] rounded-full p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "table"}
              onClick={() => onViewModeChange("table")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "table"
                  ? "bg-navy-900 text-white"
                  : "text-navy-700/70 hover:text-navy-900"
              )}
            >
              <Table2 className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>Table</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "cards"}
              onClick={() => onViewModeChange("cards")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "cards"
                  ? "bg-navy-900 text-white"
                  : "text-navy-700/70 hover:text-navy-900"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>Cards</span>
            </button>
          </div>

          <Link
            href="/create-listing"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-bold uppercase tracking-[0.12em] px-4 py-2.5 shadow-sm transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" strokeWidth={2.4} />
            <span>Create Listing</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-navy-700/55 mr-1">
          Filter
        </span>
        {ALL_STATUSES.map((status) => {
          const active = selectedStatuses.includes(status);
          const count = statusCounts?.[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => onToggleStatus(status)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ring-1",
                active
                  ? "bg-navy-900 text-white ring-navy-900"
                  : "bg-white text-navy-900/80 ring-navy-900/[0.08] hover:ring-navy-900/20"
              )}
            >
              <span>{status}</span>
              {typeof count === "number" ? (
                <span
                  className={cn(
                    "rounded-full text-[10px] font-bold px-1.5 leading-4",
                    active
                      ? "bg-white/15 text-white"
                      : "bg-navy-900/[0.06] text-navy-700"
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
        {selectedStatuses.length > 0 ? (
          <button
            type="button"
            onClick={onClearStatuses}
            className="text-xs font-semibold text-gold-700 hover:text-gold-600 underline underline-offset-2 ml-1"
          >
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  );
}
