// Deal Desk data model.
//
// Every introduction request, opportunity inquiry, company inquiry, and
// member connection eventually becomes a Deal that flows through the
// pipeline. The platform owner sits in the middle and shepherds every
// relationship from First Touch → Closed (or Lost).

export type DealStage =
  | "New Lead"
  | "Reviewing"
  | "Contacted"
  | "Waiting Response"
  | "Introduction Sent"
  | "Meeting Scheduled"
  | "Negotiating"
  | "Due Diligence"
  | "Under Contract"
  | "Closed"
  | "Lost";

export const DEAL_STAGES: DealStage[] = [
  "New Lead",
  "Reviewing",
  "Contacted",
  "Waiting Response",
  "Introduction Sent",
  "Meeting Scheduled",
  "Negotiating",
  "Due Diligence",
  "Under Contract",
  "Closed",
  "Lost",
];

/** Sort rank used by tables and metrics. Lower = earlier in funnel. */
export const STAGE_RANK: Record<DealStage, number> = {
  "New Lead": 0,
  "Reviewing": 1,
  "Contacted": 2,
  "Waiting Response": 3,
  "Introduction Sent": 4,
  "Meeting Scheduled": 5,
  "Negotiating": 6,
  "Due Diligence": 7,
  "Under Contract": 8,
  "Closed": 9,
  "Lost": 10,
};

export type DealPriority = "Low" | "Medium" | "High" | "Urgent";
export const DEAL_PRIORITIES: DealPriority[] = ["Low", "Medium", "High", "Urgent"];

export type DealSource =
  | "Introduction Request"
  | "Opportunity Inquiry"
  | "Company Inquiry"
  | "Member Inquiry"
  | "Manual Entry";

export type DealActivityKind =
  | "created"
  | "updated"
  | "stage_change"
  | "note_added"
  | "introduction_approved"
  | "meeting_scheduled"
  | "document_uploaded"
  | "closed"
  | "lost";

export type DealActivity = {
  id: string;
  kind: DealActivityKind;
  title: string;
  body?: string;
  createdAt: string; // ISO
  actor: string; // display name
  /** Optional cross-link to a structured target (member, opp, doc, etc.). */
  ref?: { kind: string; id: string };
};

export type DealNote = {
  id: string;
  /** Markdown-style text with support for **bold**, *italic*, lists, and links. */
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
};

export type DealContact = {
  /** Member id (MEM-XXXXXX), or a free-text label when not a directory member. */
  id: string;
  name: string;
  role: string;
  /** Optional reference back to a directory record. */
  memberId?: string;
  companyId?: string;
};

export type Deal = {
  dealId: string; // "DEAL-XXXXXX"
  title: string;
  status: DealStage;
  createdDate: string;
  updatedDate: string;
  /** Display name of the platform owner / admin who manages the deal. */
  owner: string;
  /** Optional handoff teammate. */
  assignedTo?: string;
  sourceType: DealSource;
  /** Identifier of the source record (e.g. INT-000001 / OPP-000003). */
  sourceId?: string;
  /** Display label for the source. */
  sourceName?: string;

  /** Linked directory records (any combination may be set). */
  memberId?: string;
  companyId?: string;
  opportunityId?: string;
  opportunitySlug?: string;

  /** USD whole-dollar estimate of deal value (used for pipeline value totals). */
  estimatedValue: number;
  /** USD commission potential to the platform. */
  commissionPotential: number;

  /** A short human note shown on cards. The full notes live in `notes[]`. */
  summaryNote?: string;
  notes: DealNote[];
  activity: DealActivity[];
  contacts: DealContact[];

  lastContactDate?: string; // ISO
  nextFollowUpDate?: string; // ISO
  priority: DealPriority;
  tags: string[];
};

export type DealMetrics = {
  openCount: number;
  closedCount: number;
  lostCount: number;
  dealsThisWeek: number;
  dealsThisMonth: number;
  potentialCommission: number;
  upcomingFollowUps: number;
  overdueFollowUps: number;
};

const OPEN_STAGES = new Set<DealStage>([
  "New Lead",
  "Reviewing",
  "Contacted",
  "Waiting Response",
  "Introduction Sent",
  "Meeting Scheduled",
  "Negotiating",
  "Due Diligence",
  "Under Contract",
]);

export function isOpenStage(stage: DealStage): boolean {
  return OPEN_STAGES.has(stage);
}

/** Days remaining until a deal's next follow-up (negative if overdue). */
export function daysUntil(iso: string | undefined, nowMs: number): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((t - nowMs) / (24 * 60 * 60 * 1000));
}

/** Compute pipeline metrics for the dashboard widgets. */
export function computeDealMetrics(deals: Deal[], nowMs: number): DealMetrics {
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
  let openCount = 0;
  let closedCount = 0;
  let lostCount = 0;
  let dealsThisWeek = 0;
  let dealsThisMonth = 0;
  let potentialCommission = 0;
  let upcomingFollowUps = 0;
  let overdueFollowUps = 0;
  for (const d of deals) {
    if (isOpenStage(d.status)) {
      openCount++;
      potentialCommission += d.commissionPotential;
    } else if (d.status === "Closed") closedCount++;
    else if (d.status === "Lost") lostCount++;
    const createdMs = new Date(d.createdDate).getTime();
    if (!Number.isNaN(createdMs)) {
      const age = nowMs - createdMs;
      if (age <= oneWeekMs) dealsThisWeek++;
      if (age <= oneMonthMs) dealsThisMonth++;
    }
    const du = daysUntil(d.nextFollowUpDate, nowMs);
    if (du !== null && isOpenStage(d.status)) {
      if (du < 0) overdueFollowUps++;
      else if (du <= 7) upcomingFollowUps++;
    }
  }
  return {
    openCount,
    closedCount,
    lostCount,
    dealsThisWeek,
    dealsThisMonth,
    potentialCommission,
    upcomingFollowUps,
    overdueFollowUps,
  };
}
