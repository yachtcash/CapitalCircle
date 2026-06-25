"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, ArrowUpRight, Users } from "lucide-react";

import type { Member } from "@/data/members";
import { MEMBERS } from "@/data/members";

export default function RelatedMembers({ member }: { member: Member }) {
  const related = useMemo(() => {
    return MEMBERS.filter((m) => m.id !== member.id)
      .map((m) => {
        let score = 0;
        if (member.companyId && m.companyId === member.companyId) score += 3;
        if (m.company === member.company) score += 3;
        if (m.industry === member.industry) score += 2;
        if (m.industries.some((i) => member.industries.includes(i))) score += 1;
        if (m.region === member.region) score += 1;
        return { m, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.m);
  }, [member]);

  if (related.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" strokeWidth={2.2} />
            Discover more
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">Related members</h2>
        </div>
        <Link href="/members" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors whitespace-nowrap">
          View directory
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {related.map((m) => (
          <Link
            key={m.id}
            href={`/member/${m.slug}`}
            className="group bg-white rounded-2xl p-5 ring-1 ring-navy-900/[0.06] hover:ring-gold-500/50 hover:shadow-lg hover:shadow-navy-900/5 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-navy-900 text-gold-500 inline-flex items-center justify-center text-sm font-semibold tracking-wide">
                {m.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[15px] font-semibold text-navy-900 leading-snug truncate group-hover:text-gold-700 transition-colors">
                    {m.name}
                  </h3>
                  {m.verification === "Verified" || m.verification === "Founding Member" ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.4} />
                  ) : null}
                </div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-gold-600 font-semibold truncate">{m.memberType}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-navy-700/70 truncate">
              {m.title} · {m.company}
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-navy-700/60 min-w-0">
              <MapPin className="h-3 w-3 text-navy-700/45 shrink-0" strokeWidth={2} />
              <span className="truncate">{m.city}, {m.country}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
