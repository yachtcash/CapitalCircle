import { Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";

export default function ExecutiveSummaryBlock({ opportunity }: { opportunity: Opportunity }) {
  const location = opportunity.place
    ? [opportunity.place.city, opportunity.place.country].filter(Boolean).join(", ")
    : opportunity.location;

  // Investment highlights — derived strictly from real fields.
  const highlights: string[] = [];
  const add = (s?: string) => {
    if (s && s.trim()) highlights.push(s.trim());
  };
  add(opportunity.expectedReturn ? `${opportunity.expectedReturn} target return` : undefined);
  add(opportunity.equityAvailable ? `${opportunity.equityAvailable} equity offered` : undefined);
  add(opportunity.minimumInvestment ? `${opportunity.minimumInvestment} minimum investment` : undefined);
  add(opportunity.currentStage ? `${opportunity.currentStage} stage` : undefined);
  add(opportunity.dealType);
  add(location ? `${location}` : undefined);

  // Standard institutional disclosures (not fabricated metrics).
  const risks = [
    "Capital at risk — projected returns are not guaranteed.",
    "Subject to completion of due diligence and definitive documentation.",
    "Market, execution, and liquidity risk apply to all positions.",
    "Detailed materials are released after an NDA is countersigned.",
  ];

  return (
    <section>
      <div className="mb-5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">Overview</div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">Executive Summary</h2>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-6 md:p-8">
        <p className="text-lg md:text-xl leading-relaxed text-navy-900 font-medium">{opportunity.executiveSummary}</p>
        {opportunity.fullDescription.length > 0 ? (
          <>
            <div className="my-6 h-px bg-navy-900/[0.06]" />
            <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-navy-700/85">
              {opportunity.fullDescription.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.length > 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
            <div className="text-[10px] uppercase tracking-[0.16em] text-gold-700 font-bold inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
              Investment Highlights
            </div>
            <ul className="mt-3 space-y-2.5">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-navy-800">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 mt-0.5 shrink-0" strokeWidth={2.2} />
                  <span className="font-medium">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-2xl bg-bone/50 ring-1 ring-navy-900/[0.06] p-5 md:p-6">
          <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/60 font-bold inline-flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-navy-700/55" strokeWidth={2.2} />
            Risk Factors &amp; Disclosures
          </div>
          <ul className="mt-3 space-y-2.5">
            {risks.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm text-navy-700/80">
                <span className="h-1.5 w-1.5 rounded-full bg-navy-700/40 mt-1.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
