import { categories } from "@/data/categories";
import { ArrowUpRight } from "lucide-react";

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
            return (
              <a
                key={category.slug}
                href={`#${category.slug}`}
                className="group relative bg-white rounded-2xl p-4 md:p-5 ring-1 ring-navy-900/[0.06] hover:ring-gold-500/60 hover:shadow-lg hover:shadow-navy-900/5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-navy-700/30 group-hover:text-gold-600 transition-colors"
                    strokeWidth={2}
                  />
                </div>
                <div className="mt-4">
                  <div className="font-semibold text-sm md:text-[15px] text-navy-900 leading-snug">
                    {category.label}
                  </div>
                  <div className="mt-1 text-xs text-navy-700/60 leading-snug hidden sm:block">
                    {category.description}
                  </div>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold">
                    {category.count} listings
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
