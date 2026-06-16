"use client";

import { useState, type DragEvent, type MouseEvent } from "react";
import {
  type CalendarViewProps,
  type EventOccurrence,
  EventChip,
  getEventDrag,
} from "@/components/calendar/shared";
import {
  monthGridDays,
  sameDay,
  toDateKey,
  durationMs,
  WEEKDAY_LABELS,
} from "@/lib/calendar/dates";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { cn } from "@/lib/cn";

const MAX_VISIBLE = 3;

export default function MonthView({
  anchorDate,
  occurrences,
  categories,
  canEdit,
  onSelectEvent,
  onCreateAt,
  onMoveEvent,
}: CalendarViewProps) {
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

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

  function handleDrop(e: DragEvent<HTMLDivElement>, cellDay: Date) {
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

  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-navy-900/[0.06] bg-bone/40">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-navy-700/70"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 6×7 grid */}
      <div className="grid grid-cols-7 grid-rows-6">
        {days.map((cellDay, i) => {
          const key = toDateKey(cellDay);
          const inMonth = cellDay.getMonth() === anchorMonth;
          const isToday = sameDay(cellDay, now);
          const dayOccs = byDay.get(key) ?? [];
          const visible = dayOccs.slice(0, MAX_VISIBLE);
          const overflow = dayOccs.length - visible.length;
          const isDragOver = dragOverKey === key;
          const col = i % 7;
          const row = Math.floor(i / 7);

          return (
            <div
              key={key}
              onClick={() => {
                if (!canEdit) return;
                const slot = new Date(
                  cellDay.getFullYear(),
                  cellDay.getMonth(),
                  cellDay.getDate(),
                  9,
                  0,
                  0,
                  0
                );
                onCreateAt(slot, false);
              }}
              onDragOver={(e) => {
                if (!canEdit) return;
                e.preventDefault();
                if (dragOverKey !== key) setDragOverKey(key);
              }}
              onDragLeave={(e) => {
                // Only clear when actually leaving the cell, not entering a child.
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverKey((k) => (k === key ? null : k));
                }
              }}
              onDrop={(e) => handleDrop(e, cellDay)}
              className={cn(
                "relative flex min-h-[7rem] flex-col gap-1 p-1.5 text-left transition-colors",
                col !== 6 && "border-r border-navy-900/[0.06]",
                row !== 5 && "border-b border-navy-900/[0.06]",
                inMonth ? "bg-white" : "bg-bone/30",
                canEdit && "cursor-pointer hover:bg-gold-500/[0.04]",
                isDragOver && "ring-2 ring-inset ring-gold-500 bg-gold-500/[0.06]"
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-end">
                {isToday ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-navy-900 ring-1 ring-gold-700/30">
                    {cellDay.getDate()}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "px-1 text-[11px] font-semibold tabular-nums",
                      inMonth ? "text-navy-900" : "text-navy-900/35"
                    )}
                  >
                    {cellDay.getDate()}
                  </span>
                )}
              </div>

              {/* Occurrences */}
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {visible.map((occ) => (
                  <ChipRow
                    key={occ.occurrenceId}
                    occ={occ}
                    categories={categories}
                    canEdit={canEdit}
                    onSelect={onSelectEvent}
                  />
                ))}
                {overflow > 0 && (
                  <span className="px-1 text-[10px] font-semibold text-navy-700/70">
                    +{overflow} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A chip wrapped so its click selects the event without bubbling up to the
 * cell's create-on-empty-click handler.
 */
function ChipRow({
  occ,
  categories,
  canEdit,
  onSelect,
}: {
  occ: EventOccurrence;
  categories: import("@/components/calendar/shared").CalendarCategory[];
  canEdit: boolean;
  onSelect: (occ: EventOccurrence) => void;
}) {
  return (
    <div onClick={(e: MouseEvent) => e.stopPropagation()}>
      <EventChip
        occ={occ}
        categories={categories}
        canEdit={canEdit}
        variant="chip"
        onClick={() => onSelect(occ)}
      />
    </div>
  );
}
