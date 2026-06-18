"use client";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities } from "@/data/opportunities";
import { resolveHeroId, isPlacementEmpty } from "@/lib/marketplace/placement";
import FeaturedOpportunityHero from "./FeaturedOpportunityHero";

/**
 * Renders the directory hero using the Super Admin's marketplace placement.
 * Falls back to the automatic "featured of the week" (passed by id) before
 * hydration or when nothing has been curated, so SSR/first paint stays stable.
 */
export default function PlacementHero({ fallbackId }: { fallbackId: string }) {
  const { marketplacePlacement: placement, hydrated } = useMessaging();
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;

  const heroId =
    !hydrated || isPlacementEmpty(placement)
      ? fallbackId
      : resolveHeroId(pool, placement) ?? fallbackId;

  const hero =
    pool.find((o) => o.id === heroId) ??
    pool.find((o) => o.id === fallbackId) ??
    pool[0];

  if (!hero) return null;
  return <FeaturedOpportunityHero opportunity={hero} />;
}
