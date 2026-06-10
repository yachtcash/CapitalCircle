export * from "./types";
export { SEED_DEALS } from "./seed";

import { SEED_DEALS } from "./seed";
import { DEAL_STAGES, type Deal, type DealStage } from "./types";

export function getDealById(deals: Deal[], id: string): Deal | undefined {
  return deals.find((d) => d.dealId === id);
}

export function listSeedDealIds(): string[] {
  return SEED_DEALS.map((d) => d.dealId);
}

export function groupByStage(deals: Deal[]): Record<DealStage, Deal[]> {
  const groups = Object.fromEntries(
    DEAL_STAGES.map((s) => [s, [] as Deal[]])
  ) as Record<DealStage, Deal[]>;
  for (const d of deals) groups[d.stage]?.push(d);
  return groups;
}
