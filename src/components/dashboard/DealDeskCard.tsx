"use client";

import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  AlertCircle,
  CalendarClock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { computeDealMetrics } from "@/data/deals";
import { formatCurrency } from "@/components/dashboard/deals/DealBadges";
import { cn } from "@/lib/cn";

/**
 * Hero-style Deal Desk card for the dashboard homepage.
 *
 * Surfaces the seven required widgets — Open Deals, Deals This Week,
 * Deals This Month, Closed Deals, Potential Commission, Upcoming Follow
 * Ups, Overdue Follow Ups — and routes to /dashboard/deals.
 */
export default function DealDeskCard() {
  const { deals } = useMessaging();
  const nowMs = Date.parse("2026-06-09T00:00:00Z");
  const m = computeDealMetrics(deals, nowMs);

  return (
    <section className="bg-navy-900 text-white rounded-3xl ring-1 ring-gold-500/30 shadow-md overflow-hidden">
      <div className="p-6 md:p-8 grid lg:grid-cols-[minmax(0,1fr)_auto] gap-6 items-end">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-400 font-bold inline-flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" strokeWidth={2.4} />
            Deal Desk
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
            Pipeline at a glance
          </h2>
          <p className="mt-1.5 text-sm text-white/70 max-w-xl leading-relaxed">
            Every introduction, inquiry, and lead — tracked from First Touch
            to Closed. Conversions feed straight into the table.
          </p>
        </div>
        <Link
          href="/dashboard/deals"
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors shrink-0"
        >
          Open Deal Desk
          <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
        </Link>
      </div>

      <div className="border-t border-white/10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <Cell label="Open" value={m.openCount.toString()} Icon={Briefcase} />
        <Cell label="This Week" value={m.dealsThisWeek.toString()} Icon={TrendingUp} />
        <Cell label="This Month" value={m.dealsThisMonth.toString()} Icon={TrendingUp} />
        <Cell label="Closed" value={m.closedCount.toString()} Icon={DollarSign} />
        <Cell
          label="Commission"
          value={formatCurrency(m.potentialCommission)}
          Icon={DollarSign}
          tone="gold"
        />
        <Cell
          label="Upcoming"
          value={m.upcomingFollowUps.toString()}
          Icon={CalendarClock}
        />
        <Cell
          label="Overdue"
          value={m.overdueFollowUps.toString()}
          Icon={AlertCircle}
          tone={m.overdueFollowUps > 0 ? "rose" : "default"}
        />
      </div>
    </section>
  );
}

function Cell({
  label,
  value,
  Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  Icon: typeof Briefcase;
  tone?: "default" | "gold" | "rose";
}) {
  return (
    <div
      className={cn(
        "px-4 md:px-5 py-4 border-r border-white/10 last:border-r-0",
        "even:bg-white/[0.02] lg:even:bg-transparent lg:[&:nth-child(even)]:bg-white/[0.02]"
      )}
    >
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-bold inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3" strokeWidth={2.4} />
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 text-xl md:text-2xl font-semibold tracking-tight tabular-nums",
          tone === "gold" && "text-gold-300",
          tone === "rose" && "text-rose-300"
        )}
      >
        {value}
      </div>
    </div>
  );
}
