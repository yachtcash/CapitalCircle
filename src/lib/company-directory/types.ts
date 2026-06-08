import type { VerificationStatus } from "@/data/companies";

// ---- Sort -------------------------------------------------------------

export const COMPANY_SORT_KEYS = [
  "featured",
  "newest",
  "oldest",
  "most_opportunities",
  "premium_verified",
  "alphabetical",
] as const;
export type CompanySortKey = (typeof COMPANY_SORT_KEYS)[number];

export const COMPANY_SORT_LABELS: Record<CompanySortKey, string> = {
  featured: "Featured",
  newest: "Newest",
  oldest: "Oldest",
  most_opportunities: "Most Opportunities",
  premium_verified: "Premium Verified",
  alphabetical: "Alphabetical",
};

// ---- Range buckets ----------------------------------------------------

export const FOUNDED_YEAR_RANGES = [
  { value: "before-2010", label: "Before 2010", min: 0, max: 2010 },
  { value: "2010-2015", label: "2010 – 2015", min: 2010, max: 2016 },
  { value: "2015-2020", label: "2015 – 2020", min: 2015, max: 2021 },
  { value: "2020+", label: "2020 or later", min: 2020, max: Number.POSITIVE_INFINITY },
] as const;
export type FoundedYearRangeValue = (typeof FOUNDED_YEAR_RANGES)[number]["value"];

export const OPPORTUNITY_COUNT_RANGES = [
  { value: "none", label: "No active listings", min: 0, max: 1 },
  { value: "one", label: "1 listing", min: 1, max: 2 },
  { value: "2-5", label: "2 – 5 listings", min: 2, max: 6 },
  { value: "6+", label: "6+ listings", min: 6, max: Number.POSITIVE_INFINITY },
] as const;
export type OpportunityCountRangeValue =
  (typeof OPPORTUNITY_COUNT_RANGES)[number]["value"];

// ---- Filters ----------------------------------------------------------

export type CompanyFilters = {
  q: string;
  industry: string[];
  verification: VerificationStatus[];
  country: string[];
  state: string[];
  city: string[];
  founded: FoundedYearRangeValue[];
  opportunityCount: OpportunityCountRangeValue[];
  sort: CompanySortKey;
};

export const EMPTY_COMPANY_FILTERS: CompanyFilters = {
  q: "",
  industry: [],
  verification: [],
  country: [],
  state: [],
  city: [],
  founded: [],
  opportunityCount: [],
  sort: "featured",
};

export type CompanyFacetKey =
  | "industry"
  | "verification"
  | "country"
  | "state"
  | "city"
  | "founded"
  | "opportunityCount";

export type CompanyFacetCounts = Record<CompanyFacetKey, Record<string, number>>;
