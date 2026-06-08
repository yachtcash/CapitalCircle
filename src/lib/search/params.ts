// URL search params ↔ SearchFilters serialization.
//
// Multi-value filters are stored as repeated keys (?category=A&category=B) or
// as a single comma-separated key (?category=A,B). Both are accepted on parse;
// serialization uses repeated keys to maximize compatibility with any external
// link builder and to make individual values URL-encoded cleanly.

import {
  EMPTY_FILTERS,
  FUNDING_RANGES,
  SORT_KEYS,
  type FundingRangeValue,
  type SearchFilters,
  type SortKey,
} from "./types";

const MULTI_KEYS: (keyof SearchFilters)[] = [
  "category",
  "listingType",
  "dealType",
  "country",
  "city",
  "funding",
  "status",
  "company",
];

function splitMulti(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function collectMulti(
  sp: URLSearchParams | ReadonlyURLSearchParamsLike,
  key: string
): string[] {
  // Accept either ?key=A&key=B OR ?key=A,B (mixed allowed).
  const raw =
    typeof sp.getAll === "function" ? sp.getAll(key) : ([sp.get(key) ?? ""] as string[]);
  const out: string[] = [];
  for (const r of raw) {
    out.push(...splitMulti(r));
  }
  return out;
}

// Minimal shape that both URLSearchParams and Next's ReadonlyURLSearchParams satisfy.
interface ReadonlyURLSearchParamsLike {
  get(key: string): string | null;
  getAll?(key: string): string[];
}

const FUNDING_VALUES: Set<string> = new Set(FUNDING_RANGES.map((r) => r.value));
const SORT_VALUES: Set<string> = new Set(SORT_KEYS);

export function parseSearchParams(
  sp: URLSearchParams | ReadonlyURLSearchParamsLike
): SearchFilters {
  const sortRaw = sp.get("sort") ?? "";
  const sort: SortKey = SORT_VALUES.has(sortRaw) ? (sortRaw as SortKey) : "newest";

  const funding = collectMulti(sp, "funding").filter((v): v is FundingRangeValue =>
    FUNDING_VALUES.has(v)
  );

  return {
    q: (sp.get("q") ?? "").trim(),
    category: collectMulti(sp, "category"),
    listingType: collectMulti(sp, "listingType"),
    dealType: collectMulti(sp, "dealType"),
    country: collectMulti(sp, "country"),
    city: collectMulti(sp, "city"),
    funding,
    status: collectMulti(sp, "status"),
    company: collectMulti(sp, "company"),
    sort,
  };
}

export function serializeFilters(filters: SearchFilters): string {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set("q", filters.q.trim());

  for (const key of MULTI_KEYS) {
    const values = filters[key] as string[];
    if (Array.isArray(values) && values.length > 0) {
      for (const v of values) params.append(key, v);
    }
  }

  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  return params.toString();
}

export function buildSearchUrl(filters: Partial<SearchFilters>): string {
  const merged: SearchFilters = { ...EMPTY_FILTERS, ...filters };
  const qs = serializeFilters(merged);
  return qs ? `/search?${qs}` : "/search";
}

export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.q.trim()) count += 1;
  for (const key of MULTI_KEYS) {
    const values = filters[key] as string[];
    if (Array.isArray(values) && values.length > 0) count += values.length;
  }
  return count;
}
