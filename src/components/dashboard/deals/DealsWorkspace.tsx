"use client";

import { useEffect, useMemo, useState } from "react";
import {
  KanbanSquare,
  LayoutList,
  Search,
  X,
  Briefcase,
  DollarSign,
  TrendingUp,
  CalendarClock,
  AlertCircle,
  Trophy,
  XCircle,
  UserPlus,
  Plus,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  computeDealDeskMetrics,
  DEAL_DESK_NOW_MS,
  DEAL_PRIORITIES,
  DEAL_STAGES,
  SAMPLE_ADMINS,
  isOpenStage,
  type Deal,
  type DealPriority,
  type DealStage,
} from "@/data/deals";
import { cn } from "@/lib/cn";

import DealPipelineView from "./DealPipelineView";
import DealTableView from "./DealTableView";
import CreateDealModal from "./CreateDealModal";
import { formatCurrency } from "./DealBadges";

type ViewMode = "kanban" | "table";
type StatusBucket = "all" | "open" | "closed" | "archived";

export default function DealsWorkspace() {
  const { deals, introductionRequests } = useMessaging();
  const [view, setView] = useState<ViewMode>("kanban");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<DealStage | "all">("all");
  const [priority, setPriority] = useState<DealPriority | "all">("all");
  const [admin, setAdmin] = useState<string>("all");
  const [bucket, setBucket] = useState<StatusBucket>("all");
  const [sponsorFilter, setSponsorFilter] = useState<string>("all");
  const [investorFilter, setInvestorFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Drill-down support: honor ?bucket= / ?stage= when arriving from Analytics.
  // Read once on mount (client-only) so no Suspense boundary is required and the
  // default behavior is unchanged when no param is present.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const b = sp.get("bucket");
    if (b === "open" || b === "closed" || b === "archived") setBucket(b);
    const s = sp.get("stage");
    if (s && (DEAL_STAGES as string[]).includes(s)) setStage(s as DealStage);
  }, []);

  const nowMs = DEAL_DESK_NOW_MS;
  const metrics = useMemo(() => computeDealDeskMetrics(deals, nowMs), [deals, nowMs]);
  const pendingIntros = useMemo(
    () => introductionRequests.filter((r) => r.status === "Pending").length,
    [introductionRequests]
  );

  const sponsors = useMemo(
    () => [...new Set(deals.map((d) => d.sponsor.name))].sort(),
    [deals]
  );
  const investors = useMemo(
    () =>
      [...new Set(deals.map((d) => d.investor?.name).filter((x): x is string => !!x))].sort(),
    [deals]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      if (stage !== "all" && d.stage !== stage) return false;
      if (priority !== "all" && d.priority !== priority) return false;
      if (admin !== "all" && d.assignedAdmin !== admin) return false;
      if (bucket === "open" && !isOpenStage(d.stage)) return false;
      if (bucket === "closed" && d.stage !== "Closed Won" && d.stage !== "Closed Lost")
        return false;
      if (bucket === "archived" && d.stage !== "Archived") return false;
      if (sponsorFilter !== "all" && d.sponsor.name !== sponsorFilter) return false;
      if (investorFilter !== "all" && d.investor?.name !== investorFilter) return false;
      if (dateFrom && d.createdDate.slice(0, 10) < dateFrom) return false;
      if (dateTo && d.createdDate.slice(0, 10) > dateTo) return false;
      if (!q) return true;
      const hay = [
        d.dealId,
        d.title,
        d.summaryNote ?? "",
        d.sponsor.name,
        d.investor?.name ?? "",
        d.assignedAdmin,
        d.companyId ?? "",
        d.opportunityId ?? "",
        ...d.tags,
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [
    deals,
    query,
    stage,
    priority,
    admin,
    bucket,
    sponsorFilter,
    investorFilter,
    dateFrom,
    dateTo,
  ]);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-10 space-y-7">
        <header className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold-700 font-bold">
              Platform Operations Center
            </div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-navy-900">
              Deal Desk
            </h1>
            <p className="mt-2 text-sm md:text-base text-navy-700/75 max-w-2xl leading-relaxed">
              Every introduction, negotiation, and capital raise tracked across
              the full lifecycle — New Lead to Closed Won.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/analytics#deals"
              className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.1] hover:ring-gold-500/50 text-navy-900 font-semibold px-4 py-2.5 text-sm transition-colors"
            >
              <BarChart3 className="h-4 w-4 text-gold-600" strokeWidth={2.4} />
              Analytics
            </Link>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              New Deal
            </button>
            <ViewSwitcher value={view} onChange={setView} />
          </div>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <Widget label="Active Deals" value={metrics.totalActive.toString()} Icon={Briefcase} tone="navy" />
          <Widget label="This Month" value={metrics.dealsThisMonth.toString()} Icon={TrendingUp} tone="sky" />
          <Widget label="Closed Won" value={metrics.closedWon.toString()} Icon={Trophy} tone="emerald" />
          <Widget label="Closed Lost" value={metrics.closedLost.toString()} Icon={XCircle} tone="rose" />
          <Widget label="Pending Intros" value={pendingIntros.toString()} Icon={UserPlus} tone="sky" />
          <Widget
            label="Follow Ups"
            value={metrics.pendingFollowUps.toString()}
            sublabel={`${metrics.overdueFollowUps} overdue`}
            Icon={metrics.overdueFollowUps > 0 ? AlertCircle : CalendarClock}
            tone={metrics.overdueFollowUps > 0 ? "rose" : "navy"}
          />
          <Widget
            label="Capital Raising"
            value={formatCurrency(metrics.capitalBeingRaised)}
            Icon={DollarSign}
            tone="gold"
          />
          <Widget
            label="Total Deal Value"
            value={formatCurrency(metrics.totalDealValue)}
            Icon={DollarSign}
            tone="gold"
          />
        </div>

        {/* Status buckets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              ["all", `All (${deals.length})`],
              ["open", "Open Deals"],
              ["closed", "Closed Deals"],
              ["archived", "Archived"],
            ] as [StatusBucket, string][]
          ).map(([b, label]) => (
            <button
              key={b}
              type="button"
              onClick={() => setBucket(b)}
              className={cn(
                "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] font-semibold ring-1 transition-colors",
                bucket === b
                  ? "bg-navy-900 text-white ring-navy-900"
                  : "bg-white text-navy-700 ring-navy-900/[0.08] hover:ring-navy-900/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[220px] bg-white rounded-full ring-1 ring-navy-900/[0.08] focus-within:ring-2 focus-within:ring-gold-500 shadow-sm flex items-center gap-2 transition-shadow">
            <span className="pl-4 text-navy-700/60">
              <Search className="h-4 w-4" strokeWidth={2} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, ID, sponsor, investor, admin, tag"
              className="flex-1 bg-transparent outline-none py-2.5 text-sm text-navy-900 placeholder:text-navy-700/45"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-bone"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            ) : null}
          </div>
          <Sel value={stage} onChange={(v) => setStage(v as DealStage | "all")}>
            <option value="all">All stages</option>
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Sel>
          <Sel value={priority} onChange={(v) => setPriority(v as DealPriority | "all")}>
            <option value="all">All priorities</option>
            {DEAL_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Sel>
          <Sel value={admin} onChange={setAdmin}>
            <option value="all">All admins</option>
            {SAMPLE_ADMINS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Sel>
          <Sel value={sponsorFilter} onChange={setSponsorFilter}>
            <option value="all">All sponsors</option>
            {sponsors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Sel>
          <Sel value={investorFilter} onChange={setInvestorFilter}>
            <option value="all">All investors</option>
            {investors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Sel>
          <label className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-700/65">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-full bg-white ring-1 ring-navy-900/[0.08] px-3 py-2 text-xs text-navy-900"
            />
          </label>
          <label className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-700/65">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-full bg-white ring-1 ring-navy-900/[0.08] px-3 py-2 text-xs text-navy-900"
            />
          </label>
        </div>

        <div className="text-xs text-navy-700/60">
          <span className="font-semibold text-navy-900 tabular-nums">{filtered.length}</span>{" "}
          deals · combined target{" "}
          <span className="font-semibold text-navy-900 tabular-nums">
            {formatCurrency(filtered.reduce((s, d) => s + d.targetInvestment, 0))}
          </span>
        </div>

        {view === "kanban" ? <DealPipelineView deals={filtered} /> : null}
        {view === "table" ? <DealTableView deals={filtered} /> : null}
      </div>

      <CreateDealModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function ViewSwitcher({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="bg-white rounded-full ring-1 ring-navy-900/[0.08] p-1 inline-flex">
      {(
        [
          ["kanban", "Kanban", KanbanSquare],
          ["table", "Table", LayoutList],
        ] as const
      ).map(([v, label, Icon]) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] font-semibold transition-colors",
              active ? "bg-navy-900 text-white" : "text-navy-700 hover:text-navy-900"
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Widget({
  label,
  value,
  sublabel,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  sublabel?: string;
  Icon: typeof Briefcase;
  tone: "navy" | "emerald" | "sky" | "gold" | "rose";
}) {
  const styles: Record<typeof tone, string> = {
    navy: "bg-white ring-navy-900/[0.06] text-navy-900",
    emerald: "bg-emerald-500/[0.06] ring-emerald-500/30 text-emerald-700",
    sky: "bg-sky-500/[0.06] ring-sky-500/30 text-sky-700",
    gold: "bg-gold-500/[0.08] ring-gold-500/40 text-gold-700",
    rose: "bg-rose-500/[0.08] ring-rose-500/30 text-rose-700",
  };
  const iconTones: Record<typeof tone, string> = {
    navy: "text-navy-700",
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    gold: "text-gold-600",
    rose: "text-rose-600",
  };
  return (
    <div className={cn("rounded-xl ring-1 p-3.5 min-w-0", styles[tone])}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.14em] font-bold opacity-75 truncate">
          {label}
        </div>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", iconTones[tone])} strokeWidth={2.4} />
      </div>
      <div className="mt-1 text-lg md:text-xl font-semibold tracking-tight tabular-nums truncate">
        {value}
      </div>
      {sublabel ? (
        <div className="mt-0.5 text-[10px] opacity-65 truncate">{sublabel}</div>
      ) : null}
    </div>
  );
}

function Sel({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full bg-white ring-1 ring-navy-900/[0.08] hover:ring-navy-900/20 px-3.5 py-2 text-xs uppercase tracking-[0.12em] font-semibold text-navy-900 transition-shadow max-w-[180px]"
    >
      {children}
    </select>
  );
}
