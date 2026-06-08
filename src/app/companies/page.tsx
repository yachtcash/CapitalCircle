import type { Metadata } from "next";

import { companies } from "@/data/companies";
import { getFeaturedCompanyOfTheWeek } from "@/data/company-directory/collections";
import { parseCompanyParams, countActiveCompanyFilters } from "@/lib/company-directory/params";
import {
  applyCompanyFilters,
  computeCompanyFacetCounts,
  sortCompanies,
} from "@/lib/company-directory/filter";

import CompanyDirectoryHero from "@/components/company-directory/CompanyDirectoryHero";
import FeaturedCompanyHero from "@/components/company-directory/FeaturedCompanyHero";
import CompanyQuickFilterPills from "@/components/company-directory/CompanyQuickFilterPills";
import CompanyDirectoryClient from "@/components/company-directory/CompanyDirectoryClient";
import CompanyDirectoryCollections from "@/components/company-directory/CompanyDirectoryCollections";

export const metadata: Metadata = {
  title: "Companies — Capital Circle Directory",
  description:
    "Browse vetted firms participating in Capital Circle — developers, investors, hospitality operators, energy independents, construction partners, and supply-chain leaders. Filter by industry, verification, location, founding year, and active opportunities.",
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

export default async function CompanyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const usp = rawToURLSearchParams(raw);
  const filters = parseCompanyParams(usp);
  const filtered = applyCompanyFilters(companies, filters);
  const results = sortCompanies(filtered, filters.sort);
  const facetCounts = computeCompanyFacetCounts(companies, filters);
  const activeCount = countActiveCompanyFilters(filters);

  const featured = getFeaturedCompanyOfTheWeek();

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <CompanyDirectoryHero />

      {activeCount === 0 ? <FeaturedCompanyHero company={featured} /> : null}

      <CompanyQuickFilterPills />

      <CompanyDirectoryClient
        filters={filters}
        results={results}
        facetCounts={facetCounts}
        totalAvailable={companies.length}
      />

      {activeCount === 0 ? <CompanyDirectoryCollections /> : null}
    </div>
  );
}
