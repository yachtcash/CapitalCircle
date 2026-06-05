"use client";

import Link from "next/link";
import { SearchX, ArrowRight } from "lucide-react";

type Props = {
  onClearFilters: () => void;
};

export default function EmptyResults({ onClearFilters }: Props) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 md:p-14 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-4 ring-navy-900/5">
        <SearchX className="h-6 w-6" strokeWidth={1.9} />
      </span>
      <h3 className="mt-5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
        No opportunities matched your search.
      </h3>
      <p className="mt-3 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-md mx-auto">
        Try widening your filters or browse the full marketplace — fresh listings come in
        every week.
      </p>
      <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/15 hover:ring-navy-900/40 text-navy-900 font-semibold text-sm px-5 py-2.5 transition-shadow"
        >
          Clear Filters
        </button>
        <Link
          href="/search"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold text-sm px-5 py-2.5 transition-colors"
        >
          Browse All Opportunities
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
