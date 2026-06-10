"use client";

import { useState, type DragEvent } from "react";
import Link from "next/link";
import { Building2, HandCoins, Clock, Tag } from "lucide-react";
import type { Deal, DealStage } from "@/data/deals";
import { DEAL_STAGES } from "@/data/deals";
import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  DealPriorityBadge,
  FollowUpBadge,
  formatCurrency,
  STAGE_DOT,
} from "./DealBadges";
import { cn } from "@/lib/cn";

type Props = {
  deals: Deal[];
};

export default function DealPipelineView({ deals }: Props) {
  const { updateDealStage } = useMessaging();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<DealStage | null>(null);

  const nowMs = Date.parse("2026-06-09T00:00:00Z");

  const grouped = DEAL_STAGES.map((stage) => ({
    stage,
    items: deals.filter((d) => d.status === stage),
  }));

  const onDragStart = (id: string) => () => setDraggingId(id);
  const onDragEnd = () => {
    setDraggingId(null);
    setHoverStage(null);
  };
  const onColumnDragOver = (stage: DealStage) => (e: DragEvent) => {
    e.preventDefault();
    setHoverStage(stage);
  };
  const onColumnDrop = (stage: DealStage) => (e: DragEvent) => {
    e.preventDefault();
    setHoverStage(null);
    if (!draggingId) return;
    const target = deals.find((d) => d.dealId === draggingId);
    if (!target || target.status === stage) return;
    updateDealStage(draggingId, stage, "Dragged on pipeline");
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 md:-mx-10 md:px-10 snap-x">
      {grouped.map(({ stage, items }) => {
        const totalValue = items.reduce((s, d) => s + d.estimatedValue, 0);
        const isHover = hoverStage === stage;
        return (
          <div
            key={stage}
            onDragOver={onColumnDragOver(stage)}
            onDragLeave={() => setHoverStage((s) => (s === stage ? null : s))}
            onDrop={onColumnDrop(stage)}
            className={cn(
              "shrink-0 w-[280px] md:w-[300px] flex flex-col snap-start rounded-2xl ring-1 bg-bone/40 transition-colors",
              isHover ? "ring-gold-500 bg-gold-500/[0.06]" : "ring-navy-900/[0.05]"
            )}
          >
            <header className="px-3 py-3 border-b border-navy-900/[0.06] bg-white rounded-t-2xl">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <span className={cn("h-2 w-2 rounded-full", STAGE_DOT[stage])} />
                  <span className="text-sm font-semibold text-navy-900 truncate">
                    {stage}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/55 tabular-nums">
                  {items.length}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-navy-700/60 tabular-nums">
                {formatCurrency(totalValue)}
              </div>
            </header>
            <ul className="flex-1 p-2 space-y-2 min-h-[120px]">
              {items.length === 0 ? (
                <li className="rounded-xl border border-dashed border-navy-900/[0.08] py-6 text-center text-[11px] text-navy-700/45">
                  Drop here
                </li>
              ) : (
                items.map((deal) => (
                  <li
                    key={deal.dealId}
                    draggable
                    onDragStart={onDragStart(deal.dealId)}
                    onDragEnd={onDragEnd}
                    className={cn(
                      "transition-opacity",
                      draggingId === deal.dealId && "opacity-40"
                    )}
                  >
                    <DealKanbanCard deal={deal} nowMs={nowMs} />
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function DealKanbanCard({ deal, nowMs }: { deal: Deal; nowMs: number }) {
  return (
    <Link
      href={`/dashboard/deals/${deal.dealId}`}
      className="block bg-white rounded-xl ring-1 ring-navy-900/[0.06] hover:ring-gold-500/50 hover:shadow-md hover:shadow-navy-900/[0.05] transition-all p-3"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/55 tabular-nums">
          {deal.dealId}
        </span>
        <DealPriorityBadge priority={deal.priority} />
      </div>
      <h4 className="font-semibold text-navy-900 text-sm leading-snug line-clamp-2">
        {deal.title}
      </h4>
      <div className="mt-2 text-[11px] text-navy-700/65 space-y-1">
        {deal.companyId ? (
          <div className="inline-flex items-center gap-1.5 truncate">
            <Building2 className="h-3 w-3 text-gold-600 shrink-0" strokeWidth={2.4} />
            <span className="truncate">{deal.companyId}</span>
          </div>
        ) : null}
        {deal.opportunityId ? (
          <div className="inline-flex items-center gap-1.5 truncate">
            <HandCoins className="h-3 w-3 text-gold-600 shrink-0" strokeWidth={2.4} />
            <span className="truncate">{deal.opportunityId}</span>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy-900 tabular-nums">
          {formatCurrency(deal.estimatedValue)}
        </span>
        <FollowUpBadge iso={deal.nextFollowUpDate} nowMs={nowMs} />
      </div>
      {deal.lastContactDate ? (
        <div className="mt-2 text-[10px] text-navy-700/45 inline-flex items-center gap-1 uppercase tracking-[0.14em] font-semibold">
          <Clock className="h-3 w-3" strokeWidth={2.4} />
          Last contact ·{" "}
          {new Date(deal.lastContactDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
      ) : null}
      {deal.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {deal.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] font-bold bg-bone text-navy-700 ring-1 ring-navy-900/[0.06] rounded-full px-1.5 py-0.5"
            >
              <Tag className="h-2.5 w-2.5" strokeWidth={2.4} />
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
