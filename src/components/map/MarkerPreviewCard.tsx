"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, X, ArrowRight, Building2, Banknote, Bookmark } from "lucide-react";
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
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${n.toLocaleString()}`;
  }
  return o.investmentRange || "—";
}

export default function MarkerPreviewCard({ opportunity, onClose }: Props) {
  const company = getCompanyById(opportunity.companyId);
  const publicId = publicOpportunityId(opportunity);
  const style = MARKER_STYLES[markerStyleFor(opportunity.category)];
  const cover = useResolvedImage(opportunity.images[0]);
  const { isOpportunitySaved, toggleSavedOpportunity, hydrated } = useMessaging();
  const saved = hydrated && isOpportunitySaved(opportunity.id);

  return (
    <article className="bg-white w-[300px] overflow-hidden">
      <div className="relative aspect-[16/9] bg-navy-900/5">
        {cover ? (
          <Image src={cover} alt={opportunity.title} fill sizes="320px" className="object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 to-transparent pointer-events-none" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-2 right-2 h-8 w-8 inline-flex items-center justify-center rounded-full bg-navy-900/85 hover:bg-navy-900 text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span
            className="inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-bold text-white rounded-full px-2.5 py-1"
            style={{ backgroundColor: style.fill }}
          >
            {opportunity.category}
          </span>
        </div>
        <div className="absolute bottom-2 right-2">
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold bg-white/85 text-navy-900 rounded-full px-2 py-0.5 tabular-nums">
            {publicId}
          </span>
        </div>
      </div>

      <div className="p-4">
        <Link
          href={`/opportunity/${opportunity.slug}`}
          className="font-semibold text-navy-900 text-[15px] leading-snug hover:text-gold-700 transition-colors line-clamp-2"
        >
          {opportunity.title}
        </Link>

        {/* Country + status */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-navy-700/70 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
            <span className="truncate">
              {opportunity.place?.country ?? opportunity.location}
            </span>
          </div>
          <span className="shrink-0 inline-flex items-center text-[10px] uppercase tracking-[0.12em] font-bold rounded-full px-2 py-0.5 ring-1 bg-navy-900/[0.05] text-navy-700 ring-navy-900/10">
            {opportunity.status}
          </span>
        </div>

        {/* Investment + sponsor */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-bone/60 ring-1 ring-navy-900/[0.05] px-2.5 py-1.5">
            <div className="text-[9px] uppercase tracking-[0.12em] text-navy-700/55 font-bold inline-flex items-center gap-1">
              <Banknote className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
              Investment
            </div>
            <div className="mt-0.5 text-sm font-semibold text-navy-900 tabular-nums">
              {formatInvestment(opportunity)}
            </div>
          </div>
          <div className="rounded-lg bg-bone/60 ring-1 ring-navy-900/[0.05] px-2.5 py-1.5 min-w-0">
            <div className="text-[9px] uppercase tracking-[0.12em] text-navy-700/55 font-bold inline-flex items-center gap-1">
              <Building2 className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
              Sponsor
            </div>
            {company ? (
              <Link
                href={`/company/${company.slug}`}
                className="mt-0.5 block text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors truncate"
              >
                {company.name}
              </Link>
            ) : (
              <div className="mt-0.5 text-sm font-semibold text-navy-900 truncate">
                {opportunity.postedBy}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <Link
          href={`/opportunity/${opportunity.slug}`}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
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
