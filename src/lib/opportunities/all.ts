// Client-side hook for the union of seed + user-created opportunities.
//
// Public marketplace surfaces (directory, search, map, related, opportunity
// detail page) read from this hook so that listings created via the wizard
// appear immediately, alongside the static seed catalog.
//
// User opportunities are filtered to only show those whose backing listing
// is in an Active-ish status (Active / Seeking Capital / Negotiating /
// Under Review). Drafts, Archived, and Closed listings stay private.

"use client";

import { useMemo } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  featuredOpportunities,
  type Opportunity,
} from "@/data/opportunities";
import type { ListingRecord, ListingStatus } from "@/data/listings";

const PUBLIC_LISTING_STATUSES: ListingStatus[] = [
  "Active",
  "Seeking Capital",
  "Negotiating",
  "Under Review",
];

function isPublicallyVisible(listing: ListingRecord | undefined): boolean {
  if (!listing) return false;
  // Status gate — Draft / Closed / Archived never reach public surfaces.
  if (!PUBLIC_LISTING_STATUSES.includes(listing.status)) return false;
  // Visibility gate — Unlisted hides from directory/search/map but the
  // direct URL still resolves (handled at the page level). Private hides
  // from every public surface AND the direct URL.
  if (listing.visibility === "Unlisted") return false;
  if (listing.visibility === "Private") return false;
  return true;
}

/**
 * Hook returning every opportunity the current user can see on public
 * surfaces: seed catalog + their own user-created opportunities whose
 * listings are in an active, public status.
 */
export function useAllOpportunities(): Opportunity[] {
  const { userOpportunities, listings, hydrated } = useMessaging();
  return useMemo(() => {
    // Pre-hydration we render only the seed catalog so the server-rendered
    // HTML matches the client's first paint.
    if (!hydrated) return featuredOpportunities;

    const listingByOppId = new Map<string, ListingRecord>();
    for (const l of listings) {
      if (l.opportunityId) listingByOppId.set(l.opportunityId, l);
    }
    const visibleUserOpps = userOpportunities.filter((o) =>
      isPublicallyVisible(listingByOppId.get(o.id))
    );
    if (visibleUserOpps.length === 0) return featuredOpportunities;
    return [...visibleUserOpps, ...featuredOpportunities];
  }, [userOpportunities, listings, hydrated]);
}

/**
 * Same as `useAllOpportunities` but also exposes the user's draft / archived
 * / closed opportunities. Used by surfaces the owner can see — Profile,
 * Dashboard's listing-management views.
 */
export function useAllOpportunitiesOwnerView(): Opportunity[] {
  const { userOpportunities, hydrated } = useMessaging();
  return useMemo(() => {
    if (!hydrated) return featuredOpportunities;
    if (userOpportunities.length === 0) return featuredOpportunities;
    return [...userOpportunities, ...featuredOpportunities];
  }, [userOpportunities, hydrated]);
}

/** Find an opportunity by slug across seed + user catalog. */
export function findOpportunityBySlug(
  slug: string,
  userOpps: Opportunity[]
): Opportunity | undefined {
  return (
    userOpps.find((o) => o.slug === slug) ??
    featuredOpportunities.find((o) => o.slug === slug)
  );
}
