"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, X, ArrowRight, Building2, Bookmark } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { markerStyleFor, MARKER_STYLES } from "@/lib/map/types";
import { useResolvedImage } from "@/lib/imageStore";
import { useMessaging } from "@/components/providers/MessagingProvider";
import MessageOpportunityButton from "@/components/common/MessageOpportunityButton";
import { cn } from "@/lib/cn";

type Props = {
  opportunity: Opportunity;
  onClose: () => void;
};

function formatInvestment(o: Opportunity): string {
  if (typeof o.fundingAmount === "number" && o.fundingAmount > 0) {
    const n = o.fundingAmount;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${n.toLocaleString()}`;
  }
  return o.investmentRange || "On request";
}

function locationLabel(o: Opportunity): string {
  const city = o.place?.city;
  const country = o.place?.country;
  if (city && country) return `${city}, ${country}`;
  return country ?? o.location;
}

export default function MarkerPreviewCard({ opportunity, onClose }: Props) {
  const company = getCompanyById(opportunity.companyId);
  const publicId = publicOpportunityId(opportunity);
  const style = MARKER_STYLES[markerStyleFor(opportunity.category)];
  const cover = useResolvedImage(opportunity.images[0]);
  const { isOpportunitySaved, toggleSavedOpportunity, hydrated } = useMessaging();
  const saved = hydrated && isOpportunitySaved(opportunity.id);

  return (
    <article className="bg-white w-[312px] overflow-hidden text-navy-900">
      {/* Hero image */}
      <div className="relative aspect-[16/9] bg-navy-900/5">
        {cover ? (
          <Image src={cover} alt={opportunity.title} fill sizes="320px" className="object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/65 via-navy-900/10 to-transparent pointer-events-none" />

        {/* Category (top-left) */}
        <span
          className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] font-bold text-white rounded-full pl-1.5 pr-2.5 py-1 shadow-sm"
          style={{ backgroundColor: style.fill }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
          {opportunity.category}
        </span>

        {/* Status (top-right) */}
        <span className="absolute top-2.5 right-2.5 inline-flex items-center text-[10px] uppercase tracking-[0.12em] font-bold bg-white/95 text-navy-900 rounded-full px-2.5 py-1 ring-1 ring-navy-900/10 shadow-sm">
          {opportunity.status}
        </span>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute bottom-2.5 right-2.5 h-7 w-7 inline-flex items-center justify-center rounded-full bg-navy-900/80 hover:bg-navy-900 text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>

        {/* Public ID */}
        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold text-white/85 tabular-nums">
          {publicId}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <Link
          href={`/opportunity/${opportunity.slug}`}
          className="block font-semibold text-[15px] leading-snug hover:text-gold-700 transition-colors line-clamp-2"
        >
          {opportunity.title}
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-navy-700/70">
          <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
          <span className="truncate">{locationLabel(opportunity)}</span>
        </div>

        {/* Capital — the headline figure */}
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-navy-900/[0.07] pt-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
              Capital Sought
            </div>
            <div className="mt-0.5 text-xl font-semibold tracking-tight text-navy-900 tabular-nums">
              {formatInvestment(opportunity)}
            </div>
          </div>
          {opportunity.expectedReturn ? (
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
                Target Return
              </div>
              <div className="mt-0.5 text-sm font-semibold text-emerald-700 tabular-nums">
                {opportunity.expectedReturn}
              </div>
            </div>
          ) : null}
        </div>

        {/* Sponsor */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] px-3 py-2">
          <span className="h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-lg bg-navy-900 text-gold-400">
            <Building2 className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <span className="block text-[9px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">
              Sponsor
            </span>
            {company ? (
              <Link
                href={`/company/${company.slug}`}
                className="block text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors truncate"
              >
                {company.name}
              </Link>
            ) : (
              <span className="block text-sm font-semibold text-navy-900 truncate">{opportunity.postedBy}</span>
            )}
          </span>
        </div>

        {/* Actions */}
        <Link
          href={`/opportunity/${opportunity.slug}`}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors"
        >
          View Opportunity
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <MessageOpportunityButton opportunity={opportunity} variant="full" className="flex-1" />
          <button
            type="button"
            onClick={() => toggleSavedOpportunity(opportunity.id)}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save opportunity"}
            className={cn(
              "shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ring-1 transition-colors",
              saved
                ? "bg-gold-500/15 text-gold-700 ring-gold-500/40"
                : "bg-white text-navy-900 ring-navy-900/15 hover:ring-gold-500/50"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-gold-600 text-gold-600")} strokeWidth={2.2} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
