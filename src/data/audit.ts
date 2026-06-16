// Central audit event architecture.
//
// Every privileged action generates one structured AuditEvent, stored in
// the provider (cc:audit:v1) and rendered by /admin/audit.

export type AuditAction =
  | "Role Changed"
  | "Member Suspended"
  | "Member Activated"
  | "Member Deleted"
  | "Member Verified"
  | "Member Featured"
  | "Member Approved"
  | "Member Created"
  | "Company Created"
  | "Company Editor Assigned"
  | "Company Admin Assigned"
  | "Opportunity Moderator Assigned"
  | "Opportunity Editor Assigned"
  | "Introduction Archived"
  | "Introduction Restored"
  | "Introduction Deleted"
  | "Introduction Created"
  | "Report Submitted"
  | "Report Resolved"
  | "Report Dismissed"
  | "Report Escalated"
  | "Report Archived"
  | "Changes Requested"
  | "Changes Resolved"
  | "Member Warned"
  | "Member Restricted"
  | "Restriction Lifted"
  | "Member Banned"
  | "Member Unbanned"
  | "Suspension Extended"
  | "Appeal Updated"
  | "Content Approved"
  | "Content Rejected"
  | "Content Removed"
  | "Content Flagged"
  | "Replacement Requested"
  | "Content Escalated"
  | "Opportunity Approved"
  | "Opportunity Rejected"
  | "Opportunity Featured"
  | "Opportunity Archived"
  | "Opportunity Deleted"
  | "Company Verified"
  | "Company Featured"
  | "Company Suspended"
  | "Company Deleted"
  | "Deal Created"
  | "Deal Assigned"
  | "Deal Stage Changed"
  | "Deal Closed"
  | "Deal Reopened"
  | "Deal Archived"
  | "Deal Restored"
  | "Deal Deleted"
  | "Introduction Approved"
  | "Introduction Rejected"
  | "Introduction Completed"
  | "Introduction Converted"
  | "Listing Deleted"
  | "Listing Archived"
  | "Listing Restored"
  | "Image Uploaded"
  | "Image Deleted"
  | "Image Replaced"
  | "Cover Image Changed"
  | "Gallery Reordered"
  | "Gallery Cleared"
  | "Company Image Uploaded"
  | "Company Image Replaced"
  | "Company Image Deleted"
  | "Company Cover Changed"
  | "Company Logo Changed"
  | "Company Gallery Reordered"
  | "Company Gallery Cleared"
  | "Member Image Uploaded"
  | "Member Image Replaced"
  | "Member Image Deleted"
  | "Member Cover Changed"
  | "Member Avatar Changed"
  | "Member Gallery Reordered"
  | "Member Gallery Cleared"
  | "Document Uploaded"
  | "Document Deleted"
  | "Document Replaced"
  | "Access Approved"
  | "Access Denied"
  | "Event Created"
  | "Event Updated"
  | "Event Deleted"
  | "Event Moved"
  | "Event Duplicated"
  | "Attachment Uploaded"
  | "Attachment Deleted"
  | "Category Changed";

export type AuditTargetKind =
  | "member"
  | "company"
  | "opportunity"
  | "listing"
  | "deal"
  | "introduction"
  | "image"
  | "document"
  | "role"
  | "calendar"
  | "system";

export type AuditEvent = {
  id: string; // "AUD-000001"
  action: AuditAction;
  actorName: string;
  actorRole: string;
  targetKind: AuditTargetKind;
  targetId: string;
  targetLabel?: string;
  detail?: string;
  /** Optional change capture for the Before → After view. */
  before?: string;
  after?: string;
  createdAt: string; // ISO
};

// ---- Action grouping (filters + summary cards) ----

export type AuditGroup =
  | "Role Management"
  | "Member Actions"
  | "Company Actions"
  | "Opportunity Actions"
  | "Listing Actions"
  | "Image Actions"
  | "Document Actions"
  | "Deal Actions"
  | "Introduction Actions"
  | "Moderation Actions"
  | "Calendar Actions"
  | "System Actions";

export const AUDIT_GROUPS: AuditGroup[] = [
  "Role Management",
  "Member Actions",
  "Company Actions",
  "Opportunity Actions",
  "Listing Actions",
  "Image Actions",
  "Document Actions",
  "Deal Actions",
  "Introduction Actions",
  "Moderation Actions",
  "Calendar Actions",
  "System Actions",
];

