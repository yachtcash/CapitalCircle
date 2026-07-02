"use client";

import { Layers, TrendingUp, Building2, Globe2, Handshake, Activity, CalendarClock } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Member } from "@/data/members";
import { useMemberProfile } from "@/lib/members/profile";
import { compactMoney } from "@/lib/home/format";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard, { StatGrid } from "@/components/ui/StatCard";

export default function MemberStats({ member }: { member: Member }) {
  const { hydrated } = useMessaging();
  const { active, capitalRaising, linkedCompanies, countries, introductionsTotal } = useMemberProfile(member, 0);

  const yearsActive = hydrated ? Math.max(0, new Date().getFullYear() - member.joinedYear) : null;
  const companiesRepresented = Math.max(linkedCompanies.length, member.companiesCount || 0);

  const stats = [
    { icon: Layers, label: "Active Opportunities", value: String(active.length) },
    { icon: TrendingUp, label: "Capital Raising", value: compactMoney(capitalRaising) },
    { icon: Building2, label: "Companies Represented", value: String(companiesRepresented) },
    { icon: Globe2, label: "Countries Active", value: String(countries.length) },
    { icon: Handshake, label: "Introductions", value: String(introductionsTotal) },
    { icon: Activity, label: "Marketplace Activity", value: String(member.recentActivity.length) },
    {
      icon: CalendarClock,
      label: "Years Active",
      value: yearsActive === null ? `Est. ${member.joinedYear}` : String(yearsActive),
    },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Institutional snapshot" title="By the numbers" />
      <StatGrid columns="grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} dense />
        ))}
      </StatGrid>
    </section>
  );
}
