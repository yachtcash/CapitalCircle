"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Globe2, Factory, HeartPulse, Building2, Users, ArrowUpRight, Eye, Bookmark, Sparkles } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import type { Member } from "@/data/members";
import {
  countryRankings,
  industryRankings,
  sponsorRankings,
  mostActiveMembers,
  healthFor,
  type MarketHealthLabel,
} from "@/lib/intelligence/market";
import { compactMoney, initialsFromName } from "@/lib/home/format";
import { sortDirectoryResults, metricsForOpportunity } from "@/lib/opportunities/sort";
import Badge from "@/components/ui/Badge";
import type { Tone } from "@/lib/design/tokens";
import VerificationBadge from "@/components/company/VerificationBadge";

const HEALTH_TONE: Record<MarketHealthLabel, Tone> = {
  "High Activity": "success",
  Growing: "gold",
  Stable: "info",
  Emerging: "neutral",
};

/** Quiet share bar — the only "chart" in the intelligence center. */
function RankingBar({ share }: { share: number }) {
  return (
    <div className="h-1.5 rounded-full bg-navy-900/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full bg-gold-500"
        style={{ width: `${Math.max(4, Math.round(share * 100))}%` }}
      />
    </div>
  );
}

function RankingCardShell({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: typeof Globe2;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
      <header className="px-5 py-4 border-b border-navy-900/[0.06]">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
          {eyebrow}
        </div>
        <h3 className="mt-1 text-base md:text-lg font-semibold text-navy-900">{title}</h3>
      </header>
      {children}
    </div>
  );
}

// ---- Country rankings -------------------------------------------------------

