"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, X, ArrowRight, Building2 } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { markerStyleFor, MARKER_STYLES } from "@/lib/map/types";

type Props = {
  opportunity: Opportunity;
  onClose: () => void;
};

export default function MarkerPreviewCard({ opportunity, onClose }: Props) {
  const company = getCompanyById(opportunity.companyId);
  const publicId = publicOpportunityId(opportunity);
  const style = MARKER_STYLES[markerStyleFor(opportunity.category)];

  return (
    <article className="bg-white rounded-2xl ring-1 ring-navy-900/[0.08] shadow-xl shadow-navy-900/15 overflow-hidden">
      <div className="relative aspect-[16/9] bg-navy-900/5">
        <Image
          src={opportunity.images[0]}
          alt={opportunity.title}
          fill
          sizes="380px"
          className="object-cover"
        />
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

        <div className="mt-2 flex items-center gap-1.5 text-xs text-navy-700/70 truncate">
          <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
          <span className="truncate">{opportunity.location}</span>
        </div>

        {company ? (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-navy-700/70 truncate">
            <Building2 className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
            <Link
              href={`/company/${company.slug}`}
              className="font-semibold text-navy-700/85 hover:text-gold-700 transition-colors truncate"
            >
              {company.name}
            </Link>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/opportunity/${opportunity.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
          >
            View opportunity
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </article>
  );
}
