"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  Search,
  X,
  Building2,
  ArrowRight,
  SearchX,
} from "lucide-react";

import CompanyCard from "./CompanyCard";
import CompanyFilterSidebar from "./CompanyFilterSidebar";
import CompanySortControl from "./CompanySortControl";

import type { Company } from "@/data/companies";
import {
  countActiveCompanyFilters,
  serializeCompanyFilters,
} from "@/lib/company-directory/params";
import {
  EMPTY_COMPANY_FILTERS,
  FOUNDED_YEAR_RANGES,
  OPPORTUNITY_COUNT_RANGES,
  type CompanyFacetCounts,
  type CompanyFilters,
  type CompanySortKey,
} from "@/lib/company-directory/types";
import { cn } from "@/lib/cn";

type Props = {
  filters: CompanyFilters;
  results: Company[];
  facetCounts: CompanyFacetCounts;
  totalAvailable: number;
};

function fundingLabelForFounded(value: string): string {
  return FOUNDED_YEAR_RANGES.find((r) => r.value === value)?.label ?? value;
}
function labelForOpportunityCount(value: string): string {
  return OPPORTUNITY_COUNT_RANGES.find((r) => r.value === value)?.label ?? value;
}

export default function CompanyDirectoryClient({
  filters,
  results,
  facetCounts,
  totalAvailable,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.q);

  const pushFilters = (next: CompanyFilters) => {
    const qs = serializeCompanyFilters(next);
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const onUpdate = (partial: Partial<CompanyFilters>) =>
    pushFilters({ ...filters, ...partial });

  const onClearFilters = () =>
    pushFilters({ ...EMPTY_COMPANY_FILTERS, q: filters.q, sort: filters.sort });

  const onClearAll = () => pushFilters(EMPTY_COMPANY_FILTERS);

  const onSortChange = (sort: CompanySortKey) =>
    pushFilters({ ...filters, sort });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushFilters({ ...filters, q: searchValue.trim() });
  };

  const activeCount = countActiveCompanyFilters(filters);
  const noun = results.length === 1 ? "company" : "companies";
  const allShown = results.length === totalAvailable;

  const chips: {
    id: string;
    label: string;
    remove: () => void;
  }[] = [];

  if (filters.q.trim()) {
    chips.push({
      id: `q:${filters.q}`,
      label: `“${filters.q.trim()}”`,
      remove: () => onUpdate({ q: "" }),
    });
  }

  const removeFromGroup = (
    key: keyof CompanyFilters,
    value: string,
    current: string[]
  ) => {
    onUpdate({ [key]: current.filter((v) => v !== value) } as Partial<CompanyFilters>);
  };

  const multiGroups: {
    key: keyof CompanyFilters;
    labelFor?: (v: string) => string;
  }[] = [
    { key: "industry" },
    { key: "verification" },
    { key: "country" },
    { key: "state" },
    { key: "city" },
    { key: "founded", labelFor: fundingLabelForFounded },
    { key: "opportunityCount", labelFor: labelForOpportunityCount },
  ];

  for (const g of multiGroups) {
    const values = filters[g.key] as string[];
    if (!Array.isArray(values)) continue;
    for (const v of values) {
      chips.push({
        id: `${String(g.key)}:${v}`,
        label: g.labelFor ? g.labelFor(v) : v,
        remove: () => removeFromGroup(g.key, v, values),
      });
    }
  }

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
              placeholder="Search by company name, industry, or headquarters"
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
                <CompanyFilterSidebar
                  filters={filters}
                  facetCounts={facetCounts}
                  onUpdate={onUpdate}
                  onClearAll={onClearAll}
                />
              </div>
            </aside>

            <main className="min-w-0">
              {/* Mobile filter trigger + count */}
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

              {/* Desktop header */}
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
                <CompanySortControl value={filters.sort} onChange={onSortChange} />
              </div>

              {/* Mobile sort */}
              <div className="lg:hidden flex items-center justify-end mb-4">
                <CompanySortControl value={filters.sort} onChange={onSortChange} />
              </div>

              {/* Chips */}
              {chips.length > 0 ? (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={chip.remove}
                      className="group inline-flex items-center gap-1.5 rounded-full bg-white text-navy-900 ring-1 ring-navy-900/[0.08] hover:ring-gold-500/60 px-3 py-1.5 text-xs font-medium transition-all"
                    >
                      <span className="truncate max-w-[200px]">{chip.label}</span>
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
              ) : null}

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                  {results.map((company, i) => (
                    <CompanyCard key={company.id} company={company} priority={i === 0} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 md:p-14 text-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-4 ring-navy-900/5">
                    <SearchX className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
                    No companies matched your search.
                  </h3>
                  <p className="mt-3 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-md mx-auto">
                    Try widening your filters or browse the full directory.
                  </p>
                  <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/15 hover:ring-navy-900/40 text-navy-900 font-semibold text-sm px-5 py-2.5 transition-shadow"
                    >
                      Clear Filters
                    </button>
                    <Link
                      href="/companies"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold text-sm px-5 py-2.5 transition-colors"
                    >
                      Browse all companies
                      <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                    </Link>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <div
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 bg-navy-900/55 backdrop-blur-sm z-40 transition-opacity duration-200 lg:hidden",
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[88vw] max-w-md bg-cream z-50 shadow-2xl lg:hidden flex flex-col transition-transform duration-300",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-navy-900/[0.08] bg-white">
          <h2 className="text-sm font-semibold text-navy-900 inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
            Company filters
          </h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filters"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-bone text-navy-900 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <CompanyFilterSidebar
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
            onClick={() => setDrawerOpen(false)}
            className="flex-1 inline-flex items-center justify-center rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold text-sm px-5 py-2.5 transition-colors"
          >
            Show {results.length} {results.length === 1 ? "company" : "companies"}
          </button>
        </footer>
      </aside>
    </>
  );
}
