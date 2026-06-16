"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Plus,
  ChevronDown,
  ChevronRight,
  Repeat,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import {
  categoryColor,
  type EventRelations,
  type EventType,
} from "@/data/calendar";
import { canEditCalendar, type Role } from "@/lib/roles";
import {
  relatedOccurrences,
  splitByNow,
  nextOfTypes,
  countOfTypes,
} from "@/lib/calendar/relatedEvents";
import { addDays, formatTime, formatDate } from "@/lib/calendar/dates";
import type { EventOccurrence } from "@/lib/calendar/recurrence";
import { TYPE_ICON } from "./shared";
import EventModal from "./EventModal";
import EventDetailPanel from "./EventDetailPanel";
import { cn } from "@/lib/cn";

const SELF_MEMBER_ID = "MEM-000001";

const DEFAULT_HIGHLIGHTS: { label: string; types: EventType[] }[] = [
  { label: "Next Meeting", types: ["Meeting", "Investor Meeting"] },
  { label: "Next Deadline", types: ["Deadline"] },
  { label: "Upcoming Calls", types: ["Call"] },
  { label: "Follow-Ups", types: ["Follow Up"] },
];

const DEFAULT_QUICK: EventType[] = ["Meeting", "Call", "Follow Up", "Deadline"];

/**
 * Reusable calendar panel for related records (deal / opportunity / company /
 * member / introduction). Surfaces a record's linked events with highlights,
 * upcoming + past lists, a Create Event button, and quick-create shortcuts
 * that prefill the relationship. Self-contained: owns the create modal and the
 * event detail panel.
 */
export default function CalendarEventsPanel({
  relation,
  eyebrow = "Calendar",
  highlights = DEFAULT_HIGHLIGHTS,
  quickTypes = DEFAULT_QUICK,
}: {
  relation: EventRelations;
  eyebrow?: string;
  highlights?: { label: string; types: EventType[] }[];
  quickTypes?: EventType[];
}) {
  const { calendarEvents, calendarCategories, calendarGrants, currentRole } = useMessaging();
  const canEdit = canEditCalendar(currentRole as Role, !!calendarGrants[SELF_MEMBER_ID]);
  const nowMs = DEAL_DESK_NOW_MS;

  const [createOpen, setCreateOpen] = useState(false);
  const [prefillType, setPrefillType] = useState<EventType | undefined>(undefined);
  const [selected, setSelected] = useState<EventOccurrence | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const occ = relatedOccurrences(
      calendarEvents,
      relation,
      new Date(nowMs - 90 * 24 * 3600 * 1000),
      new Date(nowMs + 365 * 24 * 3600 * 1000)
    );
    return splitByNow(occ, nowMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarEvents, JSON.stringify(relation)]);

  const highlightData = useMemo(
    () =>
      highlights.map((h) => ({
        ...h,
        next: nextOfTypes(upcoming, h.types),
        count: countOfTypes(upcoming, h.types),
      })),
    [highlights, upcoming]
  );

  const openCreate = (type?: EventType) => {
    setPrefillType(type);
    setCreateOpen(true);
  };
  const openDetail = (occ: EventOccurrence) => {
    setSelected(occ);
    setDetailOpen(true);
  };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
      <header className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.4} />
          {eyebrow}
          <span className="text-navy-700/45 normal-case tracking-normal font-medium">
            · {upcoming.length} upcoming
          </span>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => openCreate()}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-3.5 py-1.5 text-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
            Create Event
          </button>
        ) : null}
      </header>

      {/* Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {highlightData.map((h) => (
          <div key={h.label} className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-2.5">
            <div className="text-[9px] uppercase tracking-[0.12em] font-bold text-navy-700/55 truncate">
              {h.label}
            </div>
            {h.next ? (
              <button
                type="button"
                onClick={() => openDetail(h.next!)}
                className="mt-1 block text-left w-full group"
              >
                <div className="text-[11px] font-semibold text-navy-900 group-hover:text-gold-700 truncate">
                  {h.next.event.title}
                </div>
                <div className="text-[10px] text-navy-700/55 tabular-nums">
                  {formatDate(h.next.start)}
                  {!h.next.event.allDay ? ` · ${formatTime(h.next.start)}` : ""}
                </div>
              </button>
            ) : (
              <div className="mt-1 text-[11px] text-navy-700/40">{h.count > 0 ? `${h.count} scheduled` : "None"}</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick-create shortcuts */}
      {canEdit ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickTypes.map((t) => {
            const Icon = TYPE_ICON[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => openCreate(t)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.1] hover:ring-gold-500/50 text-navy-900 px-2.5 py-1 text-[11px] font-semibold transition-colors"
              >
                <Icon className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
                {t === "Follow Up" ? "Follow-Up" : t}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Upcoming */}
      {upcoming.length === 0 ? (
        <p className="text-xs text-navy-700/55 py-1">No upcoming events linked to this record.</p>
      ) : (
        <ul className="divide-y divide-navy-900/[0.05]">
          {upcoming.slice(0, 6).map((occ) => (
            <EventRow key={occ.occurrenceId} occ={occ} categories={calendarCategories} onClick={() => openDetail(occ)} />
          ))}
        </ul>
      )}

      {/* Past (collapsible) */}
      {past.length > 0 ? (
        <div className="mt-2 border-t border-navy-900/[0.05] pt-2">
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-700/60 hover:text-navy-900"
          >
            {showPast ? <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.4} /> : <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />}
            Past Events ({past.length})
          </button>
          {showPast ? (
            <ul className="divide-y divide-navy-900/[0.05] mt-1">
              {past.slice(0, 8).map((occ) => (
                <EventRow key={occ.occurrenceId} occ={occ} categories={calendarCategories} onClick={() => openDetail(occ)} muted />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <EventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        prefill={{ relations: relation, type: prefillType }}
        categories={calendarCategories}
      />
      <EventDetailPanel
        occ={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        canEdit={canEdit}
        categories={calendarCategories}
        onEdit={() => {
          // Editing from a related panel routes the user to the full calendar
          // for the richest editing surface.
          setDetailOpen(false);
        }}
      />
    </section>
  );
}

function EventRow({
  occ,
  categories,
  onClick,
  muted,
}: {
  occ: EventOccurrence;
  categories: { id: string; name: string; color: string }[];
  onClick: () => void;
  muted?: boolean;
}) {
  const color = categoryColor(occ.event, categories);
  const Icon = TYPE_ICON[occ.event.type];
  return (
    <li>
      <button type="button" onClick={onClick} className={cn("flex items-center gap-2.5 py-2 w-full text-left group", muted && "opacity-70")}>
        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <Icon className="h-3.5 w-3.5 text-navy-700/50 shrink-0" strokeWidth={2.1} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-navy-900 group-hover:text-gold-700 truncate">
            {occ.event.title}
            {occ.isRecurring ? <Repeat className="inline h-3 w-3 ml-1 text-navy-700/40" strokeWidth={2.2} /> : null}
          </span>
          <span className="block text-[10px] text-navy-700/55 tabular-nums">
            {formatDate(occ.start)}
            {!occ.event.allDay ? ` · ${formatTime(occ.start)}` : " · All day"}
            {" · "}{occ.event.type}
          </span>
        </span>
      </button>
    </li>
  );
}
