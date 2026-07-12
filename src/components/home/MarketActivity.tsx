"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { AuditAction } from "@/data/audit";
import type { ActivityEntity, ActivityEvent } from "@/lib/activity/types";
import { auditToneFor } from "@/lib/activity/adapters";
import ActivityFeed from "@/components/activity/ActivityFeed";

// Investor-facing relabel of the platform audit log. Only positive, market-moving
// actions are surfaced — moderation/member noise is filtered out.
const ACTIVITY: Partial<Record<AuditAction, { label: string; entity: ActivityEntity }>> = {
  "Deal Created": { label: "New deal created", entity: "deal" },
  "Deal Closed": { label: "Deal closed", entity: "deal" },
  "Deal Stage Changed": { label: "Deal advanced", entity: "deal" },
  "Company Verified": { label: "Sponsor verified", entity: "company" },
  "Company Featured": { label: "Sponsor featured", entity: "company" },
  "Opportunity Approved": { label: "New opportunity added", entity: "opportunity" },
  "Introduction Approved": { label: "Introduction approved", entity: "introduction" },
  "Introduction Converted": { label: "Introduction converted to deal", entity: "introduction" },
  "Access Approved": { label: "Data-room access granted", entity: "document" },
  "Document Uploaded": { label: "Financials updated", entity: "document" },
};

export default function MarketActivity() {
  const { auditEvents, hydrated } = useMessaging();

  const events = useMemo<ActivityEvent[]>(() => {
    if (!hydrated) return [];
    return auditEvents
      .filter((e) => ACTIVITY[e.action])
      .map((e) => {
        const cfg = ACTIVITY[e.action]!;
        return {
          id: e.id,
          entity: cfg.entity,
          tone: auditToneFor(e.action),
          title: cfg.label,
          detail: e.targetLabel ?? e.targetId,
          dateMs: Date.parse(e.createdAt) || 0,
        };
      });
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
