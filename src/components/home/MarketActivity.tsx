"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { ActivityEvent } from "@/lib/activity/types";
import { fromAuditEvent } from "@/lib/activity/adapters";
import ActivityFeed from "@/components/activity/ActivityFeed";

export default function MarketActivity() {
  const { auditEvents, hydrated } = useMessaging();

  const events = useMemo<ActivityEvent[]>(() => {
    if (!hydrated) return [];
    // Shared platform-ledger vocabulary — only market-moving actions surface.
    return auditEvents
      .map(fromAuditEvent)
      .filter((e): e is ActivityEvent => e !== null);
  }, [auditEvents, hydrated]);

  const now = hydrated ? Date.now() : 0;

  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="mb-6 md:mb-8 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
            <Activity className="h-3.5 w-3.5" strokeWidth={2.4} />
            Market Activity
          </div>
        </div>

        <ActivityFeed
          events={events}
          loading={!hydrated}
          nowMs={now}
          limit={7}
          emptyTitle="No recent activity"
          emptyDescription="Market-moving events will appear here as they happen."
        />
        <p className="mt-3 text-[11px] text-navy-700/45">
          A live read of marketplace activity · names and figures reflect platform events
        </p>
      </div>
    </section>
  );
}
