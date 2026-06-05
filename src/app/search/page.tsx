import type { Metadata } from "next";

import { featuredOpportunities } from "@/data/opportunities";
import { parseSearchParams } from "@/lib/search/params";
import { applyFilters, computeFacetCounts, sortResults } from "@/lib/search/filter";
import SearchPageClient from "@/components/search/SearchPageClient";

export const metadata: Metadata = {
  title: "Search the Marketplace",
  description:
    "Search Capital Circle opportunities by category, deal type, location, funding range, and status — the private marketplace for vetted investors, developers, and operators.",
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function rawToURLSearchParams(raw: RawSearchParams): URLSearchParams {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") usp.append(key, item);
      }
    } else if (typeof value === "string") {
      usp.set(key, value);
    }
  }
  return usp;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const usp = rawToURLSearchParams(raw);

  const filters = parseSearchParams(usp);
  const filtered = applyFilters(featuredOpportunities, filters);
  const results = sortResults(filtered, filters.sort);
  const facetCounts = computeFacetCounts(featuredOpportunities, filters);

  return (
    <SearchPageClient
      filters={filters}
      results={results}
      facetCounts={facetCounts}
      totalAvailable={featuredOpportunities.length}
    />
  );
}
