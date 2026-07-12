"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Member } from "@/data/members";
import type { AuditAction } from "@/data/audit";
import type { ActivityEntity, ActivityEvent } from "@/lib/activity/types";
import { MEMBER_ACTIVITY_ENTITY, auditToneFor } from "@/lib/activity/adapters";
import ActivityFeed from "@/components/activity/ActivityFeed";

const AUDIT_META: Partial<Record<AuditAction, { label: string; entity: ActivityEntity }>> = {
  "Member Verified": { label: "Member verified", entity: "member" },
  "Member Featured": { label: "Featured member", entity: "member" },
  "Member Approved": { label: "Member approved", entity: "member" },
  "Role Changed": { label: "Role updated", entity: "member" },
  "Deal Created": { label: "Deal created", entity: "deal" },
  "Deal Closed": { label: "Deal closed", entity: "deal" },
  "Deal Stage Changed": { label: "Deal advanced", entity: "deal" },
};

export default function MemberActivity({ member }: { member: Member }) {
  const { auditEvents, introductionRequests, hydrated } = useMessaging();

  const events = useMemo<ActivityEvent[]>(() => {
    if (!hydrated) return [];
    const out: ActivityEvent[] = [];

    // Member's own activity timeline (seed, display-only).
    for (const a of member.recentActivity) {
      out.push({
        id: a.id,
        entity: MEMBER_ACTIVITY_ENTITY[a.kind] ?? "activity",
        title: a.title || a.kind,
        detail: a.description,
        dateMs: Date.parse(a.at) || 0,
      });
    }

    // Real audit events targeting this member.
    for (const e of auditEvents) {
      if (e.targetKind !== "member" || e.targetId !== member.id) continue;
      const meta = AUDIT_META[e.action];
      if (!meta) continue;
      out.push({
        id: e.id,
        entity: meta.entity,
        tone: auditToneFor(e.action),
        title: meta.label,
        detail: e.detail ?? e.targetLabel ?? "",
        dateMs: Date.parse(e.createdAt) || 0,
      });
    }

    // Live introductions involving this member.
    for (const r of introductionRequests) {
      if (r.targetMemberId !== member.id) continue;
      out.push({
        id: r.id,
        entity: "introduction",
        tone: r.status === "Completed" ? "emerald" : r.status === "Approved" ? "sky" : "violet",
        title:
          r.status === "Completed"
            ? "Introduction completed"
            : r.status === "Approved"
              ? "Introduction approved"
              : "Introduction requested",
        detail: r.companyName ? `${r.reason} · ${r.companyName}` : r.reason,
        dateMs: Date.parse(r.createdAt) || 0,
      });
    }

    return out;
  }, [member, auditEvents, introductionRequests, hydrated]);

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
          Recent Activity
        </div>
      </div>

      <ActivityFeed
        events={events}
        loading={!hydrated}
        nowMs={now}
        limit={8}
        emptyTitle="No recent activity"
        emptyDescription="Listings, introductions, and platform events will appear here."
      />
    </section>
  );
}
