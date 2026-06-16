"use client";

import { useMemo } from "react";
import {
  CalendarClock,
  CalendarRange,
  CalendarDays,
  AlertTriangle,
  History,
  Sparkles,
} from "lucide-react";
import {
  type EventOccurrence,
  categoryColor,
  type CalendarCategory,
} from "@/components/calendar/shared";
import {
  sameDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  formatTime,
  dayLabelLong,
} from "@/lib/calendar/dates";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { cn } from "@/lib/cn";

type CalendarDashboardProps = {
  occurrences: EventOccurrence[];
  categories: CalendarCategory[];
  onSelectEvent: (occ: EventOccurrence) => void;
};

const OVERDUE_TYPES = new Set(["Task", "Deadline"]);
const CLOSED_STATUSES = new Set(["Completed", "Cancelled"]);

export default function CalendarDashboard({
  occurrences,
  categories,
  onSelectEvent,
}: CalendarDashboardProps) {
  const model = useMemo(() => {
    const now = new Date(DEAL_DESK_NOW_MS);

    const weekStart = startOfWeek(now);
    const weekEnd = addDays(weekStart, 7);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const today: EventOccurrence[] = [];
    const upcoming: EventOccurrence[] = [];
    const overdue: EventOccurrence[] = [];
    let weekCount = 0;
    let monthCount = 0;

    for (const occ of occurrences) {
      const s = occ.start;
      const sMs = s.getTime();

      if (sameDay(s, now)) today.push(occ);

      if (sMs > now.getTime()) upcoming.push(occ);

      if (
        OVERDUE_TYPES.has(occ.event.type) &&
        occ.end.getTime() < now.getTime() &&
        !CLOSED_STATUSES.has(occ.event.status)
      ) {
        overdue.push(occ);
      }

      if (sMs >= weekStart.getTime() && sMs < weekEnd.getTime()) weekCount++;
      if (sMs >= monthStart.getTime() && sMs <= monthEnd.getTime()) monthCount++;
    }

    today.sort((a, b) => a.start.getTime() - b.start.getTime());
    upcoming.sort((a, b) => a.start.getTime() - b.start.getTime());
    overdue.sort((a, b) => a.end.getTime() - b.end.getTime());

    // Recently Updated — dedupe by event.id, newest updatedAt first, take 5.
    const seen = new Set<string>();
    const recent: EventOccurrence[] = [];
    const byUpdated = [...occurrences].sort(
      (a, b) =>
        Date.parse(b.event.updatedAt) - Date.parse(a.event.updatedAt)
    );
    for (const occ of byUpdated) {
      if (seen.has(occ.event.id)) continue;
      seen.add(occ.event.id);
      recent.push(occ);
      if (recent.length >= 5) break;
    }

    return {
      now,
      today,
      upcoming: upcoming.slice(0, 6),
      overdue,
      weekCount,
      monthCount,
      recent,
    };
  }, [occurrences]);

  return (
    <aside className="w-full sm:w-[320px] shrink-0 space-y-4">
      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile
          icon={CalendarRange}
          label="This Week"
          value={model.weekCount}
          tone="text-navy-900"
          ring="ring-navy-900/10"
        />
        <StatTile
          icon={CalendarDays}
          label="This Month"
          value={model.monthCount}
          tone="text-navy-900"
          ring="ring-navy-900/10"
        />
        <StatTile
          icon={AlertTriangle}
          label="Overdue"
          value={model.overdue.length}
          tone={model.overdue.length > 0 ? "text-rose-600" : "text-navy-900"}
          ring={
            model.overdue.length > 0 ? "ring-rose-500/30" : "ring-navy-900/10"
          }
        />
      </div>

      {/* Today's Events */}
      <Panel
        icon={CalendarClock}
        title="Today's Events"
        meta={dayLabelLong(model.now)}
        count={model.today.length}
      >
        {model.today.length === 0 ? (
          <Empty text="Nothing scheduled today." />
        ) : (
          <ul className="space-y-1">
            {model.today.map((occ) => (
              <EventRow
                key={occ.occurrenceId}
                occ={occ}
                categories={categories}
                onSelect={onSelectEvent}
              />
            ))}
          </ul>
        )}
      </Panel>

      {/* Upcoming Events */}
      <Panel
        icon={Sparkles}
        title="Upcoming"
        count={model.upcoming.length}
      >
        {model.upcoming.length === 0 ? (
          <Empty text="No upcoming events." />
        ) : (
          <ul className="space-y-1">
            {model.upcoming.map((occ) => (
              <EventRow
                key={occ.occurrenceId}
                occ={occ}
                categories={categories}
                onSelect={onSelectEvent}
                withDay
                now={model.now}
              />
            ))}
          </ul>
        )}
      </Panel>

      {/* Overdue Tasks */}
      {model.overdue.length > 0 && (
        <Panel
          icon={AlertTriangle}
          title="Overdue Tasks"
          count={model.overdue.length}
          accent="rose"
        >
          <ul className="space-y-1">
            {model.overdue.map((occ) => (
              <EventRow
                key={occ.occurrenceId}
                occ={occ}
                categories={categories}
                onSelect={onSelectEvent}
                withDay
                now={model.now}
                overdue
              />
            ))}
          </ul>
        </Panel>
      )}

      {/* Recently Updated */}
      <Panel icon={History} title="Recently Updated" count={model.recent.length}>
        {model.recent.length === 0 ? (
          <Empty text="No recent activity." />
        ) : (
          <ul className="space-y-1">
            {model.recent.map((occ) => (
              <EventRow
                key={occ.occurrenceId}
                occ={occ}
                categories={categories}
                onSelect={onSelectEvent}
                withDay
                now={model.now}
              />
            ))}
          </ul>
        )}
      </Panel>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
  ring,
}: {
  icon: typeof CalendarRange;
  label: string;
  value: number;
  tone: string;
  ring: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white ring-1 p-3 flex flex-col gap-1",
        ring
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", tone)} strokeWidth={2.2} />
      <span className={cn("text-2xl font-bold leading-none tabular-nums", tone)}>
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-[0.14em] font-bold text-navy-700/60">
        {label}
      </span>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  meta,
  count,
  accent,
  children,
}: {
  icon: typeof CalendarClock;
  title: string;
  meta?: string;
  count?: number;
  accent?: "rose";
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-4">
      <header className="mb-3 flex items-center gap-2">
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            accent === "rose" ? "text-rose-500" : "text-gold-500"
          )}
          strokeWidth={2.2}
        />
        <h3 className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60">
          {title}
        </h3>
        {typeof count === "number" && count > 0 && (
          <span
            className={cn(
              "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ring-1",
              accent === "rose"
                ? "bg-rose-500/15 text-rose-700 ring-rose-500/30"
                : "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15"
            )}
          >
            {count}
          </span>
        )}
      </header>
      {meta && (
        <p className="-mt-2 mb-3 text-[11px] text-navy-700/55">{meta}</p>
      )}
      {children}
    </section>
  );
}

