"use client";

import Link from "next/link";
import { ArrowUpRight, Download, type LucideIcon } from "lucide-react";
import type { Metric, Dist, Rank, FunnelStep, Tone } from "@/lib/analytics/compute";
import { cn } from "@/lib/cn";

// ---- Tone maps (platform palette) ----

const CARD_TONE: Record<Tone, string> = {
  navy: "bg-white ring-navy-900/[0.06]",
  gold: "bg-gold-500/[0.08] ring-gold-500/40",
  emerald: "bg-emerald-500/[0.06] ring-emerald-500/30",
  amber: "bg-amber-500/[0.07] ring-amber-500/30",
  rose: "bg-rose-500/[0.06] ring-rose-500/30",
  sky: "bg-sky-500/[0.06] ring-sky-500/30",
  violet: "bg-violet-500/[0.06] ring-violet-500/30",
};

const BAR_TONE: Record<Tone, string> = {
  navy: "bg-navy-900",
  gold: "bg-gold-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

const ICON_TONE: Record<Tone, string> = {
  navy: "text-navy-700/55",
  gold: "text-gold-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
  sky: "text-sky-600",
  violet: "text-violet-600",
};

function metricDisplay(m: Pick<Metric, "value" | "display">) {
  return m.display ?? m.value.toLocaleString();
}

// ---- Section wrapper ----

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  Icon,
  action,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  Icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          {eyebrow ? (
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-700 font-bold inline-flex items-center gap-1.5">
              {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2.4} /> : null}
              {eyebrow}
            </div>
          ) : null}
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-navy-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-navy-700/70 max-w-2xl leading-relaxed">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ExportButton({ onClick, label = "Export CSV" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.1] hover:ring-gold-500/50 text-navy-900 px-3.5 py-1.5 text-xs font-semibold transition-colors"
    >
      <Download className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
      {label}
    </button>
  );
}

// ---- KPI stat cards ----

export function StatCard({ label, value, display, href, tone = "navy", Icon }: Metric & { Icon?: LucideIcon }) {
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/65 truncate">
          {label}
        </span>
        {Icon ? (
          <Icon className={cn("h-4 w-4 shrink-0", ICON_TONE[tone])} strokeWidth={2.2} />
        ) : href ? (
          <ArrowUpRight className="h-3.5 w-3.5 text-navy-700/30 group-hover:text-gold-600 shrink-0 transition-colors" strokeWidth={2.2} />
        ) : null}
      </div>
      <div className="mt-2 text-2xl md:text-[28px] font-semibold tracking-tight text-navy-900 tabular-nums leading-none">
        {display ?? value.toLocaleString()}
      </div>
    </>
  );
  const cls = cn(
    "group rounded-2xl ring-1 p-4 transition-all",
    CARD_TONE[tone],
    href && "hover:-translate-y-0.5 hover:shadow-md hover:shadow-navy-900/5 cursor-pointer"
  );
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function StatGrid({ metrics, cols = 5 }: { metrics: Metric[]; cols?: 3 | 4 | 5 | 6 }) {
  const colClass =
    cols === 6
      ? "md:grid-cols-3 xl:grid-cols-6"
      : cols === 4
        ? "md:grid-cols-2 xl:grid-cols-4"
        : cols === 3
          ? "md:grid-cols-3"
          : "md:grid-cols-3 xl:grid-cols-5";
  return <div className={cn("grid grid-cols-2 gap-3", colClass)}>{metrics.map((mm) => <StatCard key={mm.label} {...mm} />)}</div>;
}

// ---- Distribution (horizontal bars) ----

