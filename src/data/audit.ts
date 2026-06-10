// Central audit event architecture.
//
// Every privileged action generates one structured AuditEvent, stored in
// the provider (cc:audit:v1). The future /admin/audit page only needs to
// render these records — no schema work will be required.

export type AuditAction =
  | "Role Changed"
  | "Member Suspended"
  | "Member Activated"
  | "Member Deleted"
  | "Opportunity Approved"
  | "Opportunity Rejected"
  | "Opportunity Featured"
  | "Opportunity Archived"
  | "Opportunity Deleted"
  | "Company Verified"
  | "Company Featured"
  | "Company Suspended"
  | "Company Deleted"
  | "Deal Assigned"
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
  | "Image Deleted"
  | "Image Replaced"
  | "Document Deleted"
  | "Document Uploaded";

export type AuditTargetKind =
  | "member"
  | "company"
  | "opportunity"
  | "listing"
  | "deal"
  | "introduction"
  | "image"
  | "document"
  | "role";

export type AuditEvent = {
  id: string; // "AUD-000001"
  action: AuditAction;
  actorName: string;
  actorRole: string;
  targetKind: AuditTargetKind;
  targetId: string;
  targetLabel?: string;
  detail?: string;
  createdAt: string; // ISO
};

export const SEED_AUDIT_EVENTS: AuditEvent[] = [];
