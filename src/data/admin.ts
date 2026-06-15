// Admin Control Center data layer — moderation seeds + per-record admin
// override states. Seed records are static; admin actions write overlay
// state keyed by record id (persisted via the provider).

import type { Role } from "@/lib/roles";
import type { Member, MemberVerification } from "@/data/members";
import type { Company } from "@/data/companies";

// ---- Member admin overlay ----

export type MemberAccountStatus =
  | "Active"
  | "Suspended"
  | "Banned"
  | "Deleted";

export type MemberAdminState = {
  role?: Role;
  status?: MemberAccountStatus;
  /** Admin verification override; wins over the member's seed verification. */
  verificationOverride?: MemberVerification;
  /** Admin featured override; wins over the member's seed `featured`. */
  featuredOverride?: boolean;
  /** Set when an admin explicitly approves the member into the directory. */
  approved?: boolean;
};

/** A member record created at runtime through the Admin Control Center. */
export type CreatedMember = Member & { createdAt: string };
/** A company record created at runtime through the Admin Control Center. */
export type CreatedCompany = Company & { createdAt: string };

/** Defaults: everyone Active/Member; the platform owner is Super Admin. */
export const SEED_MEMBER_ADMIN: Record<string, MemberAdminState> = {
  "MEM-000001": { role: "Super Admin" },
  // One suspended account so the moderation queue has signal.
  "MEM-000037": { status: "Suspended" },
};

// ---- Company admin overlay ----

export type CompanyAccountStatus = "Active" | "Suspended" | "Deleted";

export type CompanyAdminState = {
  verificationOverride?: "Pending" | "Verified" | "Premium Verified";
  featuredOverride?: boolean;
  status?: CompanyAccountStatus;
  /** Name of the team member assigned to edit this company. */
  assignedEditor?: string;
  /** Name of the admin assigned to oversee this company. */
  assignedAdmin?: string;
};

export const SEED_COMPANY_ADMIN: Record<string, CompanyAdminState> = {};

// ---- Opportunity admin overlay ----

export type OpportunityModeration = "Pending" | "Approved" | "Rejected";

export type OpportunityAdminState = {
  moderation?: OpportunityModeration;
  archived?: boolean;
  deleted?: boolean;
  /** Name of the moderator assigned to review this opportunity. */
  assignedModerator?: string;
  /** Name of the editor assigned to this opportunity. */
  assignedEditor?: string;
};

/** A few recent submissions sit in the approval queue. */
export const SEED_OPP_ADMIN: Record<string, OpportunityAdminState> = {
  "cc-044": { moderation: "Pending" },
  "cc-045": { moderation: "Pending" },
  "cc-046": { moderation: "Pending" },
};

// ---- Reported content / flagged messages (moderation seeds) ----

export type ReportedContent = {
  id: string; // "REP-000001"
  targetKind: "opportunity" | "company" | "member" | "listing";
  targetId: string;
  targetLabel: string;
  reason: string;
  reportedBy: string;
  reportedAt: string;
  status: "Open" | "Resolved" | "Dismissed";
};

export const SEED_REPORTS: ReportedContent[] = [
  {
    id: "REP-000001",
    targetKind: "opportunity",
    targetId: "cc-031",
    targetLabel: "Container Cold-Chain Hub",
    reason: "Financial projections appear inconsistent with the deck shared in the data room.",
    reportedBy: "Helena Ortega",
    reportedAt: "2026-06-08T15:00:00Z",
    status: "Open",
  },
  {
    id: "REP-000002",
    targetKind: "member",
    targetId: "MEM-000037",
    targetLabel: "Bishop Ferguson",
    reason: "Unverified member sending unsolicited allocation requests.",
    reportedBy: "Charlotte Devereaux",
    reportedAt: "2026-06-06T11:30:00Z",
    status: "Open",
  },
  {
    id: "REP-000003",
    targetKind: "company",
    targetId: "COMP-000020",
    targetLabel: "Vanguard Property Management",
    reason: "Website link broken; claimed track record cannot be confirmed.",
    reportedBy: "Priya Sharma",
    reportedAt: "2026-06-04T09:15:00Z",
    status: "Open",
  },
];

export type FlaggedMessage = {
  id: string; // "FLG-000001"
  conversationId: string;
  companyName: string;
  excerpt: string;
  flagReason: string;
  flaggedAt: string;
  status: "Open" | "Cleared" | "Removed";
};

export const SEED_FLAGGED_MESSAGES: FlaggedMessage[] = [
  {
    id: "FLG-000001",
    conversationId: "conv-verde-stone",
    companyName: "Verde Stone & Marble",
    excerpt: "…happy to settle this off-platform if you wire directly to…",
    flagReason: "Possible off-platform payment solicitation",
    flaggedAt: "2026-06-07T18:20:00Z",
    status: "Open",
  },
  {
    id: "FLG-000002",
    conversationId: "conv-modular-north",
    companyName: "Modular North Builders",
    excerpt: "…shared the full investor list as an attachment…",
    flagReason: "Potential confidential data sharing",
    flaggedAt: "2026-06-05T10:05:00Z",
    status: "Open",
  },
];