export function CountryRankingsCard({ pool }: { pool: Opportunity[] }) {
  const rows = useMemo(() => countryRankings(pool).slice(0, 8), [pool]);
  return (
    <RankingCardShell icon={Globe2} eyebrow="Geography" title="Capital by country">
      <ol className="divide-y divide-navy-900/[0.05]">
        {rows.map((row, i) => (
          <li key={row.country} className="px-5 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 shrink-0 text-[11px] font-bold text-navy-700/45 tabular-nums">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-navy-900 truncate">
                  {row.country}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-sm font-bold text-navy-900 tabular-nums">
                  {compactMoney(row.capital)}
                </span>
                <span className="ml-2 text-[11px] text-navy-700/55 tabular-nums">
                  {row.count} {row.count === 1 ? "deal" : "deals"}
                </span>
              </div>
            </div>
            <div className="mt-2 ml-[30px]">
              <RankingBar share={row.share} />
              <div className="mt-1.5 text-[11px] text-navy-700/55 truncate">
                {row.industries.slice(0, 3).join(" · ")}
                {row.industries.length > 3 ? ` · +${row.industries.length - 3}` : ""}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </RankingCardShell>
  );
}

// ---- Industry rankings ------------------------------------------------------

export function IndustryRankingsCard({ pool }: { pool: Opportunity[] }) {
  const rows = useMemo(() => industryRankings(pool).slice(0, 8), [pool]);
  return (
    <RankingCardShell icon={Factory} eyebrow="Industries" title="Capital by industry">
      <ol className="divide-y divide-navy-900/[0.05]">
        {rows.map((row, i) => (
          <li key={row.category} className="px-5 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 shrink-0 text-[11px] font-bold text-navy-700/45 tabular-nums">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-navy-900 truncate">
                  {row.category}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-sm font-bold text-navy-900 tabular-nums">
                  {compactMoney(row.capital)}
                </span>
                <span className="ml-2 text-[11px] text-navy-700/55 tabular-nums">
                  {row.count} {row.count === 1 ? "deal" : "deals"}
                </span>
              </div>
            </div>
            <div className="mt-2 ml-[30px]">
              <RankingBar share={row.share} />
              <div className="mt-1.5 text-[11px] text-navy-700/55">
                {row.avgReturnPct !== null ? `${row.avgReturnPct}% avg. target return · ` : ""}
                largest raise {compactMoney(row.largestRaise)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </RankingCardShell>
  );
}

// ---- Market health ----------------------------------------------------------

export function MarketHealthCard({ pool }: { pool: Opportunity[] }) {
  const segments = useMemo(() => {
    return industryRankings(pool)
      .slice(0, 6)
      .map((row) => ({
        label: row.category,
        count: row.count,
        health: healthFor(
          pool.filter((o) => o.category === row.category),
          pool
        ),
      }));
  }, [pool]);

  return (
    <RankingCardShell icon={HeartPulse} eyebrow="Market Health" title="Segment activity">
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {segments.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.05] px-4 py-3 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-navy-900 truncate">{s.label}</div>
              <div className="text-[11px] text-navy-700/55 tabular-nums">
                {s.count} {s.count === 1 ? "opportunity" : "opportunities"}
              </div>
            </div>
            <Badge tone={HEALTH_TONE[s.health]} size="sm">
              {s.health}
            </Badge>
          </div>
        ))}
      </div>
    </RankingCardShell>
  );
}

// ---- Engagement rankings ------------------------------------------------------
// Reuses the directory's listing-metric sorter — views / saves / interests
// come off the seed listing records, the same data behind the directory's
// "Most Viewed / Most Saved / Most Interested" sort options.

function EngagementList({
  pool,
  metric,
  icon,
  eyebrow,
  title,
}: {
  pool: Opportunity[];
  metric: "views" | "saves" | "interests";
  icon: typeof Eye;
  eyebrow: string;
  title: string;
}) {
  const sortKey =
    metric === "views" ? "most_viewed" : metric === "saves" ? "most_saved" : "most_interested";
  const rows = useMemo(
    () =>
      sortDirectoryResults(pool, sortKey)
        .filter((o) => metricsForOpportunity(o)[metric] > 0)
        .slice(0, 5),
    [pool, sortKey, metric]
  );
  if (rows.length === 0) return null;
  return (
    <RankingCardShell icon={icon} eyebrow={eyebrow} title={title}>
      <ol className="divide-y divide-navy-900/[0.05]">
        {rows.map((o, i) => (
          <li key={o.id}>
            <Link
              href={`/opportunity/${o.slug}`}
              className="group flex items-center gap-3 px-5 py-3 hover:bg-bone/40 transition-colors"
            >
              <span className="w-5 shrink-0 text-[11px] font-bold text-navy-700/45 tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-navy-900 truncate group-hover:text-gold-700 transition-colors">
                  {o.title}
                </div>
                <div className="text-[11px] text-navy-700/55 truncate">{o.category}</div>
              </div>
              <span className="shrink-0 text-sm font-bold text-navy-900 tabular-nums">
                {metricsForOpportunity(o)[metric].toLocaleString()}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </RankingCardShell>
  );
}

export function EngagementRankingsSection({ pool }: { pool: Opportunity[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-start">
      <EngagementList pool={pool} metric="views" icon={Eye} eyebrow="Attention" title="Most viewed" />
      <EngagementList pool={pool} metric="saves" icon={Bookmark} eyebrow="Watchlists" title="Most saved" />
      <EngagementList pool={pool} metric="interests" icon={Sparkles} eyebrow="Engagement" title="Most interest received" />
    </div>
  );
}

// ---- Sponsor + member rankings ----------------------------------------------

function SponsorRow({
  company,
  metric,
}: {
  company: Company;
  metric: string;
}) {
  return (
    <li>
      <Link
        href={`/company/${company.slug}`}
        className="group flex items-center gap-3 px-5 py-3 hover:bg-bone/40 transition-colors"
      >
        <span className="h-9 w-9 shrink-0 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center text-xs font-semibold tracking-wide">
          {initialsFromName(company.name)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-navy-900 truncate group-hover:text-gold-700 transition-colors">
              {company.name}
            </span>
            <VerificationBadge status={company.verification} />
          </div>
          <div className="text-[11px] text-navy-700/55 truncate">{company.industry}</div>
        </div>
        <span className="shrink-0 text-sm font-bold text-navy-900 tabular-nums">{metric}</span>
      </Link>
    </li>
  );
}

export function SponsorRankingsSection({
  pool,
  companies,
  members,
}: {
  pool: Opportunity[];
  companies: Company[];
  members: Member[];
}) {
  const rankings = useMemo(() => sponsorRankings(pool, companies), [pool, companies]);
  const activeMembers = useMemo(() => mostActiveMembers(members), [members]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
      <RankingCardShell icon={Building2} eyebrow="Sponsors" title="Most active sponsors">
        <ul className="divide-y divide-navy-900/[0.05]">
          {rankings.mostActive.map((r) => (
            <SponsorRow
              key={r.company.id}
              company={r.company}
              metric={`${r.count} ${r.count === 1 ? "deal" : "deals"}`}
            />
          ))}
        </ul>
      </RankingCardShell>

      <RankingCardShell icon={Building2} eyebrow="Capital" title="Largest capital raising">
        <ul className="divide-y divide-navy-900/[0.05]">
          {rankings.largestRaising.map((r) => (
            <SponsorRow key={r.company.id} company={r.company} metric={compactMoney(r.capital)} />
          ))}
        </ul>
      </RankingCardShell>

      <RankingCardShell icon={Building2} eyebrow="New" title="Newest sponsors">
        <ul className="divide-y divide-navy-900/[0.05]">
          {rankings.newest.map((company) => (
            <SponsorRow key={company.id} company={company} metric="" />
          ))}
        </ul>
      </RankingCardShell>

      <RankingCardShell icon={Users} eyebrow="Members" title="Most active members">
        <ul className="divide-y divide-navy-900/[0.05]">
          {activeMembers.map((m) => (
            <li key={m.id}>
              <Link
                href={`/member/${m.slug}`}
                className="group flex items-center gap-3 px-5 py-3 hover:bg-bone/40 transition-colors"
              >
                <span className="h-9 w-9 shrink-0 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center text-xs font-semibold tracking-wide">
                  {initialsFromName(m.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-navy-900 truncate group-hover:text-gold-700 transition-colors">
                    {m.name}
                  </div>
                  <div className="text-[11px] text-navy-700/55 truncate">{m.memberType}</div>
                </div>
                <span className="shrink-0 text-sm font-bold text-navy-900 tabular-nums">
                  {m.listingsCount} {m.listingsCount === 1 ? "listing" : "listings"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3 border-t border-navy-900/[0.05]">
          <Link
            href="/members"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-gold-700 transition-colors"
          >
            Browse the network
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </div>
      </RankingCardShell>
    </div>
  );
}
