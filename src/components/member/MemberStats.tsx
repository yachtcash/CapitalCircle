"use client";

import { Layers, TrendingUp, Building2, Globe2, Handshake, Activity, CalendarClock } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Member } from "@/data/members";
import { useMemberProfile } from "@/lib/members/profile";
import { compactMoney } from "@/lib/home/format";

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
      <div className="rounded-2xl bg-navy-900/[0.06] ring-1 ring-navy-900/[0.06] grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-px overflow-hidden">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-4 md:p-5">
            <div className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase tracking-[0.12em] text-navy-700/55 font-bold">
              <s.icon className="h-3 w-3 text-gold-600 shrink-0" strokeWidth={2.2} />
              {s.label}
            </div>
            <div className="mt-1.5 text-lg md:text-xl font-semibold text-navy-900 tracking-tight tabular-nums">
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
