import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Canonical section header: gold eyebrow → title → optional description, with
 * an optional right-aligned meta counter or action. Replaces the two dozen
 * per-file SectionHeader copies that previously drifted across the app.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  meta,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Small right-aligned counter, e.g. "12 listings". */
  meta?: React.ReactNode;
  /** Right-aligned action (link/button); ignored when `meta` is set. */
  action?: React.ReactNode;
  className?: string;
}) {
  const right = meta ? (
    <span className="text-xs uppercase tracking-[0.14em] text-navy-700/60 font-semibold whitespace-nowrap">
      {meta}
    </span>
  ) : (
    action ?? null
  );

  return (
    <div className={cn("mb-5", right ? "flex items-end justify-between gap-3" : null, className)}>
      <div>
        {/* Block-level flex: renders identically to the old plain block for
            text-only eyebrows (no inline line-box strut) while still laying
            out an optional icon. Do not change to inline-flex — it shifts
            every section header down by ~7px. */}
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold flex items-center gap-1.5">
          {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2.2} /> : null}
          {eyebrow}
        </div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm md:text-base text-navy-700/70 max-w-2xl">{description}</p>
        ) : null}
      </div>
      {right}
    </div>
  );
}
