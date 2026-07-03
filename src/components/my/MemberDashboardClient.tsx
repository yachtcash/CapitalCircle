"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Eye,
  MessageSquare,
  Bookmark,
  Handshake,
  FileText,
  Layers,
  TrendingUp,
  PlusCircle,
  Bell,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import RoleGate from "@/components/common/RoleGate";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatCard, { StatGrid } from "@/components/ui/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";
import MyListingsPreview from "@/components/dashboard/MyListingsPreview";
import SavedItemsCompact from "@/components/dashboard/SavedItemsCompact";
import MyNegotiations from "@/components/dashboard/MyNegotiations";
import DocumentCenterCard from "@/components/dashboard/DocumentCenterCard";
import CalendarEventsPanel from "@/components/calendar/CalendarEventsPanel";
import { NOTIFICATION_ICONS, TONE_TILE } from "@/components/notifications/notificationUi";
import { toneForStatus } from "@/components/ui/StatusBadge";
import { compactMoney, timeAgo } from "@/lib/home/format";
import { cn } from "@/lib/cn";

const SELF_MEMBER_ID = "MEM-000001";

/**
 * The member dashboard ("My Desk") — strictly personal. Marketplace-wide
 * analytics stay on the operations dashboard; everything here derives from
 * the member's own listings, saves, conversations, and requests.
 */
export default function MemberDashboardClient() {
  return (
    <RoleGate>
      <MemberDashboardInner />
    </RoleGate>
  );
}

