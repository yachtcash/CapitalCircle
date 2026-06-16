"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Copy,
  Trash2,
  MapPin,
  Repeat,
  Clock,
  History as HistoryIcon,
  Link2,
} from "lucide-react";
import Modal from "@/components/negotiations/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import { categoryColor, type CalendarCategory } from "@/data/calendar";
import { describeRecurrence } from "@/lib/calendar/recurrence";
import { dayLabelLong, formatTime } from "@/lib/calendar/dates";
import { formatRelative } from "@/data/messages";
import type { EventOccurrence } from "./shared";
import { TYPE_ICON, PRIORITY_TONE, STATUS_TONE } from "./shared";
import { renderRichText } from "./RichTextEditor";
import EventAttachments from "./EventAttachments";
import { cn } from "@/lib/cn";

export default function EventDetailPanel({
  occ,
  open,
  onClose,
  canEdit,
  categories,
  onEdit,
}: {
  occ: EventOccurrence | null;
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
  categories: CalendarCategory[];
  onEdit: (eventId: string) => void;
}) {
  const { calendarEvents, deleteCalendarEvent, duplicateCalendarEvent } = useMessaging();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Prefer the live record so attachments / edits reflect immediately.
  const event = useMemo(
    () => (occ ? calendarEvents.find((e) => e.id === occ.event.id) ?? occ.event : null),
    [occ, calendarEvents]
  );

  if (!occ || !event) return null;
  const Icon = TYPE_ICON[event.type];
  const color = categoryColor(event, categories);
  const rels = relationLinks(event.relations);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={event.title}
        description={`${event.type} · ${categories.find((c) => c.id === event.categoryId)?.name ?? "Custom"}`}
        maxWidth="lg"
        footer={
          canEdit ? (
            <>
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rose-500/40 hover:bg-rose-500/10 text-rose-700 font-semibold px-4 py-2.5 text-sm">
                <Trash2 className="h-4 w-4" strokeWidth={2.4} />
                Delete
              </button>
              <button type="button" onClick={() => { duplicateCalendarEvent(event.id); onClose(); }} className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/10 hover:bg-bone text-navy-900 font-semibold px-4 py-2.5 text-sm">
                <Copy className="h-4 w-4" strokeWidth={2.4} />
                Duplicate
              </button>
              <button type="button" onClick={() => onEdit(event.id)} className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm">
                <Pencil className="h-4 w-4" strokeWidth={2.4} />
                Edit
              </button>
            </>
          ) : (
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone">Close</button>
          )
        }
      >
        <div className="space-y-5">
          {/* Header chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: color + "22", color }}>
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-bold ring-1", PRIORITY_TONE[event.priority])}>{event.priority}</span>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-bold ring-1", STATUS_TONE[event.status] ?? STATUS_TONE.Scheduled)}>{event.status}</span>
          </div>

          {/* When / where */}
          <div className="space-y-1.5 text-sm text-navy-700/85">
            <div className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
              <span className="font-semibold text-navy-900">{dayLabelLong(occ.start)}</span>
              <span>· {event.allDay ? "All day" : `${formatTime(occ.start)} – ${formatTime(occ.end)}`}</span>
            </div>
            {event.recurrence?.freq && event.recurrence.freq !== "None" ? (
              <div className="inline-flex items-center gap-2">
                <Repeat className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
                {describeRecurrence(event.recurrence)}
              </div>
            ) : null}
            {event.location ? (
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
                {event.location}
              </div>
            ) : null}
          </div>

          {event.description ? <p className="text-sm text-navy-700/85 leading-relaxed">{event.description}</p> : null}

          {/* Related records */}
          {rels.length > 0 ? (
            <div>
              <SectionLabel>Related</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {rels.map((r) => (
                  <Link key={r.href + r.label} href={r.href} className="inline-flex items-center gap-1 rounded-full bg-bone ring-1 ring-navy-900/[0.06] hover:ring-gold-500/40 px-2.5 py-1 text-[11px] font-semibold text-navy-900 transition-colors">
                    <Link2 className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Notes */}
          {event.notes && event.notes.trim() ? (
            <div>
              <SectionLabel>Notes</SectionLabel>
              <div className="cc-richtext text-sm rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.05] px-3 py-2.5" dangerouslySetInnerHTML={{ __html: renderRichText(event.notes) }} />
            </div>
          ) : null}

          {/* Attachments */}
          <div>
            <SectionLabel>Attachments</SectionLabel>
            <EventAttachments event={event} canEdit={canEdit} />
          </div>

          {/* History */}
          <div>
            <SectionLabel>
              <span className="inline-flex items-center gap-1.5"><HistoryIcon className="h-3.5 w-3.5" strokeWidth={2.4} />History</span>
            </SectionLabel>
            <ul className="space-y-1.5">
              {[...event.history].reverse().map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-navy-700/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />
                  <span className="font-semibold text-navy-900">{h.action}</span>
                  {h.detail ? <span className="text-navy-700/55">· {h.detail}</span> : null}
                  <span className="ml-auto text-navy-700/45">{formatRelative(h.at)} · {h.actor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${event.title}”?`}
        body="The event and its attachments are removed. This cannot be undone and is recorded in the audit trail."
        confirmLabel="Delete event"
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => { deleteCalendarEvent(event.id); setConfirmDelete(false); onClose(); }}
      />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-1.5">{children}</div>;
}

function relationLinks(rel: {
  memberId?: string;
  companyId?: string;
  opportunityId?: string;
  dealId?: string;
  introductionId?: string;
}): { href: string; label: string }[] {
  const out: { href: string; label: string }[] = [];
  if (rel.memberId) {
    const m = MEMBERS.find((x) => x.id === rel.memberId);
    out.push({ href: m ? `/member/${m.slug}` : "/members", label: m?.name ?? rel.memberId });
  }
  if (rel.companyId) {
    const c = companies.find((x) => x.id === rel.companyId);
    out.push({ href: c ? `/company/${c.slug}` : "/companies", label: c?.name ?? rel.companyId });
  }
  if (rel.opportunityId) {
    const o = featuredOpportunities.find((x) => x.id === rel.opportunityId);
    out.push({ href: o ? `/opportunity/${o.slug}` : "/opportunities", label: o?.title ?? rel.opportunityId });
  }
  if (rel.dealId) out.push({ href: `/deal-desk/${rel.dealId}`, label: rel.dealId });
  if (rel.introductionId) out.push({ href: "/admin/introductions", label: rel.introductionId });
  return out;
}
