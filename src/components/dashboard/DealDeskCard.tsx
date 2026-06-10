"use client";

import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  AlertCircle,
  CalendarClock,
  DollarSign,
  TrendingUp,
  Trophy,
  XCircle,
  UserPlus,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { computeDealDeskMetrics, DEAL_DESK_NOW_MS } from "@/data/deals";
import { formatCurrency } from "@/components/dashboard/deals/DealBadges";
import { cn } from "@/lib/cn";

/**
 * Deal Desk hero on the dashboard homepage. Surfaces the operations-center
 * summary — active, monthly, won/lost, pending intros, follow-ups, capital
 * being raised, total value — and routes to /deal-desk.
 */
export default function DealDeskCard() {
  const { deals, introductionRequests } = useMessaging();
  const m = computeDealDeskMetrics(deals, DEAL_DESK_NOW_MS);
  const pendingIntros = introductionRequests.filter((r) => r.status === "Pending").length;

  return (
    <section className="bg-navy-900 text-white rounded-3xl ring-1 ring-gold-500/30 shadow-md overflow-hidden">
      <div className="p-6 md:p-8 grid lg:grid-cols-[minmax(0,1fr)_auto] gap-6 items-end">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-400 font-bold inline-flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" strokeWidth={2.4} />
            Deal Desk · Platform Operations
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
            Pipeline at a glance
          </h2>
          <p className="mt-1.5 text-sm text-white/70 max-w-xl leading-relaxed">
            Every introduction, negotiation, and capital raise — tracked from
            New Lead to Closed Won.
          </p>
        </div>
        <Link
          href="/deal-desk"
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors shrink-0"
        >
          Open Deal Desk
          <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
        </Link>
      </div>

      <div className="border-t border-white/10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
        <Cell label="Active" value={m.totalActive.toString()} Icon={Briefcase} />
        <Cell label="This Month" value={m.dealsThisMonth.toString()} Icon={TrendingUp} />
        <Cell label="Won" value={m.closedWon.toString()} Icon={Trophy} />
        <Cell label="Lost" value={m.closedLost.toString()} Icon={XCircle} />
        <Cell label="Intros" value={pendingIntros.toString()} Icon={UserPlus} />
        <Cell
          label="Follow Ups"
          value={m.pendingFollowUps.toString()}
          Icon={CalendarClock}
          tone={m.overdueFollowUps > 0 ? "rose" : "default"}
        />
        <Cell label="Raising" value={formatCurrency(m.capitalBeingRaised)} Icon={DollarSign} tone="gold" />
        <Cell label="Total Value" value={formatCurrency(m.totalDealValue)} Icon={DollarSign} tone="gold" />
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
    <div className="px-4 md:px-5 py-4 border-r border-white/10 last:border-r-0 [&:nth-child(even)]:bg-white/[0.02]">
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
