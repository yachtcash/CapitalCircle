"use client";

import { useMemo } from "react";
import { Building2, HandCoins, Layers, Globe2, Users, type LucideIcon } from "lucide-react";

import type { Member } from "@/data/members";
import { MEMBERS } from "@/data/members";
import { useMemberProfile } from "@/lib/members/profile";
import SectionHeader from "@/components/ui/SectionHeader";

export default function MemberNetwork({ member }: { member: Member }) {
  const { active, linkedCompanies, countries } = useMemberProfile(member, 0);

  const connections = useMemo(() => {
    return MEMBERS.filter(
      (m) =>
        m.id !== member.id &&
        ((member.companyId && m.companyId === member.companyId) ||
          m.industry === member.industry ||
          m.region === member.region)
    ).length;
  }, [member]);

  const tiles: { icon: LucideIcon; label: string; value: number; chips: string[] }[] = [
    { icon: Building2, label: "Companies", value: linkedCompanies.length, chips: linkedCompanies.map((c) => c.name).slice(0, 3) },
    { icon: HandCoins, label: "Opportunities", value: active.length, chips: active.map((o) => o.title).slice(0, 3) },
    { icon: Layers, label: "Industries", value: member.industries.length, chips: member.industries.slice(0, 4) },
    { icon: Globe2, label: "Markets", value: countries.length || 1, chips: countries.length ? countries.slice(0, 4) : [member.country] },
    { icon: Users, label: "Connections", value: connections, chips: [member.region, member.industry] },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Network" title="Network at a glance" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-navy-900 text-gold-500 inline-flex items-center justify-center">
                <t.icon className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className="text-2xl font-semibold text-navy-900 tabular-nums">{t.value}</div>
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">{t.label}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.chips.filter(Boolean).map((c, i) => (
                <span key={c + i} className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-navy-900/[0.04] text-navy-700 ring-1 ring-navy-900/10 truncate max-w-full">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
