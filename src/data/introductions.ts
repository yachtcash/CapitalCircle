// Introduction request data model.
//
// Members never reach each other directly through this system. Instead:
//   Requester ──▶ Platform ──▶ Target Member
// The platform owner reviews each request and chooses to approve, reject,
// or escalate it to a direct connection.

export type IntroductionStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed";

export type IntroductionRequest = {
  id: string; // "INT-XXXXXX"
  requesterId: string; // Member id ("MEM-XXXXXX") OR profile "me"
  requesterName: string;
  targetMemberId: string;
  targetMemberName: string;
  /** Optional cross-references for context the platform owner can verify. */
  opportunitySlug?: string;
  opportunityTitle?: string;
  companyId?: string;
  companyName?: string;
  /** Short structured reason for the introduction. */
  reason: string;
  /** Longer free-text message from the requester. */
  message: string;
  status: IntroductionStatus;
  createdAt: string; // ISO
  decidedAt?: string; // ISO when approved/rejected
  completedAt?: string; // ISO when marked completed
  decisionNote?: string;
};

export const SEED_INTRODUCTIONS: IntroductionRequest[] = [
  {
    id: "INT-000001",
    requesterId: "MEM-000007",
    requesterName: "Priya Sharma",
    targetMemberId: "MEM-000001",
    targetMemberName: "Stevie Cabrera",
    opportunitySlug: "beachfront-boutique-hotel",
    opportunityTitle: "Beachfront Boutique Hotel — 42 Keys",
    companyId: "COMP-000001",
    companyName: "Pacific Coast Development Group",
    reason: "Direct LP allocation to a hospitality raise.",
    message:
      "Reviewing the Cabo boutique. We typically write $5M–$15M as direct LP alongside an operating sponsor with skin-in. Would value a working session if the platform thinks there is fit.",
    status: "Pending",
    createdAt: "2026-06-05T16:30:00Z",
  },
  {
    id: "INT-000002",
    requesterId: "MEM-000002",
    requesterName: "Helena Ortega",
    targetMemberId: "MEM-000003",
    targetMemberName: "Marco Rivera",
    opportunitySlug: "coastal-development-land",
    opportunityTitle: "Coastal Development Land — 84 Acres",
    companyId: "COMP-000003",
    companyName: "Riviera Land Group",
    reason: "Pref-equity tranche if Riviera pursues a JV.",
    message:
      "If the Punta Mita parcel moves into a JV structure, Aurora would consider underwriting a pref-equity tranche. Happy to share representative term sheets.",
    status: "Approved",
    createdAt: "2026-05-28T11:00:00Z",
    decidedAt: "2026-05-29T09:45:00Z",
    decisionNote: "Both parties confirmed mutual interest. Introduction handled out-of-band.",
  },
  {
    id: "INT-000003",
    requesterId: "MEM-000014",
    requesterName: "Ahmed Al-Mansouri",
    targetMemberId: "MEM-000006",
    targetMemberName: "Mateo Solís",
    opportunitySlug: "branded-residences-tulum-jv",
    opportunityTitle: "Joint Venture — Branded Residences",
    companyId: "COMP-000006",
    companyName: "Yucatán Development Co.",
    reason: "Direct LP into a branded JV.",
    message:
      "Family office looking for branded residential exposure with a global flag. Would appreciate a 30-minute working call once the platform has reviewed.",
    status: "Completed",
    createdAt: "2026-05-15T14:00:00Z",
    decidedAt: "2026-05-16T10:30:00Z",
    completedAt: "2026-05-22T19:00:00Z",
    decisionNote: "Connected and active negotiation underway.",
  },
];
