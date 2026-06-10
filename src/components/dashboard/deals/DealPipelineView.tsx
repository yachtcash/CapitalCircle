"use client";

import { useState, type DragEvent } from "react";
import Link from "next/link";
import { User, Landmark, CalendarClock, Info } from "lucide-react";
import type { Deal, DealStage } from "@/data/deals";
import { DEAL_DESK_NOW_MS, KANBAN_STAGES } from "@/data/deals";
import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  DealPriorityBadge,
  formatCurrency,
  formatDate,
  STAGE_DOT,
} from "./DealBadges";
import { cn } from "@/lib/cn";

/**
 * Kanban board over the eight headline stages. Deals sitting in the six
 * intermediate stages (First Contact, Investor/Sponsor Review, LOI,
 * Contract Review, Archived) don't appear here — a banner counts them and
 * points at the Table view, which covers all fourteen stages.
 */
export default function DealPipelineView({ deals }: { deals: Deal[] }) {
  const { updateDealStage } = useMessaging();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<DealStage | null>(null);

  const boardSet = new Set<DealStage>(KANBAN_STAGES);
  const offBoard = deals.filter((d) => !boardSet.has(d.stage)).length;

  const grouped = KANBAN_STAGES.map((stage) => ({
    stage,
    items: deals.filter((d) => d.stage === stage),
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
    if (!target || target.stage === stage) return;
    updateDealStage(draggingId, stage, "Moved on the Kanban board");
  };

  return (
    <div>
      {offBoard > 0 ? (
        <div className="mb-3 rounded-xl bg-bone/70 ring-1 ring-navy-900/[0.06] px-4 py-2.5 text-xs text-navy-700/75 inline-flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.4} />
          {offBoard} {offBoard === 1 ? "deal sits" : "deals sit"} in
          intermediate stages not shown on the board — switch to the Table
          view to see all fourteen stages.
        </div>
      ) : null}

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 md:-mx-10 md:px-10 snap-x">
        {grouped.map(({ stage, items }) => {
          const totalValue = items.reduce((s, d) => s + d.targetInvestment, 0);
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
                      <KanbanCard deal={deal} />
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({ deal }: { deal: Deal }) {
  return (
    <Link
      href={`/deal-desk/${deal.dealId}`}
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
      <div className="mt-2 text-[11px] text-navy-700/70 space-y-1">
        <div className="inline-flex items-center gap-1.5 truncate w-full">
          <Landmark className="h-3 w-3 text-gold-600 shrink-0" strokeWidth={2.4} />
          <span className="truncate">{deal.sponsor.name}</span>
        </div>
        {deal.investor ? (
          <div className="inline-flex items-center gap-1.5 truncate w-full">
            <User className="h-3 w-3 text-gold-600 shrink-0" strokeWidth={2.4} />
            <span className="truncate">{deal.investor.name}</span>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy-900 tabular-nums">
          {formatCurrency(deal.targetInvestment)}
        </span>
        {deal.expectedCloseDate ? (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-navy-700/55">
            <CalendarClock className="h-3 w-3" strokeWidth={2.4} />
            {formatDate(deal.expectedCloseDate)}
          </span>
        ) : null}
      </div>
      <span className="sr-only">
        Open {deal.dealId} — current follow-up window anchored to{" "}
        {new Date(DEAL_DESK_NOW_MS).toDateString()}
      </span>
    </Link>
  );
}
