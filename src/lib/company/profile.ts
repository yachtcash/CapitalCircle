"use client";

import { useMemo } from "react";
import { useAllOpportunities } from "@/lib/opportunities/all";
import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";

const ACTIVE_FUNDING_STATUSES = new Set(["Open", "Seeking Capital", "Negotiating"]);

export type CompanyOpportunityProfile = {
  /** Visible (non-closed) opportunities for this company, from the live pool. */
  active: Opportunity[];
  /** Active opportunities sorted newest-first. */
  recent: Opportunity[];
  /** Sum of fundingAmount across opportunities that are actively raising. */
  capitalRaising: number;
  /** Distinct countries this company is active in. */
  countries: string[];
  /** Distinct cities. */
  cities: string[];
  /** Distinct categories / sectors. */
  categories: string[];
  /** Distinct deal types. */
  dealTypes: string[];
  /** Count posted within the last 120 days (freshness signal). */
  recentCount: number;
};

/**
 * Derives a company's marketplace footprint from the SAME live opportunity pool
 * the rest of the app uses (seed pre-hydration, the live union after), so the
 * sponsor profile reflects user-created listings consistently.
 */
export function useCompanyOpportunityProfile(
  companyId: string,
  nowMs: number
): CompanyOpportunityProfile {
  const allOpps = useAllOpportunities();
  return useMemo(() => {
    const mine = allOpps.filter((o) => o.companyId === companyId);
    const active = mine.filter((o) => o.status !== "Closed");
    const recent = [...active].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
    const capitalRaising = active
      .filter((o) => ACTIVE_FUNDING_STATUSES.has(o.status))
      .reduce((sum, o) => sum + (o.fundingAmount || 0), 0);
    const countries = [...new Set(active.map((o) => o.place?.country).filter((c): c is string => !!c))];
    const cities = [...new Set(active.map((o) => o.place?.city).filter((c): c is string => !!c))];
    const categories = [...new Set(active.map((o) => o.category).filter(Boolean))];
    const dealTypes = [...new Set(active.map((o) => o.dealType).filter(Boolean))];
    const windowMs = 120 * 24 * 60 * 60 * 1000;
    const recentCount = nowMs
      ? active.filter((o) => nowMs - Date.parse(o.postedAt) <= windowMs).length
      : 0;
    return { active, recent, capitalRaising, countries, cities, categories, dealTypes, recentCount };
  }, [allOpps, companyId, nowMs]);
}

/** Institutional classification derived from the company's industry. */
export function companyType(company: Pick<Company, "industry">): string {
  const i = (company.industry || "").toLowerCase();
  if (/(develop|real estate|property|construction)/.test(i)) return "Development Group";
  if (/(invest|capital|asset|fund|partners|wealth)/.test(i)) return "Investment Manager";
  if (/(energy|solar|wind|power|renewable|storage)/.test(i)) return "Energy Sponsor";
  if (/(infrastructure|logistics|transport|utilit)/.test(i)) return "Infrastructure Sponsor";
  if (/(hotel|resort|hospitality|leisure)/.test(i)) return "Hotel Sponsor";
  if (/(manufactur|material|industrial)/.test(i)) return "Industrial Operator";
  return "Sponsor";
}
