"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Store, ArrowRight, Crown, Star, ListOrdered, Clock3 } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities } from "@/data/opportunities";
import { resolveHeroId, isPlacementEmpty } from "@/lib/marketplace/placement";

export default function MarketplacePlacementWidget() {
  const { marketplacePlacement: p, userOpportunities, hydrated } = useMessaging();
  const allOpps = useMemo(
    () => (hydrated ? [...userOpportunities, ...featuredOpportunities] : featuredOpportunities),
    [userOpportunities, hydrated]
  );
  const heroId = resolveHeroId(allOpps, p);
  const hero = allOpps.find((o) => o.id === heroId);
  const heroIsAuto = !p.heroId;
  const featuredCount = p.featuredIds.length;
  const totalOrdered = (p.heroId ? 1 : 0) + p.featuredIds.length + p.order.length;
  const updated = p.updatedAt ? p.updatedAt.slice(0, 16).replace("T", " ") : "Never";

  return (
    <section className="rounded-2xl bg-navy-900 text-white ring-1 ring-navy-900 p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-bold inline-flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5" strokeWidth={2.4} />
          Marketplace Placement
        </div>
        <Link
          href="/admin/marketplace"
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-400 hover:text-gold-300 transition-colors"
        >
          Manage Placement
          <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3 col-span-2">
          <div className="text-[9px] uppercase tracking-[0.14em] text-white/55 font-bold inline-flex items-center gap-1">
            <Crown className="h-3 w-3 text-gold-400" strokeWidth={2.2} />
            Current Hero
          </div>
          <div className="mt-1 text-sm font-semibold text-white truncate">
            {hero ? hero.title : "—"}
          </div>
          <div className="text-[10px] text-white/45">{heroIsAuto ? "Automatic fallback" : "Pinned"}</div>
        </div>
        <Tile Icon={Star} label="Featured" value={`${featuredCount} / 6`} />
        <Tile Icon={ListOrdered} label="Curated" value={totalOrdered} />
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3 col-span-2 lg:col-span-4">
          <div className="text-[9px] uppercase tracking-[0.14em] text-white/55 font-bold inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3 text-gold-400" strokeWidth={2.2} />
            Last Updated
          </div>
          <div className="mt-1 text-sm font-semibold text-white tabular-nums">
            {isPlacementEmpty(p) ? "Never curated — marketplace is automatic" : updated}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ Icon, label, value }: { Icon: typeof Star; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3">
      <div className="text-[9px] uppercase tracking-[0.14em] text-white/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-3 w-3 text-gold-400" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}