function EventRow({
  occ,
  categories,
  onSelect,
  withDay,
  now,
  overdue,
}: {
  occ: EventOccurrence;
  categories: CalendarCategory[];
  onSelect: (occ: EventOccurrence) => void;
  withDay?: boolean;
  now?: Date;
  overdue?: boolean;
}) {
  const color = categoryColor(occ.event, categories);
  const cancelled = occ.event.status === "Cancelled";
  const timeLabel = occ.event.allDay ? "All day" : formatTime(occ.start);
  const dayLabel =
    withDay && (!now || !sameDay(occ.start, now))
      ? relativeDay(occ.start, now)
      : null;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(occ)}
        title={occ.event.title}
        className="group flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-navy-900/[0.04]"
      >
        <span
          className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
          style={{ backgroundColor: color }}
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-[12px] font-medium text-navy-900",
              cancelled && "line-through opacity-60"
            )}
          >
            {occ.event.title}
            {occ.isRecurring ? (
              <span className="text-navy-700/50"> ↻</span>
            ) : null}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-navy-700/60">
            {dayLabel && (
              <>
                <span className="font-semibold text-navy-700/75">
                  {dayLabel}
                </span>
                <span aria-hidden className="text-navy-700/30">
                  ·
                </span>
              </>
            )}
            <span className={cn(overdue && "font-semibold text-rose-600")}>
              {timeLabel}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg bg-navy-900/[0.02] px-3 py-4 text-center text-[11px] text-navy-700/50">
      {text}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** A compact relative-day label: "Today", "Tomorrow", "Yesterday", "Tue", or "Jun 24". */
function relativeDay(d: Date, now?: Date): string {
  const ref = now ?? new Date(DEAL_DESK_NOW_MS);
  if (sameDay(d, ref)) return "Today";
  if (sameDay(d, addDays(ref, 1))) return "Tomorrow";
  if (sameDay(d, addDays(ref, -1))) return "Yesterday";

  const diffDays = Math.round(
    (startOf(d).getTime() - startOf(ref).getTime()) / 86_400_000
  );
  if (diffDays > 0 && diffDays < 7) return SHORT_WEEKDAYS[d.getDay()];
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function startOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
