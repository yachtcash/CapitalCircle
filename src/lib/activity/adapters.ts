// Pure adapters: existing domain records -> the unified ActivityEvent shape.
// One mapping per source so every surface derives identically — no duplicate
// kind maps, labels, or tones anywhere else.

import type { ListingActivity } from "@/data/listings";
import { toneForAction, type AuditAction, type AuditEvent } from "@/data/audit";
import type { ActivityEntity, ActivityEvent, ActivityTone } from "./types";

/** Audit tone vocabulary -> unified activity tones ("amber" is gold here). */
export function auditToneFor(action: AuditAction): ActivityTone | undefined {
  const t = toneForAction(action);
  if (t === "amber") return "gold";
  if (t === "emerald" || t === "sky" || t === "rose" || t === "violet") return t;
  return undefined;
}

/** The one listing-activity vocabulary (previously duplicated with drift). */
export const LISTING_ACTIVITY_META: Record<
  string,
  { label: string; entity: ActivityEntity; tone?: ActivityTone }
> = {
  interest: { label: "Interest expressed", entity: "opportunity", tone: "emerald" },
  saved: { label: "Saved by an investor", entity: "opportunity", tone: "gold" },
  negotiation_start: { label: "Negotiation started", entity: "deal" },
  company_view: { label: "Sponsor profile viewed", entity: "company" },
  document_request: { label: "Data-room access requested", entity: "document" },
  stage_change: { label: "Stage updated", entity: "deal" },
  edit: { label: "Listing updated", entity: "listing" },
};

export function fromListingActivity(
  a: ListingActivity,
  opts?: { detail?: string; href?: string }
): ActivityEvent {
  const meta = LISTING_ACTIVITY_META[a.kind] ?? {
    label: a.title,
    entity: "activity" as const,
  };
  return {
    id: a.id,
    entity: meta.entity,
    tone: meta.tone,
    title: meta.label,
    detail: opts?.detail ?? (a.title || a.body || ""),
    href: opts?.href,
    dateMs: Date.parse(a.createdAt) || 0,
  };
}

/** Member.recentActivity kinds -> unified entities. */
export const MEMBER_ACTIVITY_ENTITY: Record<string, ActivityEntity> = {
  listing: "listing",
  company: "company",
  introduction: "introduction",
  join: "member",
  verification: "member",
};

/**
 * Investor-facing relabel of positive, market-moving audit actions —
 * the platform ledger vocabulary (homepage + command center).
 */
export const AUDIT_ACTIVITY_META: Partial<
  Record<AuditAction, { label: string; entity: ActivityEntity }>
> = {
  "Deal Created": { label: "New deal created", entity: "deal" },
  "Deal Closed": { label: "Deal closed", entity: "deal" },
  "Deal Stage Changed": { label: "Deal advanced", entity: "deal" },
  "Company Verified": { label: "Sponsor verified", entity: "company" },
  "Company Featured": { label: "Sponsor featured", entity: "company" },
  "Opportunity Approved": { label: "New opportunity added", entity: "opportunity" },
  "Introduction Approved": { label: "Introduction approved", entity: "introduction" },
  "Introduction Converted": { label: "Introduction converted to deal", entity: "introduction" },
  "Access Approved": { label: "Data-room access granted", entity: "document" },
  "Document Uploaded": { label: "Financials updated", entity: "document" },
};

/** Ledger adapter — returns null for actions outside the public vocabulary. */
export function fromAuditEvent(e: AuditEvent): ActivityEvent | null {
  const meta = AUDIT_ACTIVITY_META[e.action];
  if (!meta) return null;
  return {
    id: e.id,
    entity: meta.entity,
    tone: auditToneFor(e.action),
    title: meta.label,
    detail: e.targetLabel ?? e.targetId,
    dateMs: Date.parse(e.createdAt) || 0,
  };
}
