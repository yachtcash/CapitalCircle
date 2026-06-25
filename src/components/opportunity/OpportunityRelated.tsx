"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities } from "@/data/opportunities";
import CompanyOpportunityCard from "@/components/company/CompanyOpportunityCard";

export default function OpportunityRelated({ opportunity }: { opportunity: Opportunity }) {
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;

  const related = useMemo(() => {
    const country = opportunity.place?.country;
    return pool
      .filter((o) => o.slug !== opportunity.slug && o.status !== "Closed")
      .map((o) => {
        let score = 0;
        if (o.companyId && o.companyId === opportunity.companyId) score += 3;
        if (o.category === opportunity.category) score += 2;
        if (country && o.place?.country === country) score += 1;
        return { o, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || Date.parse(b.o.postedAt) - Date.parse(a.o.postedAt))
      .slice(0, 3)
      .map((x) => x.o);
  }, [pool, opportunity]);

  if (related.length === 0) return null;

  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" strokeWidth={2.2} />
              You may also like
            </div>
            <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">Related opportunities</h2>
          </div>
          <Link href="/opportunities" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors whitespace-nowrap">
            Browse all
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {related.map((o) => (
            <CompanyOpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
