"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { FileSearch, PlusCircle } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { ListingRecord, ListingStatus } from "@/data/listings";
import ActionToast, { useActionToast } from "@/components/ui/ActionToast";
import { cn } from "@/lib/cn";
import AnalyticsSection from "./AnalyticsSection";
import ListingsCardGrid from "./ListingsCardGrid";
import ListingsTable from "./ListingsTable";
import ListingsToolbar, { type ViewMode } from "./ListingsToolbar";

const STATUS_RANK: Record<ListingStatus, number> = {
  Active: 0,
  "Seeking Capital": 1,
  Negotiating: 2,
  "Under Review": 3,
  Draft: 4,
  Closed: 5,
  Archived: 6,
};

export type SortKey =
  | "default"
  | "title"
  | "category"
  | "dealType"
  | "status"
  | "views"
  | "saves"
  | "interests"
  | "lastUpdated";

export type SortDir = "asc" | "desc";

function compareString(a?: string | null, b?: string | null): number {
  return (a ?? "").localeCompare(b ?? "");
}

function sortListings(
  listings: ListingRecord[],
  key: SortKey,
  dir: SortDir
): ListingRecord[] {
  const out = [...listings];
  const mul = dir === "asc" ? 1 : -1;
  out.sort((a, b) => {
    switch (key) {
      case "title":
        return compareString(a.title, b.title) * mul;
      case "category":
        return compareString(a.category, b.category) * mul;
      case "dealType":
        return compareString(a.dealType, b.dealType) * mul;
      case "status": {
        const diff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        return diff * mul;
      }
      case "views":
        return (a.views - b.views) * mul;
      case "saves":
        return (a.saves - b.saves) * mul;
      case "interests":
        return (a.interests - b.interests) * mul;
      case "lastUpdated":
        return a.lastUpdatedAt.localeCompare(b.lastUpdatedAt) * mul;
      case "default":
      default: {
        const rankDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (rankDiff !== 0) return rankDiff;
        return b.lastUpdatedAt.localeCompare(a.lastUpdatedAt);
      }
    }
  });
  return out;
}

export default function ListingsWorkspace() {
  const { listings } = useMessaging();

  const [query, setQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ListingStatus[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const { toast, show: showToast, dismiss: dismissToast } = useActionToast();
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      // Sensible defaults: alpha asc; numeric desc; date desc.
      const isAlpha =
        key === "title" || key === "category" || key === "dealType";
      setSortDir(isAlpha ? "asc" : "desc");
      return key;
    });
  }, []);

  const toggleStatus = useCallback((status: ListingStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const clearStatuses = useCallback(() => setSelectedStatuses([]), []);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<ListingStatus, number>> = {};
    for (const listing of listings) {
      counts[listing.status] = (counts[listing.status] ?? 0) + 1;
    }
    return counts;
  }, [listings]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(listing.status)
      ) {
        return false;
      }
      if (!trimmed) return true;
      return (
        listing.title.toLowerCase().includes(trimmed) ||
        listing.id.toLowerCase().includes(trimmed)
      );
    });
  }, [listings, selectedStatuses, query]);

  const sorted = useMemo(
    () => sortListings(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  const handleDuplicateSuccess = useCallback(
    (newId: string) => {
      showToast(`Listing duplicated as ${newId}`, {
        href: `/dashboard/listings/${newId}`,
        linkLabel: "Open draft",
      });
    },
    [showToast]
  );

  const hasAnyListing = listings.length > 0;
  const isFiltering =
    query.trim().length > 0 || selectedStatuses.length > 0;

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-8 md:space-y-10">
        <header className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-700 font-bold">
            Portfolio
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-navy-900">
                My Listings
              </h1>
              <p className="mt-2 text-navy-700/75 max-w-2xl text-sm md:text-base leading-relaxed">
                Manage every deal you have posted to Capital Circle — drafts in
                progress, active raises, live negotiations, closed deals, and
                archived history all live here.
              </p>
            </div>
          </div>
        </header>

        <ListingsToolbar
          query={query}
          onQueryChange={setQuery}
          selectedStatuses={selectedStatuses}
          onToggleStatus={toggleStatus}
          onClearStatuses={clearStatuses}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          statusCounts={statusCounts}
        />

        {sorted.length === 0 ? (
          <EmptyState
            kind={hasAnyListing ? "no-match" : "no-listings"}
            onClearFilters={() => {
              setQuery("");
              clearStatuses();
            }}
            isFiltering={isFiltering}
          />
        ) : (
          <>
            {viewMode === "table" ? (
              <>
                <ListingsTable
                  listings={sorted}
                  onDuplicateSuccess={handleDuplicateSuccess}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                {/* Mobile fallback: cards even when table is selected */}
                <ListingsCardGrid
                  listings={sorted}
                  onDuplicateSuccess={handleDuplicateSuccess}
                  className="md:hidden"
                />
              </>
            ) : (
              <ListingsCardGrid
                listings={sorted}
                onDuplicateSuccess={handleDuplicateSuccess}
              />
            )}
          </>
        )}

        <AnalyticsSection listings={listings} />
      </div>

      <ActionToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

function EmptyState({
  kind,
  onClearFilters,
  isFiltering,
}: {
  kind: "no-listings" | "no-match";
  onClearFilters: () => void;
  isFiltering: boolean;
}) {
  if (kind === "no-listings") {
    return (
      <div className="bg-white ring-1 ring-navy-900/[0.06] rounded-2xl px-6 py-12 md:py-16 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/[0.12] text-gold-700">
          <PlusCircle className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-navy-900">
          No listings yet
        </h3>
        <p className="mt-1 text-sm text-navy-700/75 max-w-md mx-auto">
          Post your first opportunity to start receiving interest, save activity,
          and negotiation requests from vetted investors.
        </p>
        <Link
          href="/create-listing"
          className={cn(
            "mt-5 inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-bold uppercase tracking-[0.12em] px-4 py-2.5 shadow-sm transition-colors"
          )}
        >
          <PlusCircle className="h-3.5 w-3.5" strokeWidth={2.4} />
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white ring-1 ring-navy-900/[0.06] rounded-2xl px-6 py-12 md:py-16 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/[0.06] text-navy-700">
        <FileSearch className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-navy-900">
        No listings match your filters
      </h3>
      <p className="mt-1 text-sm text-navy-700/75 max-w-md mx-auto">
        Try widening your status filters or adjusting the search to find what
        you are looking for.
      </p>
      {isFiltering ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-[0.12em] px-4 py-2.5 transition-colors"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
