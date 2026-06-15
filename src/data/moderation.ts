// Moderation Center data model.
//
// The platform owner's moderation domain: reports, change requests, and the
// member-sanction ladder (warnings → restrictions → suspensions → bans). All
// of these are stored in the provider (persisted to localStorage) and every
// mutation also writes a central AuditEvent. Seed records give the queue
// believable signal on first load.

export type ReportTargetKind =
  | "member"
  | "company"
  | "opportunity"
  | "listing"
  | "image"
  | "document"
  | "message";

export const REPORT_TARGET_KINDS: ReportTargetKind[] = [
  "member",
  "company",
  "opportunity",
  "listing",
  "image",
  "document",
  "message",
];

export type ReportPriority = "Low" | "Medium" | "High" | "Critical";
export const REPORT_PRIORITIES: ReportPriority[] = ["Low", "Medium", "High", "Critical"];

export const PRIORITY_RANK: Record<ReportPriority, number> = {
  Critical: 3,
  High: 2,
  Medium: 1,
  Low: 0,
};

export type ReportStatus = "Open" | "Resolved" | "Dismissed" | "Archived";
export type EscalationLevel = "Admin" | "Super Admin";

export type ModerationReport = {
  id: string; // "REP-000001"
  targetKind: ReportTargetKind;
  targetId: string;
  targetLabel: string;
  /** Optional preview token/URL for image reports. */
  imageSrc?: string;
  reason: string;
  description?: string;
  evidenceNotes?: string;
  priority: ReportPriority;
  reportedBy: string;
  reportedAt: string; // ISO
  status: ReportStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  escalatedTo?: EscalationLevel;
};

// ---- Member sanction ladder ----

export type Warning = {
  id: string; // "WARN-000001"
  memberId: string;
  memberName: string;
  reason: string;
  notes?: string;
  moderator: string;
  date: string; // ISO
};

export type RestrictionType =
  | "Cannot Post"
  | "Cannot Message"
  | "Cannot Upload Images"
  | "Cannot Upload Documents"
  | "Read Only";

export const RESTRICTION_TYPES: RestrictionType[] = [
  "Cannot Post",
  "Cannot Message",
  "Cannot Upload Images",
  "Cannot Upload Documents",
  "Read Only",
];

export type Restriction = {
  id: string; // "RES-000001"
  memberId: string;
  memberName: string;
  types: RestrictionType[];
  permanent: boolean;
  until?: string; // ISO when temporary
  reason: string;
  notes?: string;
  moderator: string;
  date: string; // ISO
  active: boolean;
};

export type Suspension = {
  id: string; // "SUS-000001"
  memberId: string;
  memberName: string;
  startDate: string; // ISO
  endDate?: string; // ISO; absent = indefinite
  reason: string;
  notes?: string;
  moderator: string;
  active: boolean;
};

export type AppealStatus =
  | "None"
  | "Submitted"
  | "Under Review"
  | "Denied"
  | "Granted";
export const APPEAL_STATUSES: AppealStatus[] = [
  "None",
  "Submitted",
  "Under Review",
  "Denied",
  "Granted",
];

export type Ban = {
  id: string; // "BAN-000001"
  memberId: string;
  memberName: string;
  reason: string;
  notes?: string;
  moderator: string;
  date: string; // ISO
  appealStatus: AppealStatus;
  active: boolean;
};

// ---- Request Changes on content ----

export type ChangeRequest = {
  id: string; // "CHG-000001"
  targetKind: ReportTargetKind;
  targetId: string;
  targetLabel: string;
  reason: string;
  notes?: string;
  dueDate?: string; // ISO
  moderator: string;
  createdAt: string; // ISO
  status: "Open" | "Resolved";
};

// ---- Per-content moderation status (images / documents / messages …) ----

export type ContentModerationStatus =
  | "Approved"
  | "Rejected"
  | "Removed"
  | "Flagged"
  | "Replacement Requested"
  | "Escalated";

export type ContentModerationEntry = {
  status: ContentModerationStatus;
  note?: string;
  moderator?: string;
  at?: string;
};

/** Keyed by `${targetKind}:${targetId}`. */
export type ContentModerationState = Record<string, ContentModerationEntry>;

// ---- Seeds ----

const NOW = Date.parse("2026-06-10T00:00:00Z");
const D = 24 * 60 * 60 * 1000;
const ago = (days: number, h = 10) =>
  new Date(NOW - days * D + h * 3600_000).toISOString();

export const SEED_MODERATION_REPORTS: ModerationReport[] = [
  {
    id: "REP-000001",
    targetKind: "opportunity",
    targetId: "cc-031",
    targetLabel: "Container Cold-Chain Hub",
    reason: "Misleading financials",
    description:
      "Financial projections appear inconsistent with the deck shared in the data room.",
    evidenceNotes: "Compare IRR on slide 7 vs the public summary.",
    priority: "High",
    reportedBy: "Helena Ortega",
    reportedAt: ago(2),
    status: "Open",
  },
  {
    id: "REP-000002",
    targetKind: "member",
    targetId: "MEM-000037",
    targetLabel: "Bishop Ferguson",
    reason: "Spam / unsolicited outreach",
    description: "Unverified member sending unsolicited allocation requests.",
    priority: "Critical",
    reportedBy: "Charlotte Devereaux",
    reportedAt: ago(4),
    status: "Open",
  },
  {
    id: "REP-000003",
    targetKind: "company",
    targetId: "COMP-000020",
    targetLabel: "Vanguard Property Management",
    reason: "Unverifiable claims",
    description: "Website link broken; claimed track record cannot be confirmed.",
    priority: "Medium",
    reportedBy: "Priya Sharma",
    reportedAt: ago(6),
    status: "Open",
  },
  {
    id: "REP-000004",
    targetKind: "message",
    targetId: "conv-verde-stone",
    targetLabel: "Verde Stone & Marble — thread",
    reason: "Off-platform payment solicitation",
    description: "“…happy to settle this off-platform if you wire directly to…”",
    evidenceNotes: "Message 14 in the thread.",
    priority: "Critical",
    reportedBy: "System Flag",
    reportedAt: ago(3),
    status: "Open",
  },
  {
    id: "REP-000005",
    targetKind: "document",
    targetId: "DOC-000004",
    targetLabel: "DSCR Model — Solar Farm 80MW",
    reason: "Confidential data exposure",
    description: "Investor list attached to a publicly requestable document.",
    priority: "High",
    reportedBy: "Marco Rivera",
    reportedAt: ago(5),
    status: "Open",
  },
];

export const SEED_WARNINGS: Warning[] = [
  {
    id: "WARN-000001",
    memberId: "MEM-000037",
    memberName: "Bishop Ferguson",
    reason: "Unsolicited outreach",
    notes: "First warning issued after two reports.",
    moderator: "Stevie Cabrera",
    date: ago(8),
  },
];

export const SEED_RESTRICTIONS: Restriction[] = [];
export const SEED_SUSPENSIONS: Suspension[] = [];
export const SEED_BANS: Ban[] = [];
export const SEED_CHANGE_REQUESTS: ChangeRequest[] = [];
export const SEED_CONTENT_MODERATION: ContentModerationState = {};

// ---- Helpers ----

export function priorityTone(p: ReportPriority): "rose" | "amber" | "sky" | "navy" {
  return p === "Critical" ? "rose" : p === "High" ? "amber" : p === "Medium" ? "sky" : "navy";
}

export function contentKey(kind: ReportTargetKind, id: string): string {
  return `${kind}:${id}`;
}
