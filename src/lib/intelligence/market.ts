// Investor intelligence — pure derivations over the existing marketplace
// datasets. Every function takes the pool as input (seed on the server,
// useAllOpportunities() live pool on the client) and fabricates nothing:
// each figure traces to real Opportunity / Company / Member records.
//
// Reused helpers: compactMoney (lib/home/format), parseReturnPct (the
// canonical return parser from the directory collections).

import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import type { Member } from "@/data/members";
import { parseReturnPct } from "@/data/opportunities/collections";

/** Statuses that count as actively raising — same set MarketStatsStrip uses. */
export const ACTIVE_FUNDING_STATUSES = new Set<Opportunity["status"]>([
  "Open",
  "Seeking Capital",
  "Negotiating",
]);

// ---- Marketplace snapshot ---------------------------------------------------

export type MarketSnapshot = {
  total: number;
  active: number;
  seekingCapital: number;
  capitalRaising: number;
  sponsorCount: number;
  countryCount: number;
  industryCount: number;
  avgReturnPct: number | null;
  avgRaise: number;
  largestRaise: Opportunity | null;
};

export function marketSnapshot(pool: Opportunity[]): MarketSnapshot {
  const active = pool.filter((o) => ACTIVE_FUNDING_STATUSES.has(o.status));
  const funded = active.filter((o) => (o.fundingAmount ?? 0) > 0);
  const capitalRaising = funded.reduce((s, o) => s + o.fundingAmount, 0);
  const returns = pool.map(parseReturnPct).filter((n): n is number => n !== null);
  const largestRaise = funded.reduce<Opportunity | null>(
    (best, o) => (!best || o.fundingAmount > best.fundingAmount ? o : best),
    null
  );
  return {
    total: pool.length,
    active: active.length,
    seekingCapital: pool.filter((o) => o.status === "Seeking Capital").length,
    capitalRaising,
    sponsorCount: new Set(pool.map((o) => o.companyId).filter(Boolean)).size,
    countryCount: new Set(pool.map((o) => o.place?.country).filter(Boolean)).size,
    industryCount: new Set(pool.map((o) => o.category).filter(Boolean)).size,
    avgReturnPct: returns.length
      ? Math.round((returns.reduce((s, n) => s + n, 0) / returns.length) * 10) / 10
      : null,
    avgRaise: funded.length ? Math.round(capitalRaising / funded.length) : 0,
    largestRaise,
  };
}

// ---- Rankings ---------------------------------------------------------------

export type CountryRank = {
  country: string;
  count: number;
  capital: number;
  industries: string[];
  /** Share of total opportunities, 0..1 — powers the ranking bars. */
  share: number;
};

export function countryRankings(pool: Opportunity[]): CountryRank[] {
  const byCountry = new Map<string, Opportunity[]>();
  for (const o of pool) {
    const c = o.place?.country;
    if (!c) continue;
    const list = byCountry.get(c);
    if (list) list.push(o);
    else byCountry.set(c, [o]);
  }
  const total = pool.length || 1;
  return [...byCountry.entries()]
    .map(([country, opps]) => ({
      country,
      count: opps.length,
      capital: opps
        .filter((o) => ACTIVE_FUNDING_STATUSES.has(o.status))
        .reduce((s, o) => s + (o.fundingAmount || 0), 0),
      industries: [...new Set(opps.map((o) => o.category))],
      share: opps.length / total,
    }))
    .sort((a, b) => b.count - a.count || b.capital - a.capital);
}

export type IndustryRank = {
  category: string;
  count: number;
  capital: number;
  avgReturnPct: number | null;
  largestRaise: number;
  share: number;
};

export function industryRankings(pool: Opportunity[]): IndustryRank[] {
  const byCategory = new Map<string, Opportunity[]>();
  for (const o of pool) {
    if (!o.category) continue;
    const list = byCategory.get(o.category);
    if (list) list.push(o);
    else byCategory.set(o.category, [o]);
  }
  const total = pool.length || 1;
  return [...byCategory.entries()]
    .map(([category, opps]) => {
      const returns = opps.map(parseReturnPct).filter((n): n is number => n !== null);
      return {
        category,
        count: opps.length,
        capital: opps
          .filter((o) => ACTIVE_FUNDING_STATUSES.has(o.status))
          .reduce((s, o) => s + (o.fundingAmount || 0), 0),
        avgReturnPct: returns.length
          ? Math.round((returns.reduce((s, n) => s + n, 0) / returns.length) * 10) / 10
          : null,
        largestRaise: opps.reduce((m, o) => Math.max(m, o.fundingAmount || 0), 0),
        share: opps.length / total,
      };
    })
    .sort((a, b) => b.count - a.count || b.capital - a.capital);
}

export type SponsorRank = {
  company: Company;
  count: number;
  capital: number;
};

export type SponsorRankings = {
  mostActive: SponsorRank[];
  largestRaising: SponsorRank[];
  newest: Company[];
  verifiedCount: number;
  premiumCount: number;
};

