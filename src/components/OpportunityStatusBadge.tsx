import type { Opportunity } from "@/data/opportunities";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

// Canonical colors for the public opportunity lifecycle status. Single source of
// truth so the marketplace card, detail hero, and map preview stay identical.
// Solid fills (not tints) because these ride on image overlays.
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
    <Badge
      size={size === "md" ? "lg" : "md"}
      className={cn(
        STATUS_STYLES[status],
        "ring-transparent",
        size === "md" ? "shadow-md" : "shadow-sm",
        className
      )}
    >
      {status}
    </Badge>
  );
}
