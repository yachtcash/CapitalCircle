"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowUpRight, Pin, Building2 } from "lucide-react";
import type { Conversation } from "@/data/messages";
import { getCompanyById } from "@/data/companies";

export default function OpportunitySummaryCard({
  conversation,
  companyName,
}: {
  conversation: Conversation;
  companyName: string;
}) {
  const hasOpportunity = Boolean(conversation.opportunitySlug);
  const company = getCompanyById(conversation.companyId);

  // No opportunity attached → render a direct-to-company "Regarding" card.
  // This is the path for company-initiated threads (no listing context).
  if (!hasOpportunity) {
    return (
      <article className="bg-white rounded-xl ring-1 ring-navy-900/[0.08] overflow-hidden">
        <header className="flex items-center gap-2 px-4 py-2 bg-bone/60 border-b border-navy-900/[0.06]">
          <Pin className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
          <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-navy-700/65">
            Regarding · direct message
          </span>
        </header>
        <div className="flex items-start gap-3 p-3 md:p-4">
          <span className="shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5">
            <Building2 className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
              Direct message
            </div>
            <div className="font-semibold text-navy-900 text-sm md:text-[15px] leading-snug mt-0.5 truncate">
              {companyName}
            </div>
            <p className="mt-1 text-xs text-navy-700/65 leading-snug">
              No specific listing is attached. Reference an opportunity in your
              message to give the sponsor context.
            </p>
            {company ? (
              <Link
                href={`/company/${company.slug}`}
                className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
              >
                View sponsor profile
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-xl ring-1 ring-navy-900/[0.08] overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-2 bg-bone/60 border-b border-navy-900/[0.06]">
        <Pin className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
        <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-navy-700/65">
          Regarding · {conversation.opportunityTitle ?? "opportunity"}
        </span>
      </header>

      <div className="flex items-stretch">
        {conversation.opportunityImage ? (
          <div className="relative shrink-0 h-24 w-24 md:h-28 md:w-28 bg-navy-900/5">
            <Image
              src={conversation.opportunityImage}
              alt={conversation.opportunityTitle ?? ""}
              fill
              sizes="120px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : null}

        <div className="flex-1 min-w-0 p-3 md:p-4 flex flex-col">
          {conversation.opportunityCategory ? (
            <div className="text-[10px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
              {conversation.opportunityCategory}
            </div>
          ) : null}
          <div className="font-semibold text-navy-900 text-sm md:text-[15px] leading-snug mt-0.5 line-clamp-1">
            {conversation.opportunityTitle ?? "Conversation"}
          </div>
          <div className="mt-1 text-xs text-navy-700/70 inline-flex items-center gap-2">
            <span className="font-medium text-navy-700/85 truncate">{companyName}</span>
            {conversation.opportunityLocation ? (
              <>
                <span className="text-navy-700/30">·</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
                  {conversation.opportunityLocation}
                </span>
              </>
            ) : null}
          </div>
          <Link
            href={`/opportunity/${conversation.opportunitySlug}`}
            className="mt-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors self-start pt-2"
          >
            View opportunity
            <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </article>
  );
}
