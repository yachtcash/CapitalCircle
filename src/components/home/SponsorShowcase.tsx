"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";

import { companies, getActiveOpportunitiesForCompany, type Company } from "@/data/companies";
import { useResolvedImage } from "@/lib/imageStore";
import { initialsFromName } from "@/lib/home/format";

export default function SponsorShowcase() {
  const sponsors = useMemo(() => {
    return companies
      .map((c) => ({ company: c, active: getActiveOpportunitiesForCompany(c.id).length }))
      .filter((s) => s.active > 0)
      .sort((a, b) => {
        // Featured first, then by active deal count.
        const f = Number(Boolean(b.company.featured)) - Number(Boolean(a.company.featured));
        if (f !== 0) return f;
        return b.active - a.active;
      })
      .slice(0, 6);
  }, []);

  if (sponsors.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
              Sponsor Showcase
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
              Proven sponsors and developers
            </h2>
            <p className="mt-2 text-sm md:text-base text-navy-700/70 max-w-2xl">
              The institutional teams bringing deals to the marketplace — vetted, verified, and actively raising.
            </p>
          </div>
          <Link
            href="/companies"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors whitespace-nowrap"
          >
            View all sponsors
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {sponsors.map(({ company, active }) => (
            <SponsorCard key={company.id} company={company} active={active} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/companies"
            className="w-full inline-flex items-center justify-center rounded-full bg-navy-900 text-white text-sm font-semibold py-3"
          >
            View all sponsors
          </Link>
        </div>
      </div>
    </section>
  );
}

function SponsorCard({ company, active }: { company: Company; active: number }) {
  const logo = useResolvedImage(company.logo);
  const initials = initialsFromName(company.name);
  const location = [company.headquarters?.city, company.headquarters?.country].filter(Boolean).join(", ");
  const verified = company.verification === "Verified" || company.verification === "Premium Verified";

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
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-semibold text-navy-900 leading-snug truncate group-hover:text-gold-700 transition-colors">
              {company.name}
            </h3>
            {verified ? <ShieldCheck className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.4} /> : null}
          </div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-gold-600 font-semibold truncate">
            {company.industry}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-navy-900/[0.06] flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 text-xs text-navy-700/70 min-w-0">
          <MapPin className="h-3.5 w-3.5 text-navy-700/50 shrink-0" strokeWidth={2} />
          <span className="truncate">{location || "—"}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 whitespace-nowrap">
          <Building2 className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
          {active} {active === 1 ? "deal" : "deals"}
        </span>
      </div>
    </Link>
  );
}
