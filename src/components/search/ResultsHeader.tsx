"use client";

import SortControl from "./SortControl";
import type { SortKey } from "@/lib/search/types";

type Props = {
  totalCount: number;
  totalAvailable: number;
  query: string;
  sort: SortKey;
  onSortChange: (next: SortKey) => void;
};

export default function ResultsHeader({
  totalCount,
  totalAvailable,
  query,
  sort,
  onSortChange,
}: Props) {
  const noun = totalCount === 1 ? "opportunity" : "opportunities";
  const allShown = totalCount === totalAvailable;

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="text-sm text-navy-900">
        <span className="font-semibold tabular-nums">{totalCount}</span>{" "}
        <span className="text-navy-700/70">{noun}</span>
        {query ? (
          <>
            {" "}
            <span className="text-navy-700/55">for</span>{" "}
            <span className="font-semibold">&ldquo;{query}&rdquo;</span>
          </>
        ) : null}
        {!allShown ? (
          <span className="text-navy-700/55"> · of {totalAvailable} total</span>
        ) : null}
      </div>
      <SortControl value={sort} onChange={onSortChange} />
    </div>
  );
}
