"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
import Modal from "@/components/negotiations/Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import {
  EVENT_TYPES,
  EVENT_PRIORITIES,
  EVENT_STATUSES,
  RECURRENCE_FREQS,
  TYPE_DEFAULT_CATEGORY,
  type CalendarEvent,
  type CalendarCategory,
  type EventType,
  type EventPriority,
  type EventStatus,
  type RecurrenceFreq,
  type EventRelations,
} from "@/data/calendar";
import { combineDateTime, toDateInput, toTimeInput } from "@/lib/calendar/dates";
import { DEAL_DESK_NOW_MS } from "@/data/deals";
import RichTextEditor from "./RichTextEditor";
import { cn } from "@/lib/cn";

const inputCls =
  "w-full rounded-lg bg-white ring-1 ring-navy-900/[0.12] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal edits this event; otherwise it creates. */
  event?: CalendarEvent | null;
  prefillStart?: Date | null;
  prefillAllDay?: boolean;
  /** Seed a new event's relations / type / title (used by the related-record panels). */
  prefill?: { relations?: EventRelations; type?: EventType; title?: string } | null;
  categories: CalendarCategory[];
  onSaved?: (id: string) => void;
};

export default function EventModal({
  open,
  onClose,
  event,
  prefillStart,
  prefillAllDay,
  prefill,
  categories,
  onSaved,
}: Props) {
  const { createCalendarEvent, updateCalendarEvent, deals, introductionRequests } = useMessaging();
  const editing = !!event;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<EventType>("Meeting");
  const [categoryId, setCategoryId] = useState("meetings");
  const [priority, setPriority] = useState<EventPriority>("Medium");
  const [status, setStatus] = useState<EventStatus>("Scheduled");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [rel, setRel] = useState<EventRelations>({});
  const [freq, setFreq] = useState<RecurrenceFreq>("None");
  const [interval, setInterval] = useState(1);
  const [neverEnds, setNeverEnds] = useState(true);
  const [until, setUntil] = useState("");

  // Hydrate the form whenever the modal opens (edit vs create vs prefill).
  useEffect(() => {
    if (!open) return;
    if (event) {
      const s = new Date(event.start);
      const e = new Date(event.end);
      setTitle(event.title);
      setDescription(event.description ?? "");
      setNotes(event.notes ?? "");
      setType(event.type);
      setCategoryId(event.categoryId);
      setPriority(event.priority);
      setStatus(event.status);
      setAllDay(event.allDay);
      setStartDate(toDateInput(s));
      setStartTime(toTimeInput(s));
      setEndDate(toDateInput(e));
      setEndTime(toTimeInput(e));
      setLocation(event.location ?? "");
      setRel(event.relations ?? {});
      setFreq(event.recurrence?.freq ?? "None");
      setInterval(event.recurrence?.interval ?? 1);
      setNeverEnds(!event.recurrence?.until);
      setUntil(event.recurrence?.until ? toDateInput(new Date(event.recurrence.until)) : "");
    } else {
      const base = prefillStart ?? new Date(DEAL_DESK_NOW_MS);
      const end = new Date(base.getTime() + 60 * 60 * 1000);
      const pType = prefill?.type ?? "Meeting";
      setTitle(prefill?.title ?? "");
      setDescription("");
      setNotes("");
      setType(pType);
      setCategoryId(TYPE_DEFAULT_CATEGORY[pType] ?? "meetings");
      setPriority("Medium");
      setStatus("Scheduled");
      setAllDay(!!prefillAllDay);
      setStartDate(toDateInput(base));
      setStartTime(toTimeInput(base));
      setEndDate(toDateInput(end));
      setEndTime(toTimeInput(end));
      setLocation("");
      setRel(prefill?.relations ?? {});
      setFreq("None");
      setInterval(1);
      setNeverEnds(true);
      setUntil("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event]);

  // When the type changes on a fresh event, suggest the matching category.
  const onTypeChange = (t: EventType) => {
    setType(t);
    if (!editing) setCategoryId(TYPE_DEFAULT_CATEGORY[t] ?? categoryId);
  };

  const memberOpts = useMemo(() => MEMBERS.map((m) => ({ id: m.id, label: m.name })), []);
  const companyOpts = useMemo(() => companies.map((c) => ({ id: c.id, label: c.name })), []);
  const oppOpts = useMemo(() => featuredOpportunities.map((o) => ({ id: o.id, label: o.title })), []);
  const dealOpts = useMemo(() => deals.map((d) => ({ id: d.dealId, label: d.title })), [deals]);
  const introOpts = useMemo(
    () => introductionRequests.map((r) => ({ id: r.id, label: `${r.requesterName} → ${r.targetMemberName}` })),
    [introductionRequests]
  );

  const canSubmit = title.trim().length > 0 && startDate && endDate;

  const submit = () => {
    if (!canSubmit) return;
    const start = allDay
      ? combineDateTime(startDate, "00:00")
      : combineDateTime(startDate, startTime);
    let end = allDay
      ? combineDateTime(endDate, "23:59")
      : combineDateTime(endDate, endTime);
    if (end.getTime() < start.getTime()) end = new Date(start.getTime() + 30 * 60 * 1000);

    const relations: EventRelations = {
      memberId: rel.memberId || undefined,
      companyId: rel.companyId || undefined,
      opportunityId: rel.opportunityId || undefined,
      dealId: rel.dealId || undefined,
      introductionId: rel.introductionId || undefined,
    };

    const recurrence = {
      freq,
      ...(freq === "Custom" ? { interval: Math.max(1, interval) } : {}),
      ...(freq !== "None" && !neverEnds && until ? { until: combineDateTime(until, "23:59").toISOString() } : {}),
    };

    if (editing && event) {
      updateCalendarEvent(event.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        type,
        categoryId,
        priority,
        status,
        allDay,
        start: start.toISOString(),
        end: end.toISOString(),
        location: location.trim() || undefined,
        relations,
        recurrence,
      });
      onSaved?.(event.id);
    } else {
      const id = createCalendarEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        type,
        categoryId,
        priority,
        status,
        allDay,
        start: start.toISOString(),
        end: end.toISOString(),
        location: location.trim() || undefined,
        relations,
        attachments: [],
        recurrence,
      });
      onSaved?.(id);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Event" : "New Event"}
      description={editing ? "Update this calendar event. Changes are audited." : "Add an event to the calendar."}
      maxWidth="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm disabled:bg-navy-900/10 disabled:text-navy-700/40 disabled:cursor-not-allowed"
          >
            {editing ? <Save className="h-4 w-4" strokeWidth={2.4} /> : <Plus className="h-4 w-4" strokeWidth={2.4} />}
            {editing ? "Save Event" : "Create Event"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" full>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Investor meeting — Aurora Capital" className={inputCls} autoFocus />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Type">
            <select value={type} onChange={(e) => onTypeChange(e.target.value as EventType)} className={inputCls}>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Category / Color">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full ring-1 ring-navy-900/15 shrink-0" style={{ backgroundColor: categories.find((c) => c.id === categoryId)?.color ?? "#64748b" }} />
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value as EventPriority)} className={inputCls}>
              {EVENT_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={inputCls}>
              {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-navy-900">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 accent-gold-600" />
          All-day event
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Start date">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
          </Field>
          {!allDay ? (
            <Field label="Start time">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
            </Field>
          ) : <div className="hidden sm:block" />}
          <Field label="End date">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
          </Field>
          {!allDay ? (
            <Field label="End time">
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
            </Field>
          ) : <div className="hidden sm:block" />}
        </div>

        <Field label="Location" full>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Zoom · Cabo San Lucas · Office" className={inputCls} />
        </Field>

        <Field label="Notes" full>
          <RichTextEditor value={notes} onChange={setNotes} placeholder="Agenda, talking points, links…" />
        </Field>

        <Field label="Description" full>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary" className={inputCls} />
        </Field>

        {/* Recurrence */}
        <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.05] p-3 space-y-3">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60">Recurrence</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Repeats">
              <select value={freq} onChange={(e) => setFreq(e.target.value as RecurrenceFreq)} className={inputCls}>
                {RECURRENCE_FREQS.map((f) => <option key={f} value={f}>{f === "None" ? "Does not repeat" : f}</option>)}
              </select>
            </Field>
            {freq === "Custom" ? (
              <Field label="Every N days">
                <input type="number" min={1} value={interval} onChange={(e) => setInterval(parseInt(e.target.value || "1", 10))} className={inputCls} />
              </Field>
            ) : null}
          </div>
          {freq !== "None" ? (
            <div className="flex items-center gap-4 flex-wrap text-sm text-navy-900">
              <label className="inline-flex items-center gap-1.5">
                <input type="radio" checked={neverEnds} onChange={() => setNeverEnds(true)} className="accent-gold-600" />
                Never ends
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input type="radio" checked={!neverEnds} onChange={() => setNeverEnds(false)} className="accent-gold-600" />
                Ends on
              </label>
              {!neverEnds ? (
                <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className={cn(inputCls, "max-w-[180px]")} />
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Relations */}
        <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.05] p-3 space-y-3">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60">Related records</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RelSelect label="Member" value={rel.memberId} opts={memberOpts} onChange={(v) => setRel((r) => ({ ...r, memberId: v }))} />
            <RelSelect label="Company" value={rel.companyId} opts={companyOpts} onChange={(v) => setRel((r) => ({ ...r, companyId: v }))} />
            <RelSelect label="Opportunity" value={rel.opportunityId} opts={oppOpts} onChange={(v) => setRel((r) => ({ ...r, opportunityId: v }))} />
            <RelSelect label="Deal" value={rel.dealId} opts={dealOpts} onChange={(v) => setRel((r) => ({ ...r, dealId: v }))} />
            <RelSelect label="Introduction" value={rel.introductionId} opts={introOpts} onChange={(v) => setRel((r) => ({ ...r, introductionId: v }))} />
          </div>
        </div>

        {!editing ? (
          <p className="text-[11px] text-navy-700/55">
            Attachments can be added from the event detail panel after the event is created.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

function RelSelect({
  label,
  value,
  opts,
  onChange,
}: {
  label: string;
  value?: string;
  opts: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">— none —</option>
        {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </Field>
  );
}
