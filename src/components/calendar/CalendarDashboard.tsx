"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  History,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  type EventOccurrence,
  categoryColor,
  tint,
  TYPE_ICON,
  PRIORITY_TONE,
  type CalendarCategory,
} from "@/components/calendar/shared";
import {
  sameDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  formatTime,
} from "@/lib/calendar/dates";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { companies } from "@/data/companies";
import { MEMBERS } from "@/data/members";
import { featuredOpportunities } from "@/data/opportunities";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

type CalendarDashboardProps = {
  occurrences: EventOccurrence[];
  categories: CalendarCategory[];
  onSelectEvent: (occ: EventOccurrence) => void;
  /** The day the month grid navigates; the hero of this panel. */
  selectedDay: Date;
  onChangeDay: (day: Date) => void;
  canEdit: boolean;
  onCreateAt: (start: Date, allDay: boolean) => void;
};

const OVERDUE_TYPES = new Set(["Task", "Deadline"]);
const CLOSED_STATUSES = new Set(["Completed", "Cancelled"]);

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Resolve the first related entity to a display name (read-only lookups). */
function useRelatedLabel(occ: EventOccurrence): string | null {
  const { deals } = useMessaging();
  const r = occ.event.relations;
  if (r.companyId) return companies.find((c) => c.id === r.companyId)?.name ?? null;
  if (r.opportunityId)
    return featuredOpportunities.find((o) => o.id === r.opportunityId)?.title ?? null;
  if (r.dealId) return deals.find((d) => d.dealId === r.dealId)?.title ?? null;
  if (r.memberId) return MEMBERS.find((m) => m.id === r.memberId)?.name ?? null;
  return null;
}

