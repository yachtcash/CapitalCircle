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
 * Apply the overlay patch map to an opportunity, returning the patched copy
 * if a patch exists, otherwise the original record unchanged.
 */
function applyOverlay(
  opp: Opportunity,
  patches: Record<string, Partial<Opportunity>>
): Opportunity {
  const patch = patches[opp.id];
  return patch ? { ...opp, ...patch } : opp;
}

/**
 * Hook returning every opportunity the current user can see on public
 * surfaces: seed catalog + their own user-created opportunities whose
 * listings are in an active, public status. Each record is merged with the
 * provider's overlay patch so edits to seed-backed listings appear here too.
 */
export function useAllOpportunities(): Opportunity[] {
  const {
    userOpportunities,
    listings,
    opportunityPatches,
    opportunityAdminState,
    hydrated,
  } = useMessaging();
  return useMemo(() => {
    // Pre-hydration we render only the seed catalog so the server-rendered
    // HTML matches the client's first paint.
    if (!hydrated) return featuredOpportunities;

    // Moderation gate — admin-rejected / archived / deleted opportunities
    // never reach public surfaces.
    const adminHidden = (id: string): boolean => {
      const s = opportunityAdminState[id];
      return !!s && (s.deleted || s.archived || s.moderation === "Rejected");
    };

    const listingByOppId = new Map<string, ListingRecord>();
    for (const l of listings) {
      if (l.opportunityId) listingByOppId.set(l.opportunityId, l);
    }
    const visibleUserOpps = userOpportunities
      .filter((o) => isPublicallyVisible(listingByOppId.get(o.id)) && !adminHidden(o.id))
      .map((o) => applyOverlay(o, opportunityPatches));
    const patchedSeed = featuredOpportunities
      .filter((o) => !adminHidden(o.id))
      .map((o) => applyOverlay(o, opportunityPatches));
    if (visibleUserOpps.length === 0) return patchedSeed;
    return [...visibleUserOpps, ...patchedSeed];
  }, [userOpportunities, listings, opportunityPatches, opportunityAdminState, hydrated]);
}

/**
 * Same as `useAllOpportunities` but also exposes the user's draft / archived
 * / closed opportunities. Used by surfaces the owner can see — Profile,
 * Dashboard's listing-management views. Overlay applied.
 */
export function useAllOpportunitiesOwnerView(): Opportunity[] {
  const { userOpportunities, opportunityPatches, hydrated } = useMessaging();
  return useMemo(() => {
    if (!hydrated) return featuredOpportunities;
    const patchedSeed = featuredOpportunities.map((o) =>
      applyOverlay(o, opportunityPatches)
    );
    if (userOpportunities.length === 0) return patchedSeed;
    const patchedUser = userOpportunities.map((o) =>
      applyOverlay(o, opportunityPatches)
    );
    return [...patchedUser, ...patchedSeed];
  }, [userOpportunities, opportunityPatches, hydrated]);
}

/**
 * Find an opportunity by slug across seed + user catalog. Does NOT apply
 * overlay — callers that need the live record should use
 * `getOpportunityBySlug` from MessagingProvider instead.
 */
export function findOpportunityBySlug(
  slug: string,
  userOpps: Opportunity[]
): Opportunity | undefined {
  return (
    userOpps.find((o) => o.slug === slug) ??
    featuredOpportunities.find((o) => o.slug === slug)
  );
}
