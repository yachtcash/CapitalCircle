"use client";

import { ShieldCheck, Activity, Layers, TrendingUp, CalendarDays, type LucideIcon } from "lucide-react";

import type { Company } from "@/data/companies";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";
import { compactMoney } from "@/lib/home/format";
import SectionHeader from "@/components/ui/SectionHeader";

export default function CompanyCredibility({ company }: { company: Company }) {
  const { active, capitalRaising, countries } = useCompanyOpportunityProfile(company.id, 0);

  const verified = company.verification === "Verified" || company.verification === "Premium Verified";
  const totalListed = active.length + company.closedOpportunitiesCount;
  const memberSinceYear = (() => {
    const y = Number.isNaN(Date.parse(company.addedAt)) ? null : new Date(company.addedAt).getUTCFullYear();
    return y;
  })();

  const signals: { icon: LucideIcon; label: string; value: string; on: boolean }[] = [
    {
      icon: ShieldCheck,
      label: company.verification === "Premium Verified" ? "Premium Verified Sponsor" : verified ? "Verified Sponsor" : "Verification Pending",
      value: verified ? "Identity & track record reviewed by Capital Circle" : "Under review by Capital Circle",
      on: verified,
    },
    {
      icon: Activity,
      label: "Active Marketplace Participant",
      value: active.length > 0 ? `${active.length} live ${active.length === 1 ? "opportunity" : "opportunities"}` : "No live opportunities",
      on: active.length > 0,
    },
    {
      icon: Layers,
      label: "Opportunities Listed",
      value: `${totalListed} total · ${company.closedOpportunitiesCount} closed`,
      on: totalListed > 0,
    },
    {
      icon: TrendingUp,
      label: "Capital Raising Activity",
      value: capitalRaising > 0 ? `${compactMoney(capitalRaising)} actively raising` : "Not currently raising",
      on: capitalRaising > 0,
    },
    {
      icon: CalendarDays,
      label: "Marketplace Presence",
      value: memberSinceYear
        ? `Member since ${memberSinceYear}${countries.length ? ` · ${countries.length} ${countries.length === 1 ? "market" : "markets"}` : ""}`
        : `${countries.length} active ${countries.length === 1 ? "market" : "markets"}`,
      on: true,
    },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Credibility" title="Why investors trust this sponsor" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {signals.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 flex items-start gap-3"
          >
            <div
              className={
                s.on
                  ? "h-10 w-10 rounded-xl bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/25 inline-flex items-center justify-center shrink-0"
                  : "h-10 w-10 rounded-xl bg-navy-900/[0.05] text-navy-700/50 ring-1 ring-navy-900/10 inline-flex items-center justify-center shrink-0"
              }
            >
              <s.icon className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-navy-900 leading-snug">{s.label}</div>
              <div className="mt-0.5 text-xs text-navy-700/70 leading-relaxed">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
