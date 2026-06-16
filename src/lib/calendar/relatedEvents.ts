// Selectors that surface calendar events on related records (deal, opportunity,
// company, member, introduction). Pure; expansion-aware.

import type { CalendarEvent, EventRelations, EventType } from "@/data/calendar";
import { expandAll, type EventOccurrence } from "./recurrence";

/**
 * True if the event is linked to the given relation. The relation usually
 * carries a single id (e.g. { dealId }); the event matches when any provided,
 * truthy relation key equals the event's corresponding relation field.
 */
export function matchesRelation(
  eventRelations: EventRelations,
  relation: EventRelations
): boolean {
  const keys = Object.keys(relation) as (keyof EventRelations)[];
  return keys.some((k) => {
    const want = relation[k];
    return !!want && eventRelations[k] === want;
  });
}

/** Events linked to `relation`, expanded into occurrences over [start, end]. */
export function relatedOccurrences(
  events: CalendarEvent[],
  relation: EventRelations,
  rangeStart: Date,
  rangeEnd: Date
): EventOccurrence[] {
  const linked = events.filter((e) => matchesRelation(e.relations, relation));
  return expandAll(linked, rangeStart, rangeEnd);
}

export type SplitOccurrences = {
  upcoming: EventOccurrence[];
  past: EventOccurrence[];
};

/** Split occurrences into upcoming (start >= now) and past (start < now). */
export function splitByNow(occ: EventOccurrence[], nowMs: number): SplitOccurrences {
  const upcoming: EventOccurrence[] = [];
  const past: EventOccurrence[] = [];
  for (const o of occ) {
    if (o.start.getTime() >= nowMs) upcoming.push(o);
    else past.push(o);
  }
  upcoming.sort((a, b) => a.start.getTime() - b.start.getTime());
  past.sort((a, b) => b.start.getTime() - a.start.getTime());
  return { upcoming, past };
}

/** First upcoming occurrence whose event type is in `types`. */
export function nextOfTypes(
  upcoming: EventOccurrence[],
  types: EventType[]
): EventOccurrence | undefined {
  return upcoming.find((o) => types.includes(o.event.type));
}

/** Count upcoming occurrences whose event type is in `types`. */
export function countOfTypes(
  upcoming: EventOccurrence[],
  types: EventType[]
): number {
  return upcoming.filter((o) => types.includes(o.event.type)).length;
}
