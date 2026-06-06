"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowUpRight, Pin } from "lucide-react";
import type { Conversation } from "@/data/messages";

export default function OpportunitySummaryCard({
  conversation,
  companyName,
}: {
  conversation: Conversation;
  companyName: string;
}) {
  const hasOpportunity = Boolean(conversation.opportunitySlug);

  return (
    <article className="bg-white rounded-xl ring-1 ring-navy-900/[0.08] overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-2 bg-bone/60 border-b border-navy-900/[0.06]">
        <Pin className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
        <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-navy-700/65">
          Pinned · Opportunity context
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
          {hasOpportunity ? (
            <Link
              href={`/opportunity/${conversation.opportunitySlug}`}
              className="mt-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors self-start pt-2"
            >
              View opportunity
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
