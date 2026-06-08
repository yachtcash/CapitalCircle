// URL search-params ↔ CompanyFilters serialization.
//
// Multi-value filters are serialized as repeated keys for compatibility
// (?industry=A&industry=B) and accepted as either repeated or
// comma-separated on parse.

import {
  COMPANY_SORT_KEYS,
  EMPTY_COMPANY_FILTERS,
  FOUNDED_YEAR_RANGES,
  OPPORTUNITY_COUNT_RANGES,
  type CompanyFilters,
  type CompanySortKey,
  type FoundedYearRangeValue,
  type OpportunityCountRangeValue,
} from "./types";

const MULTI_KEYS: (keyof CompanyFilters)[] = [
  "industry",
  "verification",
  "country",
  "state",
  "city",
  "founded",
  "opportunityCount",
];

interface ReadonlyURLSearchParamsLike {
  get(key: string): string | null;
  getAll?(key: string): string[];
}

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
  const raw =
    typeof sp.getAll === "function" ? sp.getAll(key) : ([sp.get(key) ?? ""] as string[]);
  const out: string[] = [];
  for (const r of raw) out.push(...splitMulti(r));
  return out;
}

const SORT_VALUES = new Set<string>(COMPANY_SORT_KEYS);
const FOUNDED_VALUES = new Set<string>(FOUNDED_YEAR_RANGES.map((r) => r.value));
const OPP_VALUES = new Set<string>(OPPORTUNITY_COUNT_RANGES.map((r) => r.value));
const VERIFICATION_VALUES = new Set(["Pending", "Verified", "Premium Verified"]);

export function parseCompanyParams(
  sp: URLSearchParams | ReadonlyURLSearchParamsLike
): CompanyFilters {
  const sortRaw = sp.get("sort") ?? "";
  const sort: CompanySortKey = SORT_VALUES.has(sortRaw)
    ? (sortRaw as CompanySortKey)
    : "featured";

  const founded = collectMulti(sp, "founded").filter(
    (v): v is FoundedYearRangeValue => FOUNDED_VALUES.has(v)
  );
  const opportunityCount = collectMulti(sp, "opportunityCount").filter(
    (v): v is OpportunityCountRangeValue => OPP_VALUES.has(v)
  );
  const verification = collectMulti(sp, "verification").filter((v) =>
    VERIFICATION_VALUES.has(v)
  ) as CompanyFilters["verification"];

  return {
    q: (sp.get("q") ?? "").trim(),
    industry: collectMulti(sp, "industry"),
    verification,
    country: collectMulti(sp, "country"),
    state: collectMulti(sp, "state"),
    city: collectMulti(sp, "city"),
    founded,
    opportunityCount,
    sort,
  };
}

export function serializeCompanyFilters(filters: CompanyFilters): string {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set("q", filters.q.trim());

  for (const key of MULTI_KEYS) {
    const values = filters[key] as string[];
    if (Array.isArray(values) && values.length > 0) {
      for (const v of values) params.append(key, v);
    }
  }

  if (filters.sort && filters.sort !== "featured") {
    params.set("sort", filters.sort);
  }

  return params.toString();
}

export function countActiveCompanyFilters(filters: CompanyFilters): number {
  let count = 0;
  if (filters.q.trim()) count += 1;
  for (const key of MULTI_KEYS) {
    const values = filters[key] as string[];
    if (Array.isArray(values) && values.length > 0) count += values.length;
  }
  return count;
}

export function buildCompanyUrl(filters: Partial<CompanyFilters>): string {
  const merged: CompanyFilters = { ...EMPTY_COMPANY_FILTERS, ...filters };
  const qs = serializeCompanyFilters(merged);
  return qs ? `/companies?${qs}` : "/companies";
}
