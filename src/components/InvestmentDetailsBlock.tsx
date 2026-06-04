import { Coins, PieChart, Wallet, TrendingUp } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";

export default function InvestmentDetailsBlock({ opportunity }: { opportunity: Opportunity }) {
  const items = [
    { label: "Funding required", value: opportunity.fundingRequired, icon: Coins },
    { label: "Equity available", value: opportunity.equityAvailable, icon: PieChart },
    { label: "Minimum investment", value: opportunity.minimumInvestment, icon: Wallet },
    { label: "Expected returns", value: opportunity.expectedReturns, icon: TrendingUp },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Capital" title="Investment Details" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 flex items-start gap-4"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 shrink-0">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold">
                  {item.label}
                </div>
                <div className="mt-1 text-lg font-semibold text-navy-900 leading-snug">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
        {eyebrow}
      </div>
      <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
        {title}
      </h2>
    </div>
  );
}
