import type { Opportunity } from "@/data/opportunities";
import { cn } from "@/lib/cn";

// Canonical colors for the public opportunity lifecycle status. Single source of
// truth so the marketplace card, detail hero, and map preview stay identical.
const STATUS_STYLES: Record<Opportunity["status"], string> = {
  Open: "bg-emerald-500 text-white",
  "Seeking Capital": "bg-gold-500 text-navy-900",
  Negotiating: "bg-amber-500 text-white",
  "Under Contract": "bg-rose-500 text-white",
  Closed: "bg-navy-700 text-white",
};

export default function OpportunityStatusBadge({
  status,
  size = "sm",
  className,
}: {
  status: Opportunity["status"];
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase rounded-full",
        size === "md"
          ? "text-[10px] tracking-[0.18em] px-3 py-1 shadow-md"
          : "text-[10px] tracking-[0.14em] px-2.5 py-1 shadow-sm",
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}
