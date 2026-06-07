import type { Metadata } from "next";

import { featuredOpportunities } from "@/data/opportunities";
import { getFeaturedOpportunityOfTheWeek } from "@/data/opportunities/collections";
import { parseSearchParams, countActiveFilters } from "@/lib/search/params";
import { applyFilters, computeFacetCounts } from "@/lib/search/filter";
import { sortDirectoryResults } from "@/lib/opportunities/sort";

import DirectoryHero from "@/components/opportunities/DirectoryHero";
import FeaturedOpportunityHero from "@/components/opportunities/FeaturedOpportunityHero";
import QuickFilterPills from "@/components/opportunities/QuickFilterPills";
import DirectoryClient from "@/components/opportunities/DirectoryClient";
import DirectoryCollections from "@/components/opportunities/DirectoryCollections";

export const metadata: Metadata = {
  title: "Opportunities — Capital Circle Directory",
  description:
    "Browse every active investment opportunity on Capital Circle — joint ventures, hotels, land, businesses for sale, energy, suppliers, and services. Filter by category, deal type, location, funding range, and status.",
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

export default async function OpportunitiesDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const usp = rawToURLSearchParams(raw);
  const filters = parseSearchParams(usp);
  const filtered = applyFilters(featuredOpportunities, filters);
  const results = sortDirectoryResults(filtered, filters.sort);
  const facetCounts = computeFacetCounts(featuredOpportunities, filters);
  const activeCount = countActiveFilters(filters);

  const featuredOfWeek = getFeaturedOpportunityOfTheWeek();

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <DirectoryHero />

      {/* Featured Opportunity of the Week — hidden when filters are applied to
          keep the directory feeling like a search results page mid-flow */}
      {activeCount === 0 ? (
        <FeaturedOpportunityHero opportunity={featuredOfWeek} />
      ) : null}

      <QuickFilterPills />

      <DirectoryClient
        filters={filters}
        results={results}
        facetCounts={facetCounts}
        totalAvailable={featuredOpportunities.length}
      />

      {activeCount === 0 ? <DirectoryCollections /> : null}
    </div>
  );
}
