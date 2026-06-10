// Deal Desk data model — Phase 1, Platform Operations Center.
//
// The Deal Desk sits ABOVE messaging and introductions: every introduction,
// inquiry, and negotiation eventually becomes a Deal that the platform
// owner shepherds through the full lifecycle, from New Lead to Closed Won.
//
// Activity records are structured (kind + actor + ref) so a future Audit
// Log page can be built on top of them without schema changes.

export type DealStage =
  | "New Lead"
  | "Introduction Requested"
  | "Introduction Approved"
  | "First Contact"
  | "Investor Review"
  | "Sponsor Review"
  | "Negotiating"
  | "Due Diligence"
  | "Letter Of Intent"
  | "Contract Review"
  | "Funding"
  | "Closed Won"
  | "Closed Lost"
  | "Archived";

export const DEAL_STAGES: DealStage[] = [
  "New Lead",
  "Introduction Requested",
  "Introduction Approved",
  "First Contact",
  "Investor Review",
  "Sponsor Review",
  "Negotiating",
  "Due Diligence",
  "Letter Of Intent",
  "Contract Review",
  "Funding",
  "Closed Won",
  "Closed Lost",
  "Archived",
];

/** The eight columns shown on the Kanban board. */
export const KANBAN_STAGES: DealStage[] = [
  "New Lead",
  "Introduction Requested",
  "Introduction Approved",
  "Negotiating",
  "Due Diligence",
  "Funding",
  "Closed Won",
  "Closed Lost",
];

export const STAGE_RANK: Record<DealStage, number> = {
  "New Lead": 0,
  "Introduction Requested": 1,
  "Introduction Approved": 2,
  "First Contact": 3,
  "Investor Review": 4,
  "Sponsor Review": 5,
  "Negotiating": 6,
  "Due Diligence": 7,
  "Letter Of Intent": 8,
  "Contract Review": 9,
  "Funding": 10,
  "Closed Won": 11,
  "Closed Lost": 12,
  "Archived": 13,
};

export type DealStatus = "Open" | "Closed Won" | "Closed Lost" | "Archived";

/** Derive the coarse status bucket from a stage. */
export function statusForStage(stage: DealStage): DealStatus {
  if (stage === "Closed Won") return "Closed Won";
  if (stage === "Closed Lost") return "Closed Lost";
  if (stage === "Archived") return "Archived";
  return "Open";
}

export type DealPriority = "Low" | "Normal" | "High" | "Urgent";
export const DEAL_PRIORITIES: DealPriority[] = ["Low", "Normal", "High", "Urgent"];

export type DealSource =
  | "Introduction Request"
  | "Opportunity Inquiry"
  | "Company Inquiry"
  | "Member Inquiry"
  | "Manual Entry";

// ---- Activity (audit-ready) ----

export type DealActivityKind =
  | "created"
  | "updated"
  | "stage_change"
  | "note_added"
  | "internal_note_added"
  | "introduction_requested"
  | "introduction_approved"
  | "investor_added"
  | "sponsor_added"
  | "participant_added"
  | "participant_removed"
  | "document_added"
  | "document_removed"
  | "assigned"
  | "priority_change"
  | "meeting_scheduled"
  | "closed_won"
  | "closed_lost"
  | "archived"
  | "restored"
  | "reopened"
  | "deleted";

/**
 * Structured activity record. Doubles as the audit-log row: every mutation
 * captures who (actor + actorRole), what (kind + title + body), and which
 * related record (ref) — a future Audit Log page only needs to render these.
 */
export type DealActivity = {
  id: string;
  kind: DealActivityKind;
  title: string;
  body?: string;
  createdAt: string; // ISO
  actor: string;
  actorRole?: string;
  ref?: { kind: string; id: string };
};

// ---- Notes ----

export type DealNote = {
  id: string;
  /** Markdown-ish text — **bold**, *italic*, - bullets, [links](url). */
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
};

// ---- Participants ----

export type DealParticipantRole =
  | "Sponsor"
  | "Investor"
  | "Admin"
  | "Editor"
  | "Moderator"
  | "Member";

export type DealParticipantStatus = "Active" | "Invited" | "Inactive";

export type DealParticipant = {
  id: string;
  name: string;
  company: string;
  role: DealParticipantRole;
  status: DealParticipantStatus;
  memberId?: string;
};

// ---- Documents (references only — no file storage) ----

