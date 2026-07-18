"use client";

import type { DragEvent } from "react";
import {
  Users,
  Phone,
  Repeat,
  ClipboardCheck,
  MapPin,
  Landmark,
  SearchCheck,
  AlertCircle,
  CheckSquare,
  Bell,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import {
  categoryColor,
  type CalendarCategory,
  type CalendarEvent,
  type EventType,
  type EventPriority,
} from "@/data/calendar";
import type { EventOccurrence } from "@/lib/calendar/recurrence";
import { formatTime } from "@/lib/calendar/dates";
import { cn } from "@/lib/cn";

export type { EventOccurrence };

/**
 * Shared props contract every calendar view (Month / Week / Day / Agenda)
 * implements. The workspace owns state and expansion; views are presentational
 * + emit intents through these callbacks.
 */
export type CalendarViewProps = {
  /** Current viewport anchor date. */
  anchorDate: Date;
  /** Pre-expanded occurrences overlapping the visible range. */
  occurrences: EventOccurrence[];
  categories: CalendarCategory[];
  /** Whether the current user may create / move events. */
  canEdit: boolean;
  /** Open the detail panel for an occurrence. */
  onSelectEvent: (occ: EventOccurrence) => void;
  /** Open the create modal prefilled at a slot. */
  onCreateAt: (start: Date, allDay: boolean) => void;
  /** Persist a move/resize. end must be >= start. */
  onMoveEvent: (eventId: string, newStartISO: string, newEndISO: string) => void;
  /** Month-as-navigation: the day highlighted in the schedule sidebar. */
  selectedDate?: Date;
  /** Month-as-navigation: a day cell was clicked — update the sidebar. */
  onSelectDay?: (day: Date) => void;
};

export const TYPE_ICON: Record<EventType, LucideIcon> = {
  Meeting: Users,
  Call: Phone,
  "Follow Up": Repeat,
  Inspection: ClipboardCheck,
  "Property Tour": MapPin,
  "Investor Meeting": Landmark,
  "Due Diligence": SearchCheck,
  Deadline: AlertCircle,
  Task: CheckSquare,
  Reminder: Bell,
  "Custom Event": CalendarDays,
};

export const PRIORITY_TONE: Record<EventPriority, string> = {
  Urgent: "bg-rose-500/15 text-rose-700 ring-rose-500/30",
  High: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  Medium: "bg-sky-500/15 text-sky-700 ring-sky-500/30",
  Low: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
};

export const STATUS_TONE: Record<string, string> = {
  Scheduled: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
  Confirmed: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  Tentative: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  Completed: "bg-sky-500/15 text-sky-700 ring-sky-500/30",
  Cancelled: "bg-rose-500/15 text-rose-700 ring-rose-500/30",
};

const DRAG_MIME = "application/x-cc-event";

/** Set the dragged event id on a drag start. Returns false if editing is off. */
export function setEventDrag(e: DragEvent, eventId: string, canEdit: boolean): boolean {
  if (!canEdit) return false;
  e.dataTransfer.setData(DRAG_MIME, eventId);
  e.dataTransfer.setData("text/plain", eventId);
  e.dataTransfer.effectAllowed = "move";
  return true;
}

/** Read the dragged event id from a drop event. */
export function getEventDrag(e: DragEvent): string | null {
  return e.dataTransfer.getData(DRAG_MIME) || e.dataTransfer.getData("text/plain") || null;
}

/** Tint a hex color to a translucent rgba string for chip backgrounds. */
export function tint(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * A single event rendered as a colored chip (month / agenda) or a positioned
 * block (week / day). Draggable when canEdit. The view positions the block via
 * `style`/className; the chip handles its own compact layout.
 */
export function EventChip({
  occ,
  categories,
  canEdit,
  onClick,
  variant = "chip",
  className,
  style,
}: {
  occ: EventOccurrence;
  categories: CalendarCategory[];
  canEdit: boolean;
  onClick: () => void;
  variant?: "chip" | "block" | "dot";
  className?: string;
  style?: React.CSSProperties;
}) {
  const color = categoryColor(occ.event, categories);
  const Icon = TYPE_ICON[occ.event.type];
  const cancelled = occ.event.status === "Cancelled";

  if (variant === "dot") {
    return (
      <button
        type="button"
        onClick={onClick}
        draggable={canEdit}
        onDragStart={(e) => setEventDrag(e, occ.event.id, canEdit)}
        title={occ.event.title}
        className={cn("flex items-center gap-1 w-full text-left truncate group/chip", className)}
        style={style}
      >
        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className={cn("text-[10px] text-navy-900/80 truncate", cancelled && "line-through opacity-60")}>
          {occ.event.allDay ? "" : formatTime(occ.start) + " "}
          {occ.event.title}
        </span>
      </button>
    );
  }

  if (variant === "block") {
    return (
      <button
        type="button"
        onClick={onClick}
        draggable={canEdit}
        onDragStart={(e) => setEventDrag(e, occ.event.id, canEdit)}
        className={cn(
          "absolute left-1 right-1 rounded-lg px-2 py-1 text-left overflow-hidden ring-1 transition-shadow hover:shadow-md group/chip",
          cancelled && "opacity-60",
          className
        )}
        style={{ backgroundColor: tint(color, 0.16), borderColor: color, ...style }}
      >
        <span className="absolute inset-y-0 left-0 w-1 rounded-l-lg" style={{ backgroundColor: color }} />
        <span className="block pl-1.5">
          <span className={cn("block text-[11px] font-semibold text-navy-900 truncate", cancelled && "line-through")}>
            {occ.event.title}
          </span>
          <span className="block text-[10px] text-navy-700/70 truncate">
            {formatTime(occ.start)}
            {occ.isRecurring ? " · ↻" : ""}
          </span>
        </span>
      </button>
    );
  }

  // default chip
  return (
    <button
      type="button"
      onClick={onClick}
      draggable={canEdit}
      onDragStart={(e) => setEventDrag(e, occ.event.id, canEdit)}
      title={occ.event.title}
      className={cn(
        "flex items-center gap-1.5 w-full rounded-md px-1.5 py-0.5 text-left ring-1 hover:shadow-sm transition-shadow group/chip",
        cancelled && "opacity-60",
        className
      )}
      style={{ backgroundColor: tint(color, 0.14), borderColor: tint(color, 0.4) }}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.2} style={{ color }} />
      <span className={cn("text-[10px] font-medium text-navy-900 truncate", cancelled && "line-through")}>
        {!occ.event.allDay ? <span className="text-navy-700/60">{formatTime(occ.start)} </span> : null}
        {occ.event.title}
        {occ.isRecurring ? " ↻" : ""}
      </span>
    </button>
  );
}

/** Format a label for an occurrence (used by agenda / detail). */
export function occRangeLabel(occ: EventOccurrence): string {
  if (occ.event.allDay) return "All day";
  return `${formatTime(occ.start)} – ${formatTime(occ.end)}`;
}

export { categoryColor };
export type { CalendarCategory, CalendarEvent };
