"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import OpportunityCard from "@/components/OpportunityCard";
import FilterSidebar from "@/components/filters/FilterSidebar";
import ActiveFilterChips from "@/components/filters/ActiveFilterChips";
import SearchInput from "./SearchInput";
import ResultsHeader from "./ResultsHeader";
import EmptyResults from "./EmptyResults";
import MobileFilterDrawer from "./MobileFilterDrawer";

import type { Opportunity } from "@/data/opportunities";
import { serializeFilters, countActiveFilters } from "@/lib/search/params";
import { applyFilters, computeFacetCounts } from "@/lib/search/filter";
import { sortDirectoryResults } from "@/lib/opportunities/sort";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { EMPTY_FILTERS, type FacetCounts, type SearchFilters, type SortKey } from "@/lib/search/types";

type Props = {
  filters: SearchFilters;
  results: Opportunity[];
  facetCounts: FacetCounts;
  totalAvailable: number;
};

export default function SearchPageClient({
  filters,
  results: ssrResults,
  facetCounts: ssrFacetCounts,
  totalAvailable: ssrTotalAvailable,
}: Props) {
  void ssrResults;
  void ssrFacetCounts;
  void ssrTotalAvailable;
  // Recompute client-side over seed + user-created opps so newly published
  // listings appear immediately on the marketplace.
  const allOpps = useAllOpportunities();
  const { results, facetCounts, totalAvailable } = useMemo(() => {
    const filtered = applyFilters(allOpps, filters);
    return {
      results: sortDirectoryResults(filtered, filters.sort),
      facetCounts: computeFacetCounts(allOpps, filters),
      totalAvailable: allOpps.length,
    };
  }, [allOpps, filters]);
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pushFilters = (next: SearchFilters) => {
    const qs = serializeFilters(next);
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const onUpdate = (partial: Partial<SearchFilters>) => {
    pushFilters({ ...filters, ...partial });
  };

  const onClearFilters = () => {
    // Wipe filters but keep query + sort intact
    pushFilters({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort });
  };

  const onClearAll = () => {
    pushFilters(EMPTY_FILTERS);
  };

  const onSortChange = (sort: SortKey) => {
    pushFilters({ ...filters, sort });
  };

  const onQuerySubmit = (q: string) => {
    pushFilters({ ...filters, q });
  };

  const activeCount = countActiveFilters(filters);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="bg-white border-b border-navy-900/[0.06]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-5 md:py-7">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
            Discover
          </div>
          <h1 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
            Marketplace Search
          </h1>
          <div className="mt-4 md:mt-5 max-w-3xl">
            <SearchInput
              initialValue={filters.q}
              onSubmit={onQuerySubmit}
              placeholder="Search by title, sponsor, category, location…"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-6 md:py-8">
        <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-6">
              <FilterSidebar
                filters={filters}
                facetCounts={facetCounts}
                onUpdate={onUpdate}
                onClearAll={onClearAll}
              />
            </div>
          </aside>

          <main className="min-w-0">
            {/* Mobile filter button */}
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-navy-900/[0.08] hover:ring-navy-900/20 text-navy-900 text-sm font-semibold px-4 py-2.5 transition-shadow"
              >
                <SlidersHorizontal className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
                Filters
                {activeCount > 0 ? (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold">
                    {activeCount}
                  </span>
                ) : null}
              </button>
              <span className="text-xs text-navy-700/55 ml-auto">
                {results.length} {results.length === 1 ? "result" : "results"}
              </span>
            </div>

            <ResultsHeader
              totalCount={results.length}
              totalAvailable={totalAvailable}
              query={filters.q}
              sort={filters.sort}
              onSortChange={onSortChange}
            />

            <div className="mb-5">
              <ActiveFilterChips
                filters={filters}
                onUpdate={onUpdate}
                onClearAll={onClearAll}
              />
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                {results.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            ) : (
              <EmptyResults onClearFilters={onClearFilters} />
            )}
          </main>
        </div>
      </div>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        facetCounts={facetCounts}
        onUpdate={onUpdate}
        onClearAll={onClearAll}
        totalCount={results.length}
      />
    </div>
  );
}
