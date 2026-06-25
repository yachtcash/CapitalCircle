"use client";

import { useMemo } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { companies, type Company } from "@/data/companies";
import type { Member } from "@/data/members";
import type { Opportunity } from "@/data/opportunities";

const ACTIVE_FUNDING_STATUSES = new Set(["Open", "Seeking Capital", "Negotiating"]);

export type MemberProfile = {
  /** Opportunities this member is linked to, from the live pool (visible only). */
  linkedOpps: Opportunity[];
  active: Opportunity[];
  capitalRaising: number;
  countries: string[];
  cities: string[];
  categories: string[];
  /** Companies this member is associated with (primary first). */
  linkedCompanies: Company[];
  /** Live introduction requests targeting this member. */
  introsForMember: number;
  introsCompleted: number;
  /** Seed-narrative introductions surfaced on the member's activity timeline. */
  seedIntros: number;
  /** Total introductions signal (seed + live completed). */
  introductionsTotal: number;
  /** Primary linked company slug for the "View Company" CTA. */
  primaryCompanySlug: string | null;
};

export function useMemberProfile(member: Member, nowMs: number): MemberProfile {
  void nowMs; // reserved for future time-windowed metrics; keeps the signature stable
  const pool = useAllOpportunities();
  const { introductionRequests, hydrated } = useMessaging();

  return useMemo(() => {
    const slugs = new Set(member.opportunitySlugs);
    const linkedOpps = pool.filter((o) => slugs.has(o.slug));
    const active = linkedOpps.filter((o) => o.status !== "Closed");
    const capitalRaising = active
      .filter((o) => ACTIVE_FUNDING_STATUSES.has(o.status))
      .reduce((sum, o) => sum + (o.fundingAmount || 0), 0);
    const countries = [...new Set(active.map((o) => o.place?.country).filter((c): c is string => !!c))];
    const cities = [...new Set(active.map((o) => o.place?.city).filter((c): c is string => !!c))];
    const categories = [...new Set(active.map((o) => o.category).filter(Boolean))];

    const companySlugSet = new Set(member.companySlugs);
    let linkedCompanies = companies.filter((c) => companySlugSet.has(c.slug));
    if (member.companyId && !linkedCompanies.some((c) => c.id === member.companyId)) {
      const primary = companies.find((c) => c.id === member.companyId);
      if (primary) linkedCompanies = [primary, ...linkedCompanies];
    }

    const mine = hydrated ? introductionRequests.filter((r) => r.targetMemberId === member.id) : [];
    const introsForMember = mine.length;
    const introsCompleted = mine.filter((r) => r.status === "Completed").length;
    const seedIntros = member.recentActivity.filter((a) => a.kind === "introduction").length;

    const primaryCompanySlug =
      linkedCompanies[0]?.slug ??
      (member.companyId ? companies.find((c) => c.id === member.companyId)?.slug ?? null : null);

    return {
      linkedOpps,
      active,
      capitalRaising,
      countries,
      cities,
      categories,
      linkedCompanies,
      introsForMember,
      introsCompleted,
      seedIntros,
      introductionsTotal: seedIntros + introsCompleted,
      primaryCompanySlug,
    };
  }, [pool, introductionRequests, hydrated, member]);
}
