"use client";

import { Suspense, useMemo } from "react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { ListingRecord } from "@/data/listings";
import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";

import ManagementHero from "./ManagementHero";
import ManagementTabs from "./ManagementTabs";
import ImageManager from "./ImageManager";
import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  initialListing: ListingRecord;
  opportunity?: Opportunity;
  company?: Company;
};

export default function ListingManagementView({
  initialListing,
  opportunity,
  company,
}: Props) {
  const { getListing, getOpportunity, hydrated } = useMessaging();

  // Prefer the live record from the provider (so mutations like archive,
  // status changes, draft saves immediately reflect). Fall back to the
  // server-rendered seed record while the provider hydrates.
  const live = getListing(initialListing.id);
  const listing = useMemo<ListingRecord>(() => {
    if (hydrated && live) return live;
    return initialListing;
  }, [hydrated, live, initialListing]);

  // Overlay-applied opportunity so the Gallery Manager opens with the
  // latest saved image set (seed-backed and user-created alike).
  const liveOpportunity =
    (hydrated && listing.opportunityId
      ? getOpportunity(listing.opportunityId)
      : undefined) ?? opportunity;
  const galleryImages = liveOpportunity?.images ?? [];

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <ManagementHero
        listing={listing}
        opportunity={liveOpportunity}
        company={company}
      />

      {/* Gallery Manager — always visible, zero clicks from landing. */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 pt-8">
        <ImageManager
          key={`${listing.id}:${hydrated ? "live" : "seed"}`}
          initialImages={galleryImages}
          title={listing.title}
          listingId={listing.id}
        />
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
            <Skeleton className="h-10 w-64" />
          </div>
        }
      >
        <ManagementTabs
          listing={listing}
          opportunity={liveOpportunity}
          company={company}
        />
      </Suspense>
    </div>
  );
}
