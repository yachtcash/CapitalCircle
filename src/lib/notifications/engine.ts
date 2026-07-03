// Capital Circle notification engine.
//
// Pure generation layer: maps existing platform events (audit stream +
// legacy message/calendar pushes) onto the centralized CcNotification model.
// It never mutates workflows — the provider calls these builders AFTER the
// original action has already done its work.

import {
  SEED_AUDIT_EVENTS,
  groupForAction,
  toneForAction,
  type AuditAction,
  type AuditEvent,
  type AuditGroup,
} from "@/data/audit";
import { companies } from "@/data/companies";
import { MEMBERS } from "@/data/members";
import { featuredOpportunities } from "@/data/opportunities";
import type {
  CcNotification,
  NotificationCategory,
  NotificationIcon,
  NotificationPriority,
  NotificationTone,
} from "@/data/notifications/types";

/** Everything except the fields the store assigns (id + status flags). */
export type NotificationDraft = Omit<
  CcNotification,
  "id" | "read" | "archived" | "pinned" | "dismissed" | "updatedAt"
>;

// ---- Deep linking -------------------------------------------------------

function slugUrl<T extends { id: string; slug: string }>(
  pool: T[],
  id: string,
  prefix: string,
  fallback: string
): string {
  const hit = pool.find((x) => x.id === id);
  return hit ? `${prefix}/${hit.slug}` : fallback;
}

/** Resolve the canonical in-app URL for an entity reference. */
export function urlForTarget(kind: string, id: string): string {
  switch (kind) {
    case "deal":
      return `/deal-desk/${id}`;
    case "company":
      return slugUrl(companies, id, "/company", "/companies");
    case "member":
      return slugUrl(MEMBERS, id, "/member", "/members");
    case "opportunity": {
      const hit = featuredOpportunities.find((o) => o.id === id);
      return hit ? `/opportunity/${hit.slug}` : "/opportunities";
    }
    case "listing":
      return `/dashboard/listings/${id}`;
    case "introduction":
      return "/dashboard/introductions";
    case "document":
      return "/documents";
    case "image":
      return "/dashboard/listings";
    case "calendar":
      return "/calendar";
    case "role":
      return "/admin/members";
    case "marketplace":
      return "/admin/marketplace";
    default:
      return "/dashboard";
  }
}

// ---- Category / priority / icon mapping ---------------------------------

const GROUP_CATEGORY: Record<AuditGroup, NotificationCategory> = {
  "Role Management": "Admin",
  "Member Actions": "Members",
  "Company Actions": "Companies",
  "Opportunity Actions": "Opportunities",
  "Listing Actions": "Listings",
  "Image Actions": "Images",
  "Document Actions": "Documents",
  "Deal Actions": "Deals",
  "Introduction Actions": "Introductions",
  "Moderation Actions": "Moderation",
  "Calendar Actions": "Calendar",
  "Marketplace Actions": "Admin",
  "System Actions": "System",
};

const GROUP_PRIORITY: Record<AuditGroup, NotificationPriority> = {
  "Role Management": "High",
  "Member Actions": "Normal",
  "Company Actions": "Normal",
  "Opportunity Actions": "Normal",
  "Listing Actions": "Normal",
  "Image Actions": "Low",
  "Document Actions": "Normal",
  "Deal Actions": "High",
  "Introduction Actions": "Normal",
  "Moderation Actions": "High",
  "Calendar Actions": "Normal",
  "Marketplace Actions": "Info",
  "System Actions": "Info",
};

const GROUP_ICON: Record<AuditGroup, NotificationIcon> = {
  "Role Management": "gavel",
  "Member Actions": "user",
  "Company Actions": "building",
  "Opportunity Actions": "sparkles",
  "Listing Actions": "bookmark",
  "Image Actions": "image",
  "Document Actions": "file-text",
  "Deal Actions": "handshake",
  "Introduction Actions": "user-plus",
  "Moderation Actions": "shield-alert",
  "Calendar Actions": "calendar",
  "Marketplace Actions": "settings",
  "System Actions": "megaphone",
};

/** Escalations above the group default. */
const PRIORITY_OVERRIDES: Partial<Record<AuditAction, NotificationPriority>> = {
  "Member Banned": "Critical",
  "Member Suspended": "Critical",
  "Suspension Extended": "Critical",
  "Report Escalated": "Critical",
  "Content Escalated": "Critical",
  "Introduction Approved": "High",
  "Introduction Rejected": "High",
  "Introduction Converted": "High",
  "Company Verified": "High",
  "Opportunity Approved": "High",
  "Opportunity Rejected": "High",
  "Access Approved": "High",
  "Access Denied": "High",
  "Listing Deleted": "High",
  "Member Warned": "High",
  "Deal Archived": "Normal",
  "Deal Restored": "Normal",
};

const AUDIT_TONE: Record<string, NotificationTone> = {
  emerald: "success",
  amber: "gold",
  rose: "danger",
  sky: "info",
  violet: "violet",
};

