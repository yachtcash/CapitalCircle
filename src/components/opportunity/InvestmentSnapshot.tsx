import { Coins, Wallet, PieChart, TrendingUp, CalendarRange, Layers, Briefcase, Factory, Globe2, type LucideIcon } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import { capitalRequired } from "@/lib/home/format";

export default function InvestmentSnapshot({ opportunity }: { opportunity: Opportunity }) {
  // Only surface fields that actually exist — no fabricated values.
  const rows: { icon: LucideIcon; label: string; value: string }[] = [];
  const push = (icon: LucideIcon, label: string, value?: string) => {
    if (value && value.trim()) rows.push({ icon, label, value: value.trim() });
  };

  push(Coins, "Capital Required", capitalRequired(opportunity));
  push(Wallet, "Minimum Investment", opportunity.minimumInvestment);
  push(PieChart, "Equity Offered", opportunity.equityAvailable);
  push(TrendingUp, "Expected Return", opportunity.expectedReturns || opportunity.expectedReturn);
  push(Factory, "Industry", opportunity.industry);
  push(Globe2, "Country", opportunity.place?.country || opportunity.location);
  push(Briefcase, "Investment Type", opportunity.dealType);
  push(Layers, "Current Stage", opportunity.currentStage);
  push(CalendarRange, "Timeline", opportunity.timeline);

  if (rows.length === 0) return null;

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-10 -mt-8 md:-mt-10">
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.08] shadow-xl shadow-navy-900/5 overflow-hidden">
          <div className="px-5 md:px-6 py-4 border-b border-navy-900/[0.08] flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-gold-500" />
            <h2 className="text-[13px] uppercase tracking-[0.18em] text-navy-900 font-bold">Investment Snapshot</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-navy-900/[0.08]">
            {rows.map((r) => (
              <div key={r.label} className="bg-white p-5 md:p-6">
                <div className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-bold inline-flex items-center gap-2">
                  <r.icon className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
                  {r.label}
                </div>
                <div className="mt-2 text-lg md:text-xl font-bold tracking-tight text-navy-900 leading-snug tabular-nums">
                  {r.value}
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
