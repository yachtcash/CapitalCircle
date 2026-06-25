"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Briefcase,
  CalendarDays,
  ShieldCheck,
  Layers,
  TrendingUp,
  Target,
} from "lucide-react";

import type { Member } from "@/data/members";
import MemberContactActions from "./MemberContactActions";
import ReportButton from "@/components/moderation/ReportButton";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImage } from "@/lib/imageStore";
import { useMemberProfile } from "@/lib/members/profile";
import { compactMoney } from "@/lib/home/format";
import { cn } from "@/lib/cn";

const verificationStyles: Record<Member["verification"], string> = {
  Verified: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  "Founding Member": "bg-gold-500/20 text-gold-700 ring-gold-500/40",
  Pending: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  Unverified: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
};

export default function MemberHero({ member }: { member: Member }) {
  const { getMemberLive } = useMessaging();
  const live = getMemberLive(member.id) ?? member;
  const avatar = useResolvedImage(live.avatar);
  const cover = useResolvedImage(live.coverImage);
  const { active, capitalRaising, primaryCompanySlug } = useMemberProfile(member, 0);

  const location = [member.city, member.state, member.country].filter((x): x is string => Boolean(x)).join(", ");
  const focus = member.areasOfInterest.slice(0, 4);

  return (
    <section className="bg-cream">
      {/* Cover band */}
      <div className={cn("relative h-40 md:h-60 overflow-hidden", `cover-${member.coverGradient}`)}>
        {cover ? (
          <Image src={cover} alt={`${live.name} — cover`} fill priority sizes="100vw" className="object-cover" unoptimized />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/30 via-transparent to-navy-900/40 pointer-events-none" />
        <nav className="relative max-w-6xl mx-auto px-5 md:px-10 pt-6 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/85">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <Link href="/members" className="hover:text-white transition-colors">Members</Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <span className="text-white">{member.name}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-10">
        <div className="relative -mt-14 md:-mt-20 bg-white rounded-3xl ring-1 ring-navy-900/[0.06] shadow-sm p-5 md:p-7">
          <div className="flex flex-col md:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0 h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-navy-900 text-gold-500 ring-4 ring-white shadow flex items-center justify-center text-3xl md:text-4xl font-semibold tracking-wide overflow-hidden">
              {avatar ? (
                <Image src={avatar} alt={`${live.name} — avatar`} fill sizes="112px" className="object-cover" unoptimized />
              ) : (
                member.initials
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-gold-600 font-semibold">{member.memberType}</span>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1", verificationStyles[member.verification])}>
                      <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
                      {member.verification}
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">{member.name}</h1>
                  <div className="mt-2 text-sm md:text-[15px] text-navy-700/80 inline-flex items-center gap-1.5 flex-wrap">
                    <Briefcase className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2} />
                    <span>
                      <span className="font-medium text-navy-900">{member.title}</span>
                      <span className="text-navy-700/60"> · </span>
                      <span>{member.company}</span>
                    </span>
                  </div>
                </div>
                <ReportButton targetKind="member" targetId={member.id} targetLabel={member.name} variant="chip" />
              </div>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-700/80">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2} />
                  {location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2} />
                  Member since {member.joinedYear}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2} />
                  {member.industry}
                </span>
              </div>

              {/* Investment focus */}
              {focus.length > 0 ? (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold inline-flex items-center gap-1">
                    <Target className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
                    Investment Focus
                  </span>
                  {focus.map((f) => (
                    <span key={f} className="inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/30">
                      {f}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Live stats + CTAs */}
          <div className="mt-5 pt-5 border-t border-navy-900/[0.06] flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            <div className="flex items-stretch gap-3">
              <HeroStat icon={Layers} label="Active Opportunities" value={String(active.length)} />
              <HeroStat icon={TrendingUp} label="Capital Being Raised" value={compactMoney(capitalRaising)} />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <MemberContactActions member={member} primaryCompanySlug={primaryCompanySlug} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] px-4 py-2.5 min-w-[140px]">
      <div className="text-[9px] uppercase tracking-[0.14em] text-navy-700/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold text-navy-900 tabular-nums">{value}</div>
    </div>
  );
}
