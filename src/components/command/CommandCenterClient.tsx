"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  CalendarDays,
  Flag,
  Handshake,
  HandCoins,
  HeartPulse,
  LayoutGrid,
  PlusCircle,
  ShieldCheck,
  Store,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { companies } from "@/data/companies";
import { MEMBERS } from "@/data/members";
import { allRecentActivity } from "@/data/listings";
import { isOpenStage } from "@/data/deals";
import {
  marketSnapshot,
  sponsorRankings,
  healthFor,
} from "@/lib/intelligence/market";
import { compactMoney } from "@/lib/home/format";
import { fromAuditEvent, fromListingActivity } from "@/lib/activity/adapters";
import type { ActivityEvent } from "@/lib/activity/types";
import { visibleNotificationsForRole } from "@/components/notifications/roleVisibility";
import { NOTIFICATION_ICONS, TONE_TILE } from "@/components/notifications/notificationUi";
import { DIRECTORY_COLLECTIONS } from "@/data/opportunities/collections";

import PageHeader from "@/components/ui/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard, { StatGrid } from "@/components/ui/StatCard";
import ActivityFeed from "@/components/activity/ActivityFeed";
import CollectionRow from "@/components/opportunities/CollectionRow";
import {
  CountryRankingsCard,
  IndustryRankingsCard,
  MarketHealthCard,
  SponsorRankingsSection,
} from "@/components/intelligence/RankingCards";
import DealDeskCard from "@/components/dashboard/DealDeskCard";
import { DealInsightsPanel } from "@/components/dashboard/deals/DealIntegrations";
import PendingRequestsPanel from "@/components/dashboard/PendingRequestsPanel";
import CalendarDashboardWidgets from "@/components/calendar/CalendarDashboardWidgets";
import { cn } from "@/lib/cn";

