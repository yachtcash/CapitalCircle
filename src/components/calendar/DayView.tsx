"use client";

import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import { CalendarClock } from "lucide-react";
import {
  EventChip,
  getEventDrag,
  type CalendarViewProps,
  type EventOccurrence,
} from "@/components/calendar/shared";
import {
  DAY_HOURS,
  formatHour,
  dayLabelLong,
  sameDay,
  startOfDay,
  minutesSinceMidnight,
  durationMs,
} from "@/lib/calendar/dates";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { cn } from "@/lib/cn";

const HOUR_PX = 56;
const MINUTES_PER_DAY = 24 * 60;

type LaidOut = {
  occ: EventOccurrence;
  /** Minutes from midnight (clamped to the day). */
  topMin: number;
  /** Visible height in minutes (clamped, min for legibility). */
  heightMin: number;
  /** Column index within its overlap group. */
  col: number;
  /** Total columns in its overlap group. */
  cols: number;
};

/**
 * Group timed occurrences into overlap clusters and assign each a column so
 * concurrent events sit side-by-side. Greedy interval-graph coloring: events
 * are walked in start order; a new cluster begins whenever an event starts
 * after every active event has ended.
 */
function layoutTimed(occs: EventOccurrence[], dayStart: Date): LaidOut[] {
  const dayStartMs = dayStart.getTime();
  const dayEndMs = dayStartMs + MINUTES_PER_DAY * 60_000;

  const items = occs
    .map((occ) => {
      const sMs = Math.max(occ.start.getTime(), dayStartMs);
      const eMs = Math.min(occ.end.getTime(), dayEndMs);
      const topMin = Math.round((sMs - dayStartMs) / 60_000);
      const rawHeight = Math.round((eMs - sMs) / 60_000);
      return {
        occ,
        topMin: Math.min(Math.max(0, topMin), MINUTES_PER_DAY - 1),
        // keep a floor so very short events stay tappable
        heightMin: Math.max(24, rawHeight),
        startMs: sMs,
        endMs: eMs,
      };
    })
    .sort((a, b) => a.startMs - b.startMs || b.endMs - a.endMs);

  const out: LaidOut[] = [];
  let cluster: typeof items = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (!cluster.length) return;
    // Pack columns: reuse the first column whose last event has ended.
    const colEnds: number[] = [];
    const assigned = cluster.map((it) => {
      let c = colEnds.findIndex((end) => end <= it.startMs);
      if (c === -1) {
        c = colEnds.length;
        colEnds.push(it.endMs);
      } else {
        colEnds[c] = it.endMs;
      }
      return c;
    });
    const cols = colEnds.length;
    cluster.forEach((it, i) => {
      out.push({
        occ: it.occ,
        topMin: it.topMin,
        heightMin: it.heightMin,
        col: assigned[i],
        cols,
      });
    });
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const it of items) {
    if (cluster.length && it.startMs >= clusterEnd) flush();
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.endMs);
  }
  flush();

  return out;
}

