import type { ListingStatus } from "@/data/listings";
import { cn } from "@/lib/cn";

const STATUS_CLASSES: Record<ListingStatus, string> = {
  Draft: "bg-navy-900/10 text-navy-700 ring-navy-900/15",
  Active: "bg-emerald-500 text-white",
  "Seeking Capital": "bg-gold-500 text-navy-900",
  Negotiating: "bg-amber-500 text-white",
  "Under Review": "bg-sky-500 text-white",
  Closed: "bg-rose-500 text-white",
  Archived: "bg-navy-900 text-gold-400",
};

type Props = {
  status: ListingStatus;
  className?: string;
};

export default function ListingStatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-bold inline-flex items-center ring-1 ring-inset",
        STATUS_CLASSES[status],
        // Only Draft variant relies on its ring; others get a transparent ring
        // to preserve the same box geometry without extra outline.
        status !== "Draft" && "ring-transparent",
        className
      )}
    >
      {status}
    </span>
  );
}
