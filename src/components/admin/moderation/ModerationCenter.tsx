"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Flag,
  AlertTriangle,
  Ban as BanIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  HandCoins,
  ListChecks,
  ImageIcon,
  FileText,
  MessageSquare,
  Gavel,
  History,
  type LucideIcon,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import {
  PRIORITY_RANK,
  priorityTone,
  type ModerationReport,
  type ReportPriority,
  type ReportTargetKind,
} from "@/data/moderation";
import {
  toneForAction,
  groupForAction,
  type AuditEvent,
} from "@/data/audit";
import { useResolvedImage } from "@/lib/imageStore";
import {
  canReviewQueue,
  canWarnMembers,
  canRestrictMembers,
  canSuspendAccounts,
  canRestoreMembers,
  canBanMembers,
  canEscalate,
  canRequestChanges,
  type Role,
} from "@/lib/roles";
import { AdminPage, StatusPill } from "../AdminShell";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  RequestChangesModal,
  WarnModal,
  RestrictModal,
  SuspendModal,
  BanModal,
  type SanctionTarget,
  type ContentTarget,
} from "./ModerationModals";
import MemberSanctionsPanel from "./MemberSanctionsPanel";
import { cn } from "@/lib/cn";

type Bucket =
  | "Report"
  | "Change"
  | "Pending"
  | "Flagged"
  | "Warning"
  | "Restriction"
  | "Suspension"
  | "Ban"
  | "Rejected";

type QueueStatus = "Open" | "Resolved" | "Dismissed" | "Archived" | "Active";

type QueueItem = {
  id: string;
  bucket: Bucket;
  entity: ReportTargetKind;
  title: string;
  subtitle: string;
  body?: string;
  priority?: ReportPriority;
  status: QueueStatus;
  at: string;
  targetId: string;
  imageSrc?: string;
  report?: ModerationReport;
};

const FILTERS = [
  "All",
  "Members",
  "Companies",
  "Opportunities",
  "Listings",
  "Images",
  "Documents",
  "Messages",
  "Pending Approval",
  "Warnings",
  "Restrictions",
  "Suspensions",
  "Rejected",
  "Resolved",
  "Archived",
] as const;
type Filter = (typeof FILTERS)[number];

const ENTITY_ICON: Record<ReportTargetKind, LucideIcon> = {
  member: Users,
  company: Building2,
  opportunity: HandCoins,
  listing: ListChecks,
  image: ImageIcon,
  document: FileText,
  message: MessageSquare,
};

