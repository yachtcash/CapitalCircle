import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Canonical statistic tiles.
 *
 * - `cell`  — white cell inside a `gap-px` hairline grid (stats strips).
 * - `chip`  — small bone chip used inside hero identity cards.
 * - `panel` — standalone rounded card.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  variant = "cell",
  dense = false,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: string;
  variant?: "cell" | "chip" | "panel";
  /** Slightly smaller value type for dense grids (6–7 columns). */
  dense?: boolean;
  className?: string;
}) {
  const labelEl = (
    <div
      className={cn(
        "uppercase font-bold inline-flex items-center text-navy-700/55",
        variant === "chip"
          ? "text-[9px] tracking-[0.14em] gap-1"
          : dense
            ? "text-[9px] md:text-[10px] tracking-[0.12em] gap-1.5"
            : "text-[9px] md:text-[10px] tracking-[0.14em] gap-1.5"
      )}
    >
      {Icon ? (
        <Icon className={cn(variant === "chip" || dense ? "h-3 w-3" : "h-3 w-3", "text-gold-600 shrink-0")} strokeWidth={2.2} />
      ) : null}
      {label}
    </div>
  );

  if (variant === "chip") {
    return (
      <div className={cn("rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] px-4 py-2.5 min-w-[140px]", className)}>
        {labelEl}
        <div className="mt-0.5 text-lg font-bold text-navy-900 tracking-tight tabular-nums">{value}</div>
      </div>
    );
  }

  if (variant === "panel") {
    return (
      <div className={cn("rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-4 md:p-5", className)}>
        {labelEl}
        <div className="mt-1.5 text-xl md:text-2xl font-bold text-navy-900 tracking-tight tabular-nums">{value}</div>
        {sub ? <div className="text-[10px] text-navy-700/50 truncate">{sub}</div> : null}
      </div>
    );
  }

  // cell — expects a parent grid with `gap-px bg-navy-900/[0.06]`
  return (
    <div className={cn("bg-white p-4 md:p-5", className)}>
      {labelEl}
      <div
        className={cn(
          "mt-1.5 font-bold text-navy-900 tracking-tight tabular-nums",
          dense ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
        )}
      >
        {value}
      </div>
      {sub ? <div className="text-[10px] text-navy-700/50 truncate">{sub}</div> : null}
    </div>
  );
}

/** Hairline stats grid wrapper for `variant="cell"` tiles. */
export function StatGrid({
  columns,
  className,
  children,
}: {
  /** Tailwind grid classes, e.g. "grid-cols-2 md:grid-cols-3 lg:grid-cols-6". */
  columns: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-navy-900/[0.06] ring-1 ring-navy-900/[0.06] grid gap-px overflow-hidden",
        columns,
        className
      )}
    >
      {children}
    </div>
  );
}
