// All types for the search + filter system.

export const SORT_KEYS = [
  "newest",
  "oldest",
  "featured",
  "trending",
  "alphabetical",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const FUNDING_RANGES = [
  { value: "u100k", label: "Under $100K", min: 0, max: 100_000 },
  { value: "100k-500k", label: "$100K – $500K", min: 100_000, max: 500_000 },
  { value: "500k-1m", label: "$500K – $1M", min: 500_000, max: 1_000_000 },
  { value: "1m-5m", label: "$1M – $5M", min: 1_000_000, max: 5_000_000 },
  { value: "5m-10m", label: "$5M – $10M", min: 5_000_000, max: 10_000_000 },
  { value: "10m+", label: "$10M+", min: 10_000_000, max: Number.POSITIVE_INFINITY },
] as const;
export type FundingRangeValue = (typeof FUNDING_RANGES)[number]["value"];

export type SearchFilters = {
  q: string;
  category: string[];
  listingType: string[];
  dealType: string[];
  country: string[];
  city: string[];
  funding: FundingRangeValue[];
  status: string[];
  sort: SortKey;
};

export const EMPTY_FILTERS: SearchFilters = {
  q: "",
  category: [],
  listingType: [],
  dealType: [],
  country: [],
  city: [],
  funding: [],
  status: [],
  sort: "newest",
};

export type FacetKey =
  | "category"
  | "listingType"
  | "dealType"
  | "country"
  | "city"
  | "funding"
  | "status";

export type FacetCounts = Record<FacetKey, Record<string, number>>;
