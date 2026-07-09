"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { publicOpportunityId } from "@/lib/opportunities/id";
import MessageOpportunityButton from "@/components/common/MessageOpportunityButton";
import OpportunityStatusBadge from "@/components/OpportunityStatusBadge";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImage } from "@/lib/imageStore";

export type OpportunityRibbon = "Featured" | "Trending" | "New" | "Closing Soon" | null;

type Props = {
  opportunity: Opportunity;
  priority?: boolean;
  ribbon?: OpportunityRibbon;
  showPublicId?: boolean;
};

export default function OpportunityCard({
  opportunity: passedOpportunity,
  priority = false,
  ribbon = null,
  showPublicId = false,
}: Props) {
  // Re-read the live record so server-rendered callers (homepage feed,
  // related sections) reflect gallery / editor changes. Idempotent for
  // callers that already pass an overlay-applied record.
  const { getOpportunityBySlug, hydrated } = useMessaging();
  const opportunity =
    (hydrated ? getOpportunityBySlug(passedOpportunity.slug) : undefined) ??
    passedOpportunity;
  const cover = useResolvedImage(opportunity.images[0]);
  const publicId = publicOpportunityId(opportunity);

  return (
    <Link
      href={`/opportunity/${opportunity.slug}`}
      className="group flex flex-col bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Featured image — 16:10 to match featured/hero cards across the marketplace */}
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900/5">
        {cover ? (
          <Image
            src={cover}
            alt={opportunity.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}

        {/* Subtle gradient overlays for legibility */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy-900/45 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-900/70 to-transparent pointer-events-none" />

        {/* Top-left: ribbon (Featured / Trending / New) */}
        {ribbon ? (
          <span className="absolute top-3 left-3 inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold bg-navy-900 text-gold-400 ring-1 ring-gold-500/40 rounded-full px-2.5 py-1">
            {ribbon}
          </span>
        ) : null}

        {/* Top-right: status pill + message icon */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <OpportunityStatusBadge status={opportunity.status} size="sm" />
          <MessageOpportunityButton
            opportunity={opportunity}
            variant="icon"
          />
        </div>

        {/* Bottom: location + deal type */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold drop-shadow">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span className="truncate">{opportunity.location}</span>
          </span>
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-semibold bg-white/15 backdrop-blur-md ring-1 ring-white/25 rounded-full px-2.5 py-1 shrink-0">
            {opportunity.dealType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] uppercase tracking-[0.14em] text-gold-600 font-semibold">
            {opportunity.category}
          </div>
          {showPublicId ? (
            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-navy-700/55 tabular-nums">
              {publicId}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1.5 font-semibold text-navy-900 text-[15px] md:text-base leading-snug group-hover:text-gold-700 transition-colors line-clamp-2">
          {opportunity.title}
        </h3>
        <p className="mt-2 text-sm text-navy-700/70 leading-relaxed line-clamp-2">
          {opportunity.description}
        </p>

        <div className="mt-auto pt-4 flex items-end justify-between gap-3 border-t border-navy-900/[0.06] mt-4">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
              {opportunity.dealType === "Acquisition" ? "Asking" : "Investment"}
            </div>
            <div className="mt-0.5 text-lg font-bold tracking-tight text-navy-900 tabular-nums truncate">
              {opportunity.investmentRange}
            </div>
          </div>
          <div className="text-right text-[11px] text-navy-700/60 shrink-0 max-w-[55%]">
            <div className="font-semibold text-navy-700/85 truncate">{opportunity.postedBy}</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-navy-700/55">
              <Clock className="h-3 w-3" strokeWidth={2} />
              {opportunity.postedAgo}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
