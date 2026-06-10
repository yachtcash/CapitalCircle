"use client";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Deal } from "@/data/deals";
import DealDetailView from "./DealDetailView";

/**
 * Wraps DealDetailView so the page can render the *live* deal record from
 * provider state when it's been mutated locally (notes / stage / priority /
 * follow-up updates). Falls back to the server-rendered seed copy until
 * provider hydration completes so SSR and the first client render match.
 */
export default function DealDetailHydrator({ seedDeal }: { seedDeal: Deal }) {
  const { getDeal, hydrated } = useMessaging();
  const live = hydrated ? getDeal(seedDeal.dealId) : undefined;
  return <DealDetailView deal={live ?? seedDeal} />;
}
