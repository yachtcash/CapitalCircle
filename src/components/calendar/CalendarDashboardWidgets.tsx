"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarClock,
  Sunrise,
  CalendarRange,
  AlarmClock,
  AlertTriangle,
  History as HistoryIcon,
  ArrowRight,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { categoryColor } from "@/data/calendar";
import { groupForAction, toneForAction } from "@/data/audit";
import { expandAll, type EventOccurrence } from "@/lib/calendar/recurrence";
import {
  addDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  sameDay,
  formatTime,
  formatDate,
} from "@/lib/calendar/dates";
import { TYPE_ICON } from "./shared";
import EventDetailPanel from "./EventDetailPanel";
import { cn } from "@/lib/cn";

const TONE_DOT: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

export default function CalendarDashboardWidgets() {
  const { calendarEvents, calendarCategories, auditEvents } = useMessaging();
  const nowMs = DEAL_DESK_NOW_MS;
  const now = new Date(nowMs);

  const [selected, setSelected] = useState<EventOccurrence | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = (occ: EventOccurrence) => {
    setSelected(occ);
    setDetailOpen(true);
  };

  const data = useMemo(() => {
    const occ = expandAll(calendarEvents, addDays(now, -40), addDays(now, 120));
    const tomorrow = addDays(now, 1);
    const weekStart = startOfWeek(now).getTime();
    const weekEnd = endOfDay(addDays(startOfWeek(now), 6)).getTime();
    const today = occ.filter((o) => sameDay(o.start, now));
    const tmrw = occ.filter((o) => sameDay(o.start, tomorrow));
    const thisWeek = occ.filter((o) => o.start.getTime() >= weekStart && o.start.getTime() <= weekEnd);
    const deadlines = occ
      .filter((o) => o.event.type === "Deadline" && o.start.getTime() >= startOfDay(now).getTime())
      .slice(0, 5);
    const overdue = occ.filter(
      (o) =>
        (o.event.type === "Task" || o.event.type === "Deadline") &&
        o.end.getTime() < nowMs &&
        o.event.status !== "Completed" &&
        o.event.status !== "Cancelled"
    );
    return { today, tmrw, thisWeek, deadlines, overdue };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarEvents]);

  const recentActivity = useMemo(
    () => auditEvents.filter((e) => groupForAction(e.action) === "Calendar Actions").slice(0, 6),
    [auditEvents]
  );

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.4} />
          Calendar
        </div>
        <Link href="/calendar" className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600">
          Open calendar
          <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Tile label="Today" value={data.today.length} Icon={CalendarClock} tone="navy" />
        <Tile label="This Week" value={data.thisWeek.length} Icon={CalendarRange} tone="navy" />
        <Tile label="Overdue" value={data.overdue.length} Icon={AlertTriangle} tone={data.overdue.length > 0 ? "rose" : "navy"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WidgetList title="Today's Events" Icon={CalendarClock} items={data.today} categories={calendarCategories} onOpen={openDetail} empty="Nothing scheduled today." />
        <WidgetList title="Tomorrow" Icon={Sunrise} items={data.tmrw} categories={calendarCategories} onOpen={openDetail} empty="Nothing scheduled tomorrow." />
        <WidgetList title="Upcoming Deadlines" Icon={CalendarRange} items={data.deadlines} categories={calendarCategories} onOpen={openDetail} empty="No upcoming deadlines." />
        <WidgetList title="Overdue Tasks" Icon={AlarmClock} items={data.overdue} categories={calendarCategories} onOpen={openDetail} empty="No overdue tasks." danger />
      </div>

      {/* Recent calendar activity */}
      <div className="mt-4 border-t border-navy-900/[0.05] pt-3">
        <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2 inline-flex items-center gap-1.5">
          <HistoryIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
          Recent Calendar Activity
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-xs text-navy-700/55">No calendar activity yet.</p>
        ) : (
          <ul className="space-y-1">
            {recentActivity.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-xs">
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", TONE_DOT[toneForAction(e.action)] ?? "bg-navy-400")} />
                <span className="font-semibold text-navy-900">{e.action}</span>
                <span className="text-navy-700/60 truncate">{e.targetLabel ?? e.targetId}{e.detail ? ` · ${e.detail}` : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <EventDetailPanel
        occ={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        canEdit={false}
        categories={calendarCategories}
        onEdit={() => setDetailOpen(false)}
      />
    </section>
  );
}

function Tile({ label, value, Icon, tone }: { label: string; value: number; Icon: typeof CalendarClock; tone: "navy" | "rose" }) {
  return (
    <div className={cn("rounded-xl ring-1 p-3", tone === "rose" ? "bg-rose-500/[0.06] ring-rose-500/30" : "bg-navy-900 text-white ring-navy-900")}>
      <div className="flex items-center justify-between gap-1">
        <span className={cn("text-[9px] uppercase tracking-[0.14em] font-bold truncate", tone === "rose" ? "text-rose-700" : "text-white/60")}>{label}</span>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", tone === "rose" ? "text-rose-600" : "text-gold-400")} strokeWidth={2.2} />
      </div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", tone === "rose" ? "text-rose-700" : "text-white")}>{value}</div>
    </div>
  );
}

function WidgetList({
  title,
  Icon,
  items,
  categories,
  onOpen,
  empty,
  danger,
}: {
  title: string;
  Icon: typeof CalendarClock;
  items: EventOccurrence[];
  categories: { id: string; name: string; color: string }[];
  onOpen: (occ: EventOccurrence) => void;
  empty: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.05] p-3">
      <div className={cn("text-[10px] uppercase tracking-[0.16em] font-bold mb-2 inline-flex items-center gap-1.5", danger ? "text-rose-700" : "text-navy-700/60")}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-navy-700/45">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map((occ) => {
            const color = categoryColor(occ.event, categories);
            const TIcon = TYPE_ICON[occ.event.type];
            return (
              <li key={occ.occurrenceId}>
                <button type="button" onClick={() => onOpen(occ)} className="flex items-center gap-2 w-full text-left group">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <TIcon className="h-3 w-3 text-navy-700/45 shrink-0" strokeWidth={2.1} />
                  <span className="text-[12px] text-navy-900 group-hover:text-gold-700 truncate flex-1">{occ.event.title}</span>
                  <span className="text-[10px] text-navy-700/50 tabular-nums shrink-0">
                    {occ.event.allDay ? formatDate(occ.start).slice(0, 6) : formatTime(occ.start)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
