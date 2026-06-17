"use client";

import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  ListChecks,
  HandCoins,
  Users,
  Building2,
  CalendarDays,
  Bell,
  ScrollText,
  Flag,
} from "lucide-react";

import type { Analytics } from "@/lib/analytics/compute";
import {
  SectionShell,
  StatGrid,
  DistributionCard,
  RankingTable,
  FunnelChart,
  TrendCard,
  ExportButton,
} from "./primitives";

export type ExportEntity =
  | "deals"
  | "members"
  | "companies"
  | "listings"
  | "introductions"
  | "audit"
  | "reports";

type SectionProps = { a: Analytics; onExport: (e: ExportEntity) => void };

function Cols({ children, n = 2 }: { children: React.ReactNode; n?: 2 | 3 }) {
  return (
    <div className={n === 3 ? "grid grid-cols-1 lg:grid-cols-3 gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-4"}>
      {children}
    </div>
  );
}

// 1 ── Executive Overview ────────────────────────────────────────────
export function ExecutiveOverviewSection({ a }: { a: Analytics }) {
  return (
    <SectionShell
      id="executive"
      eyebrow="Executive Overview"
      title="Platform KPIs"
      description="Every headline number across members, companies, opportunities, introductions, and deals — for the selected window. Click any card to drill into the source."
      Icon={LayoutDashboard}
    >
      <StatGrid metrics={a.executive} cols={5} />
    </SectionShell>
  );
}

// 2 ── Deal Analytics ────────────────────────────────────────────────
export function DealAnalyticsSection({ a, onExport }: SectionProps) {
  const d = a.deals;
  return (
    <SectionShell
      id="deals"
      eyebrow="Deal Analytics"
      title="Pipeline & Conversion"
      Icon={Briefcase}
      action={<ExportButton onClick={() => onExport("deals")} />}
    >
      <StatGrid metrics={d.kpis} cols={4} />
      <FunnelChart steps={d.funnel} />
      <Cols n={3}>
        <DistributionCard title="Deals by Stage" items={d.byStage} tone="navy" />
        <DistributionCard title="Deals by Health" items={d.byHealth} />
        <DistributionCard title="Deals by Priority" items={d.byPriority} tone="sky" />
      </Cols>
      <Cols n={3}>
        <RankingTable title="Deals by Admin" items={d.byAdmin} />
        <DistributionCard title="Deals by Source" items={d.bySource} tone="gold" />
        <TrendCard title="Deals by Month" items={d.byMonth} />
      </Cols>
      <Cols n={3}>
        <RankingTable title="Largest Deals" items={d.largestDeals} />
        <RankingTable title="Deals Closing This Month" items={d.closingThisMonth} />
        <RankingTable title="Recently Updated" items={d.recentlyUpdatedDeals} />
      </Cols>
      <Cols n={3}>
        <RankingTable title="Overdue Deals" items={d.overdueDeals} emptyHint="No overdue deals." />
        <RankingTable title="At Risk Deals" items={d.atRiskDeals} emptyHint="No at-risk deals." />
        <RankingTable title="Needs Attention" items={d.needsAttentionDeals} emptyHint="All deals healthy." />
      </Cols>
    </SectionShell>
  );
}

// 3 ── Introduction Analytics ────────────────────────────────────────
export function IntroductionAnalyticsSection({ a, onExport }: SectionProps) {
  const i = a.introductions;
  return (
    <SectionShell
      id="introductions"
      eyebrow="Introduction Analytics"
      title="Brokered Connections"
      Icon={UserPlus}
      action={<ExportButton onClick={() => onExport("introductions")} />}
    >
      <StatGrid metrics={i.kpis} cols={4} />
      <Cols n={2}>
        <RankingTable title="Most Active Introducers" items={i.topIntroducers} />
        <RankingTable title="Most Requested Members" items={i.mostRequested} />
      </Cols>
      <Cols n={2}>
        <RankingTable title="Most Approved Members" items={i.mostApproved} />
        <RankingTable title="Most Rejected Members" items={i.mostRejected} emptyHint="No rejected introductions in this range." />
      </Cols>
    </SectionShell>
  );
}

