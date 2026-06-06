import { Eye, Bookmark, Sparkles, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ListingAnalyticsPoint, ListingRecord } from "@/data/listings";

type Series = "views" | "saves" | "interests" | "messages";

type SeriesMeta = {
  key: Series;
  label: string;
  color: string;
  Icon: LucideIcon;
};

const SERIES: SeriesMeta[] = [
  { key: "views", label: "Total Views", color: "#D4AF37", Icon: Eye },
  { key: "saves", label: "Saves", color: "#059669", Icon: Bookmark },
  { key: "interests", label: "Interests", color: "#E11D48", Icon: Sparkles },
  { key: "messages", label: "Messages", color: "#0284C7", Icon: MessageSquare },
];

function sumSeries(series: ListingAnalyticsPoint[], key: Series): number {
  return series.reduce((sum, point) => sum + (point[key] ?? 0), 0);
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

type ChartProps = {
  series: ListingAnalyticsPoint[];
};

function SimpleAreaChart({ series }: ChartProps) {
  // Defensive: empty series → render empty state inline below.
  if (series.length === 0) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 md:p-10 text-center text-sm text-navy-700/65">
        No analytics data captured for this listing yet.
      </div>
    );
  }

  const WIDTH = 800;
  const HEIGHT = 220;
  const PADDING_TOP = 12;
  const PADDING_BOTTOM = 22;
  const PADDING_X = 8;
  const innerWidth = WIDTH - PADDING_X * 2;
  const innerHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const stepX =
    series.length > 1 ? innerWidth / (series.length - 1) : innerWidth;

  // Compute per-series max for visual scaling. Each series gets its own y-axis
  // so low-magnitude series (interests/messages) are still visible.
  const maxes = SERIES.reduce<Record<Series, number>>(
    (acc, s) => {
      const max = Math.max(1, ...series.map((p) => p[s.key]));
      acc[s.key] = max;
      return acc;
    },
    { views: 1, saves: 1, interests: 1, messages: 1 }
  );

  function buildPath(key: Series): string {
    const max = maxes[key];
    return series
      .map((point, i) => {
        const x = PADDING_X + i * stepX;
        const ratio = point[key] / max;
        const y = PADDING_TOP + (1 - ratio) * innerHeight;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }

  // Pick a few X-axis tick dates: first, middle, last.
  const firstDay = series[0]?.day ?? "";
  const lastDay = series[series.length - 1]?.day ?? "";
  const midIndex = Math.floor(series.length / 2);
  const midDay = series[midIndex]?.day ?? "";

  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
        {SERIES.map(({ key, label, color }) => (
          <div
            key={key}
            className="inline-flex items-center gap-2 text-xs text-navy-700/75"
          >
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-semibold text-navy-900">{label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative w-full" style={{ height: HEIGHT }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label="Listing performance over the last 30 days"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={PADDING_X}
              x2={WIDTH - PADDING_X}
              y1={PADDING_TOP + ratio * innerHeight}
              y2={PADDING_TOP + ratio * innerHeight}
              stroke="rgba(15,23,42,0.06)"
              strokeWidth={1}
            />
          ))}

          {SERIES.map(({ key, color }) => (
            <path
              key={key}
              d={buildPath(key)}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
        <span>{firstDay}</span>
        <span>{midDay}</span>
        <span>{lastDay}</span>
      </div>
    </div>
  );
}

export default function ListingAnalyticsDetail({
  listing,
}: {
  listing: ListingRecord;
}) {
  const series = listing.analyticsSeries;

  // Top tiles: prefer series totals, fall back to listing record fields.
  const totals: Record<Series, number> = {
    views: series.length > 0 ? sumSeries(series, "views") : listing.views,
    saves: series.length > 0 ? sumSeries(series, "saves") : listing.saves,
    interests:
      series.length > 0 ? sumSeries(series, "interests") : listing.interests,
    messages:
      series.length > 0 ? sumSeries(series, "messages") : listing.messages,
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Performance
        </div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
          Analytics
        </h2>
        <p className="mt-1 text-sm text-navy-700/65">
          Last 30 days of activity for {listing.id}.
        </p>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {SERIES.map(({ key, label, color, Icon }) => (
          <div
            key={key}
            className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6"
          >
            <div className="flex items-center justify-between">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1"
                style={{
                  color,
                  backgroundColor: `${color}1A`,
                  boxShadow: `inset 0 0 0 1px ${color}33`,
                }}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold">
              {label}
            </div>
            <div className="mt-1 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight tabular-nums">
              {formatNumber(totals[key])}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <SimpleAreaChart series={series} />
    </div>
  );
}
