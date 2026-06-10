"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Archive,
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  HandCoins,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  DEAL_DESK_NOW_MS,
  DEAL_DOCUMENT_TYPES,
  DEAL_PRIORITIES,
  DEAL_STAGES,
  SAMPLE_ADMINS,
  isOpenStage,
  type Deal,
  type DealDocumentType,
  type DealParticipantRole,
  type DealPriority,
  type DealStage,
} from "@/data/deals";
import { getCompanyById } from "@/data/companies";
import { getMemberById } from "@/data/members";
import { featuredOpportunities } from "@/data/opportunities";
import { canViewInternalNotes } from "@/lib/roles";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import {
  DealPriorityBadge,
  DealStageBadge,
  FollowUpBadge,
  formatCurrency,
  formatDate,
} from "./DealBadges";
import DealNotes from "./DealNotes";
import { cn } from "@/lib/cn";

const ACTIVITY_ICONS: Partial<Record<Deal["activity"][number]["kind"], typeof Activity>> = {
  created: Sparkles,
  updated: Pencil,
  stage_change: ChevronRight,
  note_added: FileText,
  internal_note_added: Lock,
  introduction_requested: UserPlus,
  introduction_approved: CheckCircle2,
  investor_added: UserPlus,
  sponsor_added: UserPlus,
  participant_added: UserPlus,
  participant_removed: X,
  document_added: FileText,
  document_removed: Trash2,
  assigned: Users,
  priority_change: Activity,
  meeting_scheduled: Calendar,
  closed_won: CheckCircle2,
  closed_lost: XCircle,
  archived: Archive,
  restored: RotateCcw,
  reopened: RotateCcw,
};

type TabKey =
  | "overview"
  | "timeline"
  | "notes"
  | "activity"
  | "messages"
  | "participants"
  | "documents";

