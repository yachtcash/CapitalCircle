"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";

import { sortNewestFirst, type ActivityEntity, type ActivityEvent } from "@/lib/activity/types";
import ActivityItem from "./ActivityItem";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

export type ActivityFilter = { label: string; entities: ActivityEntity[] | null };

/**
 * The one activity timeline. Card shell + newest-first rows + shared
 * skeleton + canonical empty state + optional entity filter pills.
 * Pure presentation — callers pass already-derived ActivityEvents.
 */
export default function ActivityFeed({
  events,
  loading = false,
  nowMs,
  limit,
  filters,
  emptyTitle = "No activity yet",
  emptyDescription = "Platform activity will appear here as it happens.",
  className,
}: {
  events: ActivityEvent[];
  /** Pre-hydration: renders skeleton rows instead (no layout jump). */
  loading?: boolean;
  /** Pass a hydration-stable now (0 pre-hydration). */
  nowMs: number;
  limit?: number;
  /** Optional filter pills; the first entry is treated as "All" when entities is null. */
  filters?: ActivityFilter[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);

  const visible = useMemo(() => {
    let list = sortNewestFirst(events);
    const filter = filters?.[active];
    if (filter?.entities) list = list.filter((e) => filter.entities!.includes(e.entity));
    return limit ? list.slice(0, limit) : list;
  }, [events, filters, active, limit]);

  return (
    <div className={className}>
      {filters && filters.length > 1 ? (
        <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {filters.map((f, i) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold ring-1 transition-colors",
                active === i
                  ? "bg-navy-900 text-gold-400 ring-navy-900"
                  : "bg-white text-navy-700/70 ring-navy-900/10 hover:ring-navy-900/25 hover:text-navy-900"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
        {loading ? (
          <ul aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-4 md:px-5 py-3.5 border-b border-navy-900/[0.05] last:border-b-0"
              >
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-44 rounded" />
                  <Skeleton className="h-2.5 w-28 rounded" />
                </div>
              </li>
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <EmptyState Icon={Activity} compact title={emptyTitle} description={emptyDescription} />
        ) : (
          <ul>
            {visible.map((event) => (
              <ActivityItem key={event.id} event={event} nowMs={nowMs} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
