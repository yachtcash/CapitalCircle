"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Palette,
  ShieldAlert,
  CalendarRange,
  Columns3,
  Square,
  ListChecks,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import { canViewCalendar, canEditCalendar, type Role } from "@/lib/roles";
import {
  addDays,
  addMonths,
  startOfDay,
  endOfDay,
  startOfWeek,
  weekDays,
  monthGridDays,
  monthLabel,
  weekLabel,
  dayLabelLong,
} from "@/lib/calendar/dates";
import { expandAll } from "@/lib/calendar/recurrence";
import type { EventOccurrence } from "./shared";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import AgendaView from "./AgendaView";
import CalendarDashboard from "./CalendarDashboard";
import EventModal from "./EventModal";
import EventDetailPanel from "./EventDetailPanel";
import CategoryManager from "./CategoryManager";
import { cn } from "@/lib/cn";

/** The signed-in member id used for the per-member calendar grant lookup. */
const SELF_MEMBER_ID = "MEM-000001";

type ViewKey = "month" | "week" | "day" | "agenda";

export default function CalendarWorkspace({ adminFrame = false }: { adminFrame?: boolean }) {
  const { calendarEvents, calendarCategories, calendarGrants, currentRole, moveCalendarEvent } =
    useMessaging();

  const granted = !!calendarGrants[SELF_MEMBER_ID];
  const role = currentRole as Role;
  const canView = canViewCalendar(role, granted);
  const canEdit = canEditCalendar(role, granted);

  const [view, setView] = useState<ViewKey>("month");
  const [anchor, setAnchor] = useState<Date>(() => new Date(DEAL_DESK_NOW_MS));
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date(DEAL_DESK_NOW_MS));
  const [selected, setSelected] = useState<EventOccurrence | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [prefillStart, setPrefillStart] = useState<Date | null>(null);
  const [prefillAllDay, setPrefillAllDay] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  // Visible range per view.
  const [rangeStart, rangeEnd] = useMemo<[Date, Date]>(() => {
    if (view === "month") {
      const days = monthGridDays(anchor);
      return [startOfDay(days[0]), endOfDay(days[days.length - 1])];
    }
    if (view === "week") {
      const days = weekDays(anchor);
      return [startOfDay(days[0]), endOfDay(days[6])];
    }
    if (view === "day") return [startOfDay(anchor), endOfDay(anchor)];
    return [startOfDay(anchor), endOfDay(addDays(anchor, 44))]; // agenda
  }, [view, anchor]);

  const occurrences = useMemo(
    () => expandAll(calendarEvents, rangeStart, rangeEnd),
    [calendarEvents, rangeStart, rangeEnd]
  );

  // Wide range for the dashboard sidebar.
  const dashOccurrences = useMemo(
    () => expandAll(calendarEvents, addDays(anchor, -40), addDays(anchor, 90)),
    [calendarEvents, anchor]
  );

  const editingEvent = editId ? calendarEvents.find((e) => e.id === editId) ?? null : null;

  const title =
    view === "month" ? monthLabel(anchor)
    : view === "week" ? weekLabel(anchor)
    : view === "day" ? dayLabelLong(anchor)
    : `Agenda · ${monthLabel(anchor)}`;

  const navStep = (dir: -1 | 1) => {
    if (view === "month") setAnchor((a) => addMonths(a, dir));
    else if (view === "week") setAnchor((a) => addDays(a, 7 * dir));
    else if (view === "day") setAnchor((a) => addDays(a, dir));
    else setAnchor((a) => addDays(a, 30 * dir));
  };

  const openCreate = (start: Date, allDay: boolean) => {
    if (!canEdit) return;
    setEditId(null);
    setPrefillStart(start);
    setPrefillAllDay(allDay);
    setModalOpen(true);
  };
  const openDetail = (occ: EventOccurrence) => {
    setSelected(occ);
    setDetailOpen(true);
  };
  const onMove = (id: string, startISO: string, endISO: string) => {
    if (canEdit) moveCalendarEvent(id, startISO, endISO);
  };

  if (!canView) {
    return (
      <div className={cn("mx-auto max-w-2xl px-5 py-20 text-center", !adminFrame && "")}>
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-4 ring-navy-900/10">
          <ShieldAlert className="h-6 w-6" strokeWidth={2} />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-navy-900 tracking-tight">Calendar access required</h2>
        <p className="mt-2 text-sm text-navy-700/70 leading-relaxed">
          Your role is <span className="font-semibold text-navy-900">{currentRole}</span>. The calendar is available to
          Admins, Editors, Moderators (read-only), and members granted access by a Super Admin.
        </p>
      </div>
    );
  }

  // Month-as-navigation: a day click selects it in the schedule sidebar and
  // keeps the grid anchored to that day's month.
  const selectDay = (day: Date) => {
    setSelectedDay(day);
    if (day.getMonth() !== anchor.getMonth() || day.getFullYear() !== anchor.getFullYear()) {
      setAnchor(day);
    }
  };

  const viewProps = {
    anchorDate: anchor,
    occurrences,
    categories: calendarCategories,
    canEdit,
    onSelectEvent: openDetail,
    onCreateAt: openCreate,
    onMoveEvent: onMove,
    selectedDate: selectedDay,
    onSelectDay: selectDay,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-gold-500">
            <CalendarDays className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-navy-900">{title}</h1>
            {!canEdit ? <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-amber-700">Read only</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center rounded-full bg-white ring-1 ring-navy-900/[0.08] overflow-hidden">
            <button type="button" onClick={() => navStep(-1)} aria-label="Previous" className="h-9 w-9 inline-flex items-center justify-center hover:bg-bone text-navy-700">
              <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
            </button>
            <button type="button" onClick={() => setAnchor(new Date(DEAL_DESK_NOW_MS))} className="px-3 h-9 text-xs uppercase tracking-[0.14em] font-bold text-navy-900 hover:bg-bone border-x border-navy-900/[0.08]">
              Today
            </button>
            <button type="button" onClick={() => navStep(1)} aria-label="Next" className="h-9 w-9 inline-flex items-center justify-center hover:bg-bone text-navy-700">
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>

          <ViewSwitcher view={view} onChange={setView} />

          {canEdit ? (
            <>
              <button type="button" onClick={() => setCatOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.1] hover:ring-navy-900/25 text-navy-900 font-semibold px-3.5 py-2 text-xs transition-colors">
                <Palette className="h-3.5 w-3.5" strokeWidth={2.4} />
                Categories
              </button>
              <button type="button" onClick={() => openCreate(anchor, false)} className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-sm transition-colors">
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                New Event
              </button>
            </>
          ) : null}
        </div>
      </header>

      {/* Body: calendar · selected day · (event workspace on xl when open) */}
      <div
        className={cn(
          "grid grid-cols-1 gap-5 items-start",
          detailOpen
            ? "xl:grid-cols-[minmax(0,1fr)_300px_360px]"
            : "xl:grid-cols-[minmax(0,1fr)_320px]"
        )}
      >
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-3 md:p-4 min-w-0">
          {view === "month" ? <MonthView {...viewProps} /> : null}
          {view === "week" ? <WeekView {...viewProps} /> : null}
          {view === "day" ? <DayView {...viewProps} /> : null}
          {view === "agenda" ? <AgendaView {...viewProps} /> : null}
        </div>
        <aside className="space-y-4 min-w-0">
          <CalendarDashboard
            occurrences={dashOccurrences}
            categories={calendarCategories}
            onSelectEvent={openDetail}
            selectedDay={selectedDay}
            onChangeDay={selectDay}
            canEdit={canEdit}
            onCreateAt={openCreate}
          />
        </aside>
        <EventDetailPanel
          occ={selected}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          canEdit={canEdit}
          categories={calendarCategories}
          onEdit={(id) => {
            setDetailOpen(false);
            setEditId(id);
            setPrefillStart(null);
            setModalOpen(true);
          }}
        />
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editingEvent}
        prefillStart={prefillStart}
        prefillAllDay={prefillAllDay}
        categories={calendarCategories}
      />
      <CategoryManager open={catOpen} onClose={() => setCatOpen(false)} />
    </div>
  );
}

function ViewSwitcher({ view, onChange }: { view: ViewKey; onChange: (v: ViewKey) => void }) {
  const items: { key: ViewKey; label: string; Icon: typeof Square }[] = [
    { key: "month", label: "Month", Icon: CalendarRange },
    { key: "week", label: "Week", Icon: Columns3 },
    { key: "day", label: "Day", Icon: Square },
    { key: "agenda", label: "Agenda", Icon: ListChecks },
  ];
  return (
    <div className="inline-flex items-center rounded-full bg-white ring-1 ring-navy-900/[0.08] p-0.5">
      {items.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.12em] font-semibold transition-colors",
            view === key ? "bg-navy-900 text-white" : "text-navy-700 hover:text-navy-900"
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
