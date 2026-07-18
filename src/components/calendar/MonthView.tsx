"use client";

import { useState, type DragEvent } from "react";
import {
  type CalendarViewProps,
  type EventOccurrence,
  categoryColor,
  getEventDrag,
} from "@/components/calendar/shared";
import {
  monthGridDays,
  sameDay,
  toDateKey,
  durationMs,
  dayLabelLong,
  WEEKDAY_LABELS,
} from "@/lib/calendar/dates";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { cn } from "@/lib/cn";

const OPEN_STATUSES = new Set(["Scheduled", "Confirmed", "Tentative"]);

/**
 * Month as a navigation surface: each day shows its date, up to four
 * category dots, an event count, and a priority flag — clicking a day
 * drives the schedule sidebar. Events are read in the sidebar, not here.
 * Drag-and-drop rescheduling is preserved on every cell.
 */
export default function MonthView({
  anchorDate,
  occurrences,
  categories,
  canEdit,
  onSelectEvent,
  onCreateAt,
  onMoveEvent,
  selectedDate,
  onSelectDay,
}: CalendarViewProps) {
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  void onSelectEvent;

  const days = monthGridDays(anchorDate);
  const now = new Date(DEAL_DESK_NOW_MS);
  const anchorMonth = anchorDate.getMonth();

  // Bucket occurrences by day key for fast per-cell lookup.
  const byDay = new Map<string, EventOccurrence[]>();
  for (const occ of occurrences) {
    const key = toDateKey(occ.start);
    const list = byDay.get(key);
    if (list) list.push(occ);
    else byDay.set(key, [occ]);
  }

  function handleDrop(e: DragEvent<HTMLElement>, cellDay: Date) {
    e.preventDefault();
    setDragOverKey(null);
    if (!canEdit) return;
    const eventId = getEventDrag(e);
    if (!eventId) return;
    const dragged = occurrences.find((o) => o.event.id === eventId);
    if (!dragged) return;

    // Keep the event's time-of-day, move it onto the dropped calendar day.
    const src = dragged.start;
    const newStart = new Date(
      cellDay.getFullYear(),
      cellDay.getMonth(),
      cellDay.getDate(),
      src.getHours(),
      src.getMinutes(),
      src.getSeconds(),
      src.getMilliseconds()
    );
    const duration = durationMs(dragged.event.start, dragged.event.end);
    const newEnd = new Date(newStart.getTime() + duration);
    onMoveEvent(eventId, newStart.toISOString(), newEnd.toISOString());
  }

  function handleDayClick(cellDay: Date) {
    if (onSelectDay) {
      onSelectDay(cellDay);
      return;
    }
    // Standalone fallback (no sidebar wired): keep the create-at behavior.
    if (!canEdit) return;
    const slot = new Date(cellDay.getFullYear(), cellDay.getMonth(), cellDay.getDate(), 9, 0, 0, 0);
    onCreateAt(slot, false);
  }

  return (
    <div>
      {/* Weekday header — borderless, quiet */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-navy-700/50"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 6×7 grid — one elegant surface, not forty-two boxes */}
      <div role="grid" aria-label={dayLabelLong(anchorDate)} className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((cellDay) => {
          const key = toDateKey(cellDay);
          const inMonth = cellDay.getMonth() === anchorMonth;
          const isToday = sameDay(cellDay, now);
          const isSelected = selectedDate ? sameDay(cellDay, selectedDate) : false;
          const dayOccs = byDay.get(key) ?? [];
          const isDragOver = dragOverKey === key;

          // Up to four unique category colors as indicators.
          const dotColors: string[] = [];
          for (const occ of dayOccs) {
            const c = categoryColor(occ.event, categories);
            if (!dotColors.includes(c)) dotColors.push(c);
            if (dotColors.length >= 4) break;
          }
          const hasUrgent = dayOccs.some(
            (o) =>
              (o.event.priority === "Urgent" || o.event.priority === "High") &&
              OPEN_STATUSES.has(o.event.status)
          );

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleDayClick(cellDay)}
              aria-pressed={isSelected}
              aria-label={`${dayLabelLong(cellDay)} — ${dayOccs.length} ${dayOccs.length === 1 ? "event" : "events"}${hasUrgent ? ", high priority" : ""}`}
              onDragOver={(e) => {
                if (!canEdit) return;
                e.preventDefault();
                if (dragOverKey !== key) setDragOverKey(key);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverKey((k) => (k === key ? null : k));
                }
              }}
              onDrop={(e) => handleDrop(e, cellDay)}
              className={cn(
                "relative flex min-h-[3.5rem] sm:min-h-[5rem] flex-col items-start gap-1 rounded-xl p-1.5 sm:p-2 text-left transition-all duration-150",
                inMonth ? "bg-bone/40" : "bg-transparent",
                inMonth && !isSelected && "hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-navy-900/[0.08]",
                !inMonth && "hover:bg-bone/30",
                isSelected && "bg-white ring-2 ring-gold-500 shadow-sm",
                isDragOver && "ring-2 ring-gold-500 bg-gold-500/[0.06]"
              )}
            >
              {/* Priority flag */}
              {hasUrgent ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-rose-500/25"
                />
              ) : null}

              {/* Date */}
              {isToday ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-navy-900 ring-1 ring-gold-700/30">
                  {cellDay.getDate()}
                </span>
              ) : (
                <span
                  className={cn(
                    "text-[12px] font-semibold tabular-nums leading-6",
                    inMonth ? "text-navy-900" : "text-navy-900/30"
                  )}
                >
                  {cellDay.getDate()}
                </span>
              )}

              {/* Indicators */}
              {dayOccs.length > 0 ? (
                <span className="mt-auto flex flex-col gap-0.5">
                  <span className="flex items-center gap-1">
                    {dotColors.map((c) => (
                      <span
                        key={c}
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </span>
                  <span
                    className={cn(
                      "hidden sm:block text-[10px] font-medium tabular-nums",
                      inMonth ? "text-navy-700/55" : "text-navy-700/30"
                    )}
                  >
                    {dayOccs.length} {dayOccs.length === 1 ? "event" : "events"}
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
