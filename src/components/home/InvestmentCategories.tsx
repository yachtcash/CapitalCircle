"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Hotel,
  Building2,
  Mountain,
  Zap,
  TrainTrack,
  Tag,
  Handshake,
  Truck,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities } from "@/data/opportunities";

// Institutional category set. `match` is the exact data category string used to
// count + filter the marketplace (/opportunities?category=...).
const HOME_CATEGORIES: { label: string; match: string; icon: LucideIcon }[] = [
  { label: "Hotels", match: "Hotels & Resorts", icon: Hotel },
  { label: "Real Estate", match: "Real Estate Development", icon: Building2 },
  { label: "Land", match: "Land Opportunities", icon: Mountain },
  { label: "Energy", match: "Energy", icon: Zap },
  { label: "Infrastructure", match: "Infrastructure", icon: TrainTrack },
  { label: "Businesses", match: "Business Acquisitions", icon: Tag },
  { label: "Joint Ventures", match: "Joint Ventures", icon: Handshake },
  { label: "Suppliers", match: "Suppliers & Logistics", icon: Truck },
];

export default function InvestmentCategories() {
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of pool) map.set(o.category, (map.get(o.category) ?? 0) + 1);
    return map;
  }, [pool]);

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="mb-6 md:mb-8">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
            Investment Categories
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
            Deploy capital across asset classes
          </h2>
          <p className="mt-2 text-sm md:text-base text-navy-700/70 max-w-2xl">
            Filter the marketplace by the sectors that matter to your mandate.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {HOME_CATEGORIES.map((c) => {
            const count = counts.get(c.match) ?? 0;
            return (
              <Link
                key={c.label}
                href={`/opportunities?category=${encodeURIComponent(c.match)}`}
                className="group relative bg-white rounded-2xl p-4 md:p-5 ring-1 ring-navy-900/[0.06] hover:ring-gold-500/60 hover:shadow-lg hover:shadow-navy-900/5 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-navy-900 text-gold-500 inline-flex items-center justify-center group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors">
                    <c.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-navy-700/30 group-hover:text-gold-600 transition-colors" strokeWidth={2.2} />
                </div>
                <div className="mt-3 text-sm font-semibold text-navy-900">{c.label}</div>
                <div className="mt-0.5 text-xs text-gold-600 font-semibold tabular-nums">
                  {count} {count === 1 ? "opportunity" : "opportunities"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
