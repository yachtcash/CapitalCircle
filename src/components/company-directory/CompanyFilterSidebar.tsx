"use client";

import { useMemo } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import FilterSection from "@/components/filters/FilterSection";
import CheckboxList from "@/components/filters/CheckboxList";
import { companies } from "@/data/companies";
import {
  FOUNDED_YEAR_RANGES,
  OPPORTUNITY_COUNT_RANGES,
  type CompanyFacetCounts,
  type CompanyFilters,
} from "@/lib/company-directory/types";

type Props = {
  filters: CompanyFilters;
  facetCounts: CompanyFacetCounts;
  onUpdate: (partial: Partial<CompanyFilters>) => void;
  onClearAll: () => void;
  showHeader?: boolean;
};

const VERIFICATION_OPTIONS = [
  "Pending",
  "Verified",
  "Premium Verified",
] as const;

function distinctSorted<T>(arr: (T | undefined)[]): T[] {
  const out = new Set<T>();
  for (const v of arr) {
    if (v !== undefined && v !== null) out.add(v);
  }
  return Array.from(out).sort();
}

export default function CompanyFilterSidebar({
  filters,
  facetCounts,
  onUpdate,
  onClearAll,
  showHeader = true,
}: Props) {
  const industries = useMemo(() => distinctSorted(companies.map((c) => c.industry)), []);
  const countries = useMemo(
    () => distinctSorted(companies.map((c) => c.headquarters.country)),
    []
  );
  const states = useMemo(
    () => distinctSorted(companies.map((c) => c.headquarters.state)),
    []
  );
  const cities = useMemo(
    () => distinctSorted(companies.map((c) => c.headquarters.city)),
    []
  );

  const totalSelected =
    filters.industry.length +
    filters.verification.length +
    filters.country.length +
    filters.state.length +
    filters.city.length +
    filters.founded.length +
    filters.opportunityCount.length;

  const withCounts = (values: readonly string[], counts: Record<string, number>) =>
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

      <FilterSection title="Industry" selectedCount={filters.industry.length}>
        <CheckboxList
          options={withCounts(industries, facetCounts.industry)}
          selected={filters.industry}
          onChange={(v) => onUpdate({ industry: v })}
        />
      </FilterSection>

      <FilterSection
        title="Verification"
        selectedCount={filters.verification.length}
      >
        <CheckboxList
          options={withCounts(VERIFICATION_OPTIONS, facetCounts.verification)}
          selected={filters.verification}
          onChange={(v) => onUpdate({ verification: v as CompanyFilters["verification"] })}
        />
      </FilterSection>

      <FilterSection title="Country" selectedCount={filters.country.length}>
        <CheckboxList
          options={withCounts(countries, facetCounts.country)}
          selected={filters.country}
          onChange={(v) => onUpdate({ country: v })}
        />
      </FilterSection>

      <FilterSection title="State" selectedCount={filters.state.length} defaultOpen={false}>
        <CheckboxList
          options={withCounts(states, facetCounts.state)}
          selected={filters.state}
          onChange={(v) => onUpdate({ state: v })}
        />
      </FilterSection>

      <FilterSection title="City" selectedCount={filters.city.length} defaultOpen={false}>
        <CheckboxList
          options={withCounts(cities, facetCounts.city)}
          selected={filters.city}
          onChange={(v) => onUpdate({ city: v })}
        />
      </FilterSection>

      <FilterSection title="Founded year" selectedCount={filters.founded.length}>
        <CheckboxList
          options={FOUNDED_YEAR_RANGES.map((r) => ({
            value: r.value,
            label: r.label,
            count: facetCounts.founded[r.value] ?? 0,
          }))}
          selected={filters.founded}
          onChange={(v) => onUpdate({ founded: v as CompanyFilters["founded"] })}
        />
      </FilterSection>

      <FilterSection
        title="Active opportunities"
        selectedCount={filters.opportunityCount.length}
      >
        <CheckboxList
          options={OPPORTUNITY_COUNT_RANGES.map((r) => ({
            value: r.value,
            label: r.label,
            count: facetCounts.opportunityCount[r.value] ?? 0,
          }))}
          selected={filters.opportunityCount}
          onChange={(v) =>
            onUpdate({ opportunityCount: v as CompanyFilters["opportunityCount"] })
          }
        />
      </FilterSection>
    </div>
  );
}
