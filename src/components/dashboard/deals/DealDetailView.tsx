"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  HandCoins,
  Tag,
  UserPlus,
  Users,
  Sparkles,
  Pencil,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Deal, DealPriority, DealStage } from "@/data/deals";
import { DEAL_PRIORITIES, DEAL_STAGES } from "@/data/deals";
import { getCompanyById } from "@/data/companies";
import { getMemberById } from "@/data/members";
import { featuredOpportunities } from "@/data/opportunities";

import {
  DealPriorityBadge,
  DealStageBadge,
  FollowUpBadge,
  formatCurrency,
  formatDate,
} from "./DealBadges";
import DealNotes from "./DealNotes";
import { cn } from "@/lib/cn";

const ACTIVITY_ICONS: Record<Deal["activity"][number]["kind"], typeof Activity> = {
  created: Sparkles,
  updated: Pencil,
  stage_change: ChevronRight,
  note_added: FileText,
  introduction_approved: UserPlus,
  meeting_scheduled: Calendar,
  document_uploaded: FileText,
  closed: Sparkles,
  lost: Sparkles,
};

export default function DealDetailView({ deal }: { deal: Deal }) {
  const {
    updateDealStage,
    addDealNote,
    setDealPriority,
    setDealFollowUp,
  } = useMessaging();
  const [tab, setTab] = useState<
    "overview" | "activity" | "notes" | "contacts" | "timeline" | "documents"
  >("overview");

  const nowMs = Date.parse("2026-06-09T00:00:00Z");
  const company = deal.companyId ? getCompanyById(deal.companyId) : undefined;
  const opportunity =
    featuredOpportunities.find((o) => o.id === deal.opportunityId) ??
    featuredOpportunities.find((o) => o.slug === deal.opportunitySlug);
  const member = deal.memberId ? getMemberById(deal.memberId) : undefined;

  const setFollowUpToday = () =>
    setDealFollowUp(deal.dealId, {
      lastContactDate: new Date().toISOString(),
    });

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem-3rem)]">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-7">
        {/* Hero */}
        <nav className="text-[11px] uppercase tracking-[0.16em] text-navy-700/60">
          <Link
            href="/dashboard/deals"
            className="inline-flex items-center gap-1 text-navy-700/70 hover:text-navy-900"
          >
            <ChevronLeft className="h-3 w-3" strokeWidth={2.4} />
            Deal Desk
          </Link>
          <span className="mx-2">·</span>
          <span className="text-navy-900 font-semibold tabular-nums">
            {deal.dealId}
          </span>
        </nav>

        <header className="bg-white rounded-3xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DealStageBadge stage={deal.status} />
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
                  <Clock className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Created {formatDate(deal.createdDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Pencil className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Updated {formatDate(deal.updatedDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Owner · {deal.owner}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Next follow-up {formatDate(deal.nextFollowUpDate)}
                </span>
              </div>
            </div>
            <div className="md:shrink-0 text-right space-y-1.5">
              <div className="text-3xl md:text-4xl font-semibold text-navy-900 tabular-nums">
                {formatCurrency(deal.estimatedValue)}
              </div>
              <div className="text-xs text-navy-700/65">
                Commission ·{" "}
                <span className="font-semibold text-navy-900 tabular-nums">
                  {formatCurrency(deal.commissionPotential)}
                </span>
              </div>
              <button
                type="button"
                onClick={setFollowUpToday}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors"
              >
                <Clock className="h-3 w-3" strokeWidth={2.4} />
                Log contact
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Selector
              label="Stage"
              value={deal.status}
              options={DEAL_STAGES.map((s) => ({ value: s, label: s }))}
              onChange={(v) => updateDealStage(deal.dealId, v as DealStage)}
            />
            <Selector
              label="Priority"
              value={deal.priority}
              options={DEAL_PRIORITIES.map((p) => ({ value: p, label: p }))}
              onChange={(v) => setDealPriority(deal.dealId, v as DealPriority)}
            />
            <Field label="Next Follow-Up">
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
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/[0.06] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900"
              />
            </Field>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-navy-900/[0.06]">
          {(
            [
              ["overview", "Overview", HandCoins],
              ["activity", "Activity", Activity],
              ["notes", "Notes", FileText],
              ["contacts", "Contacts", Users],
              ["timeline", "Timeline", Calendar],
              ["documents", "Documents", FileText],
            ] as const
          ).map(([key, label, Icon]) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors",
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
                      <div className="mt-1 font-semibold text-navy-900">
                        {opportunity.title}
                      </div>
                      <div className="text-xs text-navy-700/65 mt-1">
                        {opportunity.location} ·{" "}
                        {formatCurrency(opportunity.fundingAmount)}
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
                      <div className="text-xs text-navy-700/65 mt-1">
                        {company.industry}
                      </div>
                    </Link>
                  </Section>
                ) : null}
                {member ? (
                  <Section title="Related Member" Icon={Users}>
                    <Link
                      href={`/member/${member.slug}`}
                      className="block rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 hover:ring-gold-500/40 transition-all"
                    >
                      <div className="font-semibold text-navy-900">{member.name}</div>
                      <div className="text-xs text-navy-700/65 mt-1">
                        {member.memberType} · {member.company}
                      </div>
                    </Link>
                  </Section>
                ) : null}
              </>
            ) : null}

            {tab === "activity" ? (
              <Section title="Activity Log" Icon={Activity}>
                <ActivityList deal={deal} />
              </Section>
            ) : null}

            {tab === "notes" ? (
              <Section title="Notes" Icon={FileText}>
                <DealNotes
                  notes={deal.notes}
                  onAdd={(text) => addDealNote(deal.dealId, text)}
                />
              </Section>
            ) : null}

            {tab === "contacts" ? (
              <Section title="Contacts" Icon={Users}>
                {deal.contacts.length === 0 ? (
                  <p className="text-sm text-navy-700/55">
                    No contacts attached yet. Contacts are pulled from the
                    introduction or inquiry that opened this deal.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {deal.contacts.map((c) => (
                      <li
                        key={`${c.id}-${c.name}`}
                        className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 flex items-start gap-3"
                      >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-gold-500 text-xs font-bold">
                          {c.name
                            .split(/\s+/)
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-navy-900 truncate">
                            {c.memberId ? (
                              <Link
                                href={`/member/${getMemberById(c.memberId)?.slug ?? ""}`}
                                className="hover:text-gold-700 transition-colors"
                              >
                                {c.name}
                              </Link>
                            ) : (
                              c.name
                            )}
                          </div>
                          <div className="text-xs text-navy-700/65 mt-0.5">
                            {c.role}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            ) : null}

            {tab === "timeline" ? (
              <Section title="Timeline" Icon={Calendar}>
                <ActivityList deal={deal} timelineStyle />
              </Section>
            ) : null}

            {tab === "documents" ? (
              <Section title="Documents" Icon={FileText}>
                <p className="text-sm text-navy-700/55">
                  No documents attached to this deal yet. Document attachments
                  flow in from the data room and inbound inquiries.
                </p>
              </Section>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <SidePanel title="Source">
              <Row label="Type" value={deal.sourceType} />
              {deal.sourceId ? (
                <Row
                  label="Source ID"
                  value={deal.sourceId}
                  href={
                    deal.sourceType === "Introduction Request"
                      ? `/dashboard/introductions`
                      : deal.sourceType === "Opportunity Inquiry" && deal.opportunitySlug
                        ? `/opportunity/${deal.opportunitySlug}`
                        : undefined
                  }
                />
              ) : null}
              {deal.sourceName ? (
                <Row label="Label" value={deal.sourceName} />
              ) : null}
            </SidePanel>

            <SidePanel title="Identifiers">
              {deal.memberId ? (
                <Row
                  label="Member"
                  value={deal.memberId}
                  href={member ? `/member/${member.slug}` : undefined}
                />
              ) : null}
              {deal.companyId ? (
                <Row
                  label="Company"
                  value={deal.companyId}
                  href={company ? `/company/${company.slug}` : undefined}
                />
              ) : null}
              {deal.opportunityId ? (
                <Row
                  label="Opportunity"
                  value={deal.opportunityId}
                  href={
                    opportunity ? `/opportunity/${opportunity.slug}` : undefined
                  }
                />
              ) : null}
            </SidePanel>

            <SidePanel title="Follow-Up">
              <Row label="Last contact" value={formatDate(deal.lastContactDate)} />
              <Row label="Next follow-up" value={formatDate(deal.nextFollowUpDate)} />
            </SidePanel>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ActivityList({
  deal,
  timelineStyle = false,
}: {
  deal: Deal;
  timelineStyle?: boolean;
}) {
  const items = [...deal.activity].sort((a, b) =>
    timelineStyle
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt)
  );
  if (items.length === 0)
    return <p className="text-sm text-navy-700/55">No activity yet.</p>;
  return (
    <ol className={cn("relative space-y-3", timelineStyle && "border-l border-navy-900/[0.08] pl-5 ml-2")}>
      {items.map((a) => {
        const Icon = ACTIVITY_ICONS[a.kind] ?? Activity;
        return (
          <li
            key={a.id}
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
                <span className="font-semibold text-navy-900 text-sm">
                  {a.title}
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
                  {a.kind.replace(/_/g, " ")}
                </span>
              </div>
              {a.body ? (
                <p className="mt-1 text-xs text-navy-700/70 leading-relaxed">
                  {a.body}
                </p>
              ) : null}
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold">
                {a.actor} · {formatDate(a.createdAt)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

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
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-gold-700 font-bold mb-3">
        {title}
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold shrink-0">
        {label}
      </span>
      {href ? (
        <Link
          href={href}
          className="text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors truncate"
        >
          {value}
        </Link>
      ) : (
        <span className="text-sm font-semibold text-navy-900 truncate">{value}</span>
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
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/[0.06] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
