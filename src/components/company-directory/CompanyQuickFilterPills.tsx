import Link from "next/link";
import { Filter } from "lucide-react";
import { COMPANY_QUICK_FILTERS } from "@/data/company-directory/collections";

export default function CompanyQuickFilterPills() {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-4 pb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-navy-700/65 font-semibold">
            <Filter className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
            Quick filters
          </span>
          <div className="flex flex-wrap gap-2">
            {COMPANY_QUICK_FILTERS.map((q) => (
              <Link
                key={q.label}
                href={`/companies?${q.query}`}
                className="inline-flex items-center text-xs font-semibold text-navy-900 bg-white hover:bg-gold-500 hover:text-navy-900 ring-1 ring-navy-900/[0.08] hover:ring-gold-500 rounded-full px-3 py-1.5 transition-all"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
