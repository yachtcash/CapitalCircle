// Marketplace Placement — editorial control over opportunity ordering.
//
// Super Admin curates a single Hero, up to six ordered Featured slots, and an
// explicit display order for the remaining marketplace inventory. This module is
// the pure model + selectors; state lives in MessagingProvider and persists to
// its own localStorage key (separate from opportunity patches).

import type { Opportunity } from "@/data/opportunities";

export const MARKETPLACE_PLACEMENT_KEY = "cc:marketplace-placement:v1";
export const MAX_FEATURED = 6;

export type MarketplacePlacement = {
  /** The single hero opportunity id, or null to fall back automatically. */
  heroId: string | null;
  /** Ordered featured opportunity ids (position 1..6). */
  featuredIds: string[];
  /** Explicit marketplace display order (ids). Unlisted ids fall back to default. */
  order: string[];
  /** ISO timestamp of the last edit ("" when never curated). */
  updatedAt: string;
};

export const DEFAULT_MARKETPLACE_PLACEMENT: MarketplacePlacement = {
  heroId: null,
  featuredIds: [],
  order: [],
  updatedAt: "",
};

export type PlacementSlot = "hero" | "featured" | "marketplace";

/** True when nothing has been curated — the marketplace renders automatically. */
export function isPlacementEmpty(p: MarketplacePlacement): boolean {
  return !p.heroId && p.featuredIds.length === 0 && p.order.length === 0;
}

export function placementSlot(id: string, p: MarketplacePlacement): PlacementSlot {
  if (p.heroId === id) return "hero";
  if (p.featuredIds.includes(id)) return "featured";
  return "marketplace";
}

/** Human badge label: "Hero", "Featured #3", or "Marketplace". */
export function placementLabel(id: string, p: MarketplacePlacement): string {
  if (p.heroId === id) return "Hero";
  const fi = p.featuredIds.indexOf(id);
  if (fi >= 0) return `Featured #${fi + 1}`;
  return "Marketplace";
}

/**
 * Sortable rank: hero (-1) → featured slot (0..5) → ordered marketplace
 * (1000 + index) → unplaced (large, keeps incoming stable order, e.g. newest).
 */
export function placementRank(id: string, p: MarketplacePlacement): number {
  if (p.heroId === id) return -1;
  const fi = p.featuredIds.indexOf(id);
  if (fi >= 0) return fi;
  const oi = p.order.indexOf(id);
  if (oi >= 0) return 1000 + oi;
  return 1_000_000;
}

/** Resolve the hero id with the documented fallback chain. */
export function resolveHeroId(
  opps: Opportunity[],
  p: MarketplacePlacement
): string | null {
  const has = (id: string | null | undefined) => !!id && opps.some((o) => o.id === id);
  if (has(p.heroId)) return p.heroId;
  const firstFeatured = p.featuredIds.find((id) => has(id));
  if (firstFeatured) return firstFeatured;
  const firstOrdered = p.order.find((id) => has(id));
  if (firstOrdered) return firstOrdered;
  return opps[0]?.id ?? null;
}

/**
 * Split a list of opportunities into hero / featured / remaining per placement.
 * `remaining` is ordered by placement rank; hero + featured are excluded from it.
 */
export function splitByPlacement(
  opps: Opportunity[],
  p: MarketplacePlacement
): { hero: Opportunity | null; featured: Opportunity[]; remaining: Opportunity[] } {
  const byId = new Map(opps.map((o) => [o.id, o]));
  const heroId = p.heroId && byId.has(p.heroId) ? p.heroId : null;
  const hero = heroId ? byId.get(heroId)! : null;

  const featured: Opportunity[] = [];
  for (const id of p.featuredIds) {
    if (id === heroId) continue;
    const o = byId.get(id);
    if (o) featured.push(o);
  }
  const placedIds = new Set<string>([...(heroId ? [heroId] : []), ...featured.map((o) => o.id)]);

  const remaining = opps
    .filter((o) => !placedIds.has(o.id))
    .sort((a, b) => placementRank(a.id, p) - placementRank(b.id, p));

  return { hero, featured, remaining };
}