function durationLabel(occ: EventOccurrence): string | null {
  if (occ.event.allDay) return null;
  const mins = Math.round((occ.end.getTime() - occ.start.getTime()) / 60000);
  if (mins <= 0) return null;
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function CalendarDashboard({
  occurrences,
  categories,
  onSelectEvent,
  selectedDay,
  onChangeDay,
  canEdit,
  onCreateAt,
}: CalendarDashboardProps) {
  const model = useMemo(() => {
    const now = new Date(DEAL_DESK_NOW_MS);

    const weekStart = startOfWeek(now);
    const weekEnd = addDays(weekStart, 7);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const day: EventOccurrence[] = [];
    const upcoming: EventOccurrence[] = [];
    const overdue: EventOccurrence[] = [];
    let weekCount = 0;
    let monthCount = 0;

    for (const occ of occurrences) {
      const s = occ.start;
      const sMs = s.getTime();

      if (sameDay(s, selectedDay)) day.push(occ);
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

    day.sort((a, b) => a.start.getTime() - b.start.getTime());
    upcoming.sort((a, b) => a.start.getTime() - b.start.getTime());
    overdue.sort((a, b) => a.end.getTime() - b.end.getTime());

    // Group the selected day: all-day first, then morning / afternoon / evening.
    const allDay = day.filter((o) => o.event.allDay);
    const timed = day.filter((o) => !o.event.allDay);
    const morning = timed.filter((o) => o.start.getHours() < 12);
    const afternoon = timed.filter((o) => o.start.getHours() >= 12 && o.start.getHours() < 17);
    const evening = timed.filter((o) => o.start.getHours() >= 17);

    // Recently Updated — dedupe by event.id, newest updatedAt first, take 4.
    const seen = new Set<string>();
    const recent: EventOccurrence[] = [];
    const byUpdated = [...occurrences].sort(
      (a, b) => Date.parse(b.event.updatedAt) - Date.parse(a.event.updatedAt)
    );
    for (const occ of byUpdated) {
      if (seen.has(occ.event.id)) continue;
      seen.add(occ.event.id);
      recent.push(occ);
      if (recent.length >= 4) break;
    }

    return {
      now,
      dayCount: day.length,
      allDay,
      morning,
      afternoon,
      evening,
      upcoming: upcoming.slice(0, 5),
      overdue,
      weekCount,
      monthCount,
      recent,
    };
  }, [occurrences, selectedDay]);

  const isToday = sameDay(selectedDay, model.now);
  const heroDate = `${MONTHS[selectedDay.getMonth()]} ${selectedDay.getDate()}, ${selectedDay.getFullYear()}`;

  return (
    <aside className="w-full space-y-4">
      {/* Selected day — the hero */}
      <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
        <header className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
                {isToday ? "Today" : "Selected Day"}
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-navy-900">
                {WEEKDAYS[selectedDay.getDay()]}
              </h2>
              <p className="text-sm text-navy-700/60">{heroDate}</p>
            </div>
            <div className="inline-flex items-center rounded-full bg-bone/60 ring-1 ring-navy-900/[0.06] shrink-0">
              <button
                type="button"
                onClick={() => onChangeDay(addDays(selectedDay, -1))}
                aria-label="Previous day"
                className="h-8 w-8 inline-flex items-center justify-center rounded-full text-navy-700 hover:bg-white hover:text-navy-900 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => onChangeDay(addDays(selectedDay, 1))}
                aria-label="Next day"
                className="h-8 w-8 inline-flex items-center justify-center rounded-full text-navy-700 hover:bg-white hover:text-navy-900 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            </div>
          </div>
          {!isToday ? (
            <button
              type="button"
              onClick={() => onChangeDay(new Date(DEAL_DESK_NOW_MS))}
              className="mt-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
            >
              Jump to today
            </button>
          ) : null}
        </header>

        <div className="border-t border-navy-900/[0.05] px-3 pb-3 pt-2">
          {model.dayCount === 0 ? (
            <EmptyState
              Icon={CalendarDays}
              compact
              title="No events scheduled"
              description="Enjoy the open day."
              action={canEdit ? { label: "Create Event", onClick: () => onCreateAt(slotAt(selectedDay), false) } : undefined}
            />
          ) : (
            <div className="space-y-3">
              <ScheduleGroup label="All Day" items={model.allDay} categories={categories} onSelect={onSelectEvent} now={model.now} />
              <ScheduleGroup label="Morning" items={model.morning} categories={categories} onSelect={onSelectEvent} now={model.now} />
              <ScheduleGroup label="Afternoon" items={model.afternoon} categories={categories} onSelect={onSelectEvent} now={model.now} />
              <ScheduleGroup label="Evening" items={model.evening} categories={categories} onSelect={onSelectEvent} now={model.now} />
            </div>
          )}

          {canEdit && model.dayCount > 0 ? (
            <button
              type="button"
              onClick={() => onCreateAt(slotAt(selectedDay), false)}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-navy-900/15 hover:border-gold-500/60 hover:bg-gold-500/[0.04] text-navy-700/70 hover:text-navy-900 font-semibold px-4 py-2.5 text-xs uppercase tracking-[0.12em] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
              New Event
            </button>
          ) : null}
        </div>
      </section>

      {/* Quick stats — quiet hairline strip */}
      <section className="rounded-2xl bg-navy-900/[0.05] ring-1 ring-navy-900/[0.06] grid grid-cols-3 gap-px overflow-hidden">
        <QuickStat icon={CalendarRange} label="This Week" value={model.weekCount} />
        <QuickStat icon={CalendarDays} label="This Month" value={model.monthCount} />
        <QuickStat
          icon={AlertTriangle}
          label="Overdue"
          value={model.overdue.length}
          alert={model.overdue.length > 0}
        />
      </section>

      {/* Upcoming */}
      <SidePanel icon={Sparkles} title="Upcoming" count={model.upcoming.length}>
        {model.upcoming.length === 0 ? (
          <QuietEmpty text="No upcoming events." />
        ) : (
          <ul className="space-y-2">
            {model.upcoming.map((occ) => (
              <EventCard key={occ.occurrenceId} occ={occ} categories={categories} onSelect={onSelectEvent} withDay now={model.now} />
            ))}
          </ul>
        )}
      </SidePanel>

      {/* Overdue */}
      {model.overdue.length > 0 ? (
        <SidePanel icon={AlertTriangle} title="Overdue" count={model.overdue.length} accent="rose">
          <ul className="space-y-2">
            {model.overdue.map((occ) => (
              <EventCard key={occ.occurrenceId} occ={occ} categories={categories} onSelect={onSelectEvent} withDay now={model.now} overdue />
            ))}
          </ul>
        </SidePanel>
      ) : null}

      {/* Recent activity */}
      <SidePanel icon={History} title="Recently Updated" count={model.recent.length}>
        {model.recent.length === 0 ? (
          <QuietEmpty text="No recent changes." />
        ) : (
          <ul className="space-y-2">
            {model.recent.map((occ) => (
              <EventCard key={occ.occurrenceId} occ={occ} categories={categories} onSelect={onSelectEvent} withDay now={model.now} />
            ))}
          </ul>
        )}
      </SidePanel>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */

function slotAt(day: Date): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0, 0, 0);
}

function ScheduleGroup({
  label,
  items,
  categories,
  onSelect,
  now,
}: {
  label: string;
  items: EventOccurrence[];
  categories: CalendarCategory[];
  onSelect: (occ: EventOccurrence) => void;
  now?: Date;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="px-2 pb-1.5 text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/45">
        {label}
      </div>
      <ul className="space-y-2">
        {items.map((occ) => (
          <EventCard key={occ.occurrenceId} occ={occ} categories={categories} onSelect={onSelect} scheduleNow={now} />
        ))}
      </ul>
    </div>
  );
}

/** Premium event card: time · type icon tile · title · relations · badges. */
function EventCard({
  occ,
  categories,
  onSelect,
  withDay,
  now,
  overdue,
  scheduleNow,
}: {
  occ: EventOccurrence;
  categories: CalendarCategory[];
  onSelect: (occ: EventOccurrence) => void;
  withDay?: boolean;
  now?: Date;
  overdue?: boolean;
  /** When set, highlight in-progress events and fade completed ones. */
  scheduleNow?: Date;
}) {
  const color = categoryColor(occ.event, categories);
  const Icon = TYPE_ICON[occ.event.type];
  const cancelled = occ.event.status === "Cancelled";
  const completed = occ.event.status === "Completed";
  const isCurrent =
    !!scheduleNow &&
    !cancelled &&
    !completed &&
    !occ.event.allDay &&
    occ.start.getTime() <= scheduleNow.getTime() &&
    scheduleNow.getTime() <= occ.end.getTime();
  const related = useRelatedLabel(occ);
  const duration = durationLabel(occ);
  const showPriority = occ.event.priority === "Urgent" || occ.event.priority === "High";
  const dayLabel = withDay && now && !sameDay(occ.start, now) ? shortDay(occ.start, now) : null;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(occ)}
        title={occ.event.title}
        className={cn(
          "group w-full flex items-start gap-2.5 rounded-xl bg-white ring-1 ring-navy-900/[0.05] p-2.5 text-left transition-all duration-150 hover:ring-gold-500/40 hover:shadow-sm",
          (cancelled || completed) && "opacity-60",
          isCurrent && "ring-2 ring-gold-500 shadow-sm"
        )}
      >
        <span className="w-[3.25rem] shrink-0 text-right pt-0.5">
          <span className={cn("block text-[11px] font-bold tabular-nums", overdue ? "text-rose-600" : "text-navy-900")}>
            {occ.event.allDay ? "All day" : formatTime(occ.start)}
          </span>
          <span className="block text-[10px] text-navy-700/45 tabular-nums">
            {dayLabel ?? duration ?? ""}
          </span>
        </span>

        <span
          className="mt-0.5 h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg ring-1"
          style={{ backgroundColor: tint(color, 0.12), color, borderColor: tint(color, 0.35) }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.1} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-[13px] font-semibold text-navy-900 leading-snug truncate", cancelled && "line-through")}>
              {occ.event.title}
              {occ.isRecurring ? <span className="text-navy-700/40"> ↻</span> : null}
            </span>
            {showPriority ? (
              <Badge size="sm" className={PRIORITY_TONE[occ.event.priority]}>
                {occ.event.priority}
              </Badge>
            ) : null}
          </span>
          {(related || occ.event.location) ? (
            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-navy-700/55 truncate">
              {related ? <span className="truncate">{related}</span> : null}
              {related && occ.event.location ? <span className="text-navy-700/30">·</span> : null}
              {occ.event.location ? (
                <span className="inline-flex items-center gap-0.5 truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-gold-600" strokeWidth={2.2} />
                  {occ.event.location}
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  alert,
}: {
  icon: typeof CalendarRange;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="bg-white px-3 py-2.5">
      <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] font-bold text-navy-700/55">
        <Icon className={cn("h-3 w-3", alert ? "text-rose-500" : "text-gold-600")} strokeWidth={2.2} />
        {label}
      </div>
      <div className={cn("mt-0.5 text-xl font-bold tracking-tight tabular-nums", alert ? "text-rose-600" : "text-navy-900")}>
        {value}
      </div>
    </div>
  );
}

function SidePanel({
  icon: Icon,
  title,
  count,
  accent,
  children,
}: {
  icon: typeof CalendarRange;
  title: string;
  count?: number;
  accent?: "rose";
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-3.5">
      <header className="mb-2.5 flex items-center gap-2 px-0.5">
        <Icon
          className={cn("h-3.5 w-3.5 shrink-0", accent === "rose" ? "text-rose-500" : "text-gold-600")}
          strokeWidth={2.2}
        />
        <h3 className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60">{title}</h3>
        {typeof count === "number" && count > 0 ? (
          <Badge
            size="sm"
            className={cn(
              "ml-auto tabular-nums",
              accent === "rose"
                ? "bg-rose-500/15 text-rose-700 ring-rose-500/30"
                : "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15"
            )}
          >
            {count}
          </Badge>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function QuietEmpty({ text }: { text: string }) {
  return (
    <p className="rounded-lg bg-bone/40 px-3 py-3.5 text-center text-[11px] text-navy-700/50">{text}</p>
  );
}

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Today", "Tomorrow", "Tue", or "Jun 24" for upcoming/overdue rows. */
function shortDay(d: Date, ref: Date): string {
  if (sameDay(d, ref)) return "Today";
  if (sameDay(d, addDays(ref, 1))) return "Tomorrow";
  if (sameDay(d, addDays(ref, -1))) return "Yesterday";
  const diffDays = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
      new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime()) /
      86_400_000
  );
  if (diffDays > 0 && diffDays < 7) return SHORT_WEEKDAYS[d.getDay()];
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}
