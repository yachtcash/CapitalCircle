import type { ListingStatus } from "@/data/listings";
import Badge from "@/components/ui/Badge";
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
    <Badge
      className={cn(
        STATUS_CLASSES[status],
        // Only Draft relies on a visible ring; the solid fills get a
        // transparent ring to keep identical geometry without an outline.
        status !== "Draft" && "ring-transparent",
        className
      )}
    >
      {status}
    </Badge>
  );
}
