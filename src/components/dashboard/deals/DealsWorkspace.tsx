"use client";

import { useMemo, useState } from "react";
import {
  KanbanSquare,
  LayoutList,
  LayoutGrid,
  Search,
  X,
  Briefcase,
  DollarSign,
  TrendingUp,
  CalendarClock,
  AlertCircle,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { computeDealMetrics, DEAL_PRIORITIES, DEAL_STAGES } from "@/data/deals";
import type { DealPriority, DealStage } from "@/data/deals";
import { cn } from "@/lib/cn";

import DealPipelineView from "./DealPipelineView";
import DealTableView from "./DealTableView";
import DealCardGridView from "./DealCardGridView";
import { formatCurrency } from "./DealBadges";

type ViewMode = "pipeline" | "table" | "card";

const VIEWS: { value: ViewMode; label: string; Icon: typeof KanbanSquare }[] = [
  { value: "pipeline", label: "Pipeline", Icon: KanbanSquare },
  { value: "table", label: "Table", Icon: LayoutList },
  { value: "card", label: "Cards", Icon: LayoutGrid },
];

export default function DealsWorkspace() {
  const { deals } = useMessaging();
  const [view, setView] = useState<ViewMode>("pipeline");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<DealStage | "all">("all");
  const [priority, setPriority] = useState<DealPriority | "all">("all");

  const nowMs = Date.parse("2026-06-09T00:00:00Z");
  const metrics = useMemo(() => computeDealMetrics(deals, nowMs), [deals, nowMs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      if (stage !== "all" && d.status !== stage) return false;
      if (priority !== "all" && d.priority !== priority) return false;
      if (!q) return true;
      const hay = [
        d.dealId,
        d.title,
        d.summaryNote ?? "",
        d.companyId ?? "",
        d.opportunityId ?? "",
        d.sourceName ?? "",
        d.owner,
        ...d.tags,
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [deals, query, stage, priority]);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem-3rem)]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-7">
        <header className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold-700 font-bold">
              Deal Desk
            </div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-navy-900">
              Opportunity Pipeline
            </h1>
            <p className="mt-2 text-sm md:text-base text-navy-700/75 max-w-2xl leading-relaxed">
              Every introduction, inquiry, and lead flows through here. Track
              relationships from First Touch to Closed.
            </p>
          </div>
          <ViewSwitcher value={view} onChange={setView} />
        </header>

        {/* Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Widget
            label="Open"
            value={metrics.openCount.toString()}
            Icon={Briefcase}
            tone="navy"
          />
          <Widget
            label="Closed"
            value={metrics.closedCount.toString()}
            Icon={DollarSign}
            tone="emerald"
          />
          <Widget
            label="This Week"
            value={metrics.dealsThisWeek.toString()}
            Icon={TrendingUp}
            tone="sky"
          />
          <Widget
            label="This Month"
            value={metrics.dealsThisMonth.toString()}
            Icon={TrendingUp}
            tone="sky"
          />
          <Widget
            label="Commission"
            value={formatCurrency(metrics.potentialCommission)}
            Icon={DollarSign}
            tone="gold"
          />
          <Widget
            label="Overdue"
            value={metrics.overdueFollowUps.toString()}
            sublabel={`${metrics.upcomingFollowUps} upcoming`}
            Icon={AlertCircle}
            tone={metrics.overdueFollowUps > 0 ? "rose" : "navy"}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[240px] bg-white rounded-full ring-1 ring-navy-900/[0.08] focus-within:ring-2 focus-within:ring-gold-500 shadow-sm flex items-center gap-2 transition-shadow">
            <span className="pl-4 text-navy-700/60">
              <Search className="h-4 w-4" strokeWidth={2} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, ID, company, opportunity, owner, or tag"
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
          <Select value={stage} onChange={(v) => setStage(v as DealStage | "all")}>
            <option value="all">All stages</option>
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select
            value={priority}
            onChange={(v) => setPriority(v as DealPriority | "all")}
          >
            <option value="all">All priorities</option>
            {DEAL_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>

        <div className="text-xs text-navy-700/60">
          <span className="font-semibold text-navy-900 tabular-nums">
            {filtered.length}
          </span>{" "}
          deals · total estimated value{" "}
          <span className="font-semibold text-navy-900 tabular-nums">
            {formatCurrency(filtered.reduce((s, d) => s + d.estimatedValue, 0))}
          </span>
        </div>

        {/* Views */}
        {view === "pipeline" ? <DealPipelineView deals={filtered} /> : null}
        {view === "table" ? <DealTableView deals={filtered} /> : null}
        {view === "card" ? <DealCardGridView deals={filtered} /> : null}
      </div>
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
      {VIEWS.map(({ value: v, label, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] font-semibold transition-colors",
              active
                ? "bg-navy-900 text-white"
                : "text-navy-700 hover:text-navy-900"
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

function Select({
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
      className="rounded-full bg-white ring-1 ring-navy-900/[0.08] hover:ring-navy-900/20 px-4 py-2 text-xs uppercase tracking-[0.14em] font-semibold text-navy-900 transition-shadow"
    >
      {children}
    </select>
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
    <div
      className={cn(
        "rounded-xl ring-1 p-4 min-w-0",
        styles[tone]
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.16em] font-bold opacity-75">
          {label}
        </div>
        <Icon className={cn("h-3.5 w-3.5", iconTones[tone])} strokeWidth={2.4} />
      </div>
      <div className="mt-1.5 text-xl md:text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      {sublabel ? (
        <div className="mt-0.5 text-[11px] opacity-65 truncate">{sublabel}</div>
      ) : null}
    </div>
  );
}
