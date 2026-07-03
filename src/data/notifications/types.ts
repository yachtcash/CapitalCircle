// Capital Circle notification engine — data model.
//
// This is the centralized notification record consumed by the bell, the
// Notification Center, and (later) email / SMS / push delivery channels.
// The engine only generates and stores these; delivery integrations are
// out of scope and simply read this model later.

export type NotificationCategory =
  | "Deals"
  | "Introductions"
  | "Companies"
  | "Members"
  | "Opportunities"
  | "Listings"
  | "Messages"
  | "Calendar"
  | "Documents"
  | "Images"
  | "Moderation"
  | "Admin"
  | "System"
  | "Announcements";

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "Deals",
  "Introductions",
  "Companies",
  "Members",
  "Opportunities",
  "Listings",
  "Messages",
  "Calendar",
  "Documents",
  "Images",
  "Moderation",
  "Admin",
  "System",
  "Announcements",
];

export type NotificationPriority = "Critical" | "High" | "Normal" | "Low" | "Info";

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = [
  "Critical",
  "High",
  "Normal",
  "Low",
  "Info",
];

/** Icon key — mapped to a Lucide component in the UI layer. */
export type NotificationIcon =
  | "handshake"
  | "user-plus"
  | "building"
  | "user"
  | "sparkles"
  | "file-text"
  | "image"
  | "calendar"
  | "message"
  | "shield"
  | "shield-alert"
  | "gavel"
  | "megaphone"
  | "settings"
  | "trending-up"
  | "bookmark"
  | "bell";

export type NotificationTone =
  | "neutral"
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "violet"
  | "navy";

export type NotificationAction = {
  label: string;
  href: string;
};

export type CcNotification = {
  id: string; // "NTF-000001"
  createdAt: string; // ISO
  updatedAt: string; // ISO — bumped on read/pin/archive/dismiss
  category: NotificationCategory;
  priority: NotificationPriority;

  actorId?: string;
  actorName: string;
  actorRole: string;

  targetKind: string; // entity type ("deal", "company", "member", …)
  targetId: string;
  targetName?: string;
  targetUrl?: string; // deep link into the app

  title: string;
  description?: string;
  icon: NotificationIcon;
  tone: NotificationTone;

  read: boolean;
  archived: boolean;
  pinned: boolean;
  dismissed: boolean;
  expiresAt?: string; // ISO — hidden from surfaces after this moment

  action?: NotificationAction;
  secondaryAction?: NotificationAction;

  metadata?: Record<string, string>;
  groupId: string; // e.g. "deal:DEAL-000001" — used for entity grouping
  source: "audit" | "messaging" | "system" | "seed";
  generatedBy: string; // the audit action or push kind that produced it
};

// ---- Preferences (stored only — delivery integrations come later) ----

export type NotificationChannelPrefs = {
  inApp: boolean;
  email: boolean; // future
  sms: boolean; // future
  push: boolean; // future
};

export type NotificationPreferences = Record<NotificationCategory, NotificationChannelPrefs>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences =
  Object.fromEntries(
    NOTIFICATION_CATEGORIES.map((c) => [
      c,
      { inApp: true, email: false, sms: false, push: false },
    ])
  ) as NotificationPreferences;