const GROUP_MAP: Record<AuditAction, AuditGroup> = {
  "Role Changed": "Role Management",
  "Member Suspended": "Member Actions",
  "Member Activated": "Member Actions",
  "Member Deleted": "Member Actions",
  "Member Verified": "Member Actions",
  "Member Featured": "Member Actions",
  "Member Approved": "Member Actions",
  "Member Created": "Member Actions",
  "Company Created": "Company Actions",
  "Company Editor Assigned": "Company Actions",
  "Company Admin Assigned": "Company Actions",
  "Opportunity Moderator Assigned": "Opportunity Actions",
  "Opportunity Editor Assigned": "Opportunity Actions",
  "Introduction Archived": "Introduction Actions",
  "Introduction Restored": "Introduction Actions",
  "Introduction Deleted": "Introduction Actions",
  "Introduction Created": "Introduction Actions",
  "Report Submitted": "Moderation Actions",
  "Report Resolved": "Moderation Actions",
  "Report Dismissed": "Moderation Actions",
  "Report Escalated": "Moderation Actions",
  "Report Archived": "Moderation Actions",
  "Changes Requested": "Moderation Actions",
  "Changes Resolved": "Moderation Actions",
  "Member Warned": "Moderation Actions",
  "Member Restricted": "Moderation Actions",
  "Restriction Lifted": "Moderation Actions",
  "Member Banned": "Moderation Actions",
  "Member Unbanned": "Moderation Actions",
  "Suspension Extended": "Moderation Actions",
  "Appeal Updated": "Moderation Actions",
  "Content Approved": "Moderation Actions",
  "Content Rejected": "Moderation Actions",
  "Content Removed": "Moderation Actions",
  "Content Flagged": "Moderation Actions",
  "Replacement Requested": "Moderation Actions",
  "Content Escalated": "Moderation Actions",
  "Company Verified": "Company Actions",
  "Company Featured": "Company Actions",
  "Company Suspended": "Company Actions",
  "Company Deleted": "Company Actions",
  "Opportunity Approved": "Opportunity Actions",
  "Opportunity Rejected": "Opportunity Actions",
  "Opportunity Featured": "Opportunity Actions",
  "Opportunity Archived": "Opportunity Actions",
  "Opportunity Deleted": "Opportunity Actions",
  "Listing Deleted": "Listing Actions",
  "Listing Archived": "Listing Actions",
  "Listing Restored": "Listing Actions",
  "Image Uploaded": "Image Actions",
  "Image Deleted": "Image Actions",
  "Image Replaced": "Image Actions",
  "Cover Image Changed": "Image Actions",
  "Gallery Reordered": "Image Actions",
  "Gallery Cleared": "Image Actions",
  "Company Image Uploaded": "Image Actions",
  "Company Image Replaced": "Image Actions",
  "Company Image Deleted": "Image Actions",
  "Company Cover Changed": "Image Actions",
  "Company Logo Changed": "Image Actions",
  "Company Gallery Reordered": "Image Actions",
  "Company Gallery Cleared": "Image Actions",
  "Member Image Uploaded": "Image Actions",
  "Member Image Replaced": "Image Actions",
  "Member Image Deleted": "Image Actions",
  "Member Cover Changed": "Image Actions",
  "Member Avatar Changed": "Image Actions",
  "Member Gallery Reordered": "Image Actions",
  "Member Gallery Cleared": "Image Actions",
  "Document Uploaded": "Document Actions",
  "Document Deleted": "Document Actions",
  "Document Replaced": "Document Actions",
  "Access Approved": "Document Actions",
  "Access Denied": "Document Actions",
  "Deal Created": "Deal Actions",
  "Deal Assigned": "Deal Actions",
  "Deal Stage Changed": "Deal Actions",
  "Deal Closed": "Deal Actions",
  "Deal Reopened": "Deal Actions",
  "Deal Archived": "Deal Actions",
  "Deal Restored": "Deal Actions",
  "Deal Deleted": "Deal Actions",
  "Introduction Approved": "Introduction Actions",
  "Introduction Rejected": "Introduction Actions",
  "Introduction Completed": "Introduction Actions",
  "Introduction Converted": "Introduction Actions",
  "Event Created": "Calendar Actions",
  "Event Updated": "Calendar Actions",
  "Event Deleted": "Calendar Actions",
  "Event Moved": "Calendar Actions",
  "Event Duplicated": "Calendar Actions",
  "Attachment Uploaded": "Calendar Actions",
  "Attachment Deleted": "Calendar Actions",
  "Category Changed": "Calendar Actions",
};

export function groupForAction(action: AuditAction): AuditGroup {
  return GROUP_MAP[action] ?? "System Actions";
}

/** Actions counted as moderation for the summary card. */
export function isModerationAction(action: AuditAction): boolean {
  return (
    action === "Opportunity Approved" ||
    action === "Opportunity Rejected" ||
    action === "Member Suspended" ||
    action === "Member Activated" ||
    action === "Company Verified" ||
    action === "Access Approved" ||
    action === "Access Denied"
  );
}

