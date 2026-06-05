import Link from "next/link";
import { Flame } from "lucide-react";
import { POPULAR_SEARCHES } from "@/lib/search/options";

export default function PopularSearches() {
  return (
    <div className="relative max-w-6xl mx-auto px-5 md:px-10 mt-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-navy-700/65 font-semibold">
          <Flame className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
          Popular searches
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="inline-flex items-center text-xs font-semibold text-navy-900 bg-white hover:bg-gold-500 hover:text-navy-900 ring-1 ring-navy-900/[0.08] hover:ring-gold-500 rounded-full px-3 py-1.5 transition-all"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
