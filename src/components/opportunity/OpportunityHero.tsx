"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Building2, UserRound, TrendingUp, Coins, Wallet } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import type { Member } from "@/data/members";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { useResolvedImage } from "@/lib/imageStore";
import { capitalRequired } from "@/lib/home/format";
import OpportunityRequestIntro from "./OpportunityRequestIntro";
import OpportunitySaveButton from "./OpportunitySaveButton";

export default function OpportunityHero({
  opportunity,
  company,
  leadMember,
}: {
  opportunity: Opportunity;
  company: Company | undefined;
  leadMember: Member | null;
}) {
  const cover = useResolvedImage(opportunity.images[0]);
  const location = opportunity.place
    ? [opportunity.place.city, opportunity.place.state, opportunity.place.country].filter(Boolean).join(", ")
    : opportunity.location;
  const sponsor = leadMember?.name ?? opportunity.postedBy;
  const companyName = company?.name ?? opportunity.postedBy;

  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        {cover ? (
          <Image src={cover} alt={opportunity.title} fill priority sizes="100vw" className="object-cover opacity-40" unoptimized />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/85 to-navy-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-6 pb-8 md:pt-8 md:pb-12">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/70">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <Link href="/opportunities" className="hover:text-white transition-colors">Opportunities</Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <span className="text-white/90 truncate max-w-[50vw]">{opportunity.title}</span>
        </nav>

        {/* Badges */}
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-bold rounded-full px-2.5 py-1 bg-gold-500 text-navy-900">
            {opportunity.category}
          </span>
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-bold rounded-full px-2.5 py-1 bg-white/10 ring-1 ring-white/20 text-white">
            {opportunity.status}
          </span>
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2.5 py-1 bg-white/5 ring-1 ring-white/15 text-white/70 tabular-nums">
            {publicOpportunityId(opportunity)}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-3xl md:text-5xl font-semibold leading-[1.05] tracking-tight max-w-3xl text-balance">
          {opportunity.title}
        </h1>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-gold-400 shrink-0" strokeWidth={2} />
            {location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-4 w-4 text-gold-400 shrink-0" strokeWidth={2} />
            {sponsor}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-gold-400 shrink-0" strokeWidth={2} />
            {companyName}
          </span>
        </div>

        {/* Key figures */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
          <Figure icon={Coins} label="Capital Required" value={capitalRequired(opportunity)} />
          <Figure icon={TrendingUp} label="Target Return" value={opportunity.expectedReturn || "On request"} />
          <Figure icon={Wallet} label="Minimum Investment" value={opportunity.minimumInvestment || "On request"} />
        </div>

        {/* CTAs */}
        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <OpportunityRequestIntro opportunity={opportunity} leadMember={leadMember} companyName={companyName} />
          <OpportunitySaveButton opportunityId={opportunity.id} tone="dark" />
          {company ? (
            <Link
              href={`/company/${company.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/20 text-white font-medium px-5 py-2.5 text-sm transition-colors"
            >
              <Building2 className="h-4 w-4 text-gold-400" strokeWidth={2} />
              View Company
            </Link>
          ) : null}
          {leadMember ? (
            <Link
              href={`/member/${leadMember.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/20 text-white font-medium px-5 py-2.5 text-sm transition-colors"
            >
              <UserRound className="h-4 w-4 text-gold-400" strokeWidth={2} />
              View Sponsor
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Figure({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] backdrop-blur ring-1 ring-white/10 px-4 py-3">
      <div className="text-[9px] uppercase tracking-[0.14em] text-white/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-3 w-3 text-gold-400" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}
