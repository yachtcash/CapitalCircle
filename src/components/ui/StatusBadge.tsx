import Badge, { type BadgeSize } from "@/components/ui/Badge";
import type { Tone } from "@/lib/design/tokens";

/**
 * Central status → tone map. One place to answer "what colour is this state?"
 * across opportunities, listings, deals, members, companies, documents,
 * moderation, and admin. Unknown statuses fall back to neutral.
 */
const STATUS_TONE: Record<string, Tone> = {
  // Opportunity / listing lifecycle
  Open: "success",
  Active: "success",
  "Seeking Capital": "gold",
  Negotiating: "warning",
  "Under Contract": "danger",
  "Under Review": "info",
  Draft: "neutral",
  Closed: "neutral",
  Archived: "neutral",
  // Verification
  Verified: "success",
  "Premium Verified": "navy",
  "Founding Member": "gold",
  Pending: "warning",
  Unverified: "neutral",
  // Approvals / moderation
  Approved: "success",
  Rejected: "danger",
  Completed: "success",
  Resolved: "success",
  Escalated: "danger",
  Dismissed: "neutral",
  Suspended: "danger",
  Restricted: "warning",
  Banned: "danger",
  // Deals
  Funding: "gold",
  "Closed Won": "success",
  "Closed Lost": "danger",
  // Access
  Requested: "warning",
  Granted: "success",
  Denied: "danger",
  // Emphasis
  Featured: "gold",
  Trending: "warning",
  New: "success",
  Premium: "navy",
};

export function toneForStatus(status: string): Tone {
  return STATUS_TONE[status] ?? "neutral";
}

/** Renders any platform status as a canonical badge. */
export default function StatusBadge({
  status,
  size = "md",
  className,
}: {
  status: string;
  size?: BadgeSize;
  className?: string;
}) {
  return (
    <Badge tone={toneForStatus(status)} size={size} className={className}>
      {status}
    </Badge>
  );
}
