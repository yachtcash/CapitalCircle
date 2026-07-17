"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  ArrowUpRight,
  AlertCircle,
  CalendarClock,
  Pencil,
  Sparkles,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  DEAL_DESK_NOW_MS,
  daysUntil,
  dealAlerts,
  isOpenStage,
  type Deal,
} from "@/data/deals";
import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import type { Member } from "@/data/members";
import type { Conversation } from "@/data/messages";
import { getCompanyById } from "@/data/companies";

import CreateDealModal, { type DealPrefill } from "./CreateDealModal";
import {
  DealHealthBadge,
  DealStageBadge,
  formatCurrency,
  formatDate,
} from "./DealBadges";

// ---- Shared row ----

function DealRow({ deal }: { deal: Deal }) {
  const alerts = dealAlerts(deal, DEAL_DESK_NOW_MS);
  return (
    <Link
      href={`/deal-desk/${deal.dealId}`}
      className="block rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-3.5 hover:ring-gold-500/40 transition-all"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-navy-900 text-sm truncate flex-1 min-w-0">
          {deal.title}
        </span>
        <span className="font-semibold text-navy-900 text-sm tabular-nums shrink-0">
          {formatCurrency(deal.targetInvestment)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
        <DealStageBadge stage={deal.stage} />
        <DealHealthBadge health={deal.health} hideHealthy />
        {alerts.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] font-bold text-rose-700">
            <AlertCircle className="h-3 w-3" strokeWidth={2.4} />
            {alerts.length} {alerts.length === 1 ? "alert" : "alerts"}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function PanelShell({
  title,
  children,
  onCreate,
  stats,
}: {
  title: string;
  children: React.ReactNode;
  onCreate: () => void;
  stats: { label: string; value: number }[];
}) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
      <header className="flex items-center justify-between gap-2 mb-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5" strokeWidth={2.4} />
          {title}
        </div>
        <span className="flex items-center gap-1.5">
          <Link
            href="/deal-desk"
            className="inline-flex items-center gap-1 rounded-full bg-white ring-1 ring-navy-900/10 hover:ring-navy-900/30 text-navy-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-bold transition-colors"
          >
            Deal Desk
            <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
          </Link>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-1 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-bold transition-colors"
          >
            <Plus className="h-3 w-3" strokeWidth={2.4} />
            Create Deal
          </button>
        </span>
      </header>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-bone/60 px-2.5 py-2 text-center">
            <div className="text-base font-semibold text-navy-900 tabular-nums">{s.value}</div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-navy-700/55 font-bold truncate">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {children}
    </section>
  );
}

function RecentActivity({ deals }: { deals: Deal[] }) {
  const recent = deals
    .flatMap((d) =>
      d.activity.map((a) => ({ deal: d, a }))
    )
    .sort((x, y) => y.a.createdAt.localeCompare(x.a.createdAt))
    .slice(0, 3);
  if (recent.length === 0) return null;
  return (
    <div className="mt-3 border-t border-navy-900/[0.05] pt-3 space-y-1.5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">
        Recent Deal Activity
      </div>
      {recent.map(({ deal, a }) => (
        <Link
          key={`${deal.dealId}-${a.id}-${a.createdAt}`}
          href={`/deal-desk/${deal.dealId}`}
          className="block text-xs text-navy-700/75 hover:text-navy-900 truncate"
        >
          <span className="font-semibold text-navy-900">{a.title}</span>
          {" · "}
          {deal.dealId} · {formatDate(a.createdAt)}
        </Link>
      ))}
    </div>
  );
}

// ---- Opportunity Detail integration ----

export function OpportunityDealsPanel({ opportunity }: { opportunity: Opportunity }) {
  const { deals } = useMessaging();
  const [open, setOpen] = useState(false);
  const related = deals.filter(
    (d) => d.opportunityId === opportunity.id || d.opportunitySlug === opportunity.slug
  );
  const active = related.filter((d) => isOpenStage(d.stage));
  const closed = related.filter((d) => !isOpenStage(d.stage));

  const prefill: DealPrefill = {
    title: `${opportunity.title} — New Deal`,
    sponsorName: opportunity.postedBy,
    opportunityId: opportunity.id,
    opportunitySlug: opportunity.slug,
    companyId: opportunity.companyId,
    targetInvestment: opportunity.fundingAmount,
    tags: [opportunity.category],
  };

  return (
    <>
      <PanelShell
        title="Deal Desk"
        onCreate={() => setOpen(true)}
        stats={[
          { label: "Deals", value: related.length },
          { label: "Active", value: active.length },
          { label: "Closed", value: closed.length },
        ]}
      >
        {related.length === 0 ? (
          <p className="text-xs text-navy-700/55">
            No deals reference this opportunity yet.
          </p>
        ) : (
          <div className="space-y-2">
            {related.map((d) => (
              <DealRow key={d.dealId} deal={d} />
            ))}
          </div>
        )}
        <RecentActivity deals={related} />
      </PanelShell>
      <CreateDealModal open={open} onClose={() => setOpen(false)} prefill={prefill} />
    </>
  );
}

// ---- Company Profile integration ----

export function CompanyDealsPanel({ company }: { company: Company }) {
  const { deals } = useMessaging();
  const [open, setOpen] = useState(false);
  const related = deals.filter((d) => d.companyId === company.id);
  const active = related.filter((d) => isOpenStage(d.stage));
  const closed = related.filter((d) => !isOpenStage(d.stage));

  return (
    <>
      <PanelShell
        title={`Deals · ${company.name}`}
        onCreate={() => setOpen(true)}
        stats={[
          { label: "Active Deals", value: active.length },
          { label: "Closed Deals", value: closed.length },
          { label: "Total", value: related.length },
        ]}
      >
        {related.length === 0 ? (
          <p className="text-xs text-navy-700/55">No deals reference this company yet.</p>
        ) : (
          <div className="space-y-2">
            {[...active, ...closed].slice(0, 4).map((d) => (
              <DealRow key={d.dealId} deal={d} />
            ))}
          </div>
        )}
        <RecentActivity deals={related} />
      </PanelShell>
      <CreateDealModal
        open={open}
        onClose={() => setOpen(false)}
        prefill={{
          title: `${company.name} — New Deal`,
          sponsorName: company.name,
          sponsorCompanyId: company.id,
          companyId: company.id,
          tags: [company.industry],
        }}
      />
    </>
  );
}

// ---- Member Profile integration ----

export function MemberDealsPanel({ member }: { member: Member }) {
  const { deals, introductionRequests } = useMessaging();
  const [open, setOpen] = useState(false);
  const related = deals.filter(
    (d) => d.sponsor.memberId === member.id || d.investor?.memberId === member.id
  );
  const inProgress = related.filter((d) => isOpenStage(d.stage));
  const closed = related.filter((d) => !isOpenStage(d.stage));
  const converted = introductionRequests.filter(
    (r) =>
      (r.requesterId === member.id || r.targetMemberId === member.id) &&
      deals.some((d) => d.introductionId === r.id || d.sourceId === r.id)
  );

  return (
    <>
      <PanelShell
        title="Deals"
        onCreate={() => setOpen(true)}
        stats={[
          { label: "Deals In Progress", value: inProgress.length },
          { label: "Closed Deals", value: closed.length },
          { label: "Intros Converted", value: converted.length },
        ]}
      >
        {related.length === 0 ? (
          <p className="text-xs text-navy-700/55">No deals involve this member yet.</p>
        ) : (
          <div className="space-y-2">
            {[...inProgress, ...closed].slice(0, 4).map((d) => (
              <DealRow key={d.dealId} deal={d} />
            ))}
          </div>
        )}
        <RecentActivity deals={related} />
      </PanelShell>
      <CreateDealModal
        open={open}
        onClose={() => setOpen(false)}
        prefill={{
          title: `${member.name} — New Deal`,
          sponsorName: member.name,
          sponsorMemberId: member.id,
          companyId: member.companyId,
          tags: [member.memberType],
        }}
      />
    </>
  );
}

// ---- Messages integration ----

export function ConversationDealBar({ conversation }: { conversation: Conversation }) {
  const { deals } = useMessaging();
  const [open, setOpen] = useState(false);

  const linked = deals.find(
    (d) =>
      d.conversationIds.includes(conversation.id) ||
      (conversation.opportunitySlug &&
        d.opportunitySlug === conversation.opportunitySlug &&
        isOpenStage(d.stage))
  );
  const company = getCompanyById(conversation.companyId);

  return (
    <div className="bg-white rounded-xl ring-1 ring-navy-900/[0.08] px-4 py-3 flex items-center gap-3 flex-wrap">
      <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-gold-700 inline-flex items-center gap-1.5 shrink-0">
        <Briefcase className="h-3.5 w-3.5" strokeWidth={2.4} />
        Deal Desk
      </span>
      {linked ? (
        <>
          <span className="text-sm font-semibold text-navy-900 truncate min-w-0">
            {linked.dealId}
          </span>
          <DealStageBadge stage={linked.stage} />
          <DealHealthBadge health={linked.health} hideHealthy />
          <span className="text-sm font-semibold text-navy-900 tabular-nums">
            {formatCurrency(linked.targetInvestment)}
          </span>
          <span className="text-xs text-navy-700/65 truncate">
            Admin · {linked.assignedAdmin}
          </span>
          <Link
            href={`/deal-desk/${linked.dealId}`}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-navy-900 hover:bg-navy-800 text-white px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] font-bold transition-colors shrink-0"
          >
            Open Deal
            <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
          </Link>
        </>
      ) : (
        <>
          <span className="text-xs text-navy-700/65 truncate min-w-0">
            No deal is linked to this conversation yet.
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] font-bold transition-colors shrink-0"
          >
            <Plus className="h-3 w-3" strokeWidth={2.4} />
            Create Deal
          </button>
        </>
      )}
      <CreateDealModal
        open={open}
        onClose={() => setOpen(false)}
        prefill={{
          title: conversation.opportunityTitle
            ? `${conversation.opportunityTitle} — ${company?.name ?? "Deal"}`
            : `${company?.name ?? "Conversation"} — New Deal`,
          sponsorName: company?.name ?? conversation.companyId,
          companyId: conversation.companyId,
          opportunitySlug: conversation.opportunitySlug,
          conversationIds: [conversation.id],
          summaryNote: conversation.lastMessagePreview,
        }}
      />
    </div>
  );
}

