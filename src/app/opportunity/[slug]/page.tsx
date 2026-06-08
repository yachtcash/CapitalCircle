import type { Metadata } from "next";
import {
  featuredOpportunities,
  getOpportunityBySlug,
} from "@/data/opportunities";

import OpportunityDetailView from "@/components/opportunity/OpportunityDetailView";
import UserOpportunityResolver from "@/components/opportunity/UserOpportunityResolver";

type PageParams = { slug: string };

export function generateStaticParams(): PageParams[] {
  return featuredOpportunities.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);
  if (!opportunity) {
    return { title: "Opportunity — Capital Circle" };
  }
  return {
    title: `${opportunity.title} — Capital Circle`,
    description: opportunity.executiveSummary,
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);

  // Seed catalog hit — render the page server-side as before.
  if (opportunity) {
    return <OpportunityDetailView opportunity={opportunity} />;
  }

  // Otherwise: the slug might belong to a user-created opportunity in the
  // current browser's MessagingProvider state. Hand the lookup to the client
  // resolver, which renders the same view tree when found and an inline
  // "Not Found" frame when not.
  return <UserOpportunityResolver slug={slug} />;
}