export function sponsorRankings(
  pool: Opportunity[],
  companies: Company[],
  limit = 5
): SponsorRankings {
  const byCompany = new Map<string, { count: number; capital: number }>();
  for (const o of pool) {
    if (!o.companyId) continue;
    const cur = byCompany.get(o.companyId) ?? { count: 0, capital: 0 };
    cur.count += 1;
    if (ACTIVE_FUNDING_STATUSES.has(o.status)) cur.capital += o.fundingAmount || 0;
    byCompany.set(o.companyId, cur);
  }
  const ranked: SponsorRank[] = companies
    .map((company) => ({
      company,
      count: byCompany.get(company.id)?.count ?? 0,
      capital: byCompany.get(company.id)?.capital ?? 0,
    }))
    .filter((r) => r.count > 0);
  return {
    mostActive: [...ranked].sort((a, b) => b.count - a.count || b.capital - a.capital).slice(0, limit),
    largestRaising: [...ranked].sort((a, b) => b.capital - a.capital).slice(0, limit),
    newest: [...companies]
      .sort((a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""))
      .slice(0, limit),
    verifiedCount: companies.filter(
      (c) => c.verification === "Verified" || c.verification === "Premium Verified"
    ).length,
    premiumCount: companies.filter((c) => c.verification === "Premium Verified").length,
  };
}

export function mostActiveMembers(members: Member[], limit = 5): Member[] {
  return [...members]
    .filter((m) => m.trending || m.listingsCount > 0)
    .sort(
      (a, b) =>
        Number(b.trending) - Number(a.trending) || b.listingsCount - a.listingsCount
    )
    .slice(0, limit);
}

// ---- Generated insights -----------------------------------------------------

export type MarketInsight = {
  text: string;
  /** Which ranking backs the sentence — for the leading icon. */
  kind: "industry" | "geography" | "return" | "capital" | "sponsor";
};

export function marketInsights(
  pool: Opportunity[],
  companies: Company[]
): MarketInsight[] {
  const insights: MarketInsight[] = [];
  const industries = industryRankings(pool);
  const countries = countryRankings(pool);
  const snapshot = marketSnapshot(pool);

  if (industries[0]) {
    insights.push({
      kind: "industry",
      text: `${industries[0].category} represents ${Math.round(industries[0].share * 100)}% of active opportunities.`,
    });
  }
  if (countries[0]) {
    insights.push({
      kind: "geography",
      text: `${countries[0].country} leads the marketplace with ${countries[0].count} opportunities across ${countries[0].industries.length} industries.`,
    });
  }
  const byReturn = industries
    .filter((i) => i.avgReturnPct !== null && i.count >= 2)
    .sort((a, b) => (b.avgReturnPct ?? 0) - (a.avgReturnPct ?? 0));
  if (byReturn[0]) {
    insights.push({
      kind: "return",
      text: `${byReturn[0].category} carries the highest average target return at ${byReturn[0].avgReturnPct}%.`,
    });
  }
  const byAvgRaise = industries
    .filter((i) => i.count >= 2 && i.capital > 0)
    .sort((a, b) => b.capital / b.count - a.capital / a.count);
  if (byAvgRaise[0]) {
    insights.push({
      kind: "capital",
      text: `${byAvgRaise[0].category} represents the largest average raise on the platform.`,
    });
  }
  const { verifiedCount } = sponsorRankings(pool, companies, 1);
  if (verifiedCount > 0) {
    insights.push({
      kind: "sponsor",
      text: `${verifiedCount} of ${companies.length} sponsor firms have completed Capital Circle verification.`,
    });
  }
  if (snapshot.largestRaise) {
    insights.push({
      kind: "capital",
      text: `The largest live mandate is ${snapshot.largestRaise.title} at ${snapshot.largestRaise.fundingRequired || "an undisclosed amount"}.`,
    });
  }
  return insights;
}

// ---- Market health ----------------------------------------------------------

export type MarketHealthLabel = "High Activity" | "Growing" | "Stable" | "Emerging";

/**
 * Deterministic health classification for a segment. "Recent" is measured
 * against the newest posting in the whole pool (no wall clock — stable
 * across SSR and hydration).
 */
export function healthFor(
  segment: Opportunity[],
  pool: Opportunity[]
): MarketHealthLabel {
  if (segment.length < 3) return "Emerging";
  const newestMs = pool.reduce(
    (m, o) => Math.max(m, Date.parse(o.postedAt) || 0),
    0
  );
  const recentCutoff = newestMs - 45 * 24 * 60 * 60 * 1000;
  const activeShare =
    segment.filter((o) => ACTIVE_FUNDING_STATUSES.has(o.status)).length /
    segment.length;
  const recentShare =
    segment.filter((o) => (Date.parse(o.postedAt) || 0) >= recentCutoff).length /
    segment.length;
  if (activeShare >= 0.6 && recentShare >= 0.25) return "High Activity";
  if (recentShare >= 0.35) return "Growing";
  if (activeShare >= 0.4) return "Stable";
  return "Emerging";
}
