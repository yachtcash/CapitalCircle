"use client";

import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
  CalendarViewProps,
  EventChip,
  EventOccurrence,
  getEventDrag,
} from "@/components/calendar/shared";
import {
  weekDays,
  DAY_HOURS,
  WEEKDAY_LABELS,
  formatHour,
  sameDay,
  minutesSinceMidnight,
  durationMs,
} from "@/lib/calendar/dates";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { cn } from "@/lib/cn";

const HOUR_PX = 48;
const GRID_PX = 24 * HOUR_PX;

export default function WeekView({
  anchorDate,
  occurrences,
  categories,
  canEdit,
  onSelectEvent,
  onCreateAt,
  onMoveEvent,
}: CalendarViewProps) {
  const days = useMemo(() => weekDays(anchorDate), [anchorDate]);
  const now = new Date(DEAL_DESK_NOW_MS);

  // Drop target highlight: "dayIdx:hour" while a drag hovers an hour slot.
  const [dropKey, setDropKey] = useState<string | null>(null);

  // Split occurrences per day into all-day vs timed buckets.
  const perDay = useMemo(() => {
    return days.map((day) => {
      const allDay: EventOccurrence[] = [];
      const timed: EventOccurrence[] = [];
      for (const occ of occurrences) {
        if (!sameDay(occ.start, day)) continue;
        if (occ.event.allDay) allDay.push(occ);
        else timed.push(occ);
      }
      return { allDay, timed };
    });
  }, [days, occurrences]);

  const hasAllDay = perDay.some((d) => d.allDay.length > 0);

  function handleDrop(e: DragEvent, day: Date, hour: number) {
    e.preventDefault();
    setDropKey(null);
    if (!canEdit) return;
    const eventId = getEventDrag(e);
    if (!eventId) return;
    const occ = occurrences.find((o) => o.event.id === eventId);
    if (!occ) return;
    const newStart = new Date(day);
    newStart.setHours(hour, 0, 0, 0);
    const duration = durationMs(occ.event.start, occ.event.end);
    const newEnd = new Date(newStart.getTime() + duration);
    onMoveEvent(eventId, newStart.toISOString(), newEnd.toISOString());
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
      {/* Day header row */}
      <div className="flex border-b border-navy-900/[0.06]">
        <div className="w-14 shrink-0 border-r border-navy-900/[0.06]" />
        {days.map((day) => {
          const isToday = sameDay(day, now);
          return (
            <div
              key={day.toISOString()}
              className="flex-1 min-w-0 px-2 py-2 text-center border-r border-navy-900/[0.06] last:border-r-0"
            >
              <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/70">
                {WEEKDAY_LABELS[day.getDay()]}
              </div>
              <div className="mt-1 flex justify-center">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                    isToday
                      ? "bg-gold-500 text-navy-900"
                      : "text-navy-900"
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      {hasAllDay && (
        <div className="flex border-b border-navy-900/[0.06] bg-bone/40">
          <div className="w-14 shrink-0 border-r border-navy-900/[0.06] px-1 py-1.5 text-right">
            <span className="text-[9px] uppercase tracking-[0.12em] font-bold text-navy-700/60">
              All day
            </span>
          </div>
          {days.map((day, dayIdx) => (
            <div
              key={day.toISOString()}
              className="flex-1 min-w-0 border-r border-navy-900/[0.06] last:border-r-0 p-1 space-y-1"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, day, 0)}
            >
              {perDay[dayIdx].allDay.map((occ) => (
                <EventChip
                  key={occ.occurrenceId}
                  occ={occ}
                  categories={categories}
                  canEdit={canEdit}
                  onClick={() => onSelectEvent(occ)}
                  variant="chip"
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable hour grid */}
      <div className="max-h-[560px] overflow-y-auto">
        <div className="flex" style={{ height: GRID_PX }}>
          {/* Hour gutter */}
          <div className="w-14 shrink-0 border-r border-navy-900/[0.06]">
            {DAY_HOURS.map((h) => (
              <div
                key={h}
                className="relative border-b border-navy-900/[0.04]"
                style={{ height: HOUR_PX }}
              >
                {h > 0 && (
                  <span className="absolute -top-2 right-1.5 text-[10px] font-medium text-navy-700/60 tabular-nums">
                    {formatHour(h)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => {
            const isToday = sameDay(day, now);
            const nowTop = (minutesSinceMidnight(now) / 1440) * GRID_PX;
            return (
              <div
                key={day.toISOString()}
                className="relative flex-1 min-w-0 border-r border-navy-900/[0.06] last:border-r-0"
              >
                {/* Hour slots (click to create + drop target) */}
                {DAY_HOURS.map((h) => {
                  const key = `${dayIdx}:${h}`;
                  const isDropTarget = dropKey === key;
                  return (
                    <div
                      key={h}
                      className={cn(
                        "border-b border-navy-900/[0.04] transition-colors",
                        canEdit && "cursor-pointer hover:bg-gold-500/[0.06]",
                        isDropTarget && "ring-1 ring-inset ring-gold-500 bg-gold-500/10"
                      )}
                      style={{ height: HOUR_PX }}
                      onClick={() => {
                        if (!canEdit) return;
                        const slot = new Date(day);
                        slot.setHours(h, 0, 0, 0);
                        onCreateAt(slot, false);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (canEdit) setDropKey(key);
                      }}
                      onDragLeave={() => {
                        setDropKey((k) => (k === key ? null : k));
                      }}
                      onDrop={(e) => handleDrop(e, day, h)}
                    />
                  );
                })}

                {/* Now indicator */}
                {isToday && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                    style={{ top: nowTop }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 -ml-[3px]" />
                    <span className="h-px flex-1 bg-rose-500/70" />
                  </div>
                )}

                {/* Timed event blocks */}
                {perDay[dayIdx].timed.map((occ) => {
                  const top = (minutesSinceMidnight(occ.start) / 1440) * GRID_PX;
                  // Clamp a multi-day event to the end of its start day so the
                  // block never overflows the 24-hour column.
                  const nextMidnight = new Date(
                    occ.start.getFullYear(),
                    occ.start.getMonth(),
                    occ.start.getDate() + 1
                  ).getTime();
                  const visibleEndMs = Math.min(occ.end.getTime(), nextMidnight);
                  const rawHeight =
                    ((visibleEndMs - occ.start.getTime()) / 60000 / 1440) * GRID_PX;
                  const height = Math.max(24, rawHeight);
                  return (
                    <EventChip
                      key={occ.occurrenceId}
                      occ={occ}
                      categories={categories}
                      canEdit={canEdit}
                      onClick={() => onSelectEvent(occ)}
                      variant="block"
                      className="z-10"
                      style={{ top, height }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
