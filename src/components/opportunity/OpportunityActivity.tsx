"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Opportunity } from "@/data/opportunities";
import type { AuditAction } from "@/data/audit";
import type { ActivityEntity, ActivityEvent, ActivityTone } from "@/lib/activity/types";
import { fromListingActivity } from "@/lib/activity/adapters";
import ActivityFeed from "@/components/activity/ActivityFeed";

const AUDIT_META: Partial<Record<AuditAction, { label: string; entity: ActivityEntity; tone?: ActivityTone }>> = {
  "Opportunity Approved": { label: "Opportunity approved", entity: "opportunity", tone: "emerald" },
  "Opportunity Featured": { label: "Featured opportunity", entity: "opportunity", tone: "gold" },
  "Deal Created": { label: "Deal created", entity: "deal" },
  "Deal Closed": { label: "Deal closed", entity: "deal", tone: "emerald" },
};

export default function OpportunityActivity({ opportunity }: { opportunity: Opportunity }) {
  const { auditEvents, introductionRequests, listings, hydrated } = useMessaging();

  const events = useMemo<ActivityEvent[]>(() => {
    if (!hydrated) return [];
    const out: ActivityEvent[] = [];

    // Derived from the opportunity itself.
    const listedMs = Date.parse(opportunity.postedAt) || 0;
    out.push({
      id: `${opportunity.id}-listed`,
      entity: "opportunity",
      tone: "emerald",
      title: "Opportunity listed",
      detail: opportunity.title,
      dateMs: listedMs,
    });
    if (opportunity.featured) {
      out.push({
        id: `${opportunity.id}-featured`,
        entity: "opportunity",
        tone: "gold",
        title: "Featured opportunity",
        detail: "Curated onto the marketplace",
        dateMs: listedMs,
      });
    }

    // Real audit events about this opportunity.
    for (const e of auditEvents) {
      if (e.targetKind !== "opportunity" || e.targetId !== opportunity.id) continue;
      const meta = AUDIT_META[e.action];
      if (!meta) continue;
      out.push({
        id: e.id,
        entity: meta.entity,
        tone: meta.tone,
        title: meta.label,
        detail: e.detail ?? e.targetLabel ?? "",
        dateMs: Date.parse(e.createdAt) || 0,
      });
    }

    // Live per-listing activity (interest / saved / negotiation / docs / edits).
    const listing = listings.find((l) => l.opportunitySlug === opportunity.slug);
    for (const a of listing?.activity ?? []) {
      out.push(fromListingActivity(a));
    }

    // Introductions referencing this opportunity.
    for (const r of introductionRequests) {
      if (r.opportunitySlug !== opportunity.slug) continue;
      out.push({
        id: r.id,
        entity: "introduction",
        title: "Introduction requested",
        detail: r.companyName ? `${r.reason} · ${r.companyName}` : r.reason,
        dateMs: Date.parse(r.createdAt) || 0,
      });
    }

    return out;
  }, [opportunity, auditEvents, introductionRequests, listings, hydrated]);

  const now = hydrated ? Date.now() : 0;

  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" strokeWidth={2.4} />
          Marketplace Activity
        </div>
      </div>

      <ActivityFeed
        events={events}
        loading={!hydrated}
        nowMs={now}
        limit={7}
        emptyTitle="No activity on this opportunity yet"
        emptyDescription="Interest, introductions, and data-room activity will appear here."
      />
    </section>
  );
}
