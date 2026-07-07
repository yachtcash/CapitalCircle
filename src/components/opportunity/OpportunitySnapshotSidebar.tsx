"use client";

import { ShieldCheck } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import { capitalRequired } from "@/lib/home/format";
import MessageOpportunityButton from "@/components/common/MessageOpportunityButton";
import SharePageButton from "@/components/common/SharePageButton";

/**
 * Compact investment snapshot for the sticky sidebar — the numbers an
 * investor keeps referring back to while reading the memorandum, plus the
 * quiet utility actions (message / share). Presentation only; every value
 * comes straight off the existing Opportunity record.
 */
export default function OpportunitySnapshotSidebar({
  opportunity,
  company,
}: {
  opportunity: Opportunity;
  company?: Company;
}) {
  const capital = capitalRequired(opportunity);
  const verified =
    company?.verification === "Verified" || company?.verification === "Premium Verified";

  const metrics: { label: string; value: string }[] = [];
  const push = (label: string, value?: string) => {
    if (value && value.trim()) metrics.push({ label, value: value.trim() });
  };
  push("Target Return", opportunity.expectedReturns || opportunity.expectedReturn);
  push("Min. Investment", opportunity.minimumInvestment);
  push("Equity Offered", opportunity.equityAvailable);
  push("Stage", opportunity.currentStage);

  const facts: { label: string; value: React.ReactNode }[] = [];
  if (opportunity.industry) facts.push({ label: "Industry", value: opportunity.industry });
  const country = opportunity.place?.country || opportunity.location;
  if (country) facts.push({ label: "Country", value: country });
  const sponsorName = company?.name ?? opportunity.postedBy;
  if (sponsorName)
    facts.push({
      label: "Sponsor",
      value: (
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <span className="truncate">{sponsorName}</span>
          {verified ? (
            <span
              className="inline-flex items-center gap-1 shrink-0 text-[9px] uppercase tracking-[0.12em] font-bold text-emerald-700 bg-emerald-500/10 ring-1 ring-emerald-500/25 rounded-full px-1.5 py-0.5"
              title={company?.verification}
            >
              <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.4} />
              Verified
            </span>
          ) : null}
        </span>
      ),
    });

  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.08] overflow-hidden">
      <div className="p-5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Investment Snapshot
        </div>
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
            Capital Required
          </div>
          <div className="mt-1 text-[26px] md:text-[28px] leading-tight font-bold tracking-tight text-navy-900 tabular-nums">
            {capital}
          </div>
        </div>

        {metrics.length ? (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5">
            {metrics.map((m) => (
              <div key={m.label} className="min-w-0">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">
                  {m.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-navy-900 leading-snug tabular-nums">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      {facts.length ? (
        <dl className="border-t border-navy-900/[0.06] px-5 py-4 space-y-2.5">
          {facts.map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-3 text-[13px]">
              <dt className="text-navy-700/55 font-medium shrink-0">{f.label}</dt>
              <dd className="font-semibold text-navy-900 text-right min-w-0 truncate">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="border-t border-navy-900/[0.06] p-4 flex items-center gap-2">
        <MessageOpportunityButton
          opportunity={opportunity}
          variant="full"
          className="flex-1 justify-center py-2"
        />
        <SharePageButton
          label={`Share ${opportunity.title}`}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