export default function DayView({
  anchorDate,
  occurrences,
  categories,
  canEdit,
  onSelectEvent,
  onCreateAt,
  onMoveEvent,
}: CalendarViewProps) {
  const [dragHour, setDragHour] = useState<number | null>(null);

  const dayStart = useMemo(() => startOfDay(anchorDate), [anchorDate]);

  const allDay = useMemo(
    () => occurrences.filter((o) => o.event.allDay && sameDay(o.start, anchorDate)),
    [occurrences, anchorDate]
  );

  const timed = useMemo(
    () =>
      occurrences.filter(
        (o) =>
          !o.event.allDay &&
          // any portion of the occurrence falls on the anchor day
          o.start.getTime() < dayStart.getTime() + MINUTES_PER_DAY * 60_000 &&
          o.end.getTime() > dayStart.getTime()
      ),
    [occurrences, dayStart]
  );

  const laidOut = useMemo(() => layoutTimed(timed, dayStart), [timed, dayStart]);

  const isToday = sameDay(new Date(DEAL_DESK_NOW_MS), anchorDate);
  const nowMin = isToday ? minutesSinceMidnight(new Date(DEAL_DESK_NOW_MS)) : null;

  const slotDate = (hour: number) => {
    const d = new Date(dayStart);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const handleDrop = (e: DragEvent, hour: number) => {
    e.preventDefault();
    setDragHour(null);
    if (!canEdit) return;
    const eventId = getEventDrag(e);
    if (!eventId) return;
    const dragged = occurrences.find((o) => o.event.id === eventId);
    if (!dragged) return;
    const newStart = slotDate(hour);
    const duration = durationMs(dragged.event.start, dragged.event.end);
    const newEnd = new Date(newStart.getTime() + duration);
    onMoveEvent(eventId, newStart.toISOString(), newEnd.toISOString());
  };

  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-navy-900/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-gold-700" strokeWidth={2.2} />
          <h2 className="text-sm font-semibold text-navy-900">{dayLabelLong(anchorDate)}</h2>
        </div>
        {isToday ? (
          <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-700 ring-1 ring-gold-500/30">
            Today
          </span>
        ) : null}
      </div>

      {/* All-day row */}
      {allDay.length > 0 ? (
        <div className="flex items-start gap-2 border-b border-navy-900/[0.06] bg-bone/40 px-3 py-2">
          <div className="w-16 shrink-0 pt-0.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-navy-700/60">
            All day
          </div>
          <div className="flex flex-1 flex-col gap-1">
            {allDay.map((occ) => (
              <EventChip
                key={occ.occurrenceId}
                occ={occ}
                categories={categories}
                canEdit={canEdit}
                onClick={() => onSelectEvent(occ)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Hour grid */}
      <div className="relative" style={{ height: DAY_HOURS.length * HOUR_PX }}>
        {/* Background hour rows + clickable create slots */}
        {DAY_HOURS.map((hour) => (
          <div
            key={hour}
            className={cn(
              "absolute left-0 right-0 flex border-b border-navy-900/[0.05]",
              dragHour === hour && "bg-gold-500/[0.08]"
            )}
            style={{ top: hour * HOUR_PX, height: HOUR_PX }}
            onDragOver={(e) => {
              e.preventDefault();
              if (canEdit) setDragHour(hour);
            }}
            onDragLeave={() => setDragHour((h) => (h === hour ? null : h))}
            onDrop={(e) => handleDrop(e, hour)}
          >
            <div className="w-16 shrink-0 -translate-y-2 pr-2 text-right text-[10px] font-medium text-navy-700/50">
              {hour === 0 ? "" : formatHour(hour)}
            </div>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => canEdit && onCreateAt(slotDate(hour), false)}
              aria-label={canEdit ? `Create event at ${formatHour(hour)}` : undefined}
              className={cn(
                "flex-1",
                canEdit ? "cursor-pointer hover:bg-navy-900/[0.02]" : "cursor-default"
              )}
            />
          </div>
        ))}

        {/* Current-time marker */}
        {nowMin !== null ? (
          <div
            className="pointer-events-none absolute left-16 right-1 z-20 flex items-center"
            style={{ top: (nowMin / 60) * HOUR_PX }}
          >
            <span className="h-2 w-2 -translate-x-1 rounded-full bg-rose-500 ring-2 ring-white" />
            <span className="h-px flex-1 bg-rose-500/70" />
          </div>
        ) : null}

        {/* Positioned event blocks */}
        <div className="pointer-events-none absolute inset-y-0 left-16 right-1 z-10">
          {laidOut.map(({ occ, topMin, heightMin, col, cols }) => {
            const widthPct = 100 / cols;
            return (
              <EventChip
                key={occ.occurrenceId}
                occ={occ}
                categories={categories}
                canEdit={canEdit}
                onClick={() => onSelectEvent(occ)}
                variant="block"
                className="pointer-events-auto !left-0 !right-auto"
                style={{
                  top: (topMin / 60) * HOUR_PX,
                  height: Math.max(20, (heightMin / 60) * HOUR_PX - 2),
                  width: `calc(${widthPct}% - 4px)`,
                  left: `calc(${col * widthPct}% + 2px)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
