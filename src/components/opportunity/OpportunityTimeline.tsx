import { Search, Coins, HardHat, Building2, LogOut, type LucideIcon } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import { cn } from "@/lib/cn";
import SectionHeader from "@/components/ui/SectionHeader";

const STAGES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "diligence", label: "Sourcing & Diligence", icon: Search },
  { key: "funding", label: "Funding", icon: Coins },
  { key: "construction", label: "Construction", icon: HardHat },
  { key: "completion", label: "Completion", icon: Building2 },
  { key: "exit", label: "Exit", icon: LogOut },
];

/** Map the opportunity's stage / status to a position on the canonical lifecycle. */
function currentStageIndex(o: Opportunity): number {
  const hay = `${o.currentStage ?? ""} ${o.projectStatus ?? ""} ${o.status ?? ""}`.toLowerCase();
  if (/(exit|disposition|sale closing|closed)/.test(hay)) return 4;
  if (/(stabiliz|lease[- ]?up|complete|completion|operational|under contract)/.test(hay)) return 3;
  if (/(construction|build|execution|in progress|development|breaking ground)/.test(hay)) return 2;
  if (/(funding|raising|capital|equity|seeking|negotiat|open)/.test(hay)) return 1;
  if (/(sourcing|diligence|pre[- ]?dev|planning|entitlement|design)/.test(hay)) return 0;
  return 1; // default: actively funding
}

export default function OpportunityTimeline({ opportunity }: { opportunity: Opportunity }) {
  const current = currentStageIndex(opportunity);
  const next = STAGES[current + 1];

  return (
    <section>
      <SectionHeader eyebrow="Lifecycle" title="Investment Timeline" />
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-7">
        {/* Stepper */}
        <ol className="relative grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
          {STAGES.map((s, i) => {
            const done = i < current;
            const isCurrent = i === current;
            const Icon = s.icon;
            return (
              <li key={s.key} className="relative flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                {/* connector (desktop) */}
                {i < STAGES.length - 1 ? (
                  <span
                    className={cn(
                      "hidden sm:block absolute top-5 left-1/2 w-full h-0.5",
                      i < current ? "bg-gold-500" : "bg-navy-900/10"
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 h-10 w-10 rounded-full inline-flex items-center justify-center ring-1 shrink-0",
                    done
                      ? "bg-gold-500 text-navy-900 ring-gold-500"
                      : isCurrent
                        ? "bg-navy-900 text-gold-400 ring-navy-900"
                        : "bg-white text-navy-700/40 ring-navy-900/15"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <div className={cn("text-[13px] font-semibold leading-snug", isCurrent ? "text-navy-900" : "text-navy-700/70")}>
                    {s.label}
                  </div>
                  {isCurrent ? (
                    <div className="text-[10px] uppercase tracking-[0.14em] text-gold-600 font-bold mt-0.5">Current</div>
                  ) : done ? (
                    <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/40 font-semibold mt-0.5">Complete</div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Detail */}
        <div className="mt-6 pt-5 border-t border-navy-900/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Detail label="Current stage" value={opportunity.currentStage || STAGES[current].label} />
          <Detail label="Timeline" value={opportunity.timeline || "On request"} />
          <Detail label="Next milestone" value={next ? next.label : "Exit / realization"} />
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">{label}</div>
      <div className="mt-1 text-sm font-semibold text-navy-900">{value}</div>
    </div>
  );
}
