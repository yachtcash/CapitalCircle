"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, CalendarDays, Layers, TrendingUp, ArrowUpRight, ShieldCheck } from "lucide-react";

import type { Company } from "@/data/companies";
import VerificationBadge from "@/components/company/VerificationBadge";
import { useResolvedImage } from "@/lib/imageStore";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";
import { compactMoney, initialsFromName } from "@/lib/home/format";

export default function OpportunitySponsor({ company }: { company: Company }) {
  const logo = useResolvedImage(company.logo);
  const { active, capitalRaising } = useCompanyOpportunityProfile(company.id, 0);
  const initials = initialsFromName(company.name);
  const hq = [company.headquarters?.city, company.headquarters?.country].filter(Boolean).join(", ");

  return (
    <section>
      <SectionHeader eyebrow="Sponsor" title="The institution behind this deal" />
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-7">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden ring-1 ring-navy-900/10 bg-navy-900 inline-flex items-center justify-center">
            {logo ? (
              <Image src={logo} alt={company.name} fill sizes="64px" className="object-cover" />
            ) : (
              <span className="text-gold-500 font-semibold text-lg tracking-wide">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-navy-900 leading-snug">{company.name}</h3>
              <VerificationBadge status={company.verification} size="sm" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold mt-0.5">{company.industry}</div>
            <p className="mt-2 text-sm text-navy-700/80 leading-relaxed max-w-2xl">{company.tagline}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric icon={Layers} label="Active Opportunities" value={String(active.length)} />
          <Metric icon={TrendingUp} label="Capital Raising" value={compactMoney(capitalRaising)} />
          <Metric icon={MapPin} label="Headquarters" value={hq || "—"} />
          <Metric icon={CalendarDays} label="Founded" value={String(company.foundedYear)} />
        </div>

        <div className="mt-5 pt-5 border-t border-navy-900/[0.06] flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs text-navy-700/65">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
            {company.closedOpportunitiesCount} opportunities closed to date
          </span>
          <Link
            href={`/company/${company.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            View Company
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-3">
      <div className="text-[9px] uppercase tracking-[0.12em] text-navy-700/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-gold-600 shrink-0" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-navy-900 tabular-nums truncate">{value}</div>
    </div>
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
