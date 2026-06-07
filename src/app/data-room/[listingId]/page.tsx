import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SEED_LISTINGS, getListingById } from "@/data/listings";
import { featuredOpportunities, getOpportunityBySlug } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";

import DataRoomClient from "@/components/dataroom/DataRoomClient";

type PageParams = { listingId: string };

export function generateStaticParams(): PageParams[] {
  return SEED_LISTINGS.map((l) => ({ listingId: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { listingId } = await params;
  const listing = getListingById(listingId);
  if (!listing) {
    return { title: "Data room not found — Capital Circle" };
  }
  return {
    title: `Data Room · ${listing.title}`,
    description: `Private data room and document center for ${listing.title} (${listing.id}).`,
  };
}

export default async function DataRoomPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { listingId } = await params;
  const listing = getListingById(listingId);
  if (!listing) {
    notFound();
  }

  const opportunity =
    (listing.opportunitySlug
      ? getOpportunityBySlug(listing.opportunitySlug)
      : undefined) ??
    (listing.opportunityId
      ? featuredOpportunities.find((o) => o.id === listing.opportunityId)
      : undefined) ??
    null;

  const company = opportunity ? getCompanyById(opportunity.companyId) ?? null : null;

  return (
    <DataRoomClient
      listing={listing}
      opportunity={opportunity}
      company={company}
    />
  );
}
