"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Bookmark,
  Eye,
  Sparkles,
} from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Opportunity } from "@/data/opportunities";
import {
  type ListingRecord,
  type ListingStatus,
} from "@/data/listings";
import { useResolvedImage } from "@/lib/imageStore";
import { cn } from "@/lib/cn";

const STATUS_CLASSES: Record<ListingStatus, string> = {
  Draft: "bg-navy-900/10 text-navy-700 ring-navy-900/15",
  Active: "bg-emerald-500 text-white ring-transparent",
  "Seeking Capital": "bg-gold-500 text-navy-900 ring-transparent",
  Negotiating: "bg-amber-500 text-white ring-transparent",
  "Under Review": "bg-sky-500 text-white ring-transparent",
  Closed: "bg-rose-500 text-white ring-transparent",
  Archived: "bg-navy-900 text-gold-400 ring-transparent",
};

const ACTIVE_STATUSES: ListingStatus[] = [
  "Active",
  "Seeking Capital",
  "Negotiating",
  "Under Review",
];

export default function MyListingsPreview() {
  const { listings } = useMessaging();

  const topActive = listings
    .filter((l) => ACTIVE_STATUSES.includes(l.status))
    .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt))
    .slice(0, 3);

  return (
    <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
      <header className="flex items-end justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" strokeWidth={2.2} />
            Your Listings
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            Top performing listings
          </h2>
        </div>
        <Link
          href="/dashboard/listings"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors group whitespace-nowrap"
        >
          Manage all
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.2}
          />
        </Link>
      </header>

      {topActive.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {topActive.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </ul>
      )}

      <Link
        href="/dashboard/listings"
        className="mt-5 sm:hidden flex items-center justify-center gap-1.5 w-full rounded-full bg-navy-900 text-white text-sm font-semibold py-3"
      >
        Manage all listings
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </Link>
    </section>
  );
}

function ListingRow({ listing }: { listing: ListingRecord }) {
  // Live, overlay-applied record from the provider — gallery and editor
  // changes (seed-backed and user-created alike) show here immediately.
  const { getOpportunity } = useMessaging();
  const opportunity: Opportunity | undefined = listing.opportunityId
    ? getOpportunity(listing.opportunityId)
    : undefined;
  const cover = useResolvedImage(opportunity?.images[0]);

  return (
    <li>
      <div className="flex items-stretch gap-4 bg-bone/40 rounded-2xl ring-1 ring-navy-900/[0.04] p-3 hover:bg-bone/70 transition-colors">
        <div className="relative h-20 w-20 sm:h-24 sm:w-28 rounded-xl overflow-hidden bg-navy-900/5 shrink-0">
          {cover ? (
            <Image
              src={cover}
              alt={listing.title}
              fill
              sizes="(min-width: 640px) 112px, 80px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-navy-700/50">
              <Briefcase className="h-6 w-6" strokeWidth={1.8} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
                {listing.id}
              </div>
              <h3 className="mt-0.5 text-sm md:text-[15px] font-semibold text-navy-900 leading-snug line-clamp-2">
                {listing.title}
              </h3>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-bold inline-flex items-center ring-1 ring-inset shrink-0",
                STATUS_CLASSES[listing.status]
              )}
            >
              {listing.status}
            </span>
          </div>

          <div className="mt-auto pt-3 flex items-center justify-between gap-3 flex-wrap">
            <dl className="flex items-center gap-4 text-[11px]">
              <Metric icon={Eye} label="Views" value={listing.views} />
              <Metric icon={Bookmark} label="Saves" value={listing.saves} />
              <Metric
                icon={Sparkles}
                label="Interests"
                value={listing.interests}
              />
            </dl>
            <Link
              href={`/dashboard/listings/${listing.id}`}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors group whitespace-nowrap"
            >
              Manage
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.4}
              />
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 text-navy-700/75">
      <Icon className="h-3.5 w-3.5 text-navy-700/55" strokeWidth={2.2} />
      <span className="font-semibold text-navy-900">{value.toLocaleString()}</span>
      <span className="uppercase tracking-[0.12em] text-[10px] text-navy-700/55">
        {label}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.04] px-5 py-8 text-center">
      <Briefcase
        className="h-6 w-6 mx-auto text-navy-700/45"
        strokeWidth={2}
      />
      <div className="mt-3 text-sm font-semibold text-navy-900">
        No active listings yet
      </div>
      <p className="mt-1.5 text-xs text-navy-700/65 leading-relaxed max-w-sm mx-auto">
        Create a listing to start drawing interest from vetted investors.
      </p>
      <Link
        href="/create-listing"
        className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors group"
      >
        Create a listing
        <ArrowRight
          className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.4}
        />
      </Link>
    </div>
  );
}
