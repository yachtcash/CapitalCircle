"use client";

import { useMemo } from "react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { ListingRecord } from "@/data/listings";
import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";

import ManagementHero from "./ManagementHero";
import ManagementTabs from "./ManagementTabs";

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
  const { getListing, hydrated } = useMessaging();

  // Prefer the live record from the provider (so mutations like archive,
  // status changes, draft saves immediately reflect). Fall back to the
  // server-rendered seed record while the provider hydrates.
  const live = getListing(initialListing.id);
  const listing = useMemo<ListingRecord>(() => {
    if (hydrated && live) return live;
    return initialListing;
  }, [hydrated, live, initialListing]);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <ManagementHero
        listing={listing}
        opportunity={opportunity}
        company={company}
      />
      <ManagementTabs
        listing={listing}
        opportunity={opportunity}
        company={company}
      />
    </div>
  );
}
