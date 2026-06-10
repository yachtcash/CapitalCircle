"use client";

import Link from "next/link";
import { ChevronLeft, ArrowRight, ScrollText } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { groupForAction, toneForAction } from "@/data/audit";
import { AdminPage, StatusPill } from "./AdminShell";
import { cn } from "@/lib/cn";

const TONE_DOT: Record<ReturnType<typeof toneForAction>, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

/** Deep link to the affected record's admin surface, when one exists. */
function targetHref(kind: string, id: string): string | null {
  switch (kind) {
    case "member":
      return `/admin/members/${id}`;
    case "company":
      return `/admin/companies/${id}`;
    case "opportunity":
      return `/admin/opportunities/${id}`;
    case "deal":
      return `/deal-desk/${id}`;
    case "listing":
      return `/dashboard/listings/${id}`;
    case "introduction":
      return "/admin/introductions";
    default:
      return null;
  }
}

export default function AdminAuditDetail({ auditId }: { auditId: string }) {
  const { auditEvents, hydrated } = useMessaging();
  const event = auditEvents.find((e) => e.id === auditId);

  if (!event) {
    return (
      <AdminPage title={hydrated ? "Audit event not found" : "Loading audit event…"}>
        <p className="text-sm text-navy-700/65">
          {hydrated
            ? `No audit event matches ${auditId}. It may have been recorded in a different browser session.`
            : "Resolving the audit trail from local storage."}
        </p>
        <Link
          href="/admin/audit"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-600"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
          Back to Audit Log
        </Link>
      </AdminPage>
    );
  }

  const href = targetHref(event.targetKind, event.targetId);
  const ts = new Date(event.createdAt);

  return (
    <AdminPage title={event.action} subtitle={`${event.id} · ${groupForAction(event.action)}`}>
      <Link
        href="/admin/audit"
        className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] font-semibold text-navy-700/70 hover:text-navy-900"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
        Audit Log
      </Link>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="space-y-5 min-w-0">
          {/* Event card */}
          <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  TONE_DOT[toneForAction(event.action)]
                )}
              />
              <span className="font-semibold text-navy-900">{event.action}</span>
              <StatusPill label={groupForAction(event.action)} tone="navy" />
            </div>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row k="Audit ID" v={event.id} mono />
              <Row
                k="Timestamp"
                v={ts.toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              />
              <Row k="Actor" v={event.actorName} />
              <Row k="Role" v={event.actorRole} />
              <Row k="Entity Type" v={event.targetKind} />
              <Row k="Entity ID" v={event.targetId} mono />
            </dl>
            {event.targetLabel || event.detail ? (
              <div className="mt-4 rounded-xl bg-bone/60 p-4">
                <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
                  Description
                </div>
                <p className="mt-1 text-sm text-navy-900 leading-relaxed">
                  {[event.targetLabel, event.detail].filter(Boolean).join(" — ")}
                </p>
              </div>
            ) : null}
          </div>

          {/* Before / After */}
          {event.before && event.after ? (
            <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold mb-3">
                Change
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
                <div className="rounded-xl bg-rose-500/[0.06] ring-1 ring-rose-500/25 p-4">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-rose-700 font-bold">
                    Before
                  </div>
                  <div className="mt-1.5 text-base font-semibold text-navy-900">
                    {event.before}
                  </div>
                </div>
                <div className="self-center text-gold-600">
                  <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
                </div>
                <div className="rounded-xl bg-emerald-500/[0.06] ring-1 ring-emerald-500/25 p-4">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-emerald-700 font-bold">
                    After
                  </div>
                  <div className="mt-1.5 text-base font-semibold text-navy-900">
                    {event.after}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Raw metadata */}
          <div className="rounded-2xl bg-navy-900 text-white p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold-400 font-bold inline-flex items-center gap-1.5 mb-3">
              <ScrollText className="h-3.5 w-3.5" strokeWidth={2.4} />
              Metadata
            </div>
            <pre className="text-xs text-white/80 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold-700 font-bold mb-3">
              Affected Record
            </div>
            <div className="text-sm font-semibold text-navy-900">
              {event.targetLabel ?? event.targetId}
            </div>
            <div className="text-xs text-navy-700/65 mt-0.5">
              {event.targetKind} · {event.targetId}
            </div>
            {href ? (
              <Link
                href={href}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
              >
                Open Record
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </AdminPage>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-navy-900/[0.05] pb-2">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold shrink-0">
        {k}
      </dt>
      <dd className={cn("font-semibold text-navy-900 text-right", mono && "tabular-nums")}>{v}</dd>
    </div>
  );
}