// Quick actions — links only, no new behavior.
const COMMAND_ACTIONS = [
  { label: "Create Opportunity", href: "/create-listing", icon: PlusCircle, primary: true },
  { label: "Create Company", href: "/admin/companies", icon: Building2 },
  { label: "Invite Member", href: "/admin/members", icon: UserPlus },
  { label: "Deal Desk", href: "/deal-desk", icon: Handshake },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Marketplace", href: "/opportunities", icon: Store },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

/** Top-opportunity rails reused verbatim from the marketplace directory. */
const RAIL_SLUGS = ["flagship-raises", "closing-soon", "featured-now", "recently-added"];

export default function CommandCenterClient() {
  const {
    deals,
    introductionRequests,
    moderationReports,
    centerNotifications,
    auditEvents,
    currentRole,
    hydrated,
  } = useMessaging();
  const pool = useAllOpportunities();
  const nowMs = hydrated ? Date.now() : 0;

  // ---- Top-row metrics: every figure reuses an existing calculation ----
  const snapshot = useMemo(() => marketSnapshot(pool), [pool]);
  const { verifiedCount } = useMemo(() => sponsorRankings(pool, companies, 1), [pool]);
  const health = useMemo(() => healthFor(pool, pool), [pool]);
  const activeMembers = useMemo(
    () => MEMBERS.filter((m) => m.trending || m.listingsCount > 0).length,
    []
  );
  const pendingIntros = hydrated
    ? introductionRequests.filter((r) => r.status === "Pending").length
    : 0;
  const pendingModeration = hydrated
    ? moderationReports.filter((r) => r.status === "Open").length
    : 0;
  const activeDeals = hydrated ? deals.filter((d) => isOpenStage(d.stage)).length : 0;
  const visibleNotifications = useMemo(
    () =>
      visibleNotificationsForRole(centerNotifications, currentRole).filter(
        (n) => !n.archived && !n.dismissed
      ),
    [centerNotifications, currentRole]
  );
  const unread = hydrated ? visibleNotifications.filter((n) => !n.read).length : 0;

  // ---- Live platform activity: listing events + audit ledger, one feed ----
  const mergedActivity = useMemo<ActivityEvent[]>(() => {
    const listing = allRecentActivity(20).map((a) =>
      fromListingActivity(a, {
        detail: [a.title, a.body].filter(Boolean).join(" — "),
        href: a.opportunitySlug ? `/opportunity/${a.opportunitySlug}` : undefined,
      })
    );
    const ledger = hydrated
      ? auditEvents.map(fromAuditEvent).filter((e): e is ActivityEvent => e !== null)
      : [];
    return listing.concat(ledger);
  }, [auditEvents, hydrated]);

  const rails = DIRECTORY_COLLECTIONS.filter((c) => RAIL_SLUGS.includes(c.slug));
  const recentNotifications = visibleNotifications.slice(0, 5);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-10 md:space-y-12">
        <PageHeader
          eyebrow="Command Center"
          title="Platform operations"
          subtitle="Marketplace health, live activity, and everything waiting on you — one view, ten seconds."
        />

        {/* Command bar — quick actions only */}
        <nav aria-label="Quick actions" className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {COMMAND_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
                a.primary
                  ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
                  : "bg-white ring-1 ring-navy-900/10 hover:ring-navy-900/25 text-navy-900/80 hover:text-navy-900"
              )}
            >
              <a.icon className={cn("h-4 w-4", a.primary ? "" : "text-gold-600")} strokeWidth={2.2} />
              {a.label}
            </Link>
          ))}
        </nav>

        {/* Row 1 — platform health at a glance */}
        <section>
          <SectionHeader eyebrow="Pulse" title="Platform health" />
          <StatGrid columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <StatCard icon={HeartPulse} label="Marketplace Health" value={health} dense />
            <StatCard icon={TrendingUp} label="Capital Raising" value={compactMoney(snapshot.capitalRaising)} dense />
            <StatCard icon={LayoutGrid} label="Active Opportunities" value={snapshot.active} dense />
            <StatCard icon={ShieldCheck} label="Verified Companies" value={verifiedCount} dense />
            <StatCard icon={Users} label="Active Members" value={activeMembers} dense />
            <StatCard icon={Handshake} label="Pending Introductions" value={hydrated ? pendingIntros : "—"} dense />
            <StatCard icon={Flag} label="Pending Moderation" value={hydrated ? pendingModeration : "—"} dense />
            <StatCard icon={HandCoins} label="Active Deals" value={hydrated ? activeDeals : "—"} dense />
            <StatCard icon={Bell} label="Unread Notifications" value={hydrated ? unread : "—"} dense />
          </StatGrid>
        </section>

        {/* Row 2 — live activity via the Activity Engine */}
        <section>
          <SectionHeader eyebrow="Live" title="Marketplace activity" />
          <ActivityFeed
            events={mergedActivity}
            loading={!hydrated}
            nowMs={nowMs}
            limit={15}
            filters={[
              { label: "All", entities: null },
              { label: "Marketplace", entities: ["opportunity", "listing"] },
              { label: "Deals", entities: ["deal"] },
              { label: "Companies", entities: ["company"] },
              { label: "Introductions", entities: ["introduction"] },
              { label: "Documents", entities: ["document"] },
            ]}
            emptyTitle="No platform activity yet"
            emptyDescription="Marketplace and deal events will appear here as they happen."
          />
        </section>

        {/* Row 4 — sponsor intelligence (reused wholesale) */}
        <section>
          <SectionHeader eyebrow="Sponsors" title="Sponsor intelligence" />
          <SponsorRankingsSection pool={pool} companies={companies} members={MEMBERS} />
        </section>

        {/* Row 5 — deal intelligence (Deal Desk widgets, untouched) */}
        <section className="space-y-4 md:space-y-5">
          <SectionHeader eyebrow="Deals" title="Deal intelligence" />
          <DealDeskCard />
          <DealInsightsPanel />
        </section>

        {/* Row 6 — marketplace intelligence (Intelligence Center cards) */}
        <section>
          <SectionHeader eyebrow="Market" title="Marketplace intelligence" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 items-start">
            <CountryRankingsCard pool={pool} />
            <IndustryRankingsCard pool={pool} />
          </div>
          <div className="mt-4 md:mt-5">
            <MarketHealthCard pool={pool} />
          </div>
        </section>

        {/* Row 7 — action center */}
        <section className="space-y-4 md:space-y-5">
          <SectionHeader
            eyebrow="Action Center"
            title="Waiting on you"
            action={
              <Link
                href="/notifications"
                className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-gold-700 transition-colors"
              >
                Open notifications
              </Link>
            }
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 items-start">
            <PendingRequestsPanel />
            <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
              <header className="flex items-center justify-between px-4 py-3 border-b border-navy-900/[0.06]">
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
                  <Bell className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Recent notifications
                </div>
                <Link
                  href="/notifications"
                  className="text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-900 hover:text-gold-700 transition-colors"
                >
                  View all
                </Link>
              </header>
              <ul className="divide-y divide-navy-900/[0.05]">
                {!hydrated || recentNotifications.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-navy-700/55">
                    {hydrated ? "You're all caught up." : "…"}
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
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-navy-900 leading-snug truncate">
                              {n.title}
                            </span>
                            <span className="block text-[11px] text-navy-700/55 truncate">
                              {n.targetName ?? n.description}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          </div>
          <CalendarDashboardWidgets />
        </section>
      </div>

      {/* Row 3 — top opportunities: the marketplace rails, reused verbatim */}
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-5 md:px-10 pt-2">
          <SectionHeader eyebrow="Marketplace" title="Top opportunities" />
        </div>
        {rails.map((collection) => (
          <CollectionRow key={collection.slug} collection={collection} />
        ))}
      </div>
    </div>
  );
}
