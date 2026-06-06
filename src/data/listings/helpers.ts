import { SEED_LISTINGS } from "./seed";
import type {
  ListingActivity,
  ListingRecord,
  ListingStatus,
} from "./types";

export function getListingById(id: string): ListingRecord | undefined {
  return SEED_LISTINGS.find((l) => l.id === id);
}

export function getListingByOpportunitySlug(
  slug: string
): ListingRecord | undefined {
  return SEED_LISTINGS.find((l) => l.opportunitySlug === slug);
}

export function getListingByOpportunityId(
  opportunityId: string
): ListingRecord | undefined {
  return SEED_LISTINGS.find((l) => l.opportunityId === opportunityId);
}

export function getActiveListings(): ListingRecord[] {
  return SEED_LISTINGS.filter(
    (l) => l.status !== "Draft" && l.status !== "Archived"
  );
}

export function getDraftListings(): ListingRecord[] {
  return SEED_LISTINGS.filter((l) => l.status === "Draft");
}

export function getArchivedListings(): ListingRecord[] {
  return SEED_LISTINGS.filter((l) => l.status === "Archived");
}

export function countByStatus(): Record<ListingStatus, number> {
  const counts: Record<ListingStatus, number> = {
    Draft: 0,
    Active: 0,
    "Seeking Capital": 0,
    Negotiating: 0,
    "Under Review": 0,
    Closed: 0,
    Archived: 0,
  };
  for (const listing of SEED_LISTINGS) {
    counts[listing.status] += 1;
  }
  return counts;
}

export function totalActivityForListing(id: string): ListingActivity[] {
  const listing = getListingById(id);
  if (!listing) return [];
  return [...listing.activity].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function allRecentActivity(limit?: number): ListingActivity[] {
  const merged = SEED_LISTINGS.flatMap((l) => l.activity).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  return typeof limit === "number" ? merged.slice(0, limit) : merged;
}
