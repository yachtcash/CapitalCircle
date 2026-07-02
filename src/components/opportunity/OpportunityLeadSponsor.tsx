"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, CalendarDays, ArrowUpRight } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import type { Member } from "@/data/members";
import { useResolvedImage } from "@/lib/imageStore";
import OpportunityRequestIntro from "./OpportunityRequestIntro";
import { cn } from "@/lib/cn";
import SectionHeader from "@/components/ui/SectionHeader";

const verificationStyles: Record<Member["verification"], string> = {
  Verified: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  "Founding Member": "bg-gold-500/20 text-gold-700 ring-gold-500/40",
  Pending: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  Unverified: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
};

export default function OpportunityLeadSponsor({
  opportunity,
  member,
  companyName,
}: {
  opportunity: Opportunity;
  member: Member;
  companyName: string;
}) {
  const avatar = useResolvedImage(member.avatar);
  const location = [member.city, member.country].filter(Boolean).join(", ");

  return (
    <section>
      <SectionHeader eyebrow="Lead Sponsor" title="Who you'll be backing" />
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-7">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden ring-1 ring-navy-900/10 bg-navy-900 inline-flex items-center justify-center text-2xl font-semibold text-gold-500 tracking-wide">
            {avatar ? (
              <Image src={avatar} alt={member.name} fill sizes="80px" className="object-cover" unoptimized />
            ) : (
              member.initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-navy-900 leading-snug">{member.name}</h3>
              <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1", verificationStyles[member.verification])}>
                <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
                {member.verification}
              </span>
            </div>
            <div className="mt-0.5 text-sm text-navy-700/80">
              <span className="font-medium text-navy-900">{member.title}</span> · {member.company}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-navy-700/55 font-semibold">
              <CalendarDays className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
              {member.memberType} · since {member.joinedYear}
              {location ? <span className="text-navy-700/40"> · {location}</span> : null}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-navy-700/85 leading-relaxed max-w-2xl">{member.about || member.bio}</p>

        <div className="mt-5 pt-5 border-t border-navy-900/[0.06] flex items-center gap-2.5 flex-wrap">
          <OpportunityRequestIntro opportunity={opportunity} leadMember={member} companyName={companyName} />
          <Link
            href={`/member/${member.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.12] hover:ring-navy-900/30 text-navy-900 text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            View Profile
            <ArrowUpRight className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
