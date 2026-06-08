import type { Company } from "@/data/companies";
import { getActiveOpportunitiesForCompany } from "@/data/companies";
import {
  EMPTY_COMPANY_FILTERS,
  FOUNDED_YEAR_RANGES,
  OPPORTUNITY_COUNT_RANGES,
  type CompanyFacetCounts,
  type CompanyFilters,
  type CompanySortKey,
  type FoundedYearRangeValue,
  type OpportunityCountRangeValue,
} from "./types";

function normalize(s: string | undefined | null): string {
  return (s ?? "").toLowerCase();
}

function activeOpportunityCount(company: Company): number {
  return getActiveOpportunitiesForCompany(company.id).length;
}

function matchesQuery(company: Company, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  const hay = [
    company.name,
    company.industry,
    company.tagline,
    company.headquarters.city,
    company.headquarters.state,
    company.headquarters.country,
    ...company.searchKeywords,
  ]
    .map(normalize)
    .join("\n");
  return hay.includes(needle);
}

function inFoundedRange(year: number, value: FoundedYearRangeValue): boolean {
  const r = FOUNDED_YEAR_RANGES.find((x) => x.value === value);
  if (!r) return false;
  return year >= r.min && year < r.max;
}

function inOpportunityCountRange(
  count: number,
  value: OpportunityCountRangeValue
): boolean {
  const r = OPPORTUNITY_COUNT_RANGES.find((x) => x.value === value);
  if (!r) return false;
  return count >= r.min && count < r.max;
}

function passes(company: Company, filters: CompanyFilters): boolean {
  if (!matchesQuery(company, filters.q)) return false;
  if (filters.industry.length > 0 && !filters.industry.includes(company.industry))
    return false;
  if (filters.verification.length > 0 && !filters.verification.includes(company.verification))
    return false;
  if (
    filters.country.length > 0 &&
    !filters.country.includes(company.headquarters.country ?? "")
  )
    return false;
  if (
    filters.state.length > 0 &&
    !filters.state.includes(company.headquarters.state ?? "")
  )
    return false;
  if (
    filters.city.length > 0 &&
    !filters.city.includes(company.headquarters.city ?? "")
  )
    return false;
  if (filters.founded.length > 0) {
    const ok = filters.founded.some((r) => inFoundedRange(company.foundedYear, r));
    if (!ok) return false;
  }
  if (filters.opportunityCount.length > 0) {
    const count = activeOpportunityCount(company);
    const ok = filters.opportunityCount.some((r) =>
      inOpportunityCountRange(count, r)
    );
    if (!ok) return false;
  }
  return true;
}

export function applyCompanyFilters(
  companies: Company[],
  filters: CompanyFilters
): Company[] {
  return companies.filter((c) => passes(c, filters));
}

const VERIFICATION_RANK: Record<Company["verification"], number> = {
  "Premium Verified": 0,
  Verified: 1,
  Pending: 2,
};

export function sortCompanies(
  companies: Company[],
  sort: CompanySortKey
): Company[] {
  const arr = [...companies];
  switch (sort) {
    case "newest":
      return arr.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    case "oldest":
      return arr.sort((a, b) => a.addedAt.localeCompare(b.addedAt));
    case "most_opportunities":
      return arr.sort(
        (a, b) => activeOpportunityCount(b) - activeOpportunityCount(a)
      );
    case "premium_verified":
      return arr.sort((a, b) => {
        const r = VERIFICATION_RANK[a.verification] - VERIFICATION_RANK[b.verification];
        if (r !== 0) return r;
        return b.addedAt.localeCompare(a.addedAt);
      });
    case "alphabetical":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return arr.sort((a, b) => {
        const af = a.featured ? 0 : 1;
        const bf = b.featured ? 0 : 1;
        if (af !== bf) return af - bf;
        return b.addedAt.localeCompare(a.addedAt);
      });
  }
}

// Per-facet counts: clear THIS group's selection then apply everything else;
// count companies in each value for that group.
export function computeCompanyFacetCounts(
  companies: Company[],
  filters: CompanyFilters
): CompanyFacetCounts {
  const out: CompanyFacetCounts = {
    industry: {},
    verification: {},
    country: {},
    state: {},
    city: {},
    founded: {},
    opportunityCount: {},
  };

  const without = (key: keyof CompanyFacetCounts): CompanyFilters => ({
    ...filters,
    [key]: [] as never,
  });

  const bump = (
    facet: keyof CompanyFacetCounts,
    value: string | undefined | null
  ) => {
    if (!value) return;
    out[facet][value] = (out[facet][value] ?? 0) + 1;
  };

  for (const c of applyCompanyFilters(companies, without("industry"))) {
    bump("industry", c.industry);
  }
  for (const c of applyCompanyFilters(companies, without("verification"))) {
    bump("verification", c.verification);
  }
  for (const c of applyCompanyFilters(companies, without("country"))) {
    bump("country", c.headquarters.country);
  }
  for (const c of applyCompanyFilters(companies, without("state"))) {
    bump("state", c.headquarters.state);
  }
  for (const c of applyCompanyFilters(companies, without("city"))) {
    bump("city", c.headquarters.city);
  }
  for (const c of applyCompanyFilters(companies, without("founded"))) {
    for (const r of FOUNDED_YEAR_RANGES) {
      if (inFoundedRange(c.foundedYear, r.value)) bump("founded", r.value);
    }
  }
  for (const c of applyCompanyFilters(companies, without("opportunityCount"))) {
    const count = activeOpportunityCount(c);
    for (const r of OPPORTUNITY_COUNT_RANGES) {
      if (inOpportunityCountRange(count, r.value)) bump("opportunityCount", r.value);
    }
  }

  return out;
}

export { EMPTY_COMPANY_FILTERS };