/** Timeline dot tone per action — 🟢 create 🟡 update 🔴 delete 🔵 approve 🟣 role. */
export type AuditTone = "emerald" | "amber" | "rose" | "sky" | "violet";

export function toneForAction(action: AuditAction): AuditTone {
  if (action === "Role Changed") return "violet";
  if (/Deleted|Rejected|Denied|Suspended|Closed/.test(action)) return "rose";
  if (/Approved|Verified|Activated|Restored|Reopened/.test(action)) return "sky";
  if (/Created|Uploaded|Converted|Featured/.test(action)) return "emerald";
  return "amber"; // Changed / Replaced / Reordered / Assigned / Archived …
}

// ---- Seeds — a believable trail over the last 30 days ----

const NOW = Date.parse("2026-06-10T00:00:00Z");
const D = 24 * 60 * 60 * 1000;
const at = (daysAgo: number, h = 10) =>
  new Date(NOW - daysAgo * D + h * 3600_000).toISOString();

let n = 0;
const ev = (
  action: AuditAction,
  targetKind: AuditTargetKind,
  targetId: string,
  targetLabel: string,
  daysAgo: number,
  extra?: Partial<Pick<AuditEvent, "detail" | "before" | "after" | "actorName" | "actorRole">>
): AuditEvent => ({
  id: `AUD-${String(++n).padStart(6, "0")}`,
  action,
  actorName: extra?.actorName ?? "Stevie Cabrera",
  actorRole: extra?.actorRole ?? "Super Admin",
  targetKind,
  targetId,
  targetLabel,
  detail: extra?.detail,
  before: extra?.before,
  after: extra?.after,
  createdAt: at(daysAgo, 9 + (n % 8)),
});

export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  ev("Deal Stage Changed", "deal", "DEAL-000001", "Solar Portfolio Funding — 120 MW Sonora", 1, {
    before: "Due Diligence",
    after: "Funding",
    detail: "Saint-Laurent confirmed allocation",
  }),
  ev("Introduction Approved", "introduction", "INT-000001", "Helena Ortega → Stevie Cabrera", 2),
  ev("Deal Assigned", "deal", "DEAL-000005", "Global Logistics — Bolt-on", 3, {
    before: "Stevie Cabrera",
    after: "Mariana Reyes",
    detail: "Reassigned for coverage",
  }),
  ev("Company Verified", "company", "COMP-000008", "Northstar Manufacturing Co", 4, {
    before: "Pending",
    after: "Verified",
  }),
  ev("Opportunity Approved", "opportunity", "cc-041", "Logistics Hub Expansion", 5, {
    before: "Pending",
    after: "Approved",
  }),
  ev("Image Replaced", "image", "LST-000001#2", "Beachfront Boutique Hotel", 6, {
    detail: "Photo 2 replaced on LST-000001",
  }),
  ev("Document Uploaded", "document", "DOC-000031", "Updated DSCR Model v4", 7, {
    detail: "Listing LST-000005",
  }),
  ev("Member Suspended", "member", "MEM-000037", "Bishop Ferguson", 8, {
    before: "Active",
    after: "Suspended",
    detail: "Unsolicited allocation requests (REP-000002)",
    actorRole: "Moderator",
    actorName: "Mariana Reyes",
  }),
  ev("Role Changed", "member", "MEM-000019", "Catalina Reyes", 10, {
    before: "Member",
    after: "Editor",
    detail: "Promoted to assist with hospitality content",
  }),
  ev("Deal Closed", "deal", "DEAL-000023", "Luxury Resort Acquisition — Antigua", 9, {
    before: "Funding",
    after: "Closed Won",
    detail: "Closed at $51.5M actual",
  }),
  ev("Listing Archived", "listing", "LST-000011", "East Cape Oceanfront", 14),
  ev("Introduction Converted", "introduction", "INT-000003", "Crescent Wealth → Mateo Solís", 16, {
    detail: "Converted to DEAL-000002",
  }),
  ev("Access Approved", "document", "REQ-000002", "Aurora Capital — Cabo data room", 18, {
    before: "Requested",
    after: "Approved",
  }),
  ev("Gallery Reordered", "image", "LST-000003", "Coastal Development Land", 21, {
    detail: "Photo 4 moved to cover",
  }),
  ev("Company Featured", "company", "COMP-000021", "Halcyon Resort Group", 25, {
    detail: "Featured on the directory",
  }),
  ev("Deal Created", "deal", "DEAL-000020", "Northwind Direct Slice — Cabo", 28, {
    detail: "Opened from cc-001 inbound",
  }),
];
