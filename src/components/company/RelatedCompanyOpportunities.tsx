"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import CompanyOpportunityCard from "./CompanyOpportunityCard";

export default function RelatedCompanyOpportunities({ company }: { company: Company }) {
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;

  const related = useMemo(() => {
    const mine = pool.filter((o) => o.companyId === company.id);
    const cats = new Set(mine.map((o) => o.category));
    const countries = new Set(mine.map((o) => o.place?.country).filter(Boolean));
    // Seed from the company's own footprint; fall back to its industry/HQ so the
    // row still surfaces relevant deals when the sponsor has no live listings.
    if (cats.size === 0) cats.add(company.industry);
    const hqCountry = company.headquarters?.country;
    if (countries.size === 0 && hqCountry) countries.add(hqCountry);

    return pool
      .filter((o) => o.companyId !== company.id && o.status !== "Closed")
      .map((o) => {
        const catMatch = cats.has(o.category) ? 2 : 0;
        const geoMatch = o.place?.country && countries.has(o.place.country) ? 1 : 0;
        return { o, score: catMatch + geoMatch };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || Date.parse(b.o.postedAt) - Date.parse(a.o.postedAt))
      .slice(0, 6)
      .map((x) => x.o);
  }, [pool, company]);

  if (related.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5" strokeWidth={2.2} />
            Discover more
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            Related opportunities
          </h2>
        </div>
        <Link
          href="/opportunities"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors whitespace-nowrap"
        >
          Browse marketplace
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {related.slice(0, 3).map((o) => (
          <CompanyOpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
    </section>
  );
}
