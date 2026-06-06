"use client";

import { useMemo } from "react";
import { Eye, Heart, MessageSquare, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ListingRecord } from "@/data/listings";
import { cn } from "@/lib/cn";
import MiniSparkline from "./MiniSparkline";

type Props = {
  listings: ListingRecord[];
  className?: string;
};

type Aggregated = {
  totalViews: number;
  totalSaves: number;
  totalInterests: number;
  totalMessages: number;
  viewsSeries: number[];
  savesSeries: number[];
  interestsSeries: number[];
  messagesSeries: number[];
};

function aggregate(listings: ListingRecord[]): Aggregated {
  const active = listings.filter((l) => l.status !== "Archived");

  // Sum per-day across all active listings into a 30-point series. We key by
  // day so listings with offset windows still merge cleanly. Then we sort
  // chronologically and take the last 30 entries.
  const byDay = new Map<
    string,
    { views: number; saves: number; interests: number; messages: number }
  >();

  for (const listing of active) {
    for (const point of listing.analyticsSeries) {
      const existing = byDay.get(point.day) ?? {
        views: 0,
        saves: 0,
        interests: 0,
        messages: 0,
      };
      existing.views += point.views;
      existing.saves += point.saves;
      existing.interests += point.interests;
      existing.messages += point.messages;
      byDay.set(point.day, existing);
    }
  }

  const days = Array.from(byDay.keys()).sort();
  const last30 = days.slice(-30);

  const viewsSeries: number[] = [];
  const savesSeries: number[] = [];
  const interestsSeries: number[] = [];
  const messagesSeries: number[] = [];

  for (const day of last30) {
    const entry = byDay.get(day)!;
    viewsSeries.push(entry.views);
    savesSeries.push(entry.saves);
    interestsSeries.push(entry.interests);
    messagesSeries.push(entry.messages);
  }

  // Totals across the entire active portfolio (uses the listing's roll-up
  // counters so they match the listing rows / cards).
  const totalViews = active.reduce((sum, l) => sum + l.views, 0);
  const totalSaves = active.reduce((sum, l) => sum + l.saves, 0);
  const totalInterests = active.reduce((sum, l) => sum + l.interests, 0);
  const totalMessages = active.reduce((sum, l) => sum + l.messages, 0);

  return {
    totalViews,
    totalSaves,
    totalInterests,
    totalMessages,
    viewsSeries,
    savesSeries,
    interestsSeries,
    messagesSeries,
  };
}

type CardProps = {
  label: string;
  total: number;
  icon: LucideIcon;
  points: number[];
};

function MetricCard({ label, total, icon: Icon, points }: CardProps) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.18em] text-navy-700/60 font-bold">
          {label}
        </div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold-500/[0.12] text-gold-700">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold text-navy-900 tracking-tight tabular-nums leading-none">
          {total.toLocaleString()}
        </div>
        <MiniSparkline points={points} />
      </div>
      <div className="text-[11px] text-navy-700/55 font-medium">
        Last 30 days across active listings
      </div>
    </div>
  );
}

export default function AnalyticsSection({ listings, className }: Props) {
  const agg = useMemo(() => aggregate(listings), [listings]);

  return (
    <section
      aria-labelledby="my-listings-analytics"
      className={cn("space-y-4", className)}
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
            Analytics
          </div>
          <h2
            id="my-listings-analytics"
            className="mt-1 text-lg md:text-xl font-semibold text-navy-900 tracking-tight"
          >
            Portfolio performance
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Views"
          total={agg.totalViews}
          icon={Eye}
          points={agg.viewsSeries}
        />
        <MetricCard
          label="Total Saves"
          total={agg.totalSaves}
          icon={Heart}
          points={agg.savesSeries}
        />
        <MetricCard
          label="Total Interests"
          total={agg.totalInterests}
          icon={Star}
          points={agg.interestsSeries}
        />
        <MetricCard
          label="Messages Received"
          total={agg.totalMessages}
          icon={MessageSquare}
          points={agg.messagesSeries}
        />
      </div>
    </section>
  );
}
