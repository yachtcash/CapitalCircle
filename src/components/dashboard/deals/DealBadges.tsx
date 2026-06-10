"use client";

import {
  Flame,
  Zap,
  TrendingUp,
  Activity,
  CalendarClock,
  Clock,
} from "lucide-react";
import type { DealPriority, DealStage } from "@/data/deals";
import { cn } from "@/lib/cn";

export const STAGE_STYLES: Record<DealStage, string> = {
  "New Lead": "bg-sky-500/15 text-sky-700 ring-sky-500/30",
  Reviewing: "bg-indigo-500/15 text-indigo-700 ring-indigo-500/30",
  Contacted: "bg-violet-500/15 text-violet-700 ring-violet-500/30",
  "Waiting Response": "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  "Introduction Sent": "bg-cyan-500/15 text-cyan-700 ring-cyan-500/30",
  "Meeting Scheduled": "bg-fuchsia-500/15 text-fuchsia-700 ring-fuchsia-500/30",
  Negotiating: "bg-orange-500/15 text-orange-700 ring-orange-500/30",
  "Due Diligence": "bg-teal-500/15 text-teal-700 ring-teal-500/30",
  "Under Contract": "bg-gold-500/20 text-gold-700 ring-gold-500/40",
  Closed: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  Lost: "bg-rose-500/15 text-rose-700 ring-rose-500/30",
};

export const STAGE_DOT: Record<DealStage, string> = {
  "New Lead": "bg-sky-500",
  Reviewing: "bg-indigo-500",
  Contacted: "bg-violet-500",
  "Waiting Response": "bg-amber-500",
  "Introduction Sent": "bg-cyan-500",
  "Meeting Scheduled": "bg-fuchsia-500",
  Negotiating: "bg-orange-500",
  "Due Diligence": "bg-teal-500",
  "Under Contract": "bg-gold-500",
  Closed: "bg-emerald-500",
  Lost: "bg-rose-500",
};

export function DealStageBadge({ stage }: { stage: DealStage }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1",
        STAGE_STYLES[stage]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STAGE_DOT[stage])} />
      {stage}
    </span>
  );
}

const PRIORITY_STYLES: Record<DealPriority, { ring: string; Icon: typeof Flame }> = {
  Low: { ring: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15", Icon: Activity },
  Medium: { ring: "bg-sky-500/15 text-sky-700 ring-sky-500/30", Icon: TrendingUp },
  High: { ring: "bg-orange-500/15 text-orange-700 ring-orange-500/30", Icon: Flame },
  Urgent: { ring: "bg-rose-500/15 text-rose-700 ring-rose-500/30", Icon: Zap },
};

export function DealPriorityBadge({ priority }: { priority: DealPriority }) {
  const meta = PRIORITY_STYLES[priority];
  const Icon = meta.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1",
        meta.ring
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.4} />
      {priority}
    </span>
  );
}

export function FollowUpBadge({
  iso,
  nowMs,
}: {
  iso?: string;
  nowMs: number;
}) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const days = Math.floor((t - nowMs) / (24 * 60 * 60 * 1000));
  if (days < 0) {
    const overdue = Math.abs(days);
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1 bg-rose-500/15 text-rose-700 ring-rose-500/30">
        <Clock className="h-3 w-3" strokeWidth={2.4} />
        Overdue · {overdue}d
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1 bg-gold-500/15 text-gold-700 ring-gold-500/30">
        <CalendarClock className="h-3 w-3" strokeWidth={2.4} />
        Due in {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1 bg-navy-900/[0.06] text-navy-700 ring-navy-900/15">
      <CalendarClock className="h-3 w-3" strokeWidth={2.4} />
      {days}d
    </span>
  );
}

export function formatCurrency(value: number): string {
  if (value <= 0) return "—";
  if (value >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
