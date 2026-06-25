"use client";

import Link from "next/link";
import { ArrowRight, HandCoins } from "lucide-react";

import type { Member } from "@/data/members";
import { useMemberProfile } from "@/lib/members/profile";
import CompanyOpportunityCard from "@/components/company/CompanyOpportunityCard";

export default function MemberOpportunities({ member }: { member: Member }) {
  const { active } = useMemberProfile(member, 0);

  return (
    <section id="opportunities" className="scroll-mt-24">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <HandCoins className="h-3.5 w-3.5" strokeWidth={2.2} />
            Sponsored by {member.name.split(" ")[0]}
          </div>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">Opportunities</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.14em] text-navy-700/60 font-semibold whitespace-nowrap">
          {active.length} {active.length === 1 ? "listing" : "listings"}
        </span>
      </div>

      {active.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {active.map((opportunity, i) => (
            <CompanyOpportunityCard key={opportunity.id} opportunity={opportunity} priority={i === 0} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 text-center">
          <p className="text-sm text-navy-700/65">
            {member.name} has no active opportunities on the marketplace right now.
          </p>
          <Link
            href="/opportunities"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors group"
          >
            Browse marketplace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
          </Link>
        </div>
      )}
    </section>
  );
}