function MemberDashboardInner() {
  const {
    listings,
    savedOpportunityIds,
    savedCompanyIds,
    introductionRequests,
    centerNotifications,
    documents,
    getOpportunityBySlug,
    totalUnreadConversations,
    hydrated,
  } = useMessaging();

  const nowMs = hydrated ? Date.now() : 0;

  const stats = useMemo(() => {
    const active = listings.filter(
      (l) => l.status !== "Draft" && l.status !== "Archived" && l.status !== "Closed"
    );
    const views = listings.reduce((s, l) => s + (l.views || 0), 0);
    const messages = listings.reduce((s, l) => s + (l.messages || 0), 0);
    const favorites = savedOpportunityIds.length + savedCompanyIds.length;
    const intros = introductionRequests.filter(
      (r) => r.requesterId === "me" || r.targetMemberId === SELF_MEMBER_ID
    ).length;
    const docsShared = documents.length;
    const capital = active.reduce((s, l) => {
      const opp = l.opportunitySlug ? getOpportunityBySlug(l.opportunitySlug) : undefined;
      return s + (opp?.fundingAmount ?? 0);
    }, 0);
    return { views, messages, favorites, intros, docsShared, active: active.length, capital };
  }, [
    listings,
    savedOpportunityIds,
    savedCompanyIds,
    introductionRequests,
    documents,
    getOpportunityBySlug,
  ]);

  const myIntros = useMemo(
    () =>
      introductionRequests
        .filter((r) => r.requesterId === "me" || r.targetMemberId === SELF_MEMBER_ID)
        .slice(0, 4),
    [introductionRequests]
  );

  const recentNotifications = useMemo(
    () =>
      centerNotifications
        .filter(
          (n) =>
            !n.archived &&
            !n.dismissed &&
            n.category !== "Admin" &&
            n.category !== "Moderation"
        )
        .slice(0, 5),
    [centerNotifications]
  );

  const recentActivity = useMemo(() => {
    const all = listings.flatMap((l) =>
      (l.activity ?? []).map((a) => ({ ...a, listingTitle: l.title, listingId: l.id }))
    );
    return all
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6);
  }, [listings]);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-8 md:space-y-10">
        <PageHeader
          eyebrow="My Dashboard"
          title="Your desk"
          subtitle="Your opportunities, saved deals, conversations, meetings, and requests — nothing platform-wide, only what's yours."
          actions={
            <Button
              href="/create-listing"
              iconLeft={<PlusCircle className="h-4 w-4" strokeWidth={2.2} />}
            >
              Create Opportunity
            </Button>
          }
        />

        {/* My statistics — strictly personal */}
        <StatGrid columns="grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <StatCard icon={Eye} label="Views" value={hydrated ? stats.views : "—"} dense />
          <StatCard icon={MessageSquare} label="Messages" value={hydrated ? stats.messages + totalUnreadConversations : "—"} dense />
          <StatCard icon={Bookmark} label="Favorites" value={hydrated ? stats.favorites : "—"} dense />
          <StatCard icon={Handshake} label="Introductions" value={hydrated ? stats.intros : "—"} dense />
          <StatCard icon={FileText} label="Documents" value={hydrated ? stats.docsShared : "—"} dense />
          <StatCard icon={Layers} label="Active Listings" value={hydrated ? stats.active : "—"} dense />
          <StatCard icon={TrendingUp} label="Capital Raising" value={hydrated ? compactMoney(stats.capital) : "—"} dense />
        </StatGrid>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 md:gap-8 items-start">
          <div className="space-y-8 md:space-y-10 min-w-0">
            {/* My opportunities (existing member-scoped workspace) */}
            <MyListingsPreview />

            {/* Conversations */}
            <MyNegotiations />

            {/* Upcoming meetings — my relations only */}
            <section>
              <SectionHeader
                eyebrow="Schedule"
                title="Upcoming meetings"
                action={
                  <Link
                    href="/my/calendar"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-gold-700 transition-colors"
                  >
                    My calendar
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </Link>
                }
              />
              <CalendarEventsPanel
                relation={{ memberId: SELF_MEMBER_ID }}
                eyebrow="My Meetings"
                highlights={[
                  { label: "Meetings", types: ["Meeting", "Investor Meeting"] },
                  { label: "Calls", types: ["Call"] },
                  { label: "Site Visits", types: ["Inspection", "Property Tour"] },
                  { label: "Reminders", types: ["Reminder"] },
                ]}
                quickTypes={["Meeting", "Call", "Reminder"]}
              />
            </section>

            {/* Recent activity — own listings only */}
            <section>
              <SectionHeader eyebrow="Activity" title="Recent activity" />
              <ul className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.05] overflow-hidden">
                {recentActivity.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-navy-700/55">
                    Activity on your listings will appear here.
                  </li>
                ) : (
                  recentActivity.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="mt-0.5 h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg bg-navy-900/[0.05] text-navy-700 ring-1 ring-navy-900/10">
                        <Activity className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-navy-900 leading-snug">
                          {a.title}
                        </div>
                        <div className="mt-0.5 text-xs text-navy-700/60 truncate">
                          {a.listingTitle}
                        </div>
                      </div>
                      <span className="text-[11px] text-navy-700/45 tabular-nums whitespace-nowrap shrink-0 mt-0.5">
                        {hydrated ? timeAgo(a.createdAt, nowMs) : "·"}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <aside className="space-y-5">
            {/* Notifications preview — member view */}
            <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
              <header className="flex items-center justify-between px-4 py-3 border-b border-navy-900/[0.06]">
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
                  <Bell className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Notifications
                </div>
                <Link
                  href="/notifications"
                  className="text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-900 hover:text-gold-700 transition-colors"
                >
                  View all
                </Link>
              </header>
              <ul className="divide-y divide-navy-900/[0.05]">
                {recentNotifications.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-navy-700/55">
                    You&apos;re all caught up.
                  </li>
                ) : (
                  recentNotifications.map((n) => {
                    const Icon = NOTIFICATION_ICONS[n.icon];
                    return (
                      <li key={n.id}>
                        <Link
                          href="/notifications"
                          className={cn(
                            "flex items-start gap-2.5 px-4 py-2.5 hover:bg-bone/50 transition-colors",
                            !n.read && "bg-gold-500/[0.04]"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-lg ring-1",
                              TONE_TILE[n.tone]
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-navy-900 leading-snug truncate">
                              {n.title}
                            </div>
                            <div className="text-[11px] text-navy-700/55 truncate">
                              {n.targetName ?? n.description}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>

            {/* Introduction requests */}
            <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
              <header className="flex items-center justify-between px-4 py-3 border-b border-navy-900/[0.06]">
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
                  <Handshake className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Introductions
                </div>
                <Link
                  href="/dashboard/introductions"
                  className="text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-900 hover:text-gold-700 transition-colors"
                >
                  View all
                </Link>
              </header>
              <ul className="divide-y divide-navy-900/[0.05]">
                {myIntros.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-navy-700/55">
                    No introduction requests yet.
                  </li>
                ) : (
                  myIntros.map((r) => (
                    <li key={r.id} className="px-4 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-navy-900 truncate">
                          {r.targetMemberName || r.companyName || r.id}
                        </span>
                        <Badge tone={toneForStatus(r.status)} size="sm">
                          {r.status}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-[11px] text-navy-700/55 truncate">{r.reason}</div>
                    </li>
                  ))
                )}
              </ul>
            </section>

            {/* Saved / watchlist (existing member-scoped component) */}
            <SavedItemsCompact />

            {/* My documents */}
            <DocumentCenterCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
