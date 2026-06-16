// Recurrence expansion — turns a CalendarEvent's recurrence rule into concrete
// occurrences within a [rangeStart, rangeEnd] window. Pure; capped to avoid
// runaway loops.

import type { CalendarEvent } from "@/data/calendar";
import { addDays, addMonths, addYears, rangesOverlap } from "./dates";

export type EventOccurrence = {
  event: CalendarEvent;
  /** Concrete start/end for this occurrence (recurrence-shifted). */
  start: Date;
  end: Date;
  /** Stable id: `${event.id}@${startMs}` — unique per occurrence. */
  occurrenceId: string;
  /** True when this is a recurrence instance after the first. */
  isRecurring: boolean;
};

const MAX_OCCURRENCES = 750;

function step(freq: CalendarEvent["recurrence"]["freq"], from: Date, interval: number): Date {
  switch (freq) {
    case "Daily":
      return addDays(from, 1);
    case "Weekly":
      return addDays(from, 7);
    case "Monthly":
      return addMonths(from, 1);
    case "Yearly":
      return addYears(from, 1);
    case "Custom":
      return addDays(from, Math.max(1, interval));
    default:
      return addDays(from, 1);
  }
}

/** Expand a single event into occurrences overlapping [rangeStart, rangeEnd]. */
export function expandEvent(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date
): EventOccurrence[] {
  const baseStart = new Date(event.start);
  const baseEnd = new Date(event.end);
  const duration = Math.max(0, baseEnd.getTime() - baseStart.getTime());
  const freq = event.recurrence?.freq ?? "None";
  const interval = event.recurrence?.interval ?? 1;
  const until = event.recurrence?.until ? new Date(event.recurrence.until) : null;

  if (freq === "None") {
    if (rangesOverlap(baseStart, baseEnd, rangeStart, rangeEnd)) {
      return [
        {
          event,
          start: baseStart,
          end: baseEnd,
          occurrenceId: `${event.id}@${baseStart.getTime()}`,
          isRecurring: false,
        },
      ];
    }
    return [];
  }

  const out: EventOccurrence[] = [];
  let cursor = new Date(baseStart);
  let count = 0;
  let first = true;
  while (count < MAX_OCCURRENCES) {
    if (cursor.getTime() > rangeEnd.getTime()) break;
    if (until && cursor.getTime() > until.getTime()) break;
    const occEnd = new Date(cursor.getTime() + duration);
    if (rangesOverlap(cursor, occEnd, rangeStart, rangeEnd)) {
      out.push({
        event,
        start: new Date(cursor),
        end: occEnd,
        occurrenceId: `${event.id}@${cursor.getTime()}`,
        isRecurring: !first,
      });
    }
    cursor = step(freq, cursor, interval);
    count += 1;
    first = false;
  }
  return out;
}

/** Expand every event and return occurrences sorted by start time. */
export function expandAll(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date
): EventOccurrence[] {
  const out: EventOccurrence[] = [];
  for (const e of events) out.push(...expandEvent(e, rangeStart, rangeEnd));
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

export function describeRecurrence(r: CalendarEvent["recurrence"]): string {
  if (!r || r.freq === "None") return "Does not repeat";
  const base =
    r.freq === "Custom" ? `Every ${Math.max(1, r.interval ?? 1)} days` : `${r.freq}`;
  const tail = r.until ? ` until ${new Date(r.until).toLocaleDateString()}` : " · never ends";
  return base + tail;
}
