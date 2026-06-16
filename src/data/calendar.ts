// Calendar Phase 1 — data model.
//
// Events, categories, and a per-member calendar-edit grant live in the
// MessagingProvider (persisted to localStorage). Every mutation also writes a
// central AuditEvent. Attachments reuse the verified imageStore (idb:// tokens)
// — no second upload system. All demo date math anchors on DEAL_DESK_NOW_MS so
// SSG output and client hydration agree.

import { DEAL_DESK_NOW_MS } from "@/data/deals";

export type EventType =
  | "Meeting"
  | "Call"
  | "Follow Up"
  | "Inspection"
  | "Property Tour"
  | "Investor Meeting"
  | "Due Diligence"
  | "Deadline"
  | "Task"
  | "Reminder"
  | "Custom Event";

export const EVENT_TYPES: EventType[] = [
  "Meeting",
  "Call",
  "Follow Up",
  "Inspection",
  "Property Tour",
  "Investor Meeting",
  "Due Diligence",
  "Deadline",
  "Task",
  "Reminder",
  "Custom Event",
];

export type EventPriority = "Low" | "Medium" | "High" | "Urgent";
export const EVENT_PRIORITIES: EventPriority[] = ["Low", "Medium", "High", "Urgent"];

export type EventStatus =
  | "Scheduled"
  | "Confirmed"
  | "Tentative"
  | "Completed"
  | "Cancelled";
export const EVENT_STATUSES: EventStatus[] = [
  "Scheduled",
  "Confirmed",
  "Tentative",
  "Completed",
  "Cancelled",
];

export type RecurrenceFreq =
  | "None"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Yearly"
  | "Custom";
export const RECURRENCE_FREQS: RecurrenceFreq[] = [
  "None",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Custom",
];

export type Recurrence = {
  freq: RecurrenceFreq;
  /** Step size for the Custom frequency (every N days). */
  interval?: number;
  /** ISO date the recurrence ends; absent = never ends. */
  until?: string;
};

export type EventAttachment = {
  id: string;
  /** idb:// token (preferred) or a remote URL. */
  token: string;
  name: string;
  kind: "image" | "pdf" | "file";
  size?: number;
};

export type EventRelations = {
  memberId?: string;
  companyId?: string;
  opportunityId?: string;
  dealId?: string;
  introductionId?: string;
};

export type EventHistoryEntry = {
  at: string;
  actor: string;
  action: string;
  detail?: string;
};

export type CalendarEvent = {
  id: string; // "EVT-000001"
  title: string;
  description?: string;
  /** Rich-text notes stored as a small Markdown subset. */
  notes?: string;
  type: EventType;
  categoryId: string;
  /** Optional per-event color override; otherwise the category color is used. */
  color?: string;
  priority: EventPriority;
  status: EventStatus;
  allDay: boolean;
  start: string; // ISO
  end: string; // ISO
  location?: string;
  relations: EventRelations;
  attachments: EventAttachment[];
  recurrence: Recurrence;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  history: EventHistoryEntry[];
};

export type CalendarCategory = {
  id: string;
  name: string;
  color: string; // hex
  removable?: boolean;
};

/** Default color categories. Names + colors are editable; defaults aren't removable. */
export const DEFAULT_CATEGORIES: CalendarCategory[] = [
  { id: "meetings", name: "Meetings", color: "#294378", removable: false },
  { id: "calls", name: "Calls", color: "#10b981", removable: false },
  { id: "deals", name: "Deals", color: "#D4AF37", removable: false },
  { id: "investors", name: "Investors", color: "#8b5cf6", removable: false },
  { id: "properties", name: "Properties", color: "#0ea5e9", removable: false },
  { id: "tasks", name: "Tasks", color: "#f59e0b", removable: false },
  { id: "personal", name: "Personal", color: "#ef4444", removable: false },
  { id: "custom", name: "Custom", color: "#64748b", removable: false },
];

/** Suggested type → category mapping used when creating events from a type. */
export const TYPE_DEFAULT_CATEGORY: Record<EventType, string> = {
  Meeting: "meetings",
  Call: "calls",
  "Follow Up": "tasks",
  Inspection: "properties",
  "Property Tour": "properties",
  "Investor Meeting": "investors",
  "Due Diligence": "deals",
  Deadline: "tasks",
  Task: "tasks",
  Reminder: "personal",
  "Custom Event": "custom",
};

export const PRIORITY_RANK: Record<EventPriority, number> = {
  Urgent: 3,
  High: 2,
  Medium: 1,
  Low: 0,
};

// ---- Seeds ----

