"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Flag,
  History as HistoryIcon,
  Link2,
  MapPin,
  Pencil,
  Repeat,
  Trash2,
  X,
} from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import { categoryColor, type CalendarCategory } from "@/data/calendar";
import { describeRecurrence } from "@/lib/calendar/recurrence";
import { dayLabelLong, formatTime } from "@/lib/calendar/dates";
import { formatRelative } from "@/data/messages";
import { capitalRequired } from "@/lib/home/format";
import type { EventOccurrence } from "./shared";
import { TYPE_ICON, PRIORITY_TONE, STATUS_TONE, tint } from "./shared";
import { renderRichText } from "./RichTextEditor";
import EventAttachments from "./EventAttachments";
import Badge from "@/components/ui/Badge";
import VerificationBadge from "@/components/company/VerificationBadge";
import OpportunityStatusBadge from "@/components/OpportunityStatusBadge";
import { initialsFromName } from "@/lib/home/format";
import { cn } from "@/lib/cn";

/**
 * The event workspace panel. One instance, three presentations by CSS:
 * full-screen sheet on mobile, right slide-over on tablet, and a static
 * third column inside the workspace grid on xl+ — the calendar and the
 * selected-day sidebar stay visible at every size. Same props contract
 * as the old modal; all mutations reuse the existing provider workflows.
 */
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
  const {
    calendarEvents,
    deleteCalendarEvent,
    duplicateCalendarEvent,
    updateCalendarEvent,
    deals,
  } = useMessaging();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Prefer the live record so attachments / edits reflect immediately.
  const event = useMemo(
    () => (occ ? calendarEvents.find((e) => e.id === occ.event.id) ?? occ.event : null),
    [occ, calendarEvents]
  );

  // Escape closes; focus moves into the panel and returns on close.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!linkCopied) return;
    const t = window.setTimeout(() => setLinkCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [linkCopied]);

  if (!occ || !event) return null;
  const Icon = TYPE_ICON[event.type];
  const color = categoryColor(event, categories);
  const categoryName = categories.find((c) => c.id === event.categoryId)?.name ?? "Custom";
  const isCompleted = event.status === "Completed";
  const isImportant = event.priority === "Urgent" || event.priority === "High";

  const company = event.relations.companyId
    ? companies.find((c) => c.id === event.relations.companyId) ?? null
    : null;
  const opportunity = event.relations.opportunityId
    ? featuredOpportunities.find((o) => o.id === event.relations.opportunityId) ?? null
    : null;
  const deal = event.relations.dealId
    ? deals.find((d) => d.dealId === event.relations.dealId) ?? null
    : null;
  const member = event.relations.memberId
    ? MEMBERS.find((m) => m.id === event.relations.memberId) ?? null
    : null;
  const hasRelations = !!(company || opportunity || deal || member);

  const durationMin = Math.round((occ.end.getTime() - occ.start.getTime()) / 60000);
  const durationLabel =
    event.allDay || durationMin <= 0
      ? null
      : durationMin < 60
        ? `${durationMin}m`
        : durationMin % 60
          ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
          : `${Math.floor(durationMin / 60)}h`;

  const notesLong = (event.notes?.length ?? 0) > 320;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
    } catch {
      // Clipboard unavailable — no-op.
    }
  };

  return (
    <>
      {/* Backdrop — overlay modes only (mobile / tablet) */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-[2px] transition-opacity duration-200 xl:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`Event details — ${event.title}`}
        className={cn(
          // Base (mobile): full-screen sheet. sm+: right slide-over.
          "fixed inset-y-0 right-0 z-50 w-full sm:w-[26rem] bg-cream shadow-2xl shadow-navy-900/25 flex flex-col outline-none",
          "transition-transform duration-[240ms] ease-out",
          open ? "translate-x-0" : "translate-x-full invisible",
          // xl+: a static column inside the workspace grid — no overlay.
          "xl:static xl:z-auto xl:w-auto xl:shadow-none xl:bg-transparent xl:transition-none xl:translate-x-0",
          open ? "xl:visible" : "xl:hidden"
        )}
      >
        <div className="flex-1 overflow-y-auto xl:overflow-visible">
          <div className="xl:rounded-2xl xl:bg-white xl:ring-1 xl:ring-navy-900/[0.06] xl:overflow-hidden">
            {/* Executive header */}
            <header className="relative bg-navy-900 text-white px-5 pt-5 pb-5">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close event details"
                className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>

              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1"
                style={{ backgroundColor: tint(color, 0.2), color, borderColor: tint(color, 0.45) }}
              >
                <Icon className="h-5 w-5" strokeWidth={2.1} />
              </span>
              <h2 className={cn("mt-3 text-xl font-semibold tracking-tight leading-snug pr-8", isCompleted && "line-through opacity-70")}>
                {event.title}
              </h2>
              <p className="mt-1 text-sm text-white/65">
                {dayLabelLong(occ.start)}
                {!event.allDay ? (
                  <>
                    {" · "}
                    <span className="text-white/90 font-medium tabular-nums">
                      {formatTime(occ.start)} – {formatTime(occ.end)}
                    </span>
                    {durationLabel ? <span className="text-white/50"> · {durationLabel}</span> : null}
                  </>
                ) : (
                  " · All day"
                )}
              </p>

              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <Badge size="sm" className={PRIORITY_TONE[event.priority]}>{event.priority}</Badge>
                <Badge size="sm" className={STATUS_TONE[event.status] ?? STATUS_TONE.Scheduled}>{event.status}</Badge>
                <Badge size="sm" className="bg-white/10 text-white/85 ring-white/20">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {categoryName}
                </Badge>
                {event.recurrence?.freq && event.recurrence.freq !== "None" ? (
                  <Badge size="sm" className="bg-white/10 text-white/85 ring-white/20">
                    <Repeat className="h-2.5 w-2.5" strokeWidth={2.4} />
                    {describeRecurrence(event.recurrence)}
                  </Badge>
                ) : null}
              </div>
            </header>

            {/* Action bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-navy-900/[0.06] px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
              {canEdit ? (
                <>
                  <ActionBtn icon={Pencil} label="Edit" primary onClick={() => onEdit(event.id)} />
                  {!isCompleted ? (
                    <ActionBtn
                      icon={CheckCircle2}
                      label="Complete"
                      onClick={() => updateCalendarEvent(event.id, { status: "Completed" })}
                    />
                  ) : null}
                  <ActionBtn
                    icon={Flag}
                    label={isImportant ? "Important ✓" : "Important"}
                    onClick={() =>
                      updateCalendarEvent(event.id, { priority: isImportant ? "Medium" : "High" })
                    }
                  />
                  <ActionBtn icon={Copy} label="Duplicate" onClick={() => { duplicateCalendarEvent(event.id); onClose(); }} />
                </>
              ) : null}
              <ActionBtn
                icon={linkCopied ? Check : Link2}
                label={linkCopied ? "Copied" : "Copy Link"}
                onClick={copyLink}
              />
              {canEdit ? (
                <ActionBtn icon={Trash2} label="Delete" danger onClick={() => setConfirmDelete(true)} />
              ) : null}
            </div>

            <div className="p-4 space-y-5 bg-white xl:bg-transparent">
              {event.description ? (
                <p className="text-sm text-navy-700/85 leading-relaxed">{event.description}</p>
              ) : null}

              {/* Location */}
              {event.location ? (
                <div className="flex items-start gap-2.5 rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-3">
                  <MapPin className="h-4 w-4 text-gold-600 mt-0.5 shrink-0" strokeWidth={2.2} />
                  <div className="min-w-0 flex-1 text-sm text-navy-900 font-medium">{event.location}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-[11px] uppercase tracking-[0.12em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
                  >
                    Directions
                  </a>
                </div>
              ) : null}

              {/* Related records — entity cards */}
              {hasRelations ? (
                <section>
                  <SectionLabel>Related</SectionLabel>
                  <div className="space-y-2">
                    {company ? (
                      <EntityCard href={`/company/${company.slug}`}>
                        <span className="h-9 w-9 shrink-0 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center text-xs font-semibold tracking-wide">
                          {initialsFromName(company.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-navy-900 truncate">{company.name}</span>
                            <VerificationBadge status={company.verification} />
                          </span>
                          <span className="block text-[11px] text-navy-700/55 truncate">{company.industry}</span>
                        </span>
                      </EntityCard>
                    ) : null}
                    {opportunity ? (
                      <EntityCard href={`/opportunity/${opportunity.slug}`}>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-navy-900 truncate">{opportunity.title}</span>
                            <OpportunityStatusBadge status={opportunity.status} size="sm" />
                          </span>
                          <span className="block text-[11px] text-navy-700/55">
                            {capitalRequired(opportunity)}
                            {opportunity.expectedReturn ? ` · ${opportunity.expectedReturn} target` : ""}
                          </span>
                        </span>
                      </EntityCard>
                    ) : null}
                    {deal ? (
                      <EntityCard href={`/deal-desk/${deal.dealId}`}>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-navy-900 truncate">{deal.title}</span>
                            <Badge size="sm" className="bg-sky-500/15 text-sky-700 ring-sky-500/30">{deal.stage}</Badge>
                          </span>
                          <span className="block text-[11px] text-navy-700/55 tabular-nums">{deal.dealId}</span>
                        </span>
                      </EntityCard>
                    ) : null}
                    {member ? (
                      <EntityCard href={`/member/${member.slug}`}>
                        <span className="h-9 w-9 shrink-0 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center text-xs font-semibold tracking-wide">
                          {initialsFromName(member.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-navy-900 truncate">{member.name}</span>
                          <span className="block text-[11px] text-navy-700/55 truncate">{member.memberType}</span>
                        </span>
                      </EntityCard>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {/* Notes — collapsible when long */}
              {event.notes && event.notes.trim() ? (
                <section>
                  <SectionLabel>Notes</SectionLabel>
                  <div
                    className={cn(
                      "cc-richtext text-sm rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.05] px-3.5 py-3 leading-relaxed",
                      notesLong && !notesExpanded && "max-h-36 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
                    )}
                    dangerouslySetInnerHTML={{ __html: renderRichText(event.notes) }}
                  />
                  {notesLong ? (
                    <button
                      type="button"
                      onClick={() => setNotesExpanded((v) => !v)}
                      className="mt-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
                    >
                      {notesExpanded ? "Show less" : "Show more"}
                    </button>
                  ) : null}
                </section>
              ) : null}

              {/* Attachments — existing document manager reused */}
              <section>
                <SectionLabel>Attachments</SectionLabel>
                <EventAttachments event={event} canEdit={canEdit} />
              </section>

              {/* History */}
              <section>
                <SectionLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <HistoryIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                    History
                  </span>
                </SectionLabel>
                <ul className="space-y-1.5">
                  {[...event.history].reverse().map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-navy-700/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />
                      <span className="font-semibold text-navy-900">{h.action}</span>
                      {h.detail ? <span className="text-navy-700/55 truncate">· {h.detail}</span> : null}
                      <span className="ml-auto shrink-0 text-navy-700/45">{formatRelative(h.at)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${event.title}”?`}
        body="The event and its attachments are removed. This cannot be undone and is recorded in the audit trail."
        confirmLabel="Delete event"
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteCalendarEvent(event.id);
          setConfirmDelete(false);
          onClose();
        }}
      />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-1.5">
      {children}
    </div>
  );
}

function EntityCard({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 rounded-xl bg-white ring-1 ring-navy-900/[0.06] hover:ring-gold-500/40 hover:shadow-sm p-3 transition-all"
    >
      {children}
      <ArrowUpRight
        className="h-3.5 w-3.5 shrink-0 text-navy-700/30 group-hover:text-gold-600 transition-colors"
        strokeWidth={2.2}
      />
    </Link>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  primary,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        primary
          ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
          : danger
            ? "text-rose-700 ring-1 ring-rose-500/30 hover:bg-rose-500/10"
            : "text-navy-900/80 ring-1 ring-navy-900/10 hover:ring-navy-900/25 hover:text-navy-900 bg-white"
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      {label}
    </button>
  );
}
