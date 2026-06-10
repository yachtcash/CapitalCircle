import { redirect } from "next/navigation";

type PageParams = { dealId: string };

// Legacy detail URLs forward to the top-level Deal Desk.
export default async function LegacyDealDetailRedirect({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { dealId } = await params;
  redirect(`/deal-desk/${dealId}`);
}