export type DealDocumentType =
  | "LOI"
  | "NDA"
  | "Investor Deck"
  | "Financial Model"
  | "Contract"
  | "Photo"
  | "PDF";

export const DEAL_DOCUMENT_TYPES: DealDocumentType[] = [
  "LOI",
  "NDA",
  "Investor Deck",
  "Financial Model",
  "Contract",
  "Photo",
  "PDF",
];

export type DealDocumentRef = {
  id: string;
  name: string;
  type: DealDocumentType;
  /** Optional pointer to a data-room DOC-XXXXXX record. */
  linkedDocumentId?: string;
  addedAt: string;
  addedBy: string;
};

// ---- Party (sponsor / investor) ----

export type DealParty = {
  name: string;
  memberId?: string;
  companyId?: string;
};

// ---- The Deal ----

export type Deal = {
  dealId: string; // "DEAL-000001"
  title: string;

  opportunityId?: string;
  opportunitySlug?: string;
  listingId?: string;
  companyId?: string;

  sponsor: DealParty;
  investor?: DealParty;
  assignedAdmin: string;

  stage: DealStage;
  status: DealStatus;
  priority: DealPriority;

  createdDate: string;
  updatedDate: string;
  expectedCloseDate?: string;

  targetInvestment: number; // USD
  actualInvestment?: number;
  commissionPct: number; // e.g. 2.5
  estimatedCommission: number;
  actualCommission?: number;

  sourceType: DealSource;
  sourceId?: string;
  sourceName?: string;

  /** Card-level one-liner. Full notes live in the arrays below. */
  summaryNote?: string;
  /** Public notes — visible to every participant tier. */
  notes: DealNote[];
  /** Internal notes — Editor / Admin / Super Admin only. */
  internalNotes: DealNote[];

  activity: DealActivity[];
  participants: DealParticipant[];
  documents: DealDocumentRef[];
  /** Existing messaging threads related to this deal. */
  conversationIds: string[];

  lastContactDate?: string;
  nextFollowUpDate?: string;
  tags: string[];
};

// ---- Time anchor ----
//
// All "today" math anchors here so SSG output and client hydration agree.
export const DEAL_DESK_NOW_MS = Date.parse("2026-06-10T00:00:00Z");

/** Days remaining until a date (negative if overdue). */
export function daysUntil(iso: string | undefined, nowMs: number): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((t - nowMs) / (24 * 60 * 60 * 1000));
}

export function isOpenStage(stage: DealStage): boolean {
  return statusForStage(stage) === "Open";
}

// ---- Metrics for the Deal Desk dashboard cards ----

export type DealDeskMetrics = {
  totalActive: number;
  dealsThisMonth: number;
  closedWon: number;
  closedLost: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  capitalBeingRaised: number; // sum targetInvestment over open deals
  totalDealValue: number; // open target + won actual
  estimatedCommissionOpen: number;
};

export function computeDealDeskMetrics(deals: Deal[], nowMs: number): DealDeskMetrics {
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
  const m: DealDeskMetrics = {
    totalActive: 0,
    dealsThisMonth: 0,
    closedWon: 0,
    closedLost: 0,
    pendingFollowUps: 0,
    overdueFollowUps: 0,
    capitalBeingRaised: 0,
    totalDealValue: 0,
    estimatedCommissionOpen: 0,
  };
  for (const d of deals) {
    const open = isOpenStage(d.stage);
    if (open) {
      m.totalActive++;
      m.capitalBeingRaised += d.targetInvestment;
      m.totalDealValue += d.targetInvestment;
      m.estimatedCommissionOpen += d.estimatedCommission;
      const du = daysUntil(d.nextFollowUpDate, nowMs);
      if (du !== null) {
        if (du < 0) m.overdueFollowUps++;
        else if (du <= 7) m.pendingFollowUps++;
      }
    } else if (d.stage === "Closed Won") {
      m.closedWon++;
      m.totalDealValue += d.actualInvestment ?? d.targetInvestment;
    } else if (d.stage === "Closed Lost") {
      m.closedLost++;
    }
    const createdMs = new Date(d.createdDate).getTime();
    if (!Number.isNaN(createdMs) && nowMs - createdMs <= oneMonthMs) {
      m.dealsThisMonth++;
    }
  }
  return m;
}

/** Admins assignable to deals (mock roster until auth exists). */
export const SAMPLE_ADMINS = ["Stevie Cabrera", "Mariana Reyes", "Diego Salinas"];
