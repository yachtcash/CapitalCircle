// Small presentation helpers for the homepage. Pure functions — safe to call
// from server or client components and stable across SSR/hydration.

/** Compact USD: 850_000 → "$850K", 52_000_000 → "$52M", 2_400_000_000 → "$2.4B". */
export function compactMoney(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

/** Capital required for a card — prefer the human range, fall back to the amount. */
export function capitalRequired(o: { investmentRange?: string; fundingAmount?: number }): string {
  if (o.investmentRange && o.investmentRange.trim()) return o.investmentRange.trim();
  if (typeof o.fundingAmount === "number" && o.fundingAmount > 0) return compactMoney(o.fundingAmount);
  return "On request";
}

/** Two-letter monogram from a company / person name. */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Relative time from an ISO string, given "now" in ms (pass Date.now() client-side). */
export function timeAgo(iso: string, nowMs: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.round((nowMs - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.round(d / 30);
  return `${mo}mo ago`;
}
