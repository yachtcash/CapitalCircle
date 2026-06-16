"use client";

import { useMemo } from "react";
import { MapPin, Repeat, CalendarX2 } from "lucide-react";
import {
  type CalendarViewProps,
  type EventOccurrence,
  TYPE_ICON,
  PRIORITY_TONE,
  STATUS_TONE,
  categoryColor,
  occRangeLabel,
} from "@/components/calendar/shared";
import { toDateKey, dayLabelLong, sameDay } from "@/lib/calendar/dates";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { cn } from "@/lib/cn";

type DayGroup = {
  key: string;
  date: Date;
  occs: EventOccurrence[];
};

const PILL =
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-bold ring-1";

export default function AgendaView({
  occurrences,
  categories,
  onSelectEvent,
}: CalendarViewProps) {
  const today = new Date(DEAL_DESK_NOW_MS);

  const groups = useMemo<DayGroup[]>(() => {
    const byDay = new Map<string, DayGroup>();
    for (const occ of occurrences) {
      const key = toDateKey(occ.start);
      let group = byDay.get(key);
      if (!group) {
        group = { key, date: occ.start, occs: [] };
        byDay.set(key, group);
      }
      group.occs.push(occ);
    }
    const out = Array.from(byDay.values());
    out.sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const g of out) g.occs.sort((a, b) => a.start.getTime() - b.start.getTime());
    return out;
  }, [occurrences]);

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06]">
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/[0.04] ring-1 ring-navy-900/[0.06]">
            <CalendarX2 className="h-6 w-6 text-navy-700/60" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy-900">No events in this range</p>
            <p className="mt-1 text-xs text-navy-700/70">
              Nothing scheduled for the selected period.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06]">
      <ul className="divide-y divide-navy-900/[0.06]">
        {groups.map((group) => {
          const isToday = sameDay(group.date, today);
          return (
            <li key={group.key}>
              <div
                className={cn(
                  "sticky top-0 z-10 flex items-center gap-3 bg-white/95 px-4 py-2.5 backdrop-blur",
                  "border-l-2",
                  isToday ? "border-gold-500" : "border-transparent"
                )}
              >
                <h3
                  className={cn(
                    "text-xs font-bold uppercase tracking-[0.14em]",
                    isToday ? "text-gold-700" : "text-navy-700/70"
                  )}
                >
                  {dayLabelLong(group.date)}
                </h3>
                {isToday ? (
                  <span className={cn(PILL, "bg-gold-500/15 text-gold-700 ring-gold-500/30")}>
                    Today
                  </span>
                ) : null}
                <span className="ml-auto text-[11px] font-medium text-navy-700/50">
                  {group.occs.length} {group.occs.length === 1 ? "event" : "events"}
                </span>
              </div>

              <ul>
                {group.occs.map((occ) => {
                  const color = categoryColor(occ.event, categories);
                  const Icon = TYPE_ICON[occ.event.type];
                  const cancelled = occ.event.status === "Cancelled";
                  const priorityTone = PRIORITY_TONE[occ.event.priority];
                  const statusTone =
                    STATUS_TONE[occ.event.status] ?? STATUS_TONE.Scheduled;
                  return (
                    <li key={occ.occurrenceId}>
                      <button
                        type="button"
                        onClick={() => onSelectEvent(occ)}
                        className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-navy-900/[0.025]"
                      >
                        <span
                          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                          style={{ backgroundColor: color }}
                        />

                        <span className="w-24 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-navy-700/80">
                          {occRangeLabel(occ)}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <Icon
                              className="h-3.5 w-3.5 shrink-0 text-navy-700/70"
                              strokeWidth={2.1}
                            />
                            <span
                              className={cn(
                                "truncate text-sm font-semibold text-navy-900",
                                cancelled && "line-through opacity-60"
                              )}
                            >
                              {occ.event.title}
                            </span>
                          </span>

                          {occ.event.location ? (
                            <span className="mt-1 flex items-center gap-1 text-[11px] text-navy-700/60">
                              <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
                              <span className="truncate">{occ.event.location}</span>
                            </span>
                          ) : null}
                        </span>

                        <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                          {occ.isRecurring ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-navy-700/50"
                              title="Recurring event"
                            >
                              <Repeat className="h-3 w-3" strokeWidth={2.2} />
                              <span className="hidden sm:inline">Recurring</span>
                            </span>
                          ) : null}
                          <span className={cn(PILL, priorityTone)}>
                            {occ.event.priority}
                          </span>
                          <span className={cn(PILL, statusTone)}>
                            {occ.event.status}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
