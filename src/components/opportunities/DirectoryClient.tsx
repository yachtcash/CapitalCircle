"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal, Search } from "lucide-react";

import OpportunityCard from "@/components/OpportunityCard";
import FilterSidebar from "@/components/filters/FilterSidebar";
import ActiveFilterChips from "@/components/filters/ActiveFilterChips";
import SortControl from "@/components/search/SortControl";
import EmptyResults from "@/components/search/EmptyResults";
import MobileFilterDrawer from "@/components/search/MobileFilterDrawer";

import type { Opportunity } from "@/data/opportunities";
import { serializeFilters, countActiveFilters } from "@/lib/search/params";
import { EMPTY_FILTERS, type FacetCounts, type SearchFilters, type SortKey } from "@/lib/search/types";

type Props = {
  filters: SearchFilters;
  results: Opportunity[];
  facetCounts: FacetCounts;
  totalAvailable: number;
};

export default function DirectoryClient({
  filters,
  results,
  facetCounts,
  totalAvailable,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.q);

  const pushFilters = (next: SearchFilters) => {
    const qs = serializeFilters(next);
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const onUpdate = (partial: Partial<SearchFilters>) =>
    pushFilters({ ...filters, ...partial });

  const onClearFilters = () =>
    pushFilters({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort });

  const onClearAll = () => pushFilters(EMPTY_FILTERS);

  const onSortChange = (sort: SortKey) =>
    pushFilters({ ...filters, sort });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushFilters({ ...filters, q: searchValue.trim() });
  };

  const activeCount = countActiveFilters(filters);
  const noun = results.length === 1 ? "opportunity" : "opportunities";
  const allShown = results.length === totalAvailable;

  return (
    <>
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-10 pt-6 md:pt-8 pb-4">
          {/* Search bar */}
          <form
            onSubmit={submitSearch}
            className="bg-white rounded-full ring-1 ring-navy-900/[0.08] focus-within:ring-2 focus-within:ring-gold-500 shadow-sm transition-shadow flex items-center gap-2"
          >
            <span className="pl-4 text-navy-700/60">
              <Search className="h-4 w-4" strokeWidth={2} />
            </span>
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by title, company, location, category, or deal type"
              className="flex-1 bg-transparent outline-none py-3 text-sm md:text-base text-navy-900 placeholder:text-navy-700/45"
            />
            <button
              type="submit"
              className="mr-1.5 inline-flex items-center justify-center rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs uppercase tracking-[0.14em] px-4 py-2 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-10 pb-8 md:pb-10">
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
              {/* Mobile filter trigger + results count */}
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
                  {results.length} {noun}
                </span>
              </div>

              {/* Desktop toolbar */}
              <div className="hidden lg:flex items-center justify-between gap-4 mb-4">
                <div className="text-sm text-navy-900">
                  <span className="font-semibold tabular-nums">{results.length}</span>{" "}
                  <span className="text-navy-700/70">{noun}</span>
                  {filters.q ? (
                    <>
                      {" "}
                      <span className="text-navy-700/55">for</span>{" "}
                      <span className="font-semibold">&ldquo;{filters.q}&rdquo;</span>
                    </>
                  ) : null}
                  {!allShown ? (
                    <span className="text-navy-700/55"> · of {totalAvailable} total</span>
                  ) : null}
                </div>
                <SortControl value={filters.sort} onChange={onSortChange} />
              </div>

              {/* Mobile sort */}
              <div className="lg:hidden flex items-center justify-end mb-4">
                <SortControl value={filters.sort} onChange={onSortChange} />
              </div>

              <div className="mb-5">
                <ActiveFilterChips
                  filters={filters}
                  onUpdate={onUpdate}
                  onClearAll={onClearAll}
                />
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                  {results.map((opportunity, i) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      priority={i === 0}
                      showPublicId
                    />
                  ))}
                </div>
              ) : (
                <EmptyResults onClearFilters={onClearFilters} />
              )}
            </main>
          </div>
        </div>
      </section>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        facetCounts={facetCounts}
        onUpdate={onUpdate}
        onClearAll={onClearAll}
        totalCount={results.length}
      />
    </>
  );
}
