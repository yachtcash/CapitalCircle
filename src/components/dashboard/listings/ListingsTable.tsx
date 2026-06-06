"use client";

import Image from "next/image";
import Link from "next/link";
import type { ListingRecord } from "@/data/listings";
import { formatRelative } from "@/data/messages";
import { getOpportunityBySlug } from "@/data/opportunities";
import { cn } from "@/lib/cn";
import ListingActionsMenu from "./ListingActionsMenu";
import ListingStatusBadge from "./ListingStatusBadge";

type Props = {
  listings: ListingRecord[];
  onDuplicateSuccess?: (newId: string) => void;
  className?: string;
};

function PlaceholderCover({ title }: { title: string }) {
  const letter = title.trim().charAt(0).toUpperCase() || "C";
  return (
    <div
      aria-hidden="true"
      className="h-12 w-16 rounded-md bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center"
    >
      <span className="text-gold-400 text-base font-bold leading-none">
        {letter}
      </span>
    </div>
  );
}

function CoverThumb({ listing }: { listing: ListingRecord }) {
  const opp = listing.opportunitySlug
    ? getOpportunityBySlug(listing.opportunitySlug)
    : undefined;
  const src = opp?.images?.[0];

  if (!src) return <PlaceholderCover title={listing.title} />;

  return (
    <div className="relative h-12 w-16 rounded-md overflow-hidden bg-bone ring-1 ring-navy-900/[0.05]">
      <Image
        src={src}
        alt=""
        fill
        sizes="64px"
        className="object-cover"
      />
    </div>
  );
}

export default function ListingsTable({
  listings,
  onDuplicateSuccess,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "hidden md:block bg-white ring-1 ring-navy-900/[0.06] rounded-2xl overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-bone z-10">
            <tr className="text-[10px] uppercase tracking-[0.14em] font-semibold text-navy-700/70">
              <th scope="col" className="px-4 py-3 font-semibold w-[28%]">
                Listing
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Category
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Deal Type
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">
                Views
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">
                Saves
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">
                Interests
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Last Updated
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr
                key={listing.id}
                className="border-t border-navy-900/[0.06] hover:bg-bone/40 transition-colors"
              >
                <td className="px-4 py-3 align-middle">
                  <Link
                    href={`/dashboard/listings/${listing.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <CoverThumb listing={listing} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-navy-900 truncate group-hover:text-gold-700 transition-colors">
                        {listing.title}
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-medium mt-0.5">
                        {listing.id}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-navy-900/85">
                  {listing.category ?? <span className="text-navy-700/45">—</span>}
                </td>
                <td className="px-4 py-3 text-sm text-navy-900/85">
                  {listing.dealType ?? <span className="text-navy-700/45">—</span>}
                </td>
                <td className="px-4 py-3">
                  <ListingStatusBadge status={listing.status} />
                </td>
                <td className="px-4 py-3 text-sm text-navy-900 tabular-nums text-right">
                  {listing.views.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-navy-900 tabular-nums text-right">
                  {listing.saves.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-navy-900 tabular-nums text-right">
                  {listing.interests.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-navy-700/80">
                  {formatRelative(listing.lastUpdatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <ListingActionsMenu
                    listing={listing}
                    onDuplicateSuccess={onDuplicateSuccess}
                    align="right"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
