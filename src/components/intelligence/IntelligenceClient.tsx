"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  CircleDollarSign,
  Coins,
  Crown,
  Factory,
  Globe2,
  Landmark,
  Lightbulb,
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { useAllOpportunities } from "@/lib/opportunities/all";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { companies } from "@/data/companies";
import { MEMBERS } from "@/data/members";
import { allRecentActivity } from "@/data/listings";
import { fromListingActivity } from "@/lib/activity/adapters";
import ActivityFeed from "@/components/activity/ActivityFeed";
import {
  marketSnapshot,
  marketInsights,
  type MarketInsight,
} from "@/lib/intelligence/market";
import { compactMoney } from "@/lib/home/format";
import { DIRECTORY_COLLECTIONS } from "@/data/opportunities/collections";

import PageHeader from "@/components/ui/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard, { StatGrid } from "@/components/ui/StatCard";
import CollectionRow from "@/components/opportunities/CollectionRow";
import {
  CountryRankingsCard,
  IndustryRankingsCard,
  SponsorRankingsSection,
  EngagementRankingsSection,
  MarketHealthCard,
} from "./RankingCards";

const INSIGHT_ICONS: Record<MarketInsight["kind"], typeof Factory> = {
  industry: Factory,
  geography: Globe2,
  return: TrendingUp,
  capital: CircleDollarSign,
  sponsor: ShieldCheck,
};

/** Rails reused verbatim from the marketplace directory. */
const RAIL_SLUGS = ["recently-added", "featured-now", "closing-soon"];

export default function IntelligenceClient() {
  const pool = useAllOpportunities();
  const { hydrated } = useMessaging();

  const snapshot = useMemo(() => marketSnapshot(pool), [pool]);
  const insights = useMemo(() => marketInsights(pool, companies), [pool]);
  const activityEvents = useMemo(
    () =>
      allRecentActivity(20).map((a) =>
        fromListingActivity(a, {
          detail: [a.title, a.body].filter(Boolean).join(" — "),
          href: a.opportunitySlug ? `/opportunity/${a.opportunitySlug}` : undefined,
        })
      ),
    []
  );
  const rails = DIRECTORY_COLLECTIONS.filter((c) => RAIL_SLUGS.includes(c.slug));

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-10 md:space-y-12">
        <PageHeader
          eyebrow="Market Intelligence"
          title="The marketplace, explained"
          subtitle="Live figures derived from every active mandate, sponsor, and member on Capital Circle — no searching required."
          actions={
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              Browse Marketplace
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          }
        />

        {/* Marketplace snapshot — reuses the canonical StatCard cells */}
        <section>
          <SectionHeader eyebrow="Snapshot" title="Marketplace snapshot" />
          <StatGrid columns="grid-cols-2 md:grid-cols-4">
            <StatCard icon={LayoutGrid} label="Active Opportunities" value={snapshot.active} dense />
            <StatCard icon={TrendingUp} label="Total Capital Raising" value={compactMoney(snapshot.capitalRaising)} dense />
            <StatCard icon={Coins} label="Seeking Capital Now" value={snapshot.seekingCapital} dense />
            <StatCard icon={Building2} label="Active Sponsors" value={snapshot.sponsorCount} dense />
            <StatCard icon={Globe2} label="Countries Represented" value={snapshot.countryCount} dense />
            <StatCard icon={Factory} label="Industries" value={snapshot.industryCount} dense />
            <StatCard icon={BarChart3} label="Avg. Target Return" value={snapshot.avgReturnPct !== null ? `${snapshot.avgReturnPct}%` : "—"} dense />
            <StatCard icon={Crown} label="Largest Raise" value={compactMoney(snapshot.largestRaise?.fundingAmount ?? 0)} dense />
          </StatGrid>
        </section>

        {/* Intelligence cards — one question, one answer */}
        <section>
          <SectionHeader
            eyebrow="Intelligence"
            title="Questions, answered"
            action={null}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <StatCard
              variant="panel"
              icon={CircleDollarSign}
              label="How much capital is raising?"
              value={compactMoney(snapshot.capitalRaising)}
              sub={`Across ${snapshot.active} active mandates`}
            />
            <StatCard
              variant="panel"
              icon={Landmark}
              label="What is the average raise?"
              value={compactMoney(snapshot.avgRaise)}
              sub="Mean funded mandate size"
            />
            <StatCard
              variant="panel"
              icon={Crown}
              label="Who has the largest mandate?"
              value={compactMoney(snapshot.largestRaise?.fundingAmount ?? 0)}
              sub={snapshot.largestRaise?.title ?? "—"}
            />
          </div>
        </section>

        {/* Generated market insights */}
        <section>
          <SectionHeader eyebrow="Insights" title="Market insights" />
          <div className="rounded-2xl bg-navy-900 text-white ring-1 ring-white/5 overflow-hidden">
            <div className="px-5 md:px-7 py-4 border-b border-white/5 inline-flex items-center gap-2 w-full">
              <Lightbulb className="h-4 w-4 text-gold-400" strokeWidth={2.2} />
              <span className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold">
                Derived from live marketplace data
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {insights.map((insight) => {
                const Icon = INSIGHT_ICONS[insight.kind];
                return (
                  <li key={insight.text} className="flex items-start gap-3 px-5 md:px-7 py-4">
                    <span className="mt-0.5 h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg bg-white/[0.06] text-gold-400 ring-1 ring-white/10">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <p className="text-sm md:text-[15px] text-white/85 leading-relaxed">
                      {insight.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Rankings — countries, industries, health */}
        <section>
          <SectionHeader eyebrow="Rankings" title="Where capital is flowing" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 items-start">
            <CountryRankingsCard pool={pool} />
            <IndustryRankingsCard pool={pool} />
          </div>
          <div className="mt-4 md:mt-5">
            <MarketHealthCard pool={pool} />
          </div>
        </section>

        {/* Engagement rankings — listing metrics behind the directory sorts */}
        <section>
          <SectionHeader eyebrow="Engagement" title="What investors are watching" />
          <EngagementRankingsSection pool={pool} />
        </section>

        {/* Sponsor + member rankings */}
        <section>
          <SectionHeader eyebrow="Sponsors" title="Most active on the platform" />
          <SponsorRankingsSection pool={pool} companies={companies} members={MEMBERS} />
        </section>

        {/* Live activity — the unified activity engine over listing events */}
        <section>
          <SectionHeader eyebrow="Live" title="What is happening right now" />
          <ActivityFeed
            events={activityEvents}
            loading={!hydrated}
            nowMs={hydrated ? Date.now() : 0}
            limit={10}
            filters={[
              { label: "All", entities: null },
              { label: "Marketplace", entities: ["opportunity", "listing"] },
              { label: "Deals", entities: ["deal"] },
              { label: "Companies", entities: ["company"] },
              { label: "Documents", entities: ["document"] },
            ]}
            emptyTitle="No marketplace activity yet"
            emptyDescription="Interest, negotiations, and data-room events will appear here."
          />
        </section>
      </div>

      {/* Attention-worthy mandates — the marketplace rails, reused verbatim */}
      <div className="pb-10">
        <div className="max-w-7xl mx-auto px-5 md:px-10 pt-2">
          <SectionHeader eyebrow="Spotlight" title="Deserving attention now" />
        </div>
        {rails.map((collection) => (
          <CollectionRow key={collection.slug} collection={collection} />
        ))}
        <div className="max-w-7xl mx-auto px-5 md:px-10 pt-6 flex justify-center">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.12] hover:ring-navy-900/30 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
          >
            <Activity className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
            Explore all curated collections
          </Link>
        </div>
      </div>
    </div>
  );
}
