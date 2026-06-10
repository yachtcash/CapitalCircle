"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  HandCoins,
  ListChecks,
  Briefcase,
  UserPlus,
  MessageSquare,
  FileText,
  Clock,
  Flag,
  ShieldAlert,
  ScrollText,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import { SEED_FLAGGED_MESSAGES, SEED_REPORTS } from "@/data/admin";
import {
  DEAL_DESK_NOW_MS,
  DEAL_STAGES,
  isOpenStage,
  type Deal,
} from "@/data/deals";
import {
  DealHealthBadge,
  DealStageBadge,
  formatCurrency,
  formatDate,
  STAGE_DOT,
} from "@/components/dashboard/deals/DealBadges";
import { AdminPage } from "./AdminShell";
import { cn } from "@/lib/cn";

export default function AdminDashboard() {
  const {
    listings,
    deals,
    introductionRequests,
    conversations,
    documents,
    userOpportunities,
    memberAdminState,
    companyAdminState,
    opportunityAdminState,
    auditEvents,
  } = useMessaging();

  const activeMembers = MEMBERS.filter(
    (m) => (memberAdminState[m.id]?.status ?? "Active") !== "Deleted"
  ).length;
  const suspendedMembers = MEMBERS.filter(
    (m) => memberAdminState[m.id]?.status === "Suspended"
  ).length;
  const activeCompanies = companies.filter(
    (c) => (companyAdminState[c.id]?.status ?? "Active") !== "Deleted"
  ).length;
  const totalOpps =
    featuredOpportunities.filter((o) => !opportunityAdminState[o.id]?.deleted).length +
    userOpportunities.length;
  const pendingOpps = Object.values(opportunityAdminState).filter(
    (s) => s.moderation === "Pending"
  ).length;
  const pendingIntros = introductionRequests.filter((r) => r.status === "Pending").length;
  const pendingCompanies = companies.filter(
    (c) =>
      (companyAdminState[c.id]?.verificationOverride ?? c.verification) === "Pending"
  ).length;
  const pendingApprovals = pendingOpps + pendingIntros + pendingCompanies;
  const flagged =
    SEED_REPORTS.filter((r) => r.status === "Open").length +
    SEED_FLAGGED_MESSAGES.filter((f) => f.status === "Open").length;

  const cards: {
    label: string;
    value: number;
    Icon: typeof Users;
    href: string;
    tone?: "gold" | "rose" | "amber";
  }[] = [
    { label: "Members", value: activeMembers, Icon: Users, href: "/admin/members" },
    { label: "Companies", value: activeCompanies, Icon: Building2, href: "/admin/companies" },
    { label: "Opportunities", value: totalOpps, Icon: HandCoins, href: "/admin/opportunities" },
    { label: "Listings", value: listings.length, Icon: ListChecks, href: "/admin/listings" },
    { label: "Deals", value: deals.length, Icon: Briefcase, href: "/admin/deals" },
    { label: "Introductions", value: introductionRequests.length, Icon: UserPlus, href: "/admin/introductions" },
    { label: "Messages", value: conversations.length, Icon: MessageSquare, href: "/messages" },
    { label: "Documents", value: documents.length, Icon: FileText, href: "/documents" },
    { label: "Pending Approvals", value: pendingApprovals, Icon: Clock, href: "/admin/moderation", tone: "amber" },
    { label: "Flagged Content", value: flagged, Icon: Flag, href: "/admin/moderation", tone: "rose" },
    { label: "Suspended Members", value: suspendedMembers, Icon: ShieldAlert, href: "/admin/moderation", tone: "rose" },
    { label: "Audit Events", value: auditEvents.length, Icon: ScrollText, href: "/admin/audit", tone: "gold" },
  ];

  return (
    <AdminPage
      title="Executive Dashboard"
      subtitle="Live counts across the entire platform. Every card opens the matching management surface."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {cards.map(({ label, value, Icon, href, tone }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "rounded-2xl ring-1 p-4 md:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
              tone === "amber"
                ? "bg-amber-500/[0.07] ring-amber-500/30"
                : tone === "rose"
                  ? "bg-rose-500/[0.06] ring-rose-500/30"
                  : tone === "gold"
                    ? "bg-gold-500/[0.08] ring-gold-500/40"
                    : "bg-white ring-navy-900/[0.06]"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/65 truncate">
                {label}
              </span>
              <Icon className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2.2} />
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-navy-900 tabular-nums">
              {value.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>

      <DealOperations deals={deals} />

      <div className="rounded-2xl bg-navy-900 text-white p-5 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold-400 font-bold">
            Recent Audit Activity
          </div>
          <Link
            href="/admin/audit"
            className="text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-400 hover:text-gold-300"
          >
            View all →
          </Link>
        </div>
        {auditEvents.length === 0 ? (
          <p className="mt-2 text-sm text-white/65">
            No audit events yet. Every privileged action — role changes,
            suspensions, approvals, deletions — lands here automatically.
          </p>
        ) : (
          <ul className="mt-3 space-y-1">
            {auditEvents.slice(0, 10).map((e) => (
              <li key={e.id}>
                <Link
                  href={`/admin/audit/${e.id}`}
                  className="flex items-center gap-3 text-sm rounded-lg px-2 py-1.5 -mx-2 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-gold-400 tabular-nums shrink-0">
                    {e.id}
                  </span>
                  <span className="font-semibold">{e.action}</span>
                  <span className="text-white/60 truncate">
                    {e.targetLabel ?? e.targetId}
                    {e.before && e.after ? ` · ${e.before} → ${e.after}` : e.detail ? ` — ${e.detail}` : ""}
                  </span>
                  <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-white/45 shrink-0">
                    {e.actorRole}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}

/**
 * Deal Operations — admin-level pipeline overview. Counts come straight off
 * the live deals array so any stage move, assignment, or close made anywhere
 * on the platform shows here immediately.
 */
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
        value: mine
          .filter((d) => isOpenStage(d.stage))
          .reduce((s, d) => s + d.targetInvestment, 0),
      };
    })
    .sort((a, b) => b.open - a.open);

  const closingThisMonth = open.filter((d) => {
    if (!d.expectedCloseDate) return false;
    const c = new Date(d.expectedCloseDate);
    return c.getFullYear() === now.getFullYear() && c.getMonth() === now.getMonth();
  });

  const largest = [...open]
    .sort((a, b) => b.targetInvestment - a.targetInvestment)
    .slice(0, 5);

  const recent = [...deals]
    .sort((a, b) => b.updatedDate.localeCompare(a.updatedDate))
    .slice(0, 5);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold">
            Deal Operations
          </div>
          <div className="mt-1 text-sm text-navy-700/70">
            <span className="font-semibold text-navy-900 tabular-nums">
              {open.length}
            </span>{" "}
            active deals ·{" "}
            <span className="font-semibold text-navy-900 tabular-nums">
              {closingThisMonth.length}
            </span>{" "}
            closing this month ·{" "}
            <span className="font-semibold text-navy-900 tabular-nums">
              {formatCurrency(open.reduce((s, d) => s + d.targetInvestment, 0))}
            </span>{" "}
            in play
          </div>
        </div>
        <Link
          href="/admin/deals"
          className="text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600"
        >
          Manage deals →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">
            Deals By Stage
          </div>
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
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">
            Deals By Admin
          </div>
          <ul className="space-y-1.5">
            {byAdmin.map(({ admin, open: o, total, value }) => (
              <li key={admin} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-navy-900/85 truncate flex-1">{admin}</span>
                  <span className="font-semibold text-navy-900 tabular-nums">
                    {o} open / {total}
                  </span>
                </div>
                <div className="text-[10px] text-navy-700/55 tabular-nums">
                  {formatCurrency(value)} active
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">
            Closing This Month
          </div>
          {closingThisMonth.length === 0 ? (
            <p className="text-xs text-navy-700/55">
              No open deals expect to close this month.
            </p>
          ) : (
            <ul className="space-y-2">
              {closingThisMonth.slice(0, 5).map((d) => (
                <li key={d.dealId}>
                  <Link
                    href={`/deal-desk/${d.dealId}`}
                    className="block group"
                  >
                    <div className="text-xs font-semibold text-navy-900 group-hover:text-gold-700 truncate">
                      {d.title}
                    </div>
                    <div className="text-[10px] text-navy-700/55 tabular-nums">
                      {formatDate(d.expectedCloseDate)} ·{" "}
                      {formatCurrency(d.targetInvestment)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">
            Largest Open Deals
          </div>
          <ul className="space-y-2">
            {largest.map((d) => (
              <li key={d.dealId}>
                <Link href={`/deal-desk/${d.dealId}`} className="block group">
                  <div className="text-xs font-semibold text-navy-900 group-hover:text-gold-700 truncate">
                    {d.title}
                  </div>
                  <div className="text-[10px] text-navy-700/55 tabular-nums">
                    {formatCurrency(d.targetInvestment)} · {d.stage}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2">
          Recently Updated Deals
        </div>
        <ul className="divide-y divide-navy-900/[0.05]">
          {recent.map((d) => (
            <li key={d.dealId}>
              <Link
                href={`/deal-desk/${d.dealId}`}
                className="flex items-center gap-3 py-2 group"
              >
                <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-navy-700/55 tabular-nums shrink-0">
                  {d.dealId}
                </span>
                <span className="text-sm font-semibold text-navy-900 group-hover:text-gold-700 truncate flex-1">
                  {d.title}
                </span>
                <DealHealthBadge health={d.health} hideHealthy />
                <DealStageBadge stage={d.stage} />
                <span className="text-[10px] text-navy-700/55 tabular-nums shrink-0 hidden sm:inline">
                  {formatDate(d.updatedDate)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
