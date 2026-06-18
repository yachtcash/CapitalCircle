"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  BadgeCheck,
  Clock,
  HandCoins,
  Star,
  Briefcase,
  CircleDot,
  CheckCircle2,
  UserPlus,
  Hourglass,
  Sparkles,
  MessageSquare,
  ScrollText,
  TrendingUp,
  Eye,
  Activity,
  Flame,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import {
  DEAL_DESK_NOW_MS,
  DEAL_STAGES,
  isOpenStage,
  type Deal,
} from "@/data/deals";
import { toneForAction, type AuditEvent } from "@/data/audit";
import {
  DealHealthBadge,
  DealStageBadge,
  formatCurrency,
  formatDate,
  STAGE_DOT,
} from "@/components/dashboard/deals/DealBadges";
import { AdminPage } from "./AdminShell";
import AdminQuickActions from "./AdminQuickActions";
import MarketplacePlacementWidget from "./marketplace/MarketplacePlacementWidget";
import { cn } from "@/lib/cn";

const DAY = 24 * 60 * 60 * 1000;

export default function AdminDashboard() {
  const {
    deals,
    introductionRequests,
    conversations,
    listings,
    userOpportunities,
    userMembers,
    userCompanies,
    memberAdminState,
    companyAdminState,
    opportunityAdminState,
    opportunityPatches,
    auditEvents,
    hydrated,
  } = useMessaging();

  // Real wall-clock for time-windowed metrics, set after mount so the first
  // (server-matched) paint uses the stable demo anchor — no hydration drift.
  const [nowMs, setNowMs] = useState(DEAL_DESK_NOW_MS);
  useEffect(() => setNowMs(Date.now()), []);

  const allMembers = useMemo(
    () => (hydrated ? [...userMembers, ...MEMBERS] : MEMBERS),
    [userMembers, hydrated]
  );
  const allCompanies = useMemo(
    () => (hydrated ? [...userCompanies, ...companies] : companies),
    [userCompanies, hydrated]
  );
  const allOpps = useMemo(
    () => (hydrated ? [...userOpportunities, ...featuredOpportunities] : featuredOpportunities),
    [userOpportunities, hydrated]
  );

  // ---- Overview counts ----
  const memberStatus = (id: string) => memberAdminState[id]?.status ?? "Active";
  const totalMembers = allMembers.filter((m) => memberStatus(m.id) !== "Deleted").length;
  const activeMembers = allMembers.filter((m) => memberStatus(m.id) === "Active").length;
  const suspendedMembers = allMembers.filter((m) => memberStatus(m.id) === "Suspended").length;

  const liveCompanies = allCompanies.filter(
    (c) => (companyAdminState[c.id]?.status ?? "Active") !== "Deleted"
  );
  const companyVerification = (c: (typeof allCompanies)[number]) =>
    companyAdminState[c.id]?.verificationOverride ?? c.verification;
  const verifiedCompanies = liveCompanies.filter((c) =>
    /Verified/.test(companyVerification(c))
  ).length;
  const pendingCompanies = liveCompanies.filter(
    (c) => companyVerification(c) === "Pending"
  ).length;

  const liveOpps = allOpps.filter((o) => !opportunityAdminState[o.id]?.deleted);
  const pendingOpps = Object.values(opportunityAdminState).filter(
    (s) => s.moderation === "Pending"
  ).length;
  const featuredOpps = liveOpps.filter(
    (o) => opportunityPatches[o.id]?.featured ?? o.featured
  ).length;

  const openDeals = deals.filter((d) => isOpenStage(d.stage)).length;
  const closedDeals = deals.filter(
    (d) => d.stage === "Closed Won" || d.stage === "Closed Lost"
  ).length;

  const intros = introductionRequests;
  const pendingIntros = intros.filter((r) => r.status === "Pending").length;
  const completedIntros = intros.filter((r) => r.status === "Completed").length;
  const unreadMessages = conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0);

  const overview: StatDef[] = [
    { label: "Total Members", value: totalMembers, Icon: Users, href: "/admin/members" },
    { label: "Active Members", value: activeMembers, Icon: UserCheck, href: "/admin/members", tone: "emerald" },
    { label: "Suspended Members", value: suspendedMembers, Icon: UserX, href: "/admin/members", tone: suspendedMembers > 0 ? "rose" : undefined },
    { label: "Companies", value: liveCompanies.length, Icon: Building2, href: "/admin/companies" },
    { label: "Verified Companies", value: verifiedCompanies, Icon: BadgeCheck, href: "/admin/companies", tone: "emerald" },
    { label: "Pending Companies", value: pendingCompanies, Icon: Clock, href: "/admin/companies", tone: pendingCompanies > 0 ? "amber" : undefined },
    { label: "Opportunities", value: liveOpps.length, Icon: HandCoins, href: "/admin/opportunities" },
    { label: "Pending Opportunities", value: pendingOpps, Icon: Clock, href: "/admin/opportunities", tone: pendingOpps > 0 ? "amber" : undefined },
    { label: "Featured Opportunities", value: featuredOpps, Icon: Star, href: "/admin/opportunities", tone: "gold" },
    { label: "Deals", value: deals.length, Icon: Briefcase, href: "/admin/deals" },
    { label: "Open Deals", value: openDeals, Icon: CircleDot, href: "/admin/deals", tone: "sky" },
    { label: "Closed Deals", value: closedDeals, Icon: CheckCircle2, href: "/admin/deals", tone: "emerald" },
    { label: "Introductions", value: intros.length, Icon: UserPlus, href: "/admin/introductions" },
    { label: "Pending Introductions", value: pendingIntros, Icon: Hourglass, href: "/admin/introductions", tone: pendingIntros > 0 ? "amber" : undefined },
    { label: "Completed Introductions", value: completedIntros, Icon: Sparkles, href: "/admin/introductions", tone: "emerald" },
    { label: "Unread Messages", value: unreadMessages, Icon: MessageSquare, href: "/messages", tone: unreadMessages > 0 ? "gold" : undefined },
    { label: "Recent Audit Events", value: auditEvents.length, Icon: ScrollText, href: "/admin/audit", tone: "gold" },
    { label: "Analytics Center", value: totalMembers + liveCompanies.length + liveOpps.length + deals.length, Icon: BarChart3, href: "/analytics", tone: "gold" },
  ];

  // ---- Platform health: time windows ----
  const startOfToday = new Date(nowMs);
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();
  const weekAgoMs = nowMs - 7 * DAY;
  const monthAgoMs = nowMs - 30 * DAY;
  const parse = (iso?: string) => (iso ? Date.parse(iso) : NaN);

  const joinedToday = allMembers.filter((m) => parse(m.joinedAt) >= todayMs).length;
  const joinedThisWeek = allMembers.filter((m) => parse(m.joinedAt) >= weekAgoMs).length;
  const oppsThisWeek = allOpps.filter((o) => parse(o.postedAt) >= weekAgoMs).length;
  const dealsThisMonth = deals.filter((d) => parse(d.createdDate) >= monthAgoMs).length;

  // ---- Platform health: rankings ----
  const dealsByMember = (memberId: string) =>
    deals.filter((d) => d.sponsor.memberId === memberId || d.investor?.memberId === memberId).length;
  const introsByMember = (memberId: string) =>
    intros.filter((r) => r.requesterId === memberId || r.targetMemberId === memberId).length;
  const mostActiveMembers = [...allMembers]
    .map((m) => ({ m, score: dealsByMember(m.id) + introsByMember(m.id) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const mostActiveCompanies = [...allCompanies]
    .map((c) => ({ c, score: deals.filter((d) => d.companyId === c.id).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const listingsByViews = [...listings].sort((a, b) => b.views - a.views).slice(0, 5);
  const listingsByContacts = [...listings].sort((a, b) => b.messages - a.messages).slice(0, 5);

  const mostActiveDeals = [...deals]
    .sort((a, b) => (b.activity?.length ?? 0) - (a.activity?.length ?? 0))
    .slice(0, 5);

  return (
    <AdminPage
      title="Executive Dashboard"
      subtitle="Live command center across the entire platform — counts, health, quick actions, and a unified activity stream."
    >
      {/* Overview */}
      <SectionTitle>Platform Overview</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {overview.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Marketplace placement */}
      <MarketplacePlacementWidget />

      {/* Quick actions */}
      <AdminQuickActions />

      {/* Platform health */}
      <SectionTitle>Platform Health</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HealthStat label="Members Joined Today" value={joinedToday} Icon={UserPlus} />
        <HealthStat label="Members Joined This Week" value={joinedThisWeek} Icon={Users} />
        <HealthStat label="Opportunities Created This Week" value={oppsThisWeek} Icon={HandCoins} />
        <HealthStat label="Deals Created This Month" value={dealsThisMonth} Icon={Briefcase} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <RankPanel title="Most Active Members" Icon={Flame}>
          {mostActiveMembers.length === 0 ? (
            <Empty>No member activity yet.</Empty>
          ) : (
            mostActiveMembers.map(({ m, score }) => (
              <RankRow key={m.id} href={`/admin/members`} title={m.name} subtitle={`${m.id} · ${m.company}`} metric={`${score} active`} />
            ))
          )}
        </RankPanel>

        <RankPanel title="Most Active Companies" Icon={Activity}>
          {mostActiveCompanies.length === 0 ? (
            <Empty>No company deal activity yet.</Empty>
          ) : (
            mostActiveCompanies.map(({ c, score }) => (
              <RankRow key={c.id} href={`/admin/companies`} title={c.name} subtitle={`${c.id} · ${c.industry}`} metric={`${score} ${score === 1 ? "deal" : "deals"}`} />
            ))
          )}
        </RankPanel>

        <RankPanel title="Most Active Deals" Icon={TrendingUp}>
          {mostActiveDeals.length === 0 ? (
            <Empty>No deals yet.</Empty>
          ) : (
            mostActiveDeals.map((d) => (
              <RankRow key={d.dealId} href={`/deal-desk/${d.dealId}`} title={d.title} subtitle={`${d.dealId} · ${d.stage}`} metric={`${d.activity?.length ?? 0} events`} />
            ))
          )}
        </RankPanel>

        <RankPanel title="Most Viewed Opportunities" Icon={Eye}>
          {listingsByViews.length === 0 ? (
            <Empty>No listings yet.</Empty>
          ) : (
            listingsByViews.map((l) => (
              <RankRow key={l.id} href={`/dashboard/listings/${l.id}`} title={l.title} subtitle={l.id} metric={`${l.views.toLocaleString()} views`} />
            ))
          )}
        </RankPanel>

        <RankPanel title="Most Contacted Opportunities" Icon={MessageSquare}>
          {listingsByContacts.length === 0 ? (
            <Empty>No listings yet.</Empty>
          ) : (
            listingsByContacts.map((l) => (
              <RankRow key={l.id} href={`/dashboard/listings/${l.id}`} title={l.title} subtitle={l.id} metric={`${l.messages} contacts`} />
            ))
          )}
        </RankPanel>
      </div>

      {/* Deal operations (pipeline detail) */}
      <DealOperations deals={deals} />

      {/* Recent activity */}
      <RecentActivity
        auditEvents={auditEvents}
        userOpportunities={userOpportunities}
      />
    </AdminPage>
  );
}

// ---- Overview / health primitives ----

type Tone = "emerald" | "rose" | "amber" | "gold" | "sky";
type StatDef = { label: string; value: number; Icon: LucideIcon; href: string; tone?: Tone };

function StatCard({ label, value, Icon, href, tone }: StatDef) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-2xl ring-1 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
        tone === "amber"
          ? "bg-amber-500/[0.07] ring-amber-500/30"
          : tone === "rose"
            ? "bg-rose-500/[0.06] ring-rose-500/30"
            : tone === "gold"
              ? "bg-gold-500/[0.08] ring-gold-500/40"
              : tone === "emerald"
                ? "bg-emerald-500/[0.06] ring-emerald-500/30"
                : tone === "sky"
                  ? "bg-sky-500/[0.06] ring-sky-500/30"
                  : "bg-white ring-navy-900/[0.06]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/65 truncate">
          {label}
        </span>
        <Icon className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2.2} />
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-navy-900 tabular-nums">
        {value.toLocaleString()}
      </div>
    </Link>
  );
}

function HealthStat({ label, value, Icon }: { label: string; value: number; Icon: LucideIcon }) {
  return (
    <div className="rounded-2xl bg-navy-900 text-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-white/60 truncate">
          {label}
        </span>
        <Icon className="h-4 w-4 text-gold-400 shrink-0" strokeWidth={2.2} />
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] uppercase tracking-[0.2em] text-gold-700 font-bold pt-1">
      {children}
    </h3>
  );
}

function RankPanel({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5 inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.4} />
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function RankRow({
  href,
  title,
  subtitle,
  metric,
}: {
  href: string;
  title: string;
  subtitle: string;
  metric: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2 py-1.5 group">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-navy-900 group-hover:text-gold-700 truncate">
          {title}
        </span>
        <span className="block text-[10px] text-navy-700/55 truncate">{subtitle}</span>
      </span>
      <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-navy-700/70 tabular-nums shrink-0">
        {metric}
      </span>
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-navy-700/55 py-1">{children}</p>;
}

// ---- Recent activity unified stream ----

type ActivityItem = {
  key: string;
  label: string;
  detail: string;
  at: string;
  tone: ReturnType<typeof toneForAction>;
  href: string;
};

function auditHref(e: AuditEvent): string {
  switch (e.targetKind) {
    case "deal":
      return `/deal-desk/${e.targetId}`;
    case "listing":
      return `/dashboard/listings/${e.targetId}`;
    case "member":
      return "/admin/members";
    case "company":
      return "/admin/companies";
    case "opportunity":
      return "/admin/opportunities";
    case "introduction":
      return "/admin/introductions";
    default:
      return `/admin/audit/${e.id}`;
  }
}

function RecentActivity({
  auditEvents,
  userOpportunities,
}: {
  auditEvents: AuditEvent[];
  userOpportunities: { id: string; title: string; slug: string; postedAt: string }[];
}) {
  const items = useMemo<ActivityItem[]>(() => {
    const out: ActivityItem[] = auditEvents.map((e) => ({
      key: `aud-${e.id}`,
      label: e.action,
      detail: `${e.targetLabel ?? e.targetId}${e.before && e.after ? ` · ${e.before} → ${e.after}` : e.detail ? ` — ${e.detail}` : ""}`,
      at: e.createdAt,
      tone: toneForAction(e.action),
      href: auditHref(e),
    }));
    for (const o of userOpportunities) {
      if (!o.postedAt) continue;
      out.push({
        key: `opp-${o.id}`,
        label: "New Opportunity",
        detail: o.title,
        at: o.postedAt,
        tone: "emerald",
        href: `/opportunity/${o.slug}`,
      });
    }
    return out
      .filter((i) => !Number.isNaN(Date.parse(i.at)))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 14);
  }, [auditEvents, userOpportunities]);

  const toneDot: Record<ActivityItem["tone"], string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500",
  };

  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold">
          Recent Activity
        </div>
        <Link
          href="/admin/audit"
          className="text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600"
        >
          View audit log →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-navy-700/60">
          No activity yet. Member joins, approvals, deals, introductions, and
          media changes appear here as they happen.
        </p>
      ) : (
        <ul className="divide-y divide-navy-900/[0.05]">
          {items.map((i) => (
            <li key={i.key}>
              <Link href={i.href} className="flex items-center gap-3 py-2.5 group">
                <span className={cn("h-2 w-2 rounded-full shrink-0", toneDot[i.tone])} />
                <span className="text-sm font-semibold text-navy-900 group-hover:text-gold-700 shrink-0">
                  {i.label}
                </span>
                <span className="text-sm text-navy-700/65 truncate flex-1">{i.detail}</span>
                <span className="text-[10px] text-navy-700/45 tabular-nums shrink-0 hidden sm:inline">
                  {formatDate(i.at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- Deal Operations (pipeline detail) ----

function DealOperations({ deals }: { deals: Deal[] }) {
  const nowMs = DEAL_DESK_NOW_MS;
  const now = new Date(nowMs);
  const open = deals.filter((d) => isOpenStage(d.stage));

  const byStage = DEAL_STAGES.map((stage) => ({
    stage,
    count: deals.filter((d) => d.stage === stage).length,
  })).filter((s) => s.count > 0);

  const byAdmin = [...new Set(deals.map((d) => d.assignedAdmin).filter(Boolean))]
    .map((admin) => {
      const mine = deals.filter((d) => d.assignedAdmin === admin);
      return {
        admin,
        open: mine.filter((d) => isOpenStage(d.stage)).length,
        total: mine.length,
        value: mine.filter((d) => isOpenStage(d.stage)).reduce((s, d) => s + d.targetInvestment, 0),
      };
    })
    .sort((a, b) => b.open - a.open);

  const closingThisMonth = open.filter((d) => {
    if (!d.expectedCloseDate) return false;
    const c = new Date(d.expectedCloseDate);
    return c.getFullYear() === now.getFullYear() && c.getMonth() === now.getMonth();
  });

  const largest = [...open].sort((a, b) => b.targetInvestment - a.targetInvestment).slice(0, 5);
  const recent = [...deals].sort((a, b) => b.updatedDate.localeCompare(a.updatedDate)).slice(0, 5);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold">
            Deal Operations
          </div>
          <div className="mt-1 text-sm text-navy-700/70">
            <span className="font-semibold text-navy-900 tabular-nums">{open.length}</span> active deals ·{" "}
            <span className="font-semibold text-navy-900 tabular-nums">{closingThisMonth.length}</span> closing this month ·{" "}
            <span className="font-semibold text-navy-900 tabular-nums">
              {formatCurrency(open.reduce((s, d) => s + d.targetInvestment, 0))}
            </span>{" "}
            in play
          </div>
        </div>
        <Link href="/admin/deals" className="text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600">
          Manage deals →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">Deals By Stage</div>
          <ul className="space-y-1.5">
            {byStage.map(({ stage, count }) => (
              <li key={stage} className="flex items-center gap-2 text-xs">
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STAGE_DOT[stage])} />
                <span className="text-navy-900/85 truncate flex-1">{stage}</span>
                <span className="font-semibold text-navy-900 tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">Deals By Admin</div>
          <ul className="space-y-1.5">
            {byAdmin.map(({ admin, open: o, total, value }) => (
              <li key={admin} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-navy-900/85 truncate flex-1">{admin}</span>
                  <span className="font-semibold text-navy-900 tabular-nums">{o} open / {total}</span>
                </div>
                <div className="text-[10px] text-navy-700/55 tabular-nums">{formatCurrency(value)} active</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">Closing This Month</div>
          {closingThisMonth.length === 0 ? (
            <p className="text-xs text-navy-700/55">No open deals expect to close this month.</p>
          ) : (
            <ul className="space-y-2">
              {closingThisMonth.slice(0, 5).map((d) => (
                <li key={d.dealId}>
                  <Link href={`/deal-desk/${d.dealId}`} className="block group">
                    <div className="text-xs font-semibold text-navy-900 group-hover:text-gold-700 truncate">{d.title}</div>
                    <div className="text-[10px] text-navy-700/55 tabular-nums">{formatDate(d.expectedCloseDate)} · {formatCurrency(d.targetInvestment)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">Largest Open Deals</div>
          <ul className="space-y-2">
            {largest.map((d) => (
              <li key={d.dealId}>
                <Link href={`/deal-desk/${d.dealId}`} className="block group">
                  <div className="text-xs font-semibold text-navy-900 group-hover:text-gold-700 truncate">{d.title}</div>
                  <div className="text-[10px] text-navy-700/55 tabular-nums">{formatCurrency(d.targetInvestment)} · {d.stage}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2">Recently Updated Deals</div>
        <ul className="divide-y divide-navy-900/[0.05]">
          {recent.map((d) => (
            <li key={d.dealId}>
              <Link href={`/deal-desk/${d.dealId}`} className="flex items-center gap-3 py-2 group">
                <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-navy-700/55 tabular-nums shrink-0">{d.dealId}</span>
                <span className="text-sm font-semibold text-navy-900 group-hover:text-gold-700 truncate flex-1">{d.title}</span>
                <DealHealthBadge health={d.health} hideHealthy />
                <DealStageBadge stage={d.stage} />
                <span className="text-[10px] text-navy-700/55 tabular-nums shrink-0 hidden sm:inline">{formatDate(d.updatedDate)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
