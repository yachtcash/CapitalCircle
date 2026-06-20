"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

import OpportunityCard from "@/components/OpportunityCard";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities } from "@/data/opportunities";
import { resolveHeroId, isPlacementEmpty } from "@/lib/marketplace/placement";
import { getFeaturedOpportunityOfTheWeek } from "@/data/opportunities/collections";

const COUNT = 6;

export default function RecentOpportunities() {
  const { marketplacePlacement: placement, hydrated } = useMessaging();
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;
  const fallbackId = getFeaturedOpportunityOfTheWeek().id;

  const items = useMemo(() => {
    const heroId =
      !hydrated || isPlacementEmpty(placement)
        ? fallbackId
        : resolveHeroId(pool, placement) ?? fallbackId;
    return [...pool]
      .filter((o) => o.id !== heroId)
      .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
      .slice(0, COUNT);
  }, [pool, placement, hydrated, fallbackId]);

  if (items.length === 0) return null;

  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
              Recently Added
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
              Fresh deal flow
            </h2>
            <p className="mt-2 text-sm md:text-base text-navy-700/70 max-w-2xl">
              The newest opportunities to reach the marketplace — be among the first to engage.
            </p>
          </div>
          <Link
            href="/opportunities?sort=newest"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors whitespace-nowrap"
          >
            Browse all new
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((o, i) => (
            <OpportunityCard key={o.id} opportunity={o} ribbon="New" showPublicId priority={i === 0} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/opportunities?sort=newest"
            className="w-full inline-flex items-center justify-center rounded-full bg-navy-900 text-white text-sm font-semibold py-3"
          >
            Browse all new
          </Link>
        </div>
      </div>
    </section>
  );
}
