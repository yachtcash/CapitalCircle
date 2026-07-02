"use client";

import { ShieldCheck, BadgeCheck, FileText, TrendingUp, Activity, Layers, type LucideIcon } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import type { Member } from "@/data/members";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";
import { compactMoney } from "@/lib/home/format";
import SectionHeader from "@/components/ui/SectionHeader";

function fmt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function OpportunityCredibility({
  opportunity,
  company,
  leadMember,
}: {
  opportunity: Opportunity;
  company: Company | undefined;
  leadMember: Member | null;
}) {
  const { active, capitalRaising } = useCompanyOpportunityProfile(company?.id ?? "", 0);

  const sponsorVerified = leadMember
    ? leadMember.verification === "Verified" || leadMember.verification === "Founding Member"
    : false;
  const companyVerified = company
    ? company.verification === "Verified" || company.verification === "Premium Verified"
    : false;
  const docs = opportunity.documents?.length ?? 0;
  const capital = capitalRaising > 0 ? capitalRaising : opportunity.fundingAmount || 0;

  const signals: { icon: LucideIcon; label: string; value: string; on: boolean }[] = [
    {
      icon: ShieldCheck,
      label: "Verified Sponsor",
      value: leadMember ? `${leadMember.name} · ${leadMember.verification}` : "Sponsor on record",
      on: sponsorVerified,
    },
    {
      icon: BadgeCheck,
      label: "Verified Company",
      value: company ? `${company.name} · ${company.verification}` : "—",
      on: companyVerified,
    },
    {
      icon: FileText,
      label: "Documents Available",
      value: docs > 0 ? `${docs} ${docs === 1 ? "document" : "documents"} in the data room` : "Released after NDA",
      on: docs > 0,
    },
    {
      icon: TrendingUp,
      label: "Capital Raising",
      value: capital > 0 ? `${compactMoney(capital)} in active raises` : "Not currently raising",
      on: capital > 0,
    },
    {
      icon: Layers,
      label: "Active Sponsor",
      value: active.length > 0 ? `${active.length} live ${active.length === 1 ? "opportunity" : "opportunities"}` : "This opportunity",
      on: active.length > 0,
    },
    {
      icon: Activity,
      label: "Marketplace Activity",
      value: `Listed ${fmt(opportunity.postedAt)}${opportunity.featured ? " · featured" : ""}`,
      on: true,
    },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Credibility" title="Institutional trust signals" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {signals.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 flex items-start gap-3">
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
