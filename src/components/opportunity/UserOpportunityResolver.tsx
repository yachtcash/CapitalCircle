"use client";

import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import OpportunityDetailView from "./OpportunityDetailView";

/**
 * Client-side fallback for opportunity detail pages whose slug isn't in the
 * static seed catalog. Resolves the slug against the current user's locally
 * stored opportunities (the wizard target).
 *
 * - Pre-hydration: render a minimal skeleton matching the seed page layout.
 * - Post-hydration with a match: render `<OpportunityDetailView>`.
 * - Post-hydration without a match: render an inline "Not Found" frame so
 *   the user still has a path back to the marketplace.
 */
export default function UserOpportunityResolver({ slug }: { slug: string }) {
  const { userOpportunities, hydrated } = useMessaging();

  if (!hydrated) {
    return (
      <div className="bg-cream min-h-[60vh] flex items-center">
        <div className="max-w-md mx-auto px-5 md:px-10 py-16 text-center">
          <span
            aria-hidden
            className="inline-block h-12 w-12 rounded-full bg-navy-900/[0.06] animate-pulse"
          />
          <h1 className="mt-6 text-lg font-semibold text-navy-900 tracking-tight">
            Loading opportunity…
          </h1>
          <p className="mt-2 text-sm text-navy-700/65">
            Resolving listing details from your local catalog.
          </p>
        </div>
      </div>
    );
  }

  const opportunity = userOpportunities.find((o) => o.slug === slug);

  if (!opportunity) {
    return (
      <div className="bg-cream min-h-[60vh] flex items-center">
        <div className="max-w-md mx-auto px-5 md:px-10 py-16 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-8 ring-navy-900/10">
            <Compass className="h-7 w-7" strokeWidth={2} />
          </span>
          <div className="mt-6 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
            Opportunity not found
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
            We couldn&apos;t find that listing.
          </h1>
          <p className="mt-3 text-sm text-navy-700/65">
            It may have been archived, closed, or never published. Try the
            directory below.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/opportunities"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
              Browse Marketplace
            </Link>
            <Link
              href="/dashboard/listings"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/10 hover:ring-navy-900/25 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-all"
            >
              My Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <OpportunityDetailView opportunity={opportunity} />;
}
