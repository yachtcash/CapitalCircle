// Global analytics time filter. Anchored to DEAL_DESK_NOW_MS — the same demo
// "now" the Deal Desk and Calendar use — so the ranges line up with the frozen
// seed dataset instead of drifting against the real wall-clock (which would make
// most windows empty, since the seed data is clustered around 2026-05/06).

import { DEAL_DESK_NOW_MS } from "@/data/deals";

export type AnalyticsRange = "today" | "7d" | "30d" | "90d" | "all";

export const RANGE_OPTIONS: { key: AnalyticsRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
  { key: "all", label: "All Time" },
];

export const ANALYTICS_NOW_MS = DEAL_DESK_NOW_MS;

const DAY = 24 * 60 * 60 * 1000;

export type RangeBounds = { startMs: number; endMs: number };

/** Inclusive [startMs, endMs] window for a range, anchored at `nowMs`. */
export function rangeBounds(range: AnalyticsRange, nowMs: number): RangeBounds {
  const endOfToday = new Date(nowMs);
  endOfToday.setHours(23, 59, 59, 999);
  const endMs = endOfToday.getTime();

  if (range === "all") return { startMs: 0, endMs: Number.POSITIVE_INFINITY };

  if (range === "today") {
    const start = new Date(nowMs);
    start.setHours(0, 0, 0, 0);
    return { startMs: start.getTime(), endMs };
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return { startMs: nowMs - days * DAY, endMs };
}

/** True if an ISO timestamp falls within the bounds (missing/invalid → false). */
export function inRange(iso: string | undefined | null, bounds: RangeBounds): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return t >= bounds.startMs && t <= bounds.endMs;
}

/** Convenience for the active range label (used in export filenames / headers). */
export function rangeLabel(range: AnalyticsRange): string {
  return RANGE_OPTIONS.find((r) => r.key === range)?.label ?? "All Time";
}
