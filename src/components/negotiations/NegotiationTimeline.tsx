"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { NEGOTIATION_STAGES, STAGE_META, type NegotiationStage } from "@/data/negotiations";
import { cn } from "@/lib/cn";

export default function NegotiationTimeline({ current }: { current: NegotiationStage }) {
  const currentIndex = STAGE_META[current].index;
  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-gold-600 font-semibold">
          Negotiation timeline
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
          Stage {currentIndex + 1} of {NEGOTIATION_STAGES.length}
        </div>
      </div>
      <ol className="flex items-start">
        {NEGOTIATION_STAGES.map((stage, i) => {
          const meta = STAGE_META[stage];
          const isComplete = i < currentIndex;
          const isActive = i === currentIndex;
          return (
            <Fragment key={stage}>
              <li className="flex flex-col items-center min-w-0 flex-1">
                <span
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ring-2 ring-offset-2 ring-offset-white",
                    isComplete && "bg-gold-500 text-navy-900 ring-gold-500",
                    isActive && "bg-navy-900 text-gold-500 ring-gold-500",
                    !isActive && !isComplete && "bg-bone text-navy-700/50 ring-transparent"
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "mt-2 text-[10px] uppercase tracking-[0.12em] font-semibold text-center px-1 leading-tight",
                    isActive ? "text-navy-900" : isComplete ? "text-gold-700" : "text-navy-700/50"
                  )}
                >
                  {meta.shortLabel}
                </span>
              </li>
              {i < NEGOTIATION_STAGES.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex-1 h-[2px] mt-3.5 rounded-full",
                    i < currentIndex ? "bg-gold-500" : "bg-bone"
                  )}
                />
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </section>
  );
}