export default function ModerationCenter() {
  const m = useMessaging();
  const {
    currentRole,
    moderationReports,
    changeRequests,
    warnings,
    restrictions,
    suspensions,
    bans,
    opportunityAdminState,
    companyAdminState,
    listings,
    userMembers,
    resolveReport,
    dismissReport,
    archiveReport,
    deleteReport,
    escalateReport,
    resolveChangeRequest,
    approveOpportunity,
    rejectOpportunity,
    verifyCompany,
    unsuspendMember,
    liftRestriction,
    unbanMember,
    moderateContent,
  } = m;

  const [filter, setFilter] = useState<Filter>("All");
  const [changesTarget, setChangesTarget] = useState<ContentTarget | null>(null);
  const [warnTarget, setWarnTarget] = useState<SanctionTarget | null>(null);
  const [restrictTarget, setRestrictTarget] = useState<SanctionTarget | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<SanctionTarget | null>(null);
  const [banTarget, setBanTarget] = useState<SanctionTarget | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const allMembers = useMemo(() => [...userMembers, ...MEMBERS], [userMembers]);
  const memberName = (id: string) => allMembers.find((x) => x.id === id)?.name ?? id;
  const memberTarget = (id: string): SanctionTarget => ({ id, name: memberName(id) });

  // ---- Build the unified queue ----
  const items = useMemo<QueueItem[]>(() => {
    const out: QueueItem[] = [];

    for (const r of moderationReports) {
      out.push({
        id: r.id,
        bucket: "Report",
        entity: r.targetKind,
        title: r.targetLabel,
        subtitle: `${r.id} · ${r.targetKind} · by ${r.reportedBy}${r.escalatedTo ? ` · ↑ ${r.escalatedTo}` : ""}`,
        body: r.description ?? r.reason,
        priority: r.priority,
        status: r.status,
        at: r.reportedAt,
        targetId: r.targetId,
        imageSrc: r.imageSrc,
        report: r,
      });
    }
    for (const c of changeRequests) {
      out.push({
        id: c.id,
        bucket: "Change",
        entity: c.targetKind,
        title: c.targetLabel,
        subtitle: `${c.id} · changes requested${c.dueDate ? ` · due ${c.dueDate.slice(0, 10)}` : ""}`,
        body: c.reason,
        status: c.status === "Resolved" ? "Resolved" : "Open",
        at: c.createdAt,
        targetId: c.targetId,
      });
    }
    // Pending approvals
    for (const o of featuredOpportunities) {
      if (opportunityAdminState[o.id]?.moderation === "Pending")
        out.push({ id: `pend-${o.id}`, bucket: "Pending", entity: "opportunity", title: o.title, subtitle: `${o.id} · awaiting approval`, status: "Open", at: o.postedAt, targetId: o.id });
      if (opportunityAdminState[o.id]?.moderation === "Rejected")
        out.push({ id: `rej-${o.id}`, bucket: "Rejected", entity: "opportunity", title: o.title, subtitle: `${o.id} · rejected`, status: "Open", at: o.postedAt, targetId: o.id });
    }
    for (const c of companies) {
      const v = companyAdminState[c.id]?.verificationOverride ?? c.verification;
      if (v === "Pending" && (companyAdminState[c.id]?.status ?? "Active") !== "Deleted")
        out.push({ id: `pend-${c.id}`, bucket: "Pending", entity: "company", title: c.name, subtitle: `${c.id} · pending verification`, status: "Open", at: c.addedAt, targetId: c.id });
    }
    for (const l of listings) {
      if (l.status === "Draft")
        out.push({ id: `pend-${l.id}`, bucket: "Pending", entity: "listing", title: l.title, subtitle: `${l.id} · draft`, status: "Open", at: l.lastUpdatedAt, targetId: l.id });
    }
    // Sanction states
    for (const s of suspensions.filter((x) => x.active))
      out.push({ id: s.id, bucket: "Suspension", entity: "member", title: s.memberName, subtitle: `${s.memberId} · suspended${s.endDate ? ` until ${s.endDate.slice(0, 10)}` : " · indefinite"}`, body: s.reason, status: "Active", at: s.startDate, targetId: s.memberId });
    for (const r of restrictions.filter((x) => x.active))
      out.push({ id: r.id, bucket: "Restriction", entity: "member", title: r.memberName, subtitle: `${r.memberId} · ${r.types.join(", ")}`, body: r.reason, status: "Active", at: r.date, targetId: r.memberId });
    for (const b of bans.filter((x) => x.active))
      out.push({ id: b.id, bucket: "Ban", entity: "member", title: b.memberName, subtitle: `${b.memberId} · banned · appeal ${b.appealStatus}`, body: b.reason, status: "Active", at: b.date, targetId: b.memberId });
    for (const w of warnings)
      out.push({ id: w.id, bucket: "Warning", entity: "member", title: w.memberName, subtitle: `${w.memberId} · warned by ${w.moderator}`, body: w.reason, status: "Active", at: w.date, targetId: w.memberId });

    return out;
  }, [moderationReports, changeRequests, opportunityAdminState, companyAdminState, listings, suspensions, restrictions, bans, warnings]);

  const filtered = useMemo(() => {
    const entityMap: Partial<Record<Filter, ReportTargetKind>> = {
      Members: "member", Companies: "company", Opportunities: "opportunity",
      Listings: "listing", Images: "image", Documents: "document", Messages: "message",
    };
    let list = items;
    if (filter === "All") list = items.filter((i) => i.status === "Open" || i.status === "Active");
    else if (entityMap[filter]) list = items.filter((i) => i.entity === entityMap[filter]);
    else if (filter === "Pending Approval") list = items.filter((i) => i.bucket === "Pending");
    else if (filter === "Warnings") list = items.filter((i) => i.bucket === "Warning");
    else if (filter === "Restrictions") list = items.filter((i) => i.bucket === "Restriction");
    else if (filter === "Suspensions") list = items.filter((i) => i.bucket === "Suspension");
    else if (filter === "Rejected") list = items.filter((i) => i.bucket === "Rejected");
    else if (filter === "Resolved") list = items.filter((i) => i.status === "Resolved" || i.status === "Dismissed");
    else if (filter === "Archived") list = items.filter((i) => i.status === "Archived");
    return [...list].sort((a, b) => {
      const pa = a.priority ? PRIORITY_RANK[a.priority] : -1;
      const pb = b.priority ? PRIORITY_RANK[b.priority] : -1;
      if (pa !== pb) return pb - pa;
      return b.at.localeCompare(a.at);
    });
  }, [items, filter]);

  // ---- Dashboard counts ----
  const counts = useMemo(() => {
    const openReports = moderationReports.filter((r) => r.status === "Open");
    return {
      pendingReviews: items.filter((i) => i.bucket === "Pending").length + openReports.length + changeRequests.filter((c) => c.status === "Open").length,
      criticalReports: openReports.filter((r) => r.priority === "Critical").length,
      warningsIssued: warnings.length,
      restrictedMembers: new Set(restrictions.filter((r) => r.active).map((r) => r.memberId)).size,
      suspendedMembers: new Set(suspensions.filter((s) => s.active).map((s) => s.memberId)).size,
      bannedMembers: new Set(bans.filter((b) => b.active).map((b) => b.memberId)).size,
      rejectedContent: items.filter((i) => i.bucket === "Rejected").length,
      resolvedReports: moderationReports.filter((r) => r.status === "Resolved" || r.status === "Dismissed").length,
    };
  }, [items, moderationReports, changeRequests, warnings, restrictions, suspensions, bans]);

  if (!canReviewQueue(currentRole)) {
    return (
      <AdminPage title="Moderation Center" subtitle="Review and act on everything that needs attention.">
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 text-center">
          <ShieldAlert className="h-8 w-8 mx-auto text-navy-900/30 mb-3" strokeWidth={2} />
          <h3 className="text-lg font-semibold text-navy-900">Moderation access required</h3>
          <p className="mt-1 text-sm text-navy-700/65">
            Your role is <span className="font-semibold">{currentRole}</span>. The Moderation Center requires Moderator or above.
          </p>
        </div>
      </AdminPage>
    );
  }

  const dash: { label: string; value: number; Icon: LucideIcon; tone?: "rose" | "amber" | "gold" }[] = [
    { label: "Pending Reviews", value: counts.pendingReviews, Icon: Clock, tone: "amber" },
    { label: "Critical Reports", value: counts.criticalReports, Icon: AlertTriangle, tone: counts.criticalReports > 0 ? "rose" : undefined },
    { label: "Warnings Issued", value: counts.warningsIssued, Icon: Flag, tone: "amber" },
    { label: "Restricted Members", value: counts.restrictedMembers, Icon: ShieldAlert },
    { label: "Suspended Members", value: counts.suspendedMembers, Icon: ShieldAlert, tone: counts.suspendedMembers > 0 ? "rose" : undefined },
    { label: "Banned Members", value: counts.bannedMembers, Icon: BanIcon, tone: counts.bannedMembers > 0 ? "rose" : undefined },
    { label: "Rejected Content", value: counts.rejectedContent, Icon: XCircle },
    { label: "Resolved Reports", value: counts.resolvedReports, Icon: CheckCircle2, tone: "gold" },
  ];

  return (
    <AdminPage
      title="Moderation Center"
      subtitle="One workspace for reports, approvals, content review, and the member-sanction ladder. Every action is audited."
    >
      {/* Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {dash.map((d) => (
          <div key={d.label} className={cn(
            "rounded-2xl ring-1 p-4",
            d.tone === "rose" ? "bg-rose-500/[0.06] ring-rose-500/30" : d.tone === "amber" ? "bg-amber-500/[0.07] ring-amber-500/30" : d.tone === "gold" ? "bg-gold-500/[0.08] ring-gold-500/40" : "bg-white ring-navy-900/[0.06]"
          )}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/65 truncate">{d.label}</span>
              <d.Icon className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2.2} />
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-navy-900 tabular-nums">{d.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={cn("inline-flex items-center rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] font-semibold ring-1 transition-colors",
                active ? "bg-navy-900 text-white ring-navy-900" : "bg-white text-navy-700 ring-navy-900/[0.08] hover:ring-navy-900/30")}>
              {f}
            </button>
          );
        })}
      </div>

      {/* Queue */}
      <section className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-3" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-navy-900">Nothing in “{filter}”.</h3>
            <p className="mt-1 text-xs text-navy-700/60">The queue is clear for this filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <QueueRow
              key={item.bucket + item.id}
              item={item}
              role={currentRole}
              onView={viewHref(item)}
              actions={{
                resolveReport, dismissReport, archiveReport, escalateReport,
                resolveChangeRequest, approveOpportunity, rejectOpportunity, verifyCompany,
                unsuspendMember, liftRestriction, unbanMember, moderateContent,
                openChanges: (t) => setChangesTarget(t),
                openWarn: (t) => setWarnTarget(t),
                openRestrict: (t) => setRestrictTarget(t),
                openSuspend: (t) => setSuspendTarget(t),
                openBan: (t) => setBanTarget(t),
                confirmDelete: (id) => setConfirmDelete(id),
                memberTarget,
              }}
            />
          ))
        )}
      </section>

      {/* Member sanctions */}
      <MemberSanctionsPanel
        onWarn={setWarnTarget}
        onRestrict={setRestrictTarget}
        onSuspend={setSuspendTarget}
        onBan={setBanTarget}
      />

      {/* History */}
      <ModerationHistory />

      {/* Modals */}
      <RequestChangesModal open={!!changesTarget} onClose={() => setChangesTarget(null)} target={changesTarget} />
      <WarnModal open={!!warnTarget} onClose={() => setWarnTarget(null)} member={warnTarget} />
      <RestrictModal open={!!restrictTarget} onClose={() => setRestrictTarget(null)} member={restrictTarget} />
      <SuspendModal open={!!suspendTarget} onClose={() => setSuspendTarget(null)} member={suspendTarget} />
      <BanModal open={!!banTarget} onClose={() => setBanTarget(null)} member={banTarget} />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete report?"
        body="The report is permanently removed. The deletion is recorded in the audit trail."
        confirmLabel="Delete report"
        tone="danger"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteReport(confirmDelete); setConfirmDelete(null); }}
      />

      {/* role-availability hint */}
      <RolePermissionNote role={currentRole} />
    </AdminPage>
  );
}

