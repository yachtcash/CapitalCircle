// Filter + sort logic for opportunities, plus facet counting.

import type { Opportunity } from "@/data/opportunities";
import {
  EMPTY_FILTERS,
  FUNDING_RANGES,
  type FacetCounts,
  type FundingRangeValue,
  type SearchFilters,
  type SortKey,
} from "./types";

function normalize(s: string | undefined | null): string {
  return (s ?? "").toLowerCase();
}

function matchesQuery(opportunity: Opportunity, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  const haystack = [
    opportunity.title,
    opportunity.postedBy,
    opportunity.category,
    opportunity.dealType,
    opportunity.industry,
    opportunity.location,
    opportunity.place?.country,
    opportunity.place?.state,
    opportunity.place?.city,
    opportunity.description,
  ]
    .map(normalize)
    .join("\n");
  return haystack.includes(needle);
}

export function fundingRangeFor(amount: number): FundingRangeValue | null {
  for (const r of FUNDING_RANGES) {
    if (amount >= r.min && amount < r.max) return r.value;
  }
  return null;
}

export function fundingMatches(
  amount: number,
  ranges: FundingRangeValue[]
): boolean {
  if (ranges.length === 0) return true;
  const bucket = fundingRangeFor(amount);
  return bucket !== null && ranges.includes(bucket);
}

function passes(opportunity: Opportunity, filters: SearchFilters): boolean {
  if (!matchesQuery(opportunity, filters.q)) return false;
  if (filters.category.length > 0 && !filters.category.includes(opportunity.category)) return false;
  if (filters.listingType.length > 0 && !filters.listingType.includes(opportunity.listingType))
    return false;
  if (filters.dealType.length > 0 && !filters.dealType.includes(opportunity.dealType)) return false;
  if (
    filters.country.length > 0 &&
    !filters.country.includes(opportunity.place?.country ?? "")
  )
    return false;
  if (filters.city.length > 0 && !filters.city.includes(opportunity.place?.city ?? "")) return false;
  if (!fundingMatches(opportunity.fundingAmount ?? 0, filters.funding)) return false;
  if (filters.status.length > 0 && !filters.status.includes(opportunity.status)) return false;
  if (filters.company.length > 0 && !filters.company.includes(opportunity.companyId))
    return false;
  return true;
}

export function applyFilters(
  opportunities: Opportunity[],
  filters: SearchFilters
): Opportunity[] {
  return opportunities.filter((o) => passes(o, filters));
}

export function sortResults(opportunities: Opportunity[], sort: SortKey): Opportunity[] {
  const arr = [...opportunities];
  switch (sort) {
    case "newest":
      return arr.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    case "oldest":
      return arr.sort((a, b) => a.postedAt.localeCompare(b.postedAt));
    case "featured":
      return arr.sort((a, b) => {
        if (a.featured === b.featured) return b.postedAt.localeCompare(a.postedAt);
        return a.featured ? -1 : 1;
      });
    case "trending":
      return arr.sort((a, b) => {
        if (a.trending === b.trending) return b.postedAt.localeCompare(a.postedAt);
        return a.trending ? -1 : 1;
      });
    case "alphabetical":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "most_viewed":
    case "most_saved":
    case "most_interested":
      // Metric-based sorts need listing data. The directory's
      // sortDirectoryResults() handles them; in pure search we fall back
      // to newest to keep behaviour predictable.
      return arr.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    default:
      return arr;
  }
}

// Per-facet count: for each filter group, count how many opportunities
// would match if THIS group's selection were cleared but every other
// active filter remained. This gives accurate "if you selected this"
// counts in the sidebar.
export function computeFacetCounts(
  opportunities: Opportunity[],
  filters: SearchFilters
): FacetCounts {
  const facets: FacetCounts = {
    category: {},
    listingType: {},
    dealType: {},
    country: {},
    city: {},
    funding: {},
    status: {},
  };

  const countIn = (
    key: keyof FacetCounts,
    value: string | null | undefined,
    pool: Opportunity[]
  ) => {
    if (!value) return;
    facets[key][value] = (facets[key][value] ?? 0) + 1;
  };

  const without = (key: keyof FacetCounts): SearchFilters => ({
    ...filters,
    [key]: [],
  });

  // category counts: ignore current category selection
  for (const o of applyFilters(opportunities, without("category"))) {
    countIn("category", o.category, opportunities);
  }
  for (const o of applyFilters(opportunities, without("listingType"))) {
    countIn("listingType", o.listingType, opportunities);
  }
  for (const o of applyFilters(opportunities, without("dealType"))) {
    countIn("dealType", o.dealType, opportunities);
  }
  for (const o of applyFilters(opportunities, without("country"))) {
    countIn("country", o.place?.country, opportunities);
  }
  for (const o of applyFilters(opportunities, without("city"))) {
    countIn("city", o.place?.city, opportunities);
  }
  for (const o of applyFilters(opportunities, without("funding"))) {
    const bucket = fundingRangeFor(o.fundingAmount ?? 0);
    countIn("funding", bucket, opportunities);
  }
  for (const o of applyFilters(opportunities, without("status"))) {
    countIn("status", o.status, opportunities);
  }

  return facets;
}

export { EMPTY_FILTERS };
