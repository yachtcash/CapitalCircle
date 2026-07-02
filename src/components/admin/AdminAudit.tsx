"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ScrollText,
  CalendarDays,
  CalendarRange,
  UserCog,
  FileEdit,
  Briefcase,
  Gavel,
  Search,
  X,
  Download,
  LayoutList,
  GitCommitVertical,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  AUDIT_GROUPS,
  groupForAction,
  isModerationAction,
  toneForAction,
  type AuditEvent,
  type AuditGroup,
  type AuditTargetKind,
} from "@/data/audit";
import { ROLES, type Role } from "@/lib/roles";
import { AdminPage, TableShell, THead, StatusPill } from "./AdminShell";
import { cn } from "@/lib/cn";

const ENTITY_TYPES: AuditTargetKind[] = [
  "member",
  "company",
  "opportunity",
  "listing",
  "deal",
  "introduction",
  "document",
  "image",
  "role",
  "system",
];

type QuickRange = "all" | "today" | "7d" | "30d";
type ViewMode = "table" | "timeline";

const DAY = 24 * 60 * 60 * 1000;

function fmtTs(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TONE_DOT: Record<ReturnType<typeof toneForAction>, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

export default function AdminAudit() {
  const { auditEvents } = useMessaging();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [groupFilter, setGroupFilter] = useState<AuditGroup | "all">("all");
  const [entityFilter, setEntityFilter] = useState<AuditTargetKind | "all">("all");
  const [quick, setQuick] = useState<QuickRange>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [view, setView] = useState<ViewMode>("table");

  const nowMs = Date.now();

  const metrics = useMemo(() => {
    let today = 0,
      d7 = 0,
      d30 = 0,
      roleChanges = 0,
      contentChanges = 0,
      dealChanges = 0,
      moderation = 0;
    const todayKey = new Date(nowMs).toDateString();
    for (const e of auditEvents) {
      const t = new Date(e.createdAt).getTime();
      if (new Date(e.createdAt).toDateString() === todayKey) today++;
      if (nowMs - t <= 7 * DAY) d7++;
      if (nowMs - t <= 30 * DAY) d30++;
      const g = groupForAction(e.action);
      if (g === "Role Management") roleChanges++;
      if (
        g === "Listing Actions" ||
        g === "Opportunity Actions" ||
        g === "Company Actions" ||
        g === "Image Actions" ||
        g === "Document Actions"
      )
        contentChanges++;
      if (g === "Deal Actions") dealChanges++;
      if (isModerationAction(e.action)) moderation++;
    }
    return { today, d7, d30, roleChanges, contentChanges, dealChanges, moderation };
  }, [auditEvents, nowMs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditEvents.filter((e) => {
      if (roleFilter !== "all" && e.actorRole !== roleFilter) return false;
      if (groupFilter !== "all" && groupForAction(e.action) !== groupFilter) return false;
      if (entityFilter !== "all" && e.targetKind !== entityFilter) return false;
      const t = new Date(e.createdAt).getTime();
      if (quick === "today" && new Date(e.createdAt).toDateString() !== new Date(nowMs).toDateString())
        return false;
      if (quick === "7d" && nowMs - t > 7 * DAY) return false;
      if (quick === "30d" && nowMs - t > 30 * DAY) return false;
      if (dateFrom && e.createdAt.slice(0, 10) < dateFrom) return false;
      if (dateTo && e.createdAt.slice(0, 10) > dateTo) return false;
      if (!q) return true;
      const hay = [
        e.id,
        e.actorName,
        e.actorRole,
        e.action,
        e.targetKind,
        e.targetId,
        e.targetLabel ?? "",
        e.detail ?? "",
        e.before ?? "",
        e.after ?? "",
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [auditEvents, query, roleFilter, groupFilter, entityFilter, quick, dateFrom, dateTo, nowMs]);

  const exportCsv = () => {
    const header = [
      "Audit ID",
      "Date",
      "Actor",
      "Role",
      "Action",
      "Entity Type",
      "Entity ID",
      "Description",
    ];
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [
      header.join(","),
      ...filtered.map((e) =>
        [
          e.id,
          e.createdAt,
          e.actorName,
          e.actorRole,
          e.action,
          e.targetKind,
          e.targetId,
          [e.targetLabel, e.detail, e.before && e.after ? `${e.before} → ${e.after}` : undefined]
            .filter(Boolean)
            .join(" — "),
        ]
          .map((v) => esc(String(v ?? "")))
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capital-circle-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 250);
  };

  return (
    <AdminPage
      title="Audit Log"
      count={auditEvents.length}
      subtitle="Who did what, when, and to which record — every privileged action on the platform."
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <Card label="Total Events" value={auditEvents.length} Icon={ScrollText} />
        <Card label="Today" value={metrics.today} Icon={CalendarDays} />
        <Card label="Last 7 Days" value={metrics.d7} Icon={CalendarRange} />
        <Card label="Last 30 Days" value={metrics.d30} Icon={CalendarRange} />
        <Card label="Role Changes" value={metrics.roleChanges} Icon={UserCog} tone="violet" />
        <Card label="Content Changes" value={metrics.contentChanges} Icon={FileEdit} />
        <Card label="Deal Changes" value={metrics.dealChanges} Icon={Briefcase} tone="gold" />
        <Card label="Moderation" value={metrics.moderation} Icon={Gavel} tone="rose" />
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[220px] bg-white rounded-full ring-1 ring-navy-900/[0.08] focus-within:ring-2 focus-within:ring-gold-500 shadow-sm flex items-center gap-2 transition-shadow">
          <span className="pl-4 text-navy-700/60">
            <Search className="h-4 w-4" strokeWidth={2} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search audit ID, actor, entity ID, action, description"
            className="flex-1 bg-transparent outline-none py-2.5 text-sm text-navy-900 placeholder:text-navy-700/45"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-bone"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          ) : null}
        </div>
        <Sel value={roleFilter} onChange={(v) => setRoleFilter(v as Role | "all")}>
          <option value="all">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Sel>
        <Sel value={groupFilter} onChange={(v) => setGroupFilter(v as AuditGroup | "all")}>
          <option value="all">All action types</option>
          {AUDIT_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </Sel>
        <Sel value={entityFilter} onChange={(v) => setEntityFilter(v as AuditTargetKind | "all")}>
          <option value="all">All entities</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Sel>
        <label className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-700/65">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-full bg-white ring-1 ring-navy-900/[0.08] px-3 py-2 text-xs text-navy-900"
          />
        </label>
        <label className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-700/65">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-full bg-white ring-1 ring-navy-900/[0.08] px-3 py-2 text-xs text-navy-900"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(
          [
            ["all", "All time"],
            ["today", "Only Today"],
            ["7d", "Last 7 Days"],
            ["30d", "Last 30 Days"],
          ] as [QuickRange, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setQuick(k)}
            className={cn(
              "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] font-semibold ring-1 transition-colors",
              quick === k
                ? "bg-navy-900 text-white ring-navy-900"
                : "bg-white text-navy-700 ring-navy-900/[0.08] hover:ring-navy-900/30"
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2">
          <div className="bg-white rounded-full ring-1 ring-navy-900/[0.08] p-1 inline-flex">
            {(
              [
                ["table", "Table", LayoutList],
                ["timeline", "Timeline", GitCommitVertical],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] font-semibold transition-colors",
                  view === v ? "bg-navy-900 text-white" : "text-navy-700 hover:text-navy-900"
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2.4} />
            Export CSV
          </button>
        </span>
      </div>

      <div className="text-xs text-navy-700/60">
        <span className="font-semibold text-navy-900 tabular-nums">{filtered.length}</span>{" "}
        events shown
      </div>

      {view === "table" ? (
        <TableShell minWidth={1150}>
          <THead
            cols={[
              "Audit ID",
              "Timestamp",
              "Actor",
              "Role",
              "Action",
              "Entity Type",
              "Entity ID",
              "Description",
            ]}
          />
          <tbody className="divide-y divide-navy-900/[0.06]">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-bone/40 transition-colors">
                <td className="px-3 py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/audit/${e.id}`}
                    className="text-[11px] uppercase tracking-[0.12em] font-bold text-gold-700 hover:text-gold-600 tabular-nums"
                  >
                    {e.id}
                  </Link>
                </td>
                <td className="px-3 py-3 text-xs text-navy-700/70 whitespace-nowrap">
                  {fmtTs(e.createdAt)}
                </td>
                <td className="px-3 py-3 font-semibold text-navy-900 whitespace-nowrap">
                  {e.actorName}
                </td>
                <td className="px-3 py-3">
                  <StatusPill label={e.actorRole} tone="navy" />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                    <span className={cn("h-2 w-2 rounded-full", TONE_DOT[toneForAction(e.action)])} />
                    {e.action}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs uppercase tracking-[0.12em] font-semibold text-navy-700/65">
                  {e.targetKind}
                </td>
                <td className="px-3 py-3 text-xs text-navy-700/80 tabular-nums whitespace-nowrap">
                  {e.targetId}
                </td>
                <td className="px-3 py-3 text-xs text-navy-700/75 max-w-[280px] truncate">
                  {[e.targetLabel, e.detail, e.before && e.after ? `${e.before} → ${e.after}` : null]
                    .filter(Boolean)
                    .join(" — ")}
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      ) : (
        <ol className="relative border-l border-navy-900/[0.1] pl-6 ml-2 space-y-3">
          {filtered.map((e) => (
            <li key={e.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[31px] top-4 h-3 w-3 rounded-full ring-4 ring-cream",
                  TONE_DOT[toneForAction(e.action)]
                )}
              />
              <Link
                href={`/admin/audit/${e.id}`}
                className="block rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-4 hover:ring-gold-500/40 transition-all"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-navy-900 text-sm">{e.action}</span>
                  <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-navy-700/50 tabular-nums">
                    {e.id}
                  </span>
                  <span className="ml-auto text-[11px] text-navy-700/55">{fmtTs(e.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-navy-700/75">
                  {e.actorName} ({e.actorRole}) → {e.targetKind} {e.targetId}
                  {e.targetLabel ? ` · ${e.targetLabel}` : ""}
                </p>
                {e.before && e.after ? (
                  <p className="mt-1 text-xs font-semibold text-navy-900">
                    {e.before} <span className="text-gold-700">→</span> {e.after}
                  </p>
                ) : e.detail ? (
                  <p className="mt-1 text-xs text-navy-700/65">{e.detail}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </AdminPage>
  );
}

function Card({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  Icon: typeof ScrollText;
  tone?: "gold" | "rose" | "violet";
}) {
  return (
    <div
      className={cn(
        "rounded-xl ring-1 p-3.5",
        tone === "gold"
          ? "bg-gold-500/[0.08] ring-gold-500/40"
          : tone === "rose"
            ? "bg-rose-500/[0.06] ring-rose-500/30"
            : tone === "violet"
              ? "bg-violet-500/[0.06] ring-violet-500/30"
              : "bg-white ring-navy-900/[0.06]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/65 truncate">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.4} />
      </div>
      <div className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-navy-900 tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Sel({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full bg-white ring-1 ring-navy-900/[0.08] hover:ring-navy-900/20 px-3.5 py-2 text-xs uppercase tracking-[0.12em] font-semibold text-navy-900 transition-shadow max-w-[190px]"
    >
      {children}
    </select>
  );
}
