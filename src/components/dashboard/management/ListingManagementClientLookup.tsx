"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { getCompanyById } from "@/data/companies";
import ListingManagementView from "./ListingManagementView";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Client-side resolver for listings that don't exist in the seed catalog —
 * wizard-created and duplicated listings live only in the provider
 * (localStorage), which the server can't see. Without this fallback those
 * listings hit notFound() and can never be managed, edited, or have their
 * galleries changed.
 */
export default function ListingManagementClientLookup({ id }: { id: string }) {
  const { getListing, getOpportunity, hydrated } = useMessaging();

  const listing = getListing(id);

  if (!hydrated) {
    return (
      <div className="bg-cream min-h-[calc(100vh-5rem)]">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-16">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="mt-6 h-64" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-cream min-h-[calc(100vh-5rem)]">
        <div className="max-w-2xl mx-auto px-5 py-20 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-4 ring-navy-900/5">
            <Briefcase className="h-5 w-5" strokeWidth={2} />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-navy-900">
            Listing not found.
          </h1>
          <p className="mt-2 text-sm text-navy-700/70">
            {id} doesn&apos;t exist in your workspace. It may have been
            deleted, or the link is out of date.
          </p>
          <Link
            href="/dashboard/listings"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const opportunity = listing.opportunityId
    ? getOpportunity(listing.opportunityId)
    : undefined;
  const company = opportunity?.companyId
    ? getCompanyById(opportunity.companyId)
    : undefined;

  return (
    <ListingManagementView
      initialListing={listing}
      opportunity={opportunity}
      company={company}
    />
  );
}