const D = 24 * 60 * 60 * 1000;
/** Build an ISO timestamp `dayOffset` days from the demo anchor at HH:MM local. */
function at(dayOffset: number, hour = 9, minute = 0): string {
  const d = new Date(DEAL_DESK_NOW_MS + dayOffset * D);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
/** All-day marker: midnight of the offset day. */
function day(dayOffset: number): string {
  const d = new Date(DEAL_DESK_NOW_MS + dayOffset * D);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

let n = 0;
const id = () => `EVT-${String(++n).padStart(6, "0")}`;
const NOW_ISO = new Date(DEAL_DESK_NOW_MS).toISOString();

function ev(e: Partial<CalendarEvent> & Pick<CalendarEvent, "title" | "type" | "start" | "end">): CalendarEvent {
  const categoryId = e.categoryId ?? TYPE_DEFAULT_CATEGORY[e.type];
  return {
    id: id(),
    title: e.title,
    description: e.description,
    notes: e.notes,
    type: e.type,
    categoryId,
    color: e.color,
    priority: e.priority ?? "Medium",
    status: e.status ?? "Scheduled",
    allDay: e.allDay ?? false,
    start: e.start,
    end: e.end,
    location: e.location,
    relations: e.relations ?? {},
    attachments: e.attachments ?? [],
    recurrence: e.recurrence ?? { freq: "None" },
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    createdBy: "Stevie Cabrera",
    history: [{ at: NOW_ISO, actor: "Stevie Cabrera", action: "Event Created" }],
  };
}

export const SEED_CALENDAR_EVENTS: CalendarEvent[] = [
  ev({
    title: "Investor Meeting — Aurora Capital",
    type: "Investor Meeting",
    priority: "High",
    status: "Confirmed",
    start: at(0, 10, 0),
    end: at(0, 11, 0),
    location: "Zoom",
    description: "Walk through the Solar Farm equity tranche.",
    notes: "**Agenda**\n- DSCR model\n- PPA structure\n- Timeline to close",
    relations: { companyId: "COMP-000002", dealId: "DEAL-000001" },
  }),
  ev({
    title: "Due Diligence Call — Beachfront Hotel",
    type: "Call",
    priority: "Medium",
    start: at(0, 14, 30),
    end: at(0, 15, 0),
    relations: { opportunityId: "cc-001" },
  }),
  ev({
    title: "LOI Deadline — Mixed-Use Tower",
    type: "Deadline",
    priority: "Urgent",
    status: "Scheduled",
    allDay: true,
    start: day(-1),
    end: day(-1),
    description: "Letter of intent due to sponsor.",
    relations: { opportunityId: "cc-002" },
  }),
  ev({
    title: "Property Tour — Coastal Land",
    type: "Property Tour",
    priority: "Medium",
    start: at(1, 9, 0),
    end: at(1, 12, 0),
    location: "Cabo San Lucas",
    relations: { opportunityId: "cc-003" },
  }),
  ev({
    title: "Weekly Pipeline Review",
    type: "Meeting",
    priority: "Medium",
    status: "Confirmed",
    start: at(2, 16, 0),
    end: at(2, 17, 0),
    recurrence: { freq: "Weekly" },
    notes: "Standing review of all open deals.",
  }),
  ev({
    title: "Follow Up — Helena Ortega",
    type: "Follow Up",
    priority: "Low",
    start: at(3, 11, 0),
    end: at(3, 11, 30),
    relations: { memberId: "MEM-000002" },
  }),
  ev({
    title: "Site Inspection — Industrial Park",
    type: "Inspection",
    priority: "High",
    start: at(4, 13, 0),
    end: at(4, 16, 0),
  }),
  ev({
    title: "Quarterly Investor Update",
    type: "Reminder",
    priority: "Medium",
    allDay: true,
    start: day(7),
    end: day(7),
    recurrence: { freq: "Monthly" },
  }),
  ev({
    title: "Prepare Q3 Deck",
    type: "Task",
    priority: "High",
    status: "Scheduled",
    start: at(-2, 9, 0),
    end: at(-2, 18, 0),
    description: "Overdue — finalize the investor deck.",
  }),
];

// ---- Helpers ----

export function categoryColor(
  event: Pick<CalendarEvent, "color" | "categoryId">,
  categories: CalendarCategory[]
): string {
  if (event.color) return event.color;
  return categories.find((c) => c.id === event.categoryId)?.color ?? "#64748b";
}

export function attachmentKind(fileType: string, name: string): EventAttachment["kind"] {
  if (fileType.startsWith("image/")) return "image";
  if (fileType === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
  return "file";
}
