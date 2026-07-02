"use client";

import { Layers, TrendingUp, Globe2, Sparkles, CheckCircle2, CalendarClock } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Company } from "@/data/companies";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";
import { compactMoney } from "@/lib/home/format";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard, { StatGrid } from "@/components/ui/StatCard";

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
      <StatGrid columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
        ))}
      </StatGrid>
    </section>
  );
}
