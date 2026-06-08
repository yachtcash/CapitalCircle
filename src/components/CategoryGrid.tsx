import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/categories";
import { featuredOpportunities } from "@/data/opportunities";

function liveCount(label: string): number {
  return featuredOpportunities.filter((o) => o.category === label).length;
}

export default function CategoryGrid() {
  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-14 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8 md:mb-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold">
              Browse by Sector
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
              Thirteen categories. One Circle.
            </h2>
          </div>
          <p className="text-sm text-navy-700/70 md:max-w-sm md:text-right">
            From ground-up real estate to operating businesses, every deal on Capital Circle is
            posted by a vetted member.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const live = liveCount(category.label);
            return (
              <Link
                key={category.slug}
                href={`/opportunities?category=${encodeURIComponent(category.label)}`}
                aria-label={`Browse ${category.label} opportunities`}
                className="group relative bg-white rounded-2xl p-4 md:p-5 ring-1 ring-navy-900/[0.06] hover:ring-gold-500/60 hover:shadow-lg hover:shadow-navy-900/5 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-navy-700/30 group-hover:text-gold-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    strokeWidth={2}
                  />
                </div>
                <div className="mt-4">
                  <div className="font-semibold text-sm md:text-[15px] text-navy-900 leading-snug group-hover:text-gold-700 transition-colors">
                    {category.label}
                  </div>
                  <div className="mt-1 text-xs text-navy-700/60 leading-snug hidden sm:block">
                    {category.description}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold">
                      {category.count} listings
                    </span>
                    {live > 0 ? (
                      <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 rounded-full px-2 py-0.5">
                        {live} active
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
