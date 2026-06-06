import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SEED_LISTINGS, getListingById } from "@/data/listings";
import {
  featuredOpportunities,
  getOpportunityBySlug,
  type Opportunity,
} from "@/data/opportunities";
import { getCompanyById, type Company } from "@/data/companies";
import ListingManagementView from "@/components/dashboard/management/ListingManagementView";

type PageParams = { id: string };

export function generateStaticParams(): PageParams[] {
  return SEED_LISTINGS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) {
    return { title: "Listing not found — Capital Circle" };
  }
  return {
    title: `${listing.title} — Listing ${listing.id} — Capital Circle`,
    description: `Manage your listing ${listing.id} — ${listing.title}.`,
  };
}

export default async function ListingManagementPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    notFound();
  }

  // Resolve opportunity: prefer slug lookup, fall back to id lookup.
  let opportunity: Opportunity | undefined;
  if (listing.opportunitySlug) {
    opportunity = getOpportunityBySlug(listing.opportunitySlug);
  }
  if (!opportunity && listing.opportunityId) {
    opportunity = featuredOpportunities.find(
      (o) => o.id === listing.opportunityId
    );
  }

  // Resolve company through opportunity (best signal we have).
  let company: Company | undefined;
  if (opportunity?.companyId) {
    company = getCompanyById(opportunity.companyId);
  }

  return (
    <ListingManagementView
      initialListing={listing}
      opportunity={opportunity}
      company={company}
    />
  );
}
