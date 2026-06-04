import type { Opportunity } from "@/data/opportunities";
import OpportunityCard from "./OpportunityCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RelatedOpportunities({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  if (opportunities.length === 0) return null;

  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-14 md:py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
              You may also like
            </div>
            <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
              Related Opportunities
            </h2>
          </div>
          <Link
            href="/#opportunities"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors group"
          >
            Browse all
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </div>
    </section>
  );
}
