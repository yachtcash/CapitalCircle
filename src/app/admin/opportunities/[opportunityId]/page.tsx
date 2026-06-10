import { notFound } from "next/navigation";
import { featuredOpportunities } from "@/data/opportunities";
import AdminOpportunityDetail from "@/components/admin/AdminOpportunityDetail";

type PageParams = { opportunityId: string };

export function generateStaticParams(): PageParams[] {
  return featuredOpportunities.map((o) => ({ opportunityId: o.id }));
}

export default async function AdminOpportunityDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { opportunityId } = await params;
  const opportunity = featuredOpportunities.find((o) => o.id === opportunityId);
  if (!opportunity) notFound();
  return <AdminOpportunityDetail opportunity={opportunity} />;
}
