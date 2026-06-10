import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
    title: `${deal.title} — ${deal.dealId} — Capital Circle Deal Desk`,
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
  return <DealDetailHydrator seedDeal={seed} />;
}