export function DistributionCard({
  title,
  items,
  tone = "gold",
  total,
  emptyHint = "No data in this range.",
}: {
  title: string;
  items: Dist[];
  tone?: Tone;
  /** When set, bars scale to this total (e.g. % of all). Otherwise scale to max. */
  total?: number;
  emptyHint?: string;
}) {
  const max = total ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <Empty hint={emptyHint} />
      ) : (
        <ul className="space-y-2.5">
          {items.map((it) => {
            const pct = Math.round((it.value / max) * 100);
            return (
              <li key={it.label}>
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className="font-semibold text-navy-900 truncate">{it.label}</span>
                  <span className="text-navy-700/60 tabular-nums shrink-0">{it.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-900/[0.06] overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", BAR_TONE[it.tone ?? tone])}
                    style={{ width: `${Math.max(pct, it.value > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

// ---- Ranking table ----

export function RankingTable({
  title,
  items,
  valueLabel,
  emptyHint = "No data in this range.",
}: {
  title: string;
  items: Rank[];
  valueLabel?: string;
  emptyHint?: string;
}) {
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <Empty hint={emptyHint} />
      ) : (
        <ul className="divide-y divide-navy-900/[0.05]">
          {items.map((it, i) => {
            const row = (
              <div className="flex items-center gap-3 py-2">
                <span className="h-6 w-6 shrink-0 inline-flex items-center justify-center rounded-full bg-navy-900/[0.05] text-[11px] font-bold text-navy-700/70 tabular-nums">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-navy-900 truncate group-hover:text-gold-700">
                    {it.label}
                  </span>
                  {it.sublabel ? (
                    <span className="block text-[10px] uppercase tracking-[0.1em] text-navy-700/50 font-semibold truncate">
                      {it.sublabel}
                    </span>
                  ) : null}
                </span>
                <span className="text-sm font-semibold text-navy-900 tabular-nums shrink-0">
                  {it.display ?? it.value.toLocaleString()}
                </span>
              </div>
            );
            return (
              <li key={it.id}>
                {it.href ? (
                  <Link href={it.href} className="group block">
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      )}
      {valueLabel ? (
        <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-navy-700/40 font-semibold text-right">
          {valueLabel}
        </div>
      ) : null}
    </Panel>
  );
}

// ---- Funnel ----

export function FunnelChart({ steps, emptyHint = "No deals in this range." }: { steps: FunnelStep[]; emptyHint?: string }) {
  const max = Math.max(1, ...steps.map((s) => s.count));
  const hasAny = steps.some((s) => s.count > 0);
  return (
    <Panel title="Deal Conversion Funnel">
      {!hasAny ? (
        <Empty hint={emptyHint} />
      ) : (
        <ul className="space-y-1.5">
          {steps.map((s, i) => {
            const pct = Math.round((s.count / max) * 100);
            const prev = i > 0 ? steps[i - 1].count : null;
            const drop = prev && prev > 0 ? Math.round((1 - s.count / prev) * 100) : null;
            return (
              <li key={s.stage} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-[11px] font-semibold text-navy-700/75 truncate text-right">
                  {s.stage}
                </span>
                <div className="flex-1 h-6 rounded-md bg-navy-900/[0.04] overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-navy-900 to-navy-700 rounded-md flex items-center justify-end px-2"
                    style={{ width: `${Math.max(pct, s.count > 0 ? 6 : 0)}%` }}
                  >
                    {s.count > 0 ? (
                      <span className="text-[11px] font-bold text-white tabular-nums">{s.count}</span>
                    ) : null}
                  </div>
                </div>
                <span className="w-12 shrink-0 text-[10px] text-navy-700/45 tabular-nums">
                  {drop !== null && drop > 0 ? `-${drop}%` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

// ---- Trend (vertical mini-bars, e.g. by month) ----

export function TrendCard({ title, items, emptyHint = "No data in this range." }: { title: string; items: Dist[]; emptyHint?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <Empty hint={emptyHint} />
      ) : (
        <div className="flex items-end gap-2 h-32 pt-2">
          {items.map((it) => (
            <div key={it.label} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-navy-700/70 tabular-nums">{it.value}</span>
              <div className="w-full flex items-end justify-center" style={{ height: "100%" }}>
                <div
                  className="w-full max-w-[36px] rounded-t-md bg-gradient-to-t from-gold-600 to-gold-400"
                  style={{ height: `${Math.max((it.value / max) * 100, it.value > 0 ? 6 : 0)}%` }}
                />
              </div>
              <span className="text-[9px] uppercase tracking-[0.08em] text-navy-700/50 font-semibold truncate w-full text-center">
                {it.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ---- Status indicator pill ----

const PILL_TONE: Record<Tone, string> = {
  navy: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
  gold: "bg-gold-500/20 text-gold-700 ring-gold-500/40",
  emerald: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  rose: "bg-rose-500/15 text-rose-700 ring-rose-500/30",
  sky: "bg-sky-500/15 text-sky-700 ring-sky-500/30",
  violet: "bg-violet-500/15 text-violet-700 ring-violet-500/30",
};

export function StatusPill({ label, tone = "navy" }: { label: string; tone?: Tone }) {
  return (
    <span className={cn("inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1 whitespace-nowrap", PILL_TONE[tone])}>
      {label}
    </span>
  );
}

// ---- Shared shells ----

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
      <h3 className="text-[11px] uppercase tracking-[0.16em] text-navy-700/60 font-bold mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function Empty({ hint }: { hint: string }) {
  return <p className="text-xs text-navy-700/45 py-2">{hint}</p>;
}

export function MetricDisplay(m: Metric) {
  return <>{metricDisplay(m)}</>;
}
