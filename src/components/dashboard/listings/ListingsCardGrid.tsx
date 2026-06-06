"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye, Heart, Star } from "lucide-react";
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
      className="relative h-44 w-full bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center"
    >
      <span className="text-gold-400 text-6xl font-bold leading-none drop-shadow-sm">
        {letter}
      </span>
    </div>
  );
}

function Cover({ listing }: { listing: ListingRecord }) {
  const opp = listing.opportunitySlug
    ? getOpportunityBySlug(listing.opportunitySlug)
    : undefined;
  const src = opp?.images?.[0];

  if (!src) return <PlaceholderCover title={listing.title} />;

  return (
    <div className="relative h-44 w-full bg-bone">
      <Image
        src={src}
        alt={listing.title}
        fill
        sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default function ListingsCardGrid({
  listings,
  onDuplicateSuccess,
  className,
}: Props) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {listings.map((listing) => (
        <li
          key={listing.id}
          className="group bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden flex flex-col"
        >
          <div className="relative">
            <Cover listing={listing} />
            <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm ring-1 ring-navy-900/[0.08] px-2 py-1 text-[10px] uppercase tracking-[0.14em] font-bold text-navy-900">
              {listing.id}
            </div>
            <div className="absolute top-3 right-3">
              <ListingStatusBadge status={listing.status} />
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-navy-900 leading-snug line-clamp-2">
                  {listing.title}
                </h3>
                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-navy-700/65 font-medium">
                  {listing.dealType ?? listing.category ?? "Listing"}
                </div>
              </div>
              <ListingActionsMenu
                listing={listing}
                onDuplicateSuccess={onDuplicateSuccess}
                align="right"
              />
            </div>

            <dl className="grid grid-cols-3 gap-2 text-center bg-bone rounded-xl py-2.5 px-1 ring-1 ring-navy-900/[0.04]">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.12em] text-navy-700/60 font-semibold inline-flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
                  Views
                </dt>
                <dd className="text-sm font-bold text-navy-900 tabular-nums">
                  {listing.views.toLocaleString()}
                </dd>
              </div>
              <div className="border-x border-navy-900/[0.06]">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-navy-700/60 font-semibold inline-flex items-center justify-center gap-1">
                  <Heart className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
                  Saves
                </dt>
                <dd className="text-sm font-bold text-navy-900 tabular-nums">
                  {listing.saves.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.12em] text-navy-700/60 font-semibold inline-flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
                  Interests
                </dt>
                <dd className="text-sm font-bold text-navy-900 tabular-nums">
                  {listing.interests.toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between mt-auto pt-1">
              <span className="text-[11px] text-navy-700/65">
                Updated {formatRelative(listing.lastUpdatedAt)}
              </span>
              <Link
                href={`/dashboard/listings/${listing.id}`}
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-bold text-navy-900 hover:text-gold-700 transition-colors"
              >
                Manage
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
