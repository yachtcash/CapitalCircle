"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, Layers, TrendingUp, ArrowUpRight } from "lucide-react";

import type { Member } from "@/data/members";
import type { Company } from "@/data/companies";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { useResolvedImage } from "@/lib/imageStore";
import { useMemberProfile } from "@/lib/members/profile";
import { compactMoney, initialsFromName } from "@/lib/home/format";
import SectionHeader from "@/components/ui/SectionHeader";

const ACTIVE_FUNDING_STATUSES = new Set(["Open", "Seeking Capital", "Negotiating"]);

export default function MemberCompanies({ member }: { member: Member }) {
  const { linkedCompanies } = useMemberProfile(member, 0);
  const allOpps = useAllOpportunities();

  const statsByCompany = useMemo(() => {
    const m = new Map<string, { active: number; capital: number }>();
    for (const o of allOpps) {
      if (!o.companyId || o.status === "Closed") continue;
      const cur = m.get(o.companyId) ?? { active: 0, capital: 0 };
      cur.active += 1;
      if (ACTIVE_FUNDING_STATUSES.has(o.status)) cur.capital += o.fundingAmount || 0;
      m.set(o.companyId, cur);
    }
    return m;
  }, [allOpps]);

  if (linkedCompanies.length === 0) return null;

  return (
    <section>
      <SectionHeader eyebrow="Affiliations" title="Companies represented" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {linkedCompanies.map((c) => (
          <MemberCompanyCard key={c.id} company={c} stats={statsByCompany.get(c.id)} />
        ))}
      </div>
    </section>
  );
}

function MemberCompanyCard({
  company,
  stats,
}: {
  company: Company;
  stats?: { active: number; capital: number };
}) {
  const logo = useResolvedImage(company.logo);
  const initials = initialsFromName(company.name);
  const location = [company.headquarters?.city, company.headquarters?.country].filter(Boolean).join(", ");
  const active = stats?.active ?? 0;
  const capital = stats?.capital ?? 0;

  return (
    <Link
      href={`/company/${company.slug}`}
      className="group flex flex-col bg-white rounded-2xl p-5 ring-1 ring-navy-900/[0.06] hover:ring-gold-500/50 hover:shadow-lg hover:shadow-navy-900/5 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden ring-1 ring-navy-900/10 bg-navy-900 inline-flex items-center justify-center">
          {logo ? (
            <Image src={logo} alt={company.name} fill sizes="48px" className="object-cover" />
          ) : (
            <span className="text-gold-500 font-semibold text-sm tracking-wide">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-navy-900 leading-snug truncate group-hover:text-gold-700 transition-colors">
            {company.name}
          </h3>
          <div className="text-[10px] uppercase tracking-[0.12em] text-gold-600 font-semibold truncate">
            {company.industry}
          </div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-navy-700/65 min-w-0">
            <MapPin className="h-3 w-3 text-navy-700/45 shrink-0" strokeWidth={2} />
            <span className="truncate">{location || "—"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-navy-900/[0.06] grid grid-cols-2 gap-3">
        <Metric icon={Layers} label="Active" value={String(active)} />
        <Metric icon={TrendingUp} label="Raising" value={compactMoney(capital)} />
      </div>

      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-navy-900 group-hover:text-gold-700 transition-colors">
        <Building2 className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        View Company
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
      </div>
    </Link>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.12em] text-navy-700/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-gold-600" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-navy-900 tabular-nums">{value}</div>
    </div>
  );
}
