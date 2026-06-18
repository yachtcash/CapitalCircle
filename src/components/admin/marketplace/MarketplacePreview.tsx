"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Eye, Crown, Star } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities, type Opportunity } from "@/data/opportunities";
import { resolveHeroId, splitByPlacement } from "@/lib/marketplace/placement";
import { useResolvedImage } from "@/lib/imageStore";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { formatInvestment } from "./MarketplacePlacementCard";

function MiniThumb({ opportunity, className }: { opportunity: Opportunity; className?: string }) {
  const src = useResolvedImage(opportunity.images[0]);
  return (
    <div className={`relative bg-navy-900/5 overflow-hidden ${className ?? ""}`}>
      {src ? <Image src={src} alt={opportunity.title} fill sizes="160px" className="object-cover" /> : null}
    </div>
  );
}

export default function MarketplacePreview() {
  const { marketplacePlacement: placement, hydrated } = useMessaging();
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;

  const { hero, featured, remaining } = useMemo(() => {
    // Mirror the directory: hero resolves with the fallback chain, then split.
    const heroId = hydrated ? resolveHeroId(pool, placement) : null;
    return splitByPlacement(pool, { ...placement, heroId });
  }, [pool, placement, hydrated]);

  const top = remaining.slice(0, 12);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" strokeWidth={2.4} />
          Marketplace Preview
        </div>
        <span className="text-[11px] text-navy-700/55">This is what investors see on /opportunities</span>
      </div>

      {/* Hero */}
      {hero ? (
        <div className="relative rounded-2xl overflow-hidden bg-navy-900 text-white ring-1 ring-white/5">
          <div className="grid grid-cols-[1.4fr_minmax(0,1fr)]">
            <MiniThumb opportunity={hero} className="aspect-[16/8]" />
            <div className="p-4 flex flex-col justify-center min-w-0">
              <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.16em] font-bold text-gold-400">
                <Crown className="h-3 w-3" strokeWidth={2.4} /> Hero
              </span>
              <div className="mt-1 text-sm md:text-base font-semibold leading-snug line-clamp-2">{hero.title}</div>
              <div className="mt-1 text-xs text-white/70 tabular-nums">{formatInvestment(hero)} · {hero.status}</div>
              <div className="text-[10px] text-white/45 mt-0.5">{publicOpportunityId(hero)}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-bone/50 ring-1 ring-navy-900/[0.06] p-6 text-center text-sm text-navy-700/55">
          No hero — the marketplace will auto-select one.
        </div>
      )}

      {/* Featured row */}
      {featured.length > 0 ? (
        <>
          <div className="mt-4 mb-2 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold inline-flex items-center gap-1.5">
            <Star className="h-3 w-3 text-gold-600" strokeWidth={2.4} /> Featured
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {featured.map((o, i) => (
              <PreviewCard key={o.id} opportunity={o} badge={`#${i + 1}`} />
            ))}
          </div>
        </>
      ) : null}

      {/* Marketplace */}
      <div className="mt-4 mb-2 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
        Marketplace · first {top.length}
      </div>
      {top.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {top.map((o) => (
            <PreviewCard key={o.id} opportunity={o} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-navy-700/45">No marketplace listings.</p>
      )}
    </section>
  );
}

function PreviewCard({ opportunity, badge }: { opportunity: Opportunity; badge?: string }) {
  return (
    <div className="rounded-lg ring-1 ring-navy-900/[0.06] bg-white overflow-hidden">
      <div className="relative">
        <MiniThumb opportunity={opportunity} className="aspect-[16/10]" />
        {badge ? (
          <span className="absolute top-1 left-1 inline-flex items-center text-[9px] uppercase tracking-[0.12em] font-bold rounded-full px-1.5 py-0.5 bg-gold-500 text-navy-900">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="p-2">
        <div className="text-[11px] font-semibold text-navy-900 leading-snug line-clamp-2">{opportunity.title}</div>
        <div className="mt-0.5 text-[10px] text-navy-700/55 tabular-nums">{formatInvestment(opportunity)}</div>
      </div>
    </div>
  );
}