// ---- Dashboard widgets ----

export function DealInsightsPanel() {
  const { deals, profile } = useMessaging();
  const nowMs = DEAL_DESK_NOW_MS;

  const widgets = useMemo(() => {
    const open = deals.filter((d) => isOpenStage(d.stage));
    const mine = open
      .filter((d) => d.assignedAdmin === profile.name)
      .sort((a, b) => b.updatedDate.localeCompare(a.updatedDate))
      .slice(0, 4);
    const attention = open
      .filter(
        (d) =>
          (d.health && d.health !== "Healthy") || dealAlerts(d, nowMs).length > 0
      )
      .slice(0, 4);
    const closingSoon = open
      .filter((d) => {
        const du = daysUntil(d.expectedCloseDate, nowMs);
        return du !== null && du >= 0 && du <= 21;
      })
      .sort(
        (a, b) =>
          (a.expectedCloseDate ?? "").localeCompare(b.expectedCloseDate ?? "")
      )
      .slice(0, 4);
    const recent = [...deals]
      .sort((a, b) => b.updatedDate.localeCompare(a.updatedDate))
      .slice(0, 4);
    return { mine, attention, closingSoon, recent };
  }, [deals, profile.name, nowMs]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Widget title="My Active Deals" Icon={Briefcase} deals={widgets.mine} empty="Nothing assigned to you right now." />
      <Widget title="Deals Needing Attention" Icon={AlertCircle} deals={widgets.attention} empty="All deals are healthy." />
      <Widget title="Deals Closing Soon" Icon={CalendarClock} deals={widgets.closingSoon} empty="Nothing closing in the next three weeks." />
      <Widget title="Recently Updated" Icon={Pencil} deals={widgets.recent} empty="No deal activity yet." />
    </section>
  );
}

function Widget({
  title,
  Icon,
  deals,
  empty,
}: {
  title: string;
  Icon: typeof Briefcase;
  deals: Deal[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
          {title}
        </div>
        <Link
          href="/deal-desk"
          className="text-[10px] uppercase tracking-[0.12em] font-bold text-gold-700 hover:text-gold-600 inline-flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" strokeWidth={2.4} />
          Deal Desk
        </Link>
      </div>
      {deals.length === 0 ? (
        <p className="text-xs text-navy-700/55">{empty}</p>
      ) : (
        <div className="space-y-2">
          {deals.map((d) => (
            <DealRow key={d.dealId} deal={d} />
          ))}
        </div>
      )}
    </div>
  );
}