function viewHref(item: QueueItem): string | undefined {
  switch (item.entity) {
    case "opportunity": return `/admin/opportunities/${item.targetId}`;
    case "company": return `/admin/companies/${item.targetId}`;
    case "member": return `/admin/members/${item.targetId}`;
    case "listing": return `/dashboard/listings/${item.targetId}`;
    case "message": return `/messages?conversation=${item.targetId}`;
    default: return undefined;
  }
}

type ActionHandlers = {
  resolveReport: (id: string, note?: string) => void;
  dismissReport: (id: string, note?: string) => void;
  archiveReport: (id: string) => void;
  escalateReport: (id: string, level: "Admin" | "Super Admin") => void;
  resolveChangeRequest: (id: string) => void;
  approveOpportunity: (id: string, title?: string) => void;
  rejectOpportunity: (id: string, title?: string) => void;
  verifyCompany: (id: string, name?: string) => void;
  unsuspendMember: (id: string, name?: string) => void;
  liftRestriction: (id: string) => void;
  unbanMember: (id: string, name?: string) => void;
  moderateContent: (kind: ReportTargetKind, id: string, label: string, status: "Approved" | "Rejected" | "Removed" | "Flagged" | "Replacement Requested" | "Escalated", note?: string) => void;
  openChanges: (t: ContentTarget) => void;
  openWarn: (t: SanctionTarget) => void;
  openRestrict: (t: SanctionTarget) => void;
  openSuspend: (t: SanctionTarget) => void;
  openBan: (t: SanctionTarget) => void;
  confirmDelete: (id: string) => void;
  memberTarget: (id: string) => SanctionTarget;
};