// 4 ── Listing Analytics ─────────────────────────────────────────────
export function ListingAnalyticsSection({ a, onExport }: SectionProps) {
  const l = a.listings;
  return (
    <SectionShell
      id="listings"
      eyebrow="Listing Analytics"
      title="Listing Performance"
      Icon={ListChecks}
      action={<ExportButton onClick={() => onExport("listings")} />}
    >
      <StatGrid metrics={l.kpis} cols={4} />
      <Cols n={3}>
        <DistributionCard title="Listings by Status" items={l.byStatus} tone="navy" />
        <DistributionCard title="Top Categories" items={l.categories} tone="gold" />
        <DistributionCard title="Top Deal Types" items={l.dealTypes} tone="sky" />
      </Cols>
      <Cols n={3}>
        <RankingTable title="Most Viewed" items={l.mostViewed} valueLabel="views" />
        <RankingTable title="Most Saved" items={l.mostSaved} valueLabel="saves" />
        <RankingTable title="Most Contacted" items={l.mostContacted} valueLabel="contacts" />
      </Cols>
      <Cols n={3}>
        <RankingTable title="Most Introductions" items={l.mostIntros} emptyHint="No introductions linked." />
        <RankingTable title="Most Deals Generated" items={l.mostDeals} emptyHint="No deals linked." />
        <RankingTable title="Recently Updated" items={l.recent} valueLabel="views" />
      </Cols>
    </SectionShell>
  );
}

// 5 ── Opportunity Analytics ─────────────────────────────────────────
export function OpportunityAnalyticsSection({ a }: { a: Analytics }) {
  const o = a.opportunities;
  return (
    <SectionShell
      id="opportunities"
      eyebrow="Opportunity Analytics"
      title="Catalog Performance"
      Icon={HandCoins}
    >
      <StatGrid metrics={o.kpis} cols={6} />
      <Cols n={3}>
        <DistributionCard title="Top Categories" items={o.categories} tone="gold" />
        <DistributionCard title="Top Industries" items={o.industries} tone="navy" />
        <DistributionCard title="Top Locations" items={o.locations} tone="sky" />
      </Cols>
      <Cols n={3}>
        <RankingTable title="Most Viewed" items={o.mostViewed} valueLabel="via linked listing" emptyHint="No listing views linked." />
        <RankingTable title="Most Saved" items={o.mostSaved} valueLabel="via linked listing" emptyHint="No listing saves linked." />
        <RankingTable title="Most Contacted" items={o.mostContacted} valueLabel="via linked listing" emptyHint="No listing contacts linked." />
      </Cols>
    </SectionShell>
  );
}

// 6 ── Member Analytics ──────────────────────────────────────────────
export function MemberAnalyticsSection({ a, onExport }: SectionProps) {
  const mem = a.members;
  return (
    <SectionShell
      id="members"
      eyebrow="Member Analytics"
      title="Member Engagement"
      Icon={Users}
      action={<ExportButton onClick={() => onExport("members")} />}
    >
      <StatGrid metrics={mem.kpis} cols={6} />
      <Cols n={2}>
        <DistributionCard title="Members by Type" items={mem.byType} tone="navy" />
        <DistributionCard title="Members by Country" items={mem.byRegion} tone="gold" />
      </Cols>
      <Cols n={3}>
        <RankingTable title="Most Active Members" items={mem.mostActive} />
        <RankingTable title="Most Introductions Sent" items={mem.mostIntrosSent} />
        <RankingTable title="Most Introductions Received" items={mem.mostIntrosReceived} />
      </Cols>
      <Cols n={2}>
        <RankingTable title="Most Deals" items={mem.mostDealsCreated} />
        <RankingTable title="Most Calendar Events" items={mem.mostCalendar} emptyHint="No member-linked events." />
      </Cols>
    </SectionShell>
  );
}

// 7 ── Company Analytics ─────────────────────────────────────────────
export function CompanyAnalyticsSection({ a, onExport }: SectionProps) {
  const c = a.companies;
  return (
    <SectionShell
      id="companies"
      eyebrow="Company Analytics"
      title="Company Engagement"
      Icon={Building2}
      action={<ExportButton onClick={() => onExport("companies")} />}
    >
      <StatGrid metrics={c.kpis} cols={4} />
      <Cols n={2}>
        <DistributionCard title="Top Industries" items={c.industries} tone="navy" />
        <DistributionCard title="Top Locations" items={c.locations} tone="gold" />
      </Cols>
      <Cols n={3}>
        <RankingTable title="Most Active Companies" items={c.mostActive} />
        <RankingTable title="Most Opportunities" items={c.mostOpps} />
        <RankingTable title="Most Deals" items={c.mostDeals} />
      </Cols>
      <Cols n={2}>
        <RankingTable title="Most Introductions" items={c.mostIntros} emptyHint="No company-linked introductions." />
        <RankingTable title="Most Calendar Activity" items={c.mostCalendar} emptyHint="No company-linked events." />
      </Cols>
    </SectionShell>
  );
}

