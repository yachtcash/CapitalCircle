export * from "./types";
export { SEED_DEALS } from "./seed";

import { SEED_DEALS } from "./seed";
import type { Deal, DealStage } from "./types";

export function getDealById(deals: Deal[], id: string): Deal | undefined {
  return deals.find((d) => d.dealId === id);
}

export function listSeedDealIds(): string[] {
  return SEED_DEALS.map((d) => d.dealId);
}

export function groupByStage(deals: Deal[]): Record<DealStage, Deal[]> {
  const groups: Record<DealStage, Deal[]> = {
    "New Lead": [],
    Reviewing: [],
    Contacted: [],
    "Waiting Response": [],
    "Introduction Sent": [],
    "Meeting Scheduled": [],
    Negotiating: [],
    "Due Diligence": [],
    "Under Contract": [],
    Closed: [],
    Lost: [],
  };
  for (const d of deals) groups[d.status].push(d);
  return groups;
}