export default function DealDetailView({ deal }: { deal: Deal }) {
  const router = useRouter();
  const {
    conversations,
    currentRole,
    updateDealStage,
    updateDealFields,
    addDealNote,
    setDealPriority,
    setDealFollowUp,
    assignDealAdmin,
    closeDeal,
    reopenDeal,
    archiveDeal,
    restoreDeal,
    deleteDeal,
    addDealParticipant,
    removeDealParticipant,
    addDealDocument,
    removeDealDocument,
  } = useMessaging();

  const [tab, setTab] = useState<TabKey>("overview");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const nowMs = DEAL_DESK_NOW_MS;
  const company = deal.companyId ? getCompanyById(deal.companyId) : undefined;
  const opportunity =
    featuredOpportunities.find((o) => o.id === deal.opportunityId) ??
    featuredOpportunities.find((o) => o.slug === deal.opportunitySlug);
  const relatedConversations = conversations.filter((c) =>
    deal.conversationIds.includes(c.id)
  );

  const open = isOpenStage(deal.stage);
  const closed = deal.stage === "Closed Won" || deal.stage === "Closed Lost";
  const archived = deal.stage === "Archived";

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-7">
        <nav className="text-[11px] uppercase tracking-[0.16em] text-navy-700/60">
          <Link
            href="/deal-desk"
            className="inline-flex items-center gap-1 text-navy-700/70 hover:text-navy-900"
          >
            <ChevronLeft className="h-3 w-3" strokeWidth={2.4} />
            Deal Desk
          </Link>
          <span className="mx-2">·</span>
          <span className="text-navy-900 font-semibold tabular-nums">{deal.dealId}</span>
        </nav>

        {/* Hero */}
        <header className="bg-white rounded-3xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DealStageBadge stage={deal.stage} />
                <DealPriorityBadge priority={deal.priority} />
                <FollowUpBadge iso={deal.nextFollowUpDate} nowMs={nowMs} />
                {deal.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700 bg-bone ring-1 ring-navy-900/[0.06] rounded-full px-2 py-0.5"
                  >
                    <Tag className="h-2.5 w-2.5" strokeWidth={2.4} />
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
                {deal.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-700/75">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Sponsor · <span className="font-semibold text-navy-900">{deal.sponsor.name}</span>
                </span>
                {deal.investor ? (
                  <span className="inline-flex items-center gap-1.5">
                    <HandCoins className="h-4 w-4 text-gold-600" strokeWidth={2} />
                    Investor · <span className="font-semibold text-navy-900">{deal.investor.name}</span>
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  {deal.assignedAdmin}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Created {formatDate(deal.createdDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Close {formatDate(deal.expectedCloseDate)}
                </span>
              </div>
            </div>
            <div className="md:shrink-0 text-right space-y-1">
              <div className="text-3xl md:text-4xl font-semibold text-navy-900 tabular-nums">
                {formatCurrency(deal.targetInvestment)}
              </div>
              <div className="text-xs text-navy-700/65 tabular-nums">
                {deal.commissionPct}% · est. {formatCurrency(deal.estimatedCommission)}
              </div>
              {deal.actualInvestment ? (
                <div className="text-xs text-emerald-700 font-semibold tabular-nums">
                  Actual {formatCurrency(deal.actualInvestment)} ·{" "}
                  {formatCurrency(deal.actualCommission)} commission
                </div>
              ) : null}
            </div>
          </div>

          {/* Inline controls */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Selector
              label="Stage"
              value={deal.stage}
              options={DEAL_STAGES}
              onChange={(v) => updateDealStage(deal.dealId, v as DealStage)}
            />
            <Selector
              label="Priority"
              value={deal.priority}
              options={DEAL_PRIORITIES}
              onChange={(v) => setDealPriority(deal.dealId, v as DealPriority)}
            />
            <Selector
              label="Assigned Admin"
              value={deal.assignedAdmin}
              options={SAMPLE_ADMINS}
              onChange={(v) => assignDealAdmin(deal.dealId, v)}
            />
            <FieldShell label="Expected Close">
              <input
                type="date"
                value={deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : ""}
                onChange={(e) =>
                  updateDealFields(deal.dealId, {
                    expectedCloseDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  })
                }
                className={fieldCls}
              />
            </FieldShell>
          </div>

          {/* Lifecycle actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionBtn
              onClick={() =>
                setDealFollowUp(deal.dealId, { lastContactDate: new Date().toISOString() })
              }
              Icon={Clock}
            >
              Log contact
            </ActionBtn>
            {open ? (
              <>
                <ActionBtn onClick={() => closeDeal(deal.dealId, "won")} Icon={CheckCircle2} tone="emerald">
                  Close Won
                </ActionBtn>
                <ActionBtn onClick={() => closeDeal(deal.dealId, "lost")} Icon={XCircle} tone="rose">
                  Close Lost
                </ActionBtn>
                <ActionBtn onClick={() => archiveDeal(deal.dealId)} Icon={Archive}>
                  Archive
                </ActionBtn>
              </>
            ) : null}
            {closed ? (
              <ActionBtn onClick={() => reopenDeal(deal.dealId)} Icon={RotateCcw}>
                Reopen
              </ActionBtn>
            ) : null}
            {archived ? (
              <ActionBtn onClick={() => restoreDeal(deal.dealId)} Icon={RotateCcw}>
                Restore
              </ActionBtn>
            ) : null}
            <ActionBtn onClick={() => setConfirmDelete(true)} Icon={Trash2} tone="rose">
              Delete
            </ActionBtn>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-navy-900/[0.06]">
          {(
            [
              ["overview", "Overview", HandCoins],
              ["timeline", "Timeline", Calendar],
              ["notes", "Notes", FileText],
              ["activity", "Activity", Activity],
              ["messages", `Messages (${relatedConversations.length})`, MessageSquare],
              ["participants", `Participants (${deal.participants.length})`, Users],
              ["documents", `Documents (${deal.documents.length})`, FileText],
            ] as [TabKey, string, typeof Activity][]
          ).map(([key, label, Icon]) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap",
                  active ? "text-navy-900" : "text-navy-700/60 hover:text-navy-900"
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                {label}
                <span
                  className={cn(
                    "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-opacity",
                    active ? "bg-gold-500 opacity-100" : "opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-7">
          <div className="min-w-0 space-y-6">
            {tab === "overview" ? (
              <>
                <Section title="Summary" Icon={HandCoins}>
                  <p className="text-sm md:text-[15px] text-navy-700/85 leading-relaxed">
                    {deal.summaryNote ?? "No summary provided yet."}
                  </p>
                </Section>
                {opportunity ? (
                  <Section title="Related Opportunity" Icon={HandCoins}>
                    <Link
                      href={`/opportunity/${opportunity.slug}`}
                      className="block rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 hover:ring-gold-500/40 transition-all"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-gold-700">
                        {opportunity.category} · {opportunity.dealType}
                      </div>
                      <div className="mt-1 font-semibold text-navy-900">{opportunity.title}</div>
                      <div className="text-xs text-navy-700/65 mt-1">
                        {opportunity.location} · {formatCurrency(opportunity.fundingAmount)}
                      </div>
                    </Link>
                  </Section>
                ) : null}
                {company ? (
                  <Section title="Related Company" Icon={Building2}>
                    <Link
                      href={`/company/${company.slug}`}
                      className="block rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 hover:ring-gold-500/40 transition-all"
                    >
                      <div className="font-semibold text-navy-900">{company.name}</div>
                      <div className="text-xs text-navy-700/65 mt-1">{company.industry}</div>
                    </Link>
                  </Section>
                ) : null}
              </>
            ) : null}

            {tab === "timeline" ? (
              <Section title="Timeline" Icon={Calendar}>
                <ActivityList deal={deal} timelineStyle />
              </Section>
            ) : null}

            {tab === "notes" ? (
              <>
                <Section title="Notes" Icon={FileText}>
                  <DealNotes
                    notes={deal.notes}
                    onAdd={(text) => addDealNote(deal.dealId, text, false)}
                  />
                </Section>
                {canViewInternalNotes(currentRole) ? (
                  <Section title="Internal Notes" Icon={Lock}>
                    <div className="mb-3 rounded-xl bg-navy-900 text-white/85 px-4 py-2.5 text-xs inline-flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-gold-400" strokeWidth={2.4} />
                      Visible to Editor, Admin, and Super Admin only — you are{" "}
                      {currentRole}.
                    </div>
                    <DealNotes
                      notes={deal.internalNotes}
                      onAdd={(text) => addDealNote(deal.dealId, text, true)}
                    />
                  </Section>
                ) : null}
              </>
            ) : null}

            {tab === "activity" ? (
              <Section title="Activity Log" Icon={Activity}>
                <ActivityList deal={deal} />
              </Section>
            ) : null}

            {tab === "messages" ? (
              <Section title="Related Conversations" Icon={MessageSquare}>
                {relatedConversations.length === 0 ? (
                  <p className="text-sm text-navy-700/55">
                    No conversations linked to this deal yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {relatedConversations.map((c) => {
                      const co = getCompanyById(c.companyId);
                      return (
                        <li key={c.id}>
                          <Link
                            href={`/messages?conversation=${c.id}`}
                            className="block rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 hover:ring-gold-500/40 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-semibold text-navy-900">
                                {co?.name ?? c.companyId}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                {c.unreadCount > 0 ? (
                                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold">
                                    {c.unreadCount} unread
                                  </span>
                                ) : null}
                                <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
                                  {c.messages.length} messages
                                </span>
                              </span>
                            </div>
                            {c.opportunityTitle ? (
                              <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-gold-700 font-semibold">
                                Re: {c.opportunityTitle}
                              </div>
                            ) : null}
                            <p className="mt-1.5 text-sm text-navy-700/75 line-clamp-1">
                              {c.lastMessagePreview}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>
            ) : null}

            {tab === "participants" ? (
              <Section title="Participants" Icon={Users}>
                <ParticipantsPanel
                  deal={deal}
                  onAdd={(input) => addDealParticipant(deal.dealId, input)}
                  onRemove={(pid) => removeDealParticipant(deal.dealId, pid)}
                />
              </Section>
            ) : null}

            {tab === "documents" ? (
              <Section title="Document References" Icon={FileText}>
                <DocumentsPanel
                  deal={deal}
                  onAdd={(input) => addDealDocument(deal.dealId, input)}
                  onRemove={(docId) => removeDealDocument(deal.dealId, docId)}
                />
              </Section>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <SidePanel title="Economics">
              <Row label="Target" value={formatCurrency(deal.targetInvestment)} />
              <Row label="Actual" value={formatCurrency(deal.actualInvestment)} />
              <Row label="Commission %" value={`${deal.commissionPct}%`} />
              <Row label="Est. commission" value={formatCurrency(deal.estimatedCommission)} />
              <Row label="Actual commission" value={formatCurrency(deal.actualCommission)} />
            </SidePanel>
            <SidePanel title="Source">
              <Row label="Type" value={deal.sourceType} />
              {deal.sourceId ? <Row label="Source ID" value={deal.sourceId} /> : null}
            </SidePanel>
            <SidePanel title="Identifiers">
              {deal.opportunityId ? (
                <Row
                  label="Opportunity"
                  value={deal.opportunityId}
                  href={opportunity ? `/opportunity/${opportunity.slug}` : undefined}
                />
              ) : null}
              {deal.listingId ? (
                <Row
                  label="Listing"
                  value={deal.listingId}
                  href={`/dashboard/listings/${deal.listingId}`}
                />
              ) : null}
              {deal.companyId ? (
                <Row
                  label="Company"
                  value={deal.companyId}
                  href={company ? `/company/${company.slug}` : undefined}
                />
              ) : null}
              {deal.sponsor.memberId ? (
                <Row
                  label="Sponsor"
                  value={deal.sponsor.memberId}
                  href={`/member/${getMemberById(deal.sponsor.memberId)?.slug ?? ""}`}
                />
              ) : null}
              {deal.investor?.memberId ? (
                <Row
                  label="Investor"
                  value={deal.investor.memberId}
                  href={`/member/${getMemberById(deal.investor.memberId)?.slug ?? ""}`}
                />
              ) : null}
            </SidePanel>
            <SidePanel title="Follow-Up">
              <Row label="Last contact" value={formatDate(deal.lastContactDate)} />
              <FieldShell label="Next follow-up">
                <input
                  type="date"
                  value={deal.nextFollowUpDate ? deal.nextFollowUpDate.slice(0, 10) : ""}
                  onChange={(e) =>
                    setDealFollowUp(deal.dealId, {
                      nextFollowUpDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                  className={fieldCls}
                />
              </FieldShell>
            </SidePanel>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${deal.dealId}?`}
        body={`“${deal.title}”, its notes, activity history, and references will be removed. This cannot be undone.`}
        confirmLabel="Delete deal"
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteDeal(deal.dealId);
          setConfirmDelete(false);
          router.push("/deal-desk");
        }}
      />
    </div>
  );
}

// ---- Panels ----

function ParticipantsPanel({
  deal,
  onAdd,
  onRemove,
}: {
  deal: Deal;
  onAdd: (input: { name: string; company: string; role: DealParticipantRole; status: "Active" }) => void;
  onRemove: (participantId: string) => void;
}) {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<DealParticipantRole>("Member");

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {deal.participants.map((p) => (
          <li
            key={p.id}
            className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 flex items-start gap-3"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-gold-500 text-xs font-bold shrink-0">
              {p.name
                .split(/\s+/)
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-navy-900 truncate">
                {p.memberId && getMemberById(p.memberId) ? (
                  <Link
                    href={`/member/${getMemberById(p.memberId)!.slug}`}
                    className="hover:text-gold-700 transition-colors"
                  >
                    {p.name}
                  </Link>
                ) : (
                  p.name
                )}
              </div>
              <div className="text-xs text-navy-700/65 mt-0.5 truncate">{p.company}</div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold bg-bone text-navy-700 ring-1 ring-navy-900/[0.06] rounded-full px-2 py-0.5">
                {p.role}
              </span>
              <span
                className={cn(
                  "inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1",
                  p.status === "Active"
                    ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30"
                    : p.status === "Invited"
                      ? "bg-amber-500/15 text-amber-700 ring-amber-500/30"
                      : "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15"
                )}
              >
                {p.status}
              </span>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label={`Remove ${p.name}`}
                className="h-7 w-7 inline-flex items-center justify-center rounded-full text-rose-700 hover:bg-rose-500/10"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
        <FieldShell label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={fieldCls} />
        </FieldShell>
        <FieldShell label="Company">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={fieldCls}
          />
        </FieldShell>
        <FieldShell label="Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as DealParticipantRole)}
            className={fieldCls}
          >
            {(["Sponsor", "Investor", "Admin", "Editor", "Moderator", "Member"] as const).map(
              (r) => (
                <option key={r} value={r}>{r}</option>
              )
            )}
          </select>
        </FieldShell>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            onAdd({ name: name.trim(), company: companyName.trim() || "—", role, status: "Active" });
            setName("");
            setCompanyName("");
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors disabled:bg-navy-900/10 disabled:text-navy-700/40"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          Add
        </button>
      </div>
    </div>
  );
}

function DocumentsPanel({
  deal,
  onAdd,
  onRemove,
}: {
  deal: Deal;
  onAdd: (input: { name: string; type: DealDocumentType }) => void;
  onRemove: (documentId: string) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DealDocumentType>("PDF");

  return (
    <div className="space-y-4">
      <p className="text-xs text-navy-700/60 leading-relaxed">
        References only — files live in the data room or offline. Attach a
        pointer so the deal record shows what exists and where.
      </p>
      {deal.documents.length === 0 ? (
        <p className="text-sm text-navy-700/55">No document references yet.</p>
      ) : (
        <ul className="space-y-2">
          {deal.documents.map((doc) => (
            <li
              key={doc.id}
              className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-3.5 flex items-center gap-3"
            >
              <FileText className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2.2} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-navy-900 text-sm truncate">{doc.name}</div>
                <div className="text-[11px] text-navy-700/65 mt-0.5">
                  {doc.type} · added {formatDate(doc.addedAt)} by {doc.addedBy}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                aria-label={`Remove ${doc.name}`}
                className="h-7 w-7 inline-flex items-center justify-center rounded-full text-rose-700 hover:bg-rose-500/10 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
        <FieldShell label="Document name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Executed NDA — Aurora"
            className={fieldCls}
          />
        </FieldShell>
        <FieldShell label="Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DealDocumentType)}
            className={fieldCls}
          >
            {DEAL_DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FieldShell>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            onAdd({ name: name.trim(), type });
            setName("");
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors disabled:bg-navy-900/10 disabled:text-navy-700/40"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          Attach
        </button>
      </div>
    </div>
  );
}

function ActivityList({ deal, timelineStyle = false }: { deal: Deal; timelineStyle?: boolean }) {
  const items = [...deal.activity].sort((a, b) =>
    timelineStyle ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)
  );
  if (items.length === 0)
    return <p className="text-sm text-navy-700/55">No activity yet.</p>;
  return (
    <ol
      className={cn(
        "relative space-y-3",
        timelineStyle && "border-l border-navy-900/[0.08] pl-5 ml-2"
      )}
    >
      {items.map((a) => {
        const Icon = ACTIVITY_ICONS[a.kind] ?? Activity;
        return (
          <li
            key={a.id + a.createdAt}
            className={cn(
              "rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 flex items-start gap-3",
              timelineStyle && "relative"
            )}
          >
            {timelineStyle ? (
              <span className="absolute -left-[27px] top-5 h-2.5 w-2.5 rounded-full bg-gold-500 ring-4 ring-cream" />
            ) : null}
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-bone text-gold-700 shrink-0">
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-navy-900 text-sm">{a.title}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
                  {a.kind.replace(/_/g, " ")}
                </span>
              </div>
              {a.body ? (
                <p className="mt-1 text-xs text-navy-700/70 leading-relaxed">{a.body}</p>
              ) : null}
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold">
                {a.actor}
                {a.actorRole ? ` · ${a.actorRole}` : ""} · {formatDate(a.createdAt)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---- Small primitives ----

const fieldCls =
  "w-full rounded-lg bg-white ring-1 ring-navy-900/[0.08] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900";

function Section({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: typeof Activity;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5 mb-3">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        {title}
      </div>
      <div>{children}</div>
    </section>
  );
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 space-y-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-gold-700 font-bold mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold shrink-0">
        {label}
      </span>
      {href ? (
        <Link href={href} className="font-semibold text-navy-900 hover:text-gold-700 truncate">
          {value}
        </Link>
      ) : (
        <span className="font-semibold text-navy-900 truncate">{value}</span>
      )}
    </div>
  );
}

function Selector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <FieldShell label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </FieldShell>
  );
}

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function ActionBtn({
  onClick,
  Icon,
  children,
  tone = "default",
}: {
  onClick: () => void;
  Icon: typeof Activity;
  children: React.ReactNode;
  tone?: "default" | "emerald" | "rose";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ring-1",
        tone === "emerald"
          ? "bg-emerald-500 hover:bg-emerald-400 text-white ring-emerald-500"
          : tone === "rose"
            ? "bg-white hover:bg-rose-500/10 text-rose-700 ring-rose-500/40"
            : "bg-white hover:bg-bone text-navy-900 ring-navy-900/10"
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {children}
    </button>
  );
}