function QueueRow({ item, role, onView, actions }: { item: QueueItem; role: Role; onView?: string; actions: ActionHandlers }) {
  const Icon = ENTITY_ICON[item.entity];
  const isContent = ["image", "document", "message"].includes(item.entity);
  const ct: ContentTarget = { kind: item.entity, id: item.targetId, label: item.title };
  const mt = () => actions.memberTarget(item.targetId);

  return (
    <article className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-4">
      <div className="flex items-start gap-3">
        {item.entity === "image" && item.imageSrc ? (
          <ResolvedThumb src={item.imageSrc} />
        ) : (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-bone text-gold-700 shrink-0">
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-navy-900 text-sm truncate">{item.title}</span>
            <BucketPill bucket={item.bucket} />
            {item.priority ? <StatusPill label={item.priority} tone={priorityTone(item.priority)} /> : null}
            {item.status !== "Open" && item.status !== "Active" ? <StatusPill label={item.status} tone="navy" /> : null}
          </div>
          <div className="text-[11px] text-navy-700/60 mt-0.5 truncate">{item.subtitle}</div>
          {item.body ? <p className="mt-1.5 text-xs text-navy-700/75 leading-relaxed line-clamp-2">{item.body}</p> : null}

          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {onView ? <Act href={onView}>View</Act> : null}

            {/* Pending approvals */}
            {item.bucket === "Pending" && item.entity === "opportunity" ? (
              <>
                <Act tone="emerald" onClick={() => actions.approveOpportunity(item.targetId, item.title)}>Approve</Act>
                <Act tone="rose" onClick={() => actions.rejectOpportunity(item.targetId, item.title)}>Reject</Act>
              </>
            ) : null}
            {item.bucket === "Pending" && item.entity === "company" ? (
              <Act tone="emerald" onClick={() => actions.verifyCompany(item.targetId, item.title)}>Approve</Act>
            ) : null}
            {item.bucket === "Rejected" && item.entity === "opportunity" ? (
              <Act tone="emerald" onClick={() => actions.approveOpportunity(item.targetId, item.title)}>Restore</Act>
            ) : null}

            {/* Content moderation (images / documents / messages) */}
            {isContent ? (
              <>
                <Act tone="emerald" onClick={() => actions.moderateContent(item.entity, item.targetId, item.title, "Approved")}>Approve</Act>
                <Act tone="rose" onClick={() => actions.moderateContent(item.entity, item.targetId, item.title, "Rejected")}>Reject</Act>
                <Act onClick={() => actions.moderateContent(item.entity, item.targetId, item.title, "Removed")}>Remove</Act>
                <Act onClick={() => actions.moderateContent(item.entity, item.targetId, item.title, "Flagged")}>Flag</Act>
                <Act onClick={() => actions.moderateContent(item.entity, item.targetId, item.title, "Replacement Requested")}>Request Replacement</Act>
              </>
            ) : null}

            {/* Request changes on content/listings/opps/companies */}
            {(item.bucket === "Report" || item.bucket === "Pending") && item.entity !== "member" && canRequestChanges(role) ? (
              <Act tone="amber" onClick={() => actions.openChanges(ct)}>Request Changes</Act>
            ) : null}

            {/* Member sanctions */}
            {item.entity === "member" && item.bucket !== "Suspension" && item.bucket !== "Ban" ? (
              <>
                {canWarnMembers(role) ? <Act tone="amber" onClick={() => actions.openWarn(mt())}>Warn</Act> : null}
                {canRestrictMembers(role) ? <Act onClick={() => actions.openRestrict(mt())}>Restrict</Act> : null}
                {canSuspendAccounts(role) ? <Act tone="rose" onClick={() => actions.openSuspend(mt())}>Suspend</Act> : null}
                {canBanMembers(role) ? <Act tone="rose" onClick={() => actions.openBan(mt())}>Ban</Act> : null}
              </>
            ) : null}

            {/* Sanction lifts */}
            {item.bucket === "Suspension" && canRestoreMembers(role) ? (
              <Act tone="emerald" onClick={() => actions.unsuspendMember(item.targetId, item.title)}>Unsuspend</Act>
            ) : null}
            {item.bucket === "Restriction" && canRestoreMembers(role) ? (
              <Act tone="emerald" onClick={() => actions.liftRestriction(item.id)}>Lift Restriction</Act>
            ) : null}
            {item.bucket === "Ban" && canBanMembers(role) ? (
              <Act tone="emerald" onClick={() => actions.unbanMember(item.targetId, item.title)}>Restore</Act>
            ) : null}

            {/* Report lifecycle */}
            {item.bucket === "Report" && item.status === "Open" ? (
              <>
                <Act tone="emerald" onClick={() => actions.resolveReport(item.id)}>Resolve</Act>
                <Act onClick={() => actions.dismissReport(item.id)}>Dismiss</Act>
                {canEscalate(role) ? (
                  <>
                    <Act onClick={() => actions.escalateReport(item.id, "Admin")}>Escalate → Admin</Act>
                    <Act onClick={() => actions.escalateReport(item.id, "Super Admin")}>Escalate → Super Admin</Act>
                  </>
                ) : null}
                <Act onClick={() => actions.archiveReport(item.id)}>Archive</Act>
                {canBanMembers(role) ? <Act tone="rose" onClick={() => actions.confirmDelete(item.id)}>Delete</Act> : null}
              </>
            ) : null}

            {item.bucket === "Change" && item.status === "Open" ? (
              <Act tone="emerald" onClick={() => actions.resolveChangeRequest(item.id)}>Mark Resolved</Act>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function BucketPill({ bucket }: { bucket: Bucket }) {
  const tone =
    bucket === "Report" ? "amber" : bucket === "Pending" ? "sky" : bucket === "Suspension" || bucket === "Ban" || bucket === "Rejected" ? "rose" : bucket === "Restriction" || bucket === "Warning" ? "amber" : "navy";
  return <StatusPill label={bucket} tone={tone as "amber" | "sky" | "rose" | "navy"} />;
}

function Act({ children, onClick, href, tone = "default" }: { children: React.ReactNode; onClick?: () => void; href?: string; tone?: "default" | "gold" | "rose" | "emerald" | "amber" }) {
  const cls = cn(
    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-bold ring-1 transition-colors whitespace-nowrap",
    tone === "rose" && "bg-white hover:bg-rose-500/10 text-rose-700 ring-rose-500/40",
    tone === "emerald" && "bg-emerald-500 hover:bg-emerald-400 text-white ring-emerald-500",
    tone === "amber" && "bg-amber-500 hover:bg-amber-400 text-white ring-amber-500",
    tone === "gold" && "bg-gold-500 hover:bg-gold-400 text-navy-900 ring-gold-500",
    tone === "default" && "bg-white hover:bg-bone text-navy-900 ring-navy-900/10"
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

function ResolvedThumb({ src }: { src: string }) {
  const url = useResolvedImage(src);
  return (
    <span className="relative h-12 w-12 rounded-lg overflow-hidden bg-navy-900/10 ring-1 ring-navy-900/[0.06] shrink-0">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="reported" className="h-full w-full object-cover" />
      ) : null}
    </span>
  );
}

function ModerationHistory() {
  const { auditEvents } = useMessaging();
  const events = useMemo(
    () => auditEvents.filter((e) => groupForAction(e.action) === "Moderation Actions").slice(0, 12),
    [auditEvents]
  );
  const toneDot: Record<string, string> = { emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500", sky: "bg-sky-500", violet: "bg-violet-500" };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <History className="h-3.5 w-3.5" strokeWidth={2.4} />
          Moderation History
        </div>
        <Link href="/admin/audit" className="text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600">Full audit log →</Link>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-navy-700/60">No moderation actions yet. Reports, warnings, restrictions, suspensions, and bans appear here.</p>
      ) : (
        <ul className="divide-y divide-navy-900/[0.05]">
          {(events as AuditEvent[]).map((e) => (
            <li key={e.id}>
              <Link href={`/admin/audit/${e.id}`} className="flex items-center gap-3 py-2.5 group">
                <span className={cn("h-2 w-2 rounded-full shrink-0", toneDot[toneForAction(e.action)])} />
                <span className="text-sm font-semibold text-navy-900 group-hover:text-gold-700 shrink-0">{e.action}</span>
                <span className="text-sm text-navy-700/65 truncate flex-1">
                  {e.targetLabel ?? e.targetId}{e.detail ? ` — ${e.detail}` : ""}
                </span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-navy-700/45 shrink-0">{e.actorRole}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RolePermissionNote({ role }: { role: Role }) {
  return (
    <div className="rounded-2xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-4 text-xs text-navy-700/70 inline-flex items-start gap-2">
      <Gavel className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" strokeWidth={2.2} />
      <span>
        Acting as <span className="font-semibold text-navy-900">{role}</span>.
        {" "}Moderators review, approve/reject, warn, and request changes. Admins add restrict, suspend, and restore. Ban and delete are Super Admin only. Available actions above reflect your role.
      </span>
    </div>
  );
}
