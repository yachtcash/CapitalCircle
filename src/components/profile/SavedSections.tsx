"use client";

import Link from "next/link";
import { Bookmark, Building2, MapPin } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities } from "@/data/opportunities";
import { companies } from "@/data/companies";
import OpportunityCard from "@/components/OpportunityCard";
import VerificationBadge from "@/components/company/VerificationBadge";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SavedSections() {
  const { savedOpportunityIds, savedCompanyIds, hydrated } = useMessaging();

  const savedOpportunities = featuredOpportunities.filter((o) =>
    savedOpportunityIds.includes(o.id)
  );
  const savedCompanies = companies.filter((c) => savedCompanyIds.includes(c.id));

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
        <header className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5" strokeWidth={2.2} />
              Your shortlist
            </div>
            <h3 className="mt-1 text-base md:text-lg font-semibold text-navy-900">
              Saved Opportunities
            </h3>
          </div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold whitespace-nowrap">
            {hydrated ? savedOpportunities.length : "…"}
          </span>
        </header>

        {!hydrated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard className="hidden sm:block" />
          </div>
        ) : savedOpportunities.length === 0 ? (
          <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.04]">
            <EmptyState
              Icon={Bookmark}
              compact
              title="No saved opportunities yet"
              description='Tap "Save Opportunity" on any opportunity page or card to shortlist it here.'
              action={{ label: "Browse opportunities", href: "/opportunities" }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
        <header className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" strokeWidth={2.2} />
              Sponsors you follow
            </div>
            <h3 className="mt-1 text-base md:text-lg font-semibold text-navy-900">
              Saved Companies
            </h3>
          </div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold whitespace-nowrap">
            {hydrated ? savedCompanies.length : "…"}
          </span>
        </header>

        {!hydrated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20 hidden sm:block" />
          </div>
        ) : savedCompanies.length === 0 ? (
          <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.04]">
            <EmptyState
              Icon={Building2}
              compact
              title="No saved companies yet"
              description='Tap "Save" on any company card or sponsor profile to follow the firm here.'
              action={{ label: "Browse companies", href: "/companies" }}
            />
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedCompanies.map((company) => {
              const hq = [company.headquarters.city, company.headquarters.country]
                .filter(Boolean)
                .join(", ");
              return (
                <li key={company.id}>
                  <Link
                    href={`/company/${company.slug}`}
                    className="group flex gap-3 items-start bg-bone/40 hover:bg-bone/80 rounded-xl ring-1 ring-navy-900/[0.04] p-4 transition-colors"
                  >
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center text-sm font-semibold tracking-wide">
                      {initialsFor(company.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-navy-900 text-sm group-hover:text-gold-700 transition-colors truncate">
                          {company.name}
                        </span>
                        <VerificationBadge status={company.verification} />
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold mt-0.5 truncate">
                        {company.industry}
                      </div>
                      {hq ? (
                        <div className="mt-1 text-xs text-navy-700/70 inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
                          {hq}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

