"use client";

import { Layers, TrendingUp, Globe2, Sparkles, CheckCircle2, CalendarClock } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Company } from "@/data/companies";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";
import { compactMoney } from "@/lib/home/format";

export default function CompanyStats({ company }: { company: Company }) {
  const { hydrated } = useMessaging();
  const nowMs = hydrated ? Date.now() : 0;
  const { active, capitalRaising, countries, recentCount } = useCompanyOpportunityProfile(company.id, nowMs);

  const yearsActive = hydrated ? Math.max(0, new Date().getFullYear() - company.foundedYear) : null;

  const stats = [
    { icon: Layers, label: "Active Opportunities", value: String(active.length) },
    { icon: TrendingUp, label: "Total Capital Raising", value: compactMoney(capitalRaising) },
    { icon: Globe2, label: "Countries Active", value: String(countries.length) },
    { icon: Sparkles, label: "Recent Opportunities", value: String(recentCount) },
    { icon: CheckCircle2, label: "Closed Opportunities", value: String(company.closedOpportunitiesCount) },
    {
      icon: CalendarClock,
      label: "Years Active",
      value: yearsActive === null ? `Est. ${company.foundedYear}` : String(yearsActive),
    },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Institutional snapshot" title="By the numbers" />
      <div className="rounded-2xl bg-navy-900/[0.06] ring-1 ring-navy-900/[0.06] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-4 md:p-5">
            <div className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">
              <s.icon className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
              {s.label}
            </div>
            <div className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight tabular-nums">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">{eyebrow}</div>
      <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">{title}</h2>
    </div>
  );
}
