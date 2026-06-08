import type { Metadata } from "next";

import { featuredOpportunities } from "@/data/opportunities";
import { parseSearchParams } from "@/lib/search/params";
import { applyFilters } from "@/lib/search/filter";
import MapClient from "@/components/map/MapClient";

export const metadata: Metadata = {
  title: "Map View — Capital Circle",
  description:
    "Explore Capital Circle opportunities by location — interactive map of investments, joint ventures, hotels, land, energy projects, and businesses, with markers grouped by category.",
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

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const usp = rawToURLSearchParams(raw);
  const filters = parseSearchParams(usp);
  const opportunities = applyFilters(featuredOpportunities, filters);

  return (
    <MapClient
      filters={filters}
      opportunities={opportunities}
      totalAvailable={featuredOpportunities.length}
    />
  );
}