// 8 ── Calendar Analytics ────────────────────────────────────────────
export function CalendarAnalyticsSection({ a }: { a: Analytics }) {
  const c = a.calendar;
  return (
    <SectionShell
      id="calendar"
      eyebrow="Calendar Analytics"
      title="Scheduling Activity"
      description="Tiles (Today / Week / Upcoming / Overdue) reflect the live calendar; the distributions below honor the selected window by event creation date."
      Icon={CalendarDays}
    >
      <StatGrid metrics={c.tiles} cols={6} />
      <StatGrid metrics={c.typeKpis} cols={6} />
      <Cols n={3}>
        <DistributionCard title="Events by Type" items={c.byType} tone="gold" />
        <RankingTable title="Most Active Members" items={c.mostMembers} emptyHint="No member-linked events." />
        <RankingTable title="Most Active Companies" items={c.mostCompanies} emptyHint="No company-linked events." />
      </Cols>
      <Cols n={2}>
        <RankingTable title="Most Active Deals" items={c.mostDeals} emptyHint="No deal-linked events." />
        <div />
      </Cols>
    </SectionShell>
  );
}

// 9 ── Notification Analytics ────────────────────────────────────────
export function NotificationAnalyticsSection({ a }: { a: Analytics }) {
  const n = a.notifications;
  return (
    <SectionShell
      id="notifications"
      eyebrow="Notification Analytics"
      title="Notification Volume"
      Icon={Bell}
    >
      <StatGrid metrics={n.kpis} cols={6} />
      <Cols n={2}>
        <DistributionCard title="Notifications by Type" items={n.byKind} tone="sky" />
        <div />
      </Cols>
    </SectionShell>
  );
}

// 10 ── Audit Analytics ──────────────────────────────────────────────
export function AuditAnalyticsSection({ a, onExport }: SectionProps) {
  const au = a.audit;
  return (
    <SectionShell
      id="audit"
      eyebrow="Audit Analytics"
      title="Administrative Activity"
      Icon={ScrollText}
      action={<ExportButton onClick={() => onExport("audit")} />}
    >
      <StatGrid metrics={au.kpis} cols={5} />
      <Cols n={3}>
        <DistributionCard title="Actions by Group" items={au.byGroup} tone="navy" />
        <DistributionCard title="Actions by Role" items={au.byRole} tone="violet" />
        <DistributionCard title="Actions by Target" items={au.byTarget} tone="sky" />
      </Cols>
      <Cols n={2}>
        <DistributionCard title="Most Common Actions" items={au.byAction} tone="gold" />
        <RankingTable title="Most Active Users" items={au.byActor} valueLabel="actions" />
      </Cols>
    </SectionShell>
  );
}

// 11 ── Moderation Analytics ─────────────────────────────────────────
export function ModerationAnalyticsSection({ a, onExport }: SectionProps) {
  const mo = a.moderation;
  return (
    <SectionShell
      id="moderation"
      eyebrow="Moderation Analytics"
      title="Trust & Safety"
      Icon={Flag}
      action={<ExportButton onClick={() => onExport("reports")} label="Export Reports" />}
    >
      <StatGrid metrics={mo.kpis} cols={5} />
      <Cols n={3}>
        <DistributionCard title="Reports by Status" items={mo.byStatus} tone="navy" />
        <DistributionCard title="Reports by Priority" items={mo.byPriority} tone="rose" />
        <DistributionCard title="Most Common Reasons" items={mo.byReason} tone="amber" />
      </Cols>
      <Cols n={2}>
        <RankingTable title="Most Reported Targets" items={mo.mostReported} emptyHint="No reports in this range." />
        <div />
      </Cols>
    </SectionShell>
  );
}
