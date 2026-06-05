"use client";

import { useMemo } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import FilterSection from "./FilterSection";
import CheckboxList, { type CheckboxOption } from "./CheckboxList";
import {
  CATEGORY_OPTIONS,
  DEAL_TYPE_OPTIONS,
  LISTING_TYPE_OPTIONS,
  STATUS_OPTIONS,
  getCityOptions,
  getCountryOptions,
} from "@/lib/search/options";
import { FUNDING_RANGES, type FacetCounts, type SearchFilters } from "@/lib/search/types";

type Props = {
  filters: SearchFilters;
  facetCounts: FacetCounts;
  onUpdate: (partial: Partial<SearchFilters>) => void;
  onClearAll: () => void;
  showHeader?: boolean;
};

export default function FilterSidebar({
  filters,
  facetCounts,
  onUpdate,
  onClearAll,
  showHeader = true,
}: Props) {
  const countries = useMemo(() => getCountryOptions(), []);
  const cities = useMemo(() => getCityOptions(), []);

  const totalSelected =
    filters.category.length +
    filters.listingType.length +
    filters.dealType.length +
    filters.country.length +
    filters.city.length +
    filters.funding.length +
    filters.status.length;

  const withCounts = (
    values: readonly string[],
    counts: Record<string, number>
  ): CheckboxOption[] =>
    values.map((v) => ({ value: v, label: v, count: counts[v] ?? 0 }));

  return (
    <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      {showHeader ? (
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-navy-900/[0.06]">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900">
            <SlidersHorizontal className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
            Filters
            {totalSelected > 0 ? (
              <span className="text-navy-700/55 font-normal">· {totalSelected} active</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClearAll}
            disabled={totalSelected === 0 && !filters.q}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] font-semibold text-navy-700/65 hover:text-gold-700 disabled:text-navy-700/30 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2.4} />
            Reset
          </button>
        </div>
      ) : null}

      <FilterSection title="Category" selectedCount={filters.category.length}>
        <CheckboxList
          options={withCounts(CATEGORY_OPTIONS, facetCounts.category)}
          selected={filters.category}
          onChange={(v) => onUpdate({ category: v })}
        />
      </FilterSection>

      <FilterSection title="Listing Type" selectedCount={filters.listingType.length}>
        <CheckboxList
          options={withCounts(LISTING_TYPE_OPTIONS, facetCounts.listingType)}
          selected={filters.listingType}
          onChange={(v) => onUpdate({ listingType: v })}
        />
      </FilterSection>

      <FilterSection title="Deal Type" selectedCount={filters.dealType.length}>
        <CheckboxList
          options={withCounts(DEAL_TYPE_OPTIONS, facetCounts.dealType)}
          selected={filters.dealType}
          onChange={(v) => onUpdate({ dealType: v })}
        />
      </FilterSection>

      <FilterSection title="Country" selectedCount={filters.country.length}>
        <CheckboxList
          options={withCounts(countries, facetCounts.country)}
          selected={filters.country}
          onChange={(v) => onUpdate({ country: v })}
          emptyMessage="No countries in current listings."
        />
      </FilterSection>

      <FilterSection title="City" selectedCount={filters.city.length} defaultOpen={false}>
        <CheckboxList
          options={withCounts(cities, facetCounts.city)}
          selected={filters.city}
          onChange={(v) => onUpdate({ city: v })}
          emptyMessage="No cities in current listings."
        />
      </FilterSection>

      <FilterSection title="Funding Range" selectedCount={filters.funding.length}>
        <CheckboxList
          options={FUNDING_RANGES.map((r) => ({
            value: r.value,
            label: r.label,
            count: facetCounts.funding[r.value] ?? 0,
          }))}
          selected={filters.funding}
          onChange={(v) => onUpdate({ funding: v as SearchFilters["funding"] })}
        />
      </FilterSection>

      <FilterSection title="Opportunity Status" selectedCount={filters.status.length}>
        <CheckboxList
          options={withCounts(STATUS_OPTIONS, facetCounts.status)}
          selected={filters.status}
          onChange={(v) => onUpdate({ status: v })}
        />
      </FilterSection>
    </div>
  );
}
