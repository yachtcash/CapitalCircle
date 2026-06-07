// Directory-aware sorting. Extends the base search SortKey with
// metric-based options that draw views/saves/interests off the
// owner's listing record for each opportunity.

import type { Opportunity } from "@/data/opportunities";
import { SEED_LISTINGS } from "@/data/listings";
import type { SortKey } from "@/lib/search/types";
import { sortResults as baseSortResults } from "@/lib/search/filter";

type MetricKey = "views" | "saves" | "interests";

function metricFor(opp: Opportunity, key: MetricKey): number {
  const listing = SEED_LISTINGS.find((l) => l.opportunitySlug === opp.slug);
  return listing ? (listing[key] ?? 0) : 0;
}

function sortByMetric(
  opportunities: Opportunity[],
  metric: MetricKey
): Opportunity[] {
  return [...opportunities].sort((a, b) => metricFor(b, metric) - metricFor(a, metric));
}

export function sortDirectoryResults(
  opportunities: Opportunity[],
  sort: SortKey
): Opportunity[] {
  switch (sort) {
    case "most_viewed":
      return sortByMetric(opportunities, "views");
    case "most_saved":
      return sortByMetric(opportunities, "saves");
    case "most_interested":
      return sortByMetric(opportunities, "interests");
    default:
      return baseSortResults(opportunities, sort);
  }
}

export type DirectoryMetrics = {
  views: number;
  saves: number;
  interests: number;
};

export function metricsForOpportunity(opp: Opportunity): DirectoryMetrics {
  const listing = SEED_LISTINGS.find((l) => l.opportunitySlug === opp.slug);
  return {
    views: listing?.views ?? 0,
    saves: listing?.saves ?? 0,
    interests: listing?.interests ?? 0,
  };
}

// Re-export the shared SortKey for convenience so directory components
// can pull it from one place.
export type { SortKey };
