import { featuredOpportunities } from "@/data/opportunities";
import OpportunityCard from "./OpportunityCard";
import { ArrowRight } from "lucide-react";

export default function FeaturedOpportunities() {
  return (
    <section id="opportunities" className="bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-14 md:py-20">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold">
              Featured This Week
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
              Active opportunities
            </h2>
          </div>
          <a
            href="#all"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors group"
          >
            View all
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {featuredOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <a
            href="#all"
            className="flex items-center justify-center gap-1.5 w-full rounded-full bg-navy-900 text-white text-sm font-semibold py-3"
          >
            View all opportunities
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </a>
        </div>
      </div>
    </section>
  );
}
