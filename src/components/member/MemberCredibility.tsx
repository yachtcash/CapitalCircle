"use client";

import { ShieldCheck, Activity, Layers, TrendingUp, Handshake, CalendarDays, type LucideIcon } from "lucide-react";

import type { Member } from "@/data/members";
import { useMemberProfile } from "@/lib/members/profile";
import { compactMoney } from "@/lib/home/format";
import SectionHeader from "@/components/ui/SectionHeader";

export default function MemberCredibility({ member }: { member: Member }) {
  const { active, capitalRaising, introductionsTotal } = useMemberProfile(member, 0);

  const verified = member.verification === "Verified" || member.verification === "Founding Member";
  const opportunitiesListed = Math.max(active.length, member.opportunitiesCount || 0);

  const signals: { icon: LucideIcon; label: string; value: string; on: boolean }[] = [
    {
      icon: ShieldCheck,
      label: member.verification === "Founding Member" ? "Founding Member" : verified ? "Verified Member" : "Verification " + member.verification,
      value: verified ? "Identity reviewed by Capital Circle" : "Under review by Capital Circle",
      on: verified,
    },
    {
      icon: Activity,
      label: "Active Marketplace Participant",
      value: active.length > 0 ? `${active.length} live ${active.length === 1 ? "opportunity" : "opportunities"}` : `${member.recentActivity.length} recent actions`,
      on: active.length > 0 || member.recentActivity.length > 0,
    },
    {
      icon: Layers,
      label: "Opportunities Listed",
      value: `${opportunitiesListed} ${opportunitiesListed === 1 ? "opportunity" : "opportunities"} · ${member.listingsCount} listings`,
      on: opportunitiesListed > 0,
    },
    {
      icon: TrendingUp,
      label: "Capital Raising Activity",
      value: capitalRaising > 0 ? `${compactMoney(capitalRaising)} actively raising` : "Not currently raising",
      on: capitalRaising > 0,
    },
    {
      icon: Handshake,
      label: "Introductions Generated",
      value: introductionsTotal > 0 ? `${introductionsTotal} brokered ${introductionsTotal === 1 ? "introduction" : "introductions"}` : "No introductions yet",
      on: introductionsTotal > 0,
    },
    {
      icon: CalendarDays,
      label: "Marketplace Presence",
      value: `Member since ${member.joinedYear}${member.contactPreferences.acceptsIntroductions ? " · open to introductions" : ""}`,
      on: true,
    },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Credibility" title="Trust & track record" />
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