function describeAudit(e: {
  targetLabel?: string;
  targetId: string;
  detail?: string;
  before?: string;
  after?: string;
}): string {
  const parts: string[] = [];
  parts.push(e.targetLabel ?? e.targetId);
  if (e.before && e.after) parts.push(`${e.before} → ${e.after}`);
  if (e.detail) parts.push(e.detail);
  return parts.join(" · ");
}

/**
 * Build a notification draft from an audit event. Returns null only for
 * actions that should never surface (none today — full coverage by design).
 */
export function draftFromAudit(e: AuditEvent): NotificationDraft {
  const group = groupForAction(e.action);
  return {
    createdAt: e.createdAt,
    category: GROUP_CATEGORY[group],
    priority: PRIORITY_OVERRIDES[e.action] ?? GROUP_PRIORITY[group],
    actorName: e.actorName,
    actorRole: e.actorRole,
    targetKind: e.targetKind,
    targetId: e.targetId,
    targetName: e.targetLabel,
    targetUrl: urlForTarget(e.targetKind, e.targetId),
    title: e.action,
    description: describeAudit(e),
    icon: GROUP_ICON[group],
    tone: AUDIT_TONE[toneForAction(e.action)] ?? "neutral",
    action: { label: "Open record", href: urlForTarget(e.targetKind, e.targetId) },
    metadata: {
      auditAction: e.action,
      ...(e.before ? { before: e.before } : {}),
      ...(e.after ? { after: e.after } : {}),
      ...(e.detail ? { detail: e.detail } : {}),
    },
    groupId: `${e.targetKind}:${e.targetId}`,
    source: "audit",
    generatedBy: e.action,
  };
}

// ---- Legacy push mapping (messages / calendar / documents) ---------------

const PUSH_CATEGORY: Record<string, NotificationCategory> = {
  message: "Messages",
  attachment: "Messages",
  negotiation_update: "Messages",
  company_response: "Messages",
  calendar_event: "Calendar",
  calendar_deadline: "Calendar",
  calendar_overdue: "Calendar",
  calendar_reminder: "Calendar",
};

const PUSH_ICON: Record<string, NotificationIcon> = {
  message: "message",
  attachment: "message",
  negotiation_update: "handshake",
  company_response: "building",
  calendar_event: "calendar",
  calendar_deadline: "calendar",
  calendar_overdue: "calendar",
  calendar_reminder: "calendar",
};

const PUSH_PRIORITY: Record<string, NotificationPriority> = {
  message: "Normal",
  attachment: "Normal",
  negotiation_update: "High",
  company_response: "Normal",
  calendar_event: "Normal",
  calendar_deadline: "High",
  calendar_overdue: "Critical",
  calendar_reminder: "Normal",
};

export function draftFromPush(input: {
  kind: string;
  title: string;
  body?: string;
  href?: string;
  companyId?: string;
  createdAt: string;
  actorName: string;
  actorRole: string;
}): NotificationDraft {
  const category = PUSH_CATEGORY[input.kind] ?? "Messages";
  return {
    createdAt: input.createdAt,
    category,
    priority: PUSH_PRIORITY[input.kind] ?? "Normal",
    actorName: input.actorName,
    actorRole: input.actorRole,
    targetKind: input.companyId ? "company" : category === "Calendar" ? "calendar" : "conversation",
    targetId: input.companyId ?? input.kind,
    targetName: input.title,
    targetUrl: input.href ?? (category === "Calendar" ? "/calendar" : "/messages"),
    title: input.title,
    description: input.body,
    icon: PUSH_ICON[input.kind] ?? "bell",
    tone: category === "Calendar" ? "info" : "gold",
    action: {
      label: category === "Calendar" ? "Open calendar" : "Open conversation",
      href: input.href ?? (category === "Calendar" ? "/calendar" : "/messages"),
    },
    groupId: input.companyId ? `company:${input.companyId}` : `push:${input.kind}`,
    source: "messaging",
    generatedBy: `push:${input.kind}`,
  };
}

// ---- Seeds ----------------------------------------------------------------

// Anchor matching the audit seed clock so read/unread is deterministic
// (no Date.now — this must be stable across SSR and hydration).
const SEED_ANCHOR_MS = Date.parse("2026-06-10T00:00:00Z");
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/** Deterministic starter notifications derived from the seeded audit trail. */
export const SEED_NOTIFICATIONS: CcNotification[] = SEED_AUDIT_EVENTS.map(
  (e, i) => {
    const draft = draftFromAudit(e);
    const ageMs = SEED_ANCHOR_MS - Date.parse(e.createdAt);
    return {
      ...draft,
      id: `NTF-${String(i + 1).padStart(6, "0")}`,
      updatedAt: e.createdAt,
      read: ageMs > THREE_DAYS_MS,
      archived: false,
      pinned: e.action === "Deal Stage Changed" && i === 0,
      dismissed: false,
      source: "seed",
    };
  }
);
