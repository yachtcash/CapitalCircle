"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  current: number;
  total: number;
  labels: string[];
  /**
   * If provided, completed step circles become clickable buttons that jump
   * back to that step. The active step + future steps remain non-interactive.
   */
  onJumpTo?: (step: number) => void;
};

export default function ProgressBar({ current, total, labels, onJumpTo }: Props) {
  const pct = Math.max(0, Math.min(100, ((current - 1) / (total - 1)) * 100));

  return (
    <div className="bg-white border-b border-navy-900/[0.06] sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-3 md:py-5">
        {/* Mobile: thin bar + label */}
        <div className="md:hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-navy-900">
              Step {current} of {total}
            </span>
            <span className="text-gold-600 font-semibold uppercase tracking-[0.14em] text-[10px]">
              {labels[current - 1]}
            </span>
          </div>
          <div className="h-1.5 bg-bone rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 transition-all duration-300"
              style={{ width: `${(current / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop: numbered steps */}
        <div className="hidden md:flex items-start">
          {labels.map((label, i) => {
            const stepNum = i + 1;
            const isComplete = stepNum < current;
            const isActive = stepNum === current;
            const canJump = !!onJumpTo && isComplete;
            const circleClass = cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
              isComplete && "bg-gold-500 text-navy-900",
              isActive && "bg-navy-900 text-gold-500 ring-2 ring-gold-500 ring-offset-2 ring-offset-white",
              !isComplete && !isActive && "bg-bone text-navy-700/55",
              canJump && "hover:bg-gold-400 cursor-pointer"
            );
            return (
              <Fragment key={label}>
                <div className="flex flex-col items-center min-w-0">
                  {canJump ? (
                    <button
                      type="button"
                      onClick={() => onJumpTo?.(stepNum)}
                      aria-label={`Jump back to step ${stepNum} — ${label}`}
                      className={circleClass}
                    >
                      <Check className="h-4 w-4" strokeWidth={2.6} />
                    </button>
                  ) : (
                    <div
                      className={circleClass}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {isComplete ? <Check className="h-4 w-4" strokeWidth={2.6} /> : stepNum}
                    </div>
                  )}
                  <span
                    className={cn(
                      "mt-2 text-[10px] uppercase tracking-[0.14em] font-semibold whitespace-nowrap",
                      isActive && "text-navy-900",
                      isComplete && "text-gold-600",
                      !isActive && !isComplete && "text-navy-700/50"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < labels.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-[2px] mx-1.5 lg:mx-2 mt-4 rounded-full transition-colors",
                      isComplete ? "bg-gold-500" : "bg-bone"
                    )}
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
      {/* Decorative gold underline (hidden on mobile, the thin bar is enough) */}
      <div
        className="hidden md:block h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent transition-opacity"
        style={{ opacity: pct > 0 ? 1 : 0 }}
      />
    </div>
  );
}
