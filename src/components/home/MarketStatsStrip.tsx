"use client";

import { useMemo } from "react";
import Link from "next/link";
import { LayoutGrid, TrendingUp, Building2, Globe2, DoorOpen, CircleDollarSign, ArrowRight } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities } from "@/data/opportunities";
import { compactMoney } from "@/lib/home/format";
import { marketSnapshot } from "@/lib/intelligence/market";

export default function MarketStatsStrip() {
  const { auditEvents, hydrated } = useMessaging();
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;

  const stats = useMemo(() => {
    // Shared marketplace math lives in lib/intelligence/market — this strip
    // and the Market Intelligence center derive from the same functions.
    const snapshot = marketSnapshot(pool);
    const open = pool.filter((o) => o.status === "Open").length;
    const underContract = pool.filter((o) => o.status === "Under Contract").length;
    const closedDeals = hydrated ? auditEvents.filter((e) => e.action === "Deal Closed").length : 0;
    const recentlyFunded = underContract + closedDeals;

    return [
      { icon: LayoutGrid, label: "Total Opportunities", value: snapshot.total.toString() },
      { icon: TrendingUp, label: "Capital Being Raised", value: compactMoney(snapshot.capitalRaising) },
      { icon: Building2, label: "Active Sponsors", value: snapshot.sponsorCount.toString() },
      { icon: Globe2, label: "Countries Represented", value: snapshot.countryCount.toString() },
      { icon: DoorOpen, label: "Open Deals", value: open.toString() },
      { icon: CircleDollarSign, label: "Recently Funded", value: recentlyFunded.toString() },
    ];
  }, [pool, auditEvents, hydrated]);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-10 -mt-10 md:-mt-12 mb-2 md:mb-4">
      <div className="rounded-2xl bg-navy-900/[0.06] ring-1 ring-navy-900/[0.06] shadow-xl shadow-navy-900/5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-4 md:p-5">
              <div className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">
                <s.icon className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
                {s.label}
              </div>
              <div className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight tabular-nums">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      <p className="mt-3 text-center text-[11px] text-navy-700/45">
        Live figures from the current marketplace · updated as deals move ·{" "}
        <Link
          href="/intelligence"
          className="font-semibold text-gold-700 hover:text-gold-600 transition-colors inline-flex items-center gap-0.5"
        >
          Explore Market Intelligence
          <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
        </Link>
      </p>
    </div>
  );
}
