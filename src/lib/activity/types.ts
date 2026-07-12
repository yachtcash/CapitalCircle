// Unified activity language — pure presentation types. Every activity row
// anywhere on the platform renders from an ActivityEvent; each surface keeps
// its own domain derivation and maps into this shape. No business logic.

import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  FileText,
  Flag,
  HandCoins,
  Handshake,
  Image as ImageIcon,
  Layers,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ActivityEntity =
  | "opportunity"
  | "company"
  | "member"
  | "deal"
  | "calendar"
  | "notification"
  | "audit"
  | "moderation"
  | "listing"
  | "document"
  | "image"
  | "introduction"
  | "activity";

export type ActivityTone = "emerald" | "gold" | "sky" | "rose" | "violet" | "navy";

export type ActivityEvent = {
  id: string;
  entity: ActivityEntity;
  /** Action label — "Introduction requested", "Listing published"… */
  title: string;
  /** Context line — the entity name, reason, or description. */
  detail?: string;
  /** Optional actor name, shown before the detail. */
  actor?: string;
  /** Overrides the entity's default tone. */
  tone?: ActivityTone;
  /** Optional status badge (rendered with the canonical Badge). */
  badge?: { label: string; className: string };
  /** Optional deep link — the whole row becomes clickable. */
  href?: string;
  /** Optional square thumbnail (resolved image URL). */
  thumbnail?: string;
  /** Epoch ms — feeds sort newest-first and the shared timestamp. */
  dateMs: number;
};

/** One icon per entity — the visual vocabulary of the activity system. */
export const ENTITY_ICON: Record<ActivityEntity, LucideIcon> = {
  opportunity: HandCoins,
  company: Building2,
  member: Users,
  deal: Handshake,
  calendar: CalendarDays,
  notification: Bell,
  audit: ScrollText,
  moderation: Flag,
  listing: Layers,
  document: FileText,
  image: ImageIcon,
  introduction: Handshake,
  activity: Activity,
};

/** Default tone per entity — override per event where the action implies one. */
export const ENTITY_TONE: Record<ActivityEntity, ActivityTone> = {
  opportunity: "emerald",
  company: "sky",
  member: "gold",
  deal: "sky",
  calendar: "violet",
  notification: "gold",
  audit: "navy",
  moderation: "rose",
  listing: "gold",
  document: "violet",
  image: "sky",
  introduction: "violet",
  activity: "navy",
};

/** Icon tile tint classes — the single tone->classes map for activity tiles. */
export const ACTIVITY_TONE_TILE: Record<ActivityTone, string> = {
  emerald: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20",
  gold: "text-gold-700 bg-gold-500/10 ring-gold-500/25",
  sky: "text-sky-600 bg-sky-500/10 ring-sky-500/20",
  rose: "text-rose-600 bg-rose-500/10 ring-rose-500/20",
  violet: "text-violet-600 bg-violet-500/10 ring-violet-500/20",
  navy: "text-navy-700 bg-navy-900/[0.05] ring-navy-900/10",
};

export function sortNewestFirst(events: ActivityEvent[]): ActivityEvent[] {
  return [...events].sort((a, b) => b.dateMs - a.dateMs);
}
