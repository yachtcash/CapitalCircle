import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DealDetailView from "@/components/dashboard/deals/DealDetailView";
import { SEED_DEALS, getDealById, listSeedDealIds } from "@/data/deals";
import DealDetailHydrator from "@/components/dashboard/deals/DealDetailHydrator";

type PageParams = { dealId: string };

export function generateStaticParams(): PageParams[] {
  return listSeedDealIds().map((dealId) => ({ dealId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { dealId } = await params;
  const deal = getDealById(SEED_DEALS, dealId);
  if (!deal) return { title: "Deal — Capital Circle" };
  return {
    title: `${deal.title} — ${deal.dealId} — Capital Circle`,
    description: deal.summaryNote ?? deal.title,
  };
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { dealId } = await params;
  const seed = getDealById(SEED_DEALS, dealId);
  if (!seed) notFound();
  // The hydrator picks up the latest copy from MessagingProvider state
  // (overlay) so saved edits / stage moves render live.
  return <DealDetailHydrator seedDeal={seed} />;
}
