"use client";

import Link from "next/link";
import { Building2, HandCoins, Tag, ArrowUpRight } from "lucide-react";
import type { Deal } from "@/data/deals";
import {
  DealPriorityBadge,
  DealStageBadge,
  FollowUpBadge,
  formatCurrency,
  formatDate,
} from "./DealBadges";

export default function DealCardGridView({ deals }: { deals: Deal[] }) {
  const nowMs = Date.parse("2026-06-09T00:00:00Z");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
      {deals.map((deal) => (
        <Link
          key={deal.dealId}
          href={`/dashboard/deals/${deal.dealId}`}
          className="group flex flex-col bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 transition-all"
        >
          <header className="bg-navy-900 text-white px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold tabular-nums text-gold-400">
                {deal.dealId}
              </span>
              <DealPriorityBadge priority={deal.priority} />
            </div>
            <h3 className="mt-1.5 text-base md:text-lg font-semibold tracking-tight leading-snug line-clamp-2">
              {deal.title}
            </h3>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <DealStageBadge stage={deal.status} />
              <FollowUpBadge iso={deal.nextFollowUpDate} nowMs={nowMs} />
            </div>
          </header>

          <div className="p-5 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-3 text-xs text-navy-700/70">
              {deal.companyId ? (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Building2 className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
                  <span className="truncate">{deal.companyId}</span>
                </span>
              ) : null}
              {deal.opportunityId ? (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <HandCoins className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
                  <span className="truncate">{deal.opportunityId}</span>
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-navy-900 tabular-nums">
                {formatCurrency(deal.estimatedValue)}
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
                est. value
              </span>
            </div>
            <div className="text-xs text-navy-700/60 tabular-nums">
              {formatCurrency(deal.commissionPotential)} potential commission
            </div>

            {deal.summaryNote ? (
              <p className="mt-3 text-sm text-navy-700/80 leading-relaxed line-clamp-3">
                {deal.summaryNote}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {deal.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700 bg-bone ring-1 ring-navy-900/[0.05] rounded-full px-2 py-0.5"
                >
                  <Tag className="h-2.5 w-2.5" strokeWidth={2.4} />
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-navy-900/[0.06] flex items-center justify-between gap-2 text-[11px]">
              <span className="text-navy-700/55">
                Updated {formatDate(deal.updatedDate)}
              </span>
              <span className="inline-flex items-center gap-1 uppercase tracking-[0.14em] font-bold text-gold-700 group-hover:text-gold-600">
                Open
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
