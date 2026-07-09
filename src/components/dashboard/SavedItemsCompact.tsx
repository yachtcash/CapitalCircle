"use client";

import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities } from "@/data/opportunities";
import { companies } from "@/data/companies";
import OpportunityCard from "@/components/OpportunityCard";
import VerificationBadge from "@/components/company/VerificationBadge";
import { Skeleton } from "@/components/ui/Skeleton";
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

export default function SavedItemsCompact() {
  const { hydrated, savedOpportunityIds, savedCompanyIds } = useMessaging();

  const savedOpportunities = featuredOpportunities
    .filter((o) => savedOpportunityIds.includes(o.id))
    .slice(0, 2);
  const savedCompanies = companies
    .filter((c) => savedCompanyIds.includes(c.id))
    .slice(0, 3);

  return (
    <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5">
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5" strokeWidth={2.2} />
            Your shortlist
          </div>
        </div>
        <Link
          href="/saved"
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors group whitespace-nowrap"
        >
          View all
          <ArrowRight
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.4}
          />
        </Link>
      </header>

      {/* Saved Opportunities */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-navy-900">
              Saved opportunities
            </h3>
            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-navy-700/55">
              {hydrated ? savedOpportunities.length : "…"}
            </span>
          </div>
          {!hydrated ? (
            <Skeleton className="h-32" />
          ) : savedOpportunities.length === 0 ? (
            <EmptyHint
              label="Nothing saved yet"
              hint='Tap "Save Opportunity" on any listing to keep it here.'
            />
          ) : (
            <div className="space-y-3">
              {savedOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          )}
        </div>

        {/* Saved Companies */}
        <div className="pt-4 border-t border-navy-900/[0.06]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-navy-900">
              Saved companies
            </h3>
            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-navy-700/55">
              {hydrated ? savedCompanies.length : "…"}
            </span>
          </div>
          {!hydrated ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : savedCompanies.length === 0 ? (
            <EmptyHint
              label="No companies followed"
              hint='Tap "Follow Company" on any sponsor profile.'
            />
          ) : (
            <ul className="space-y-2">
              {savedCompanies.map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/company/${company.slug}`}
                    className="group flex items-center gap-3 bg-bone/40 hover:bg-bone/80 rounded-xl ring-1 ring-navy-900/[0.04] p-3 transition-colors"
                  >
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center text-xs font-semibold tracking-wide">
                      {initialsFor(company.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-navy-900 group-hover:text-gold-700 transition-colors truncate">
                        {company.name}
                      </div>
                      <div className="mt-0.5">
                        <VerificationBadge status={company.verification} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/** Compact wrapper around the canonical EmptyState for widget slots. */
function EmptyHint({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.04]">
      <EmptyState compact title={label} description={hint} />
    </div>
  );
}
