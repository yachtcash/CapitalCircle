"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Company } from "@/data/companies";
import type { AuditAction } from "@/data/audit";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";
import type { ActivityEntity, ActivityEvent } from "@/lib/activity/types";
import { auditToneFor } from "@/lib/activity/adapters";
import ActivityFeed from "@/components/activity/ActivityFeed";

const ACTION_META: Partial<Record<AuditAction, { label: string; entity: ActivityEntity }>> = {
  "Company Verified": { label: "Sponsor verified", entity: "company" },
  "Company Featured": { label: "Featured sponsor", entity: "company" },
  "Opportunity Approved": { label: "Opportunity approved", entity: "opportunity" },
  "Opportunity Featured": { label: "Opportunity featured", entity: "opportunity" },
  "Deal Created": { label: "Deal created", entity: "deal" },
  "Deal Closed": { label: "Deal closed", entity: "deal" },
  "Deal Stage Changed": { label: "Deal advanced", entity: "deal" },
  "Introduction Approved": { label: "Introduction approved", entity: "introduction" },
  "Introduction Converted": { label: "Introduction converted", entity: "introduction" },
  "Document Uploaded": { label: "Financials updated", entity: "document" },
};

export default function CompanyMarketActivity({ company }: { company: Company }) {
  const { auditEvents, hydrated } = useMessaging();
  const { active } = useCompanyOpportunityProfile(company.id, 0);

  const events = useMemo<ActivityEvent[]>(() => {
    if (!hydrated) return [];
    const oppIds = new Set(active.map((o) => o.id));
    const out: ActivityEvent[] = [];

    // Real audit events about this company or its opportunities.
    for (const e of auditEvents) {
      const meta = ACTION_META[e.action];
      if (!meta) continue;
      const isCompany = e.targetKind === "company" && e.targetId === company.id;
      const isOpp = e.targetKind === "opportunity" && oppIds.has(e.targetId);
      if (!isCompany && !isOpp) continue;
      out.push({
        id: e.id,
        entity: meta.entity,
        tone: auditToneFor(e.action),
        title: meta.label,
        detail: e.targetLabel ?? e.targetId,
        dateMs: Date.parse(e.createdAt) || 0,
      });
    }

    // Derived, real-data activity so the ledger reflects this sponsor's footprint.
    if (company.verification === "Verified" || company.verification === "Premium Verified") {
      const d = Date.parse(company.addedAt) || 0;
      if (!out.some((i) => i.title === "Sponsor verified")) {
        out.push({
          id: `${company.id}-verified`,
          entity: "company",
          tone: "sky",
          title: "Sponsor verified",
          detail: company.name,
          dateMs: d,
        });
      }
    }
    if (company.featured) {
      const d = Date.parse(company.addedAt) || 0;
      out.push({
        id: `${company.id}-featured`,
        entity: "company",
        tone: "gold",
        title: "Featured sponsor",
        detail: company.name,
        dateMs: d,
      });
    }
    for (const o of active) {
      if (out.some((i) => i.detail === o.title)) continue;
      out.push({
        id: `${o.id}-listed`,
        entity: "opportunity",
        tone: "emerald",
        title: "Opportunity listed",
        detail: o.title,
        href: `/opportunity/${o.slug}`,
        dateMs: Date.parse(o.postedAt) || 0,
      });
    }

    return out;
  }, [auditEvents, active, company, hydrated]);

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
          Market Activity
        </div>
      </div>

      <ActivityFeed
        events={events}
        loading={!hydrated}
        nowMs={now}
        limit={7}
        emptyTitle="No recent activity for this sponsor"
        emptyDescription="Deals, listings, and verification events will appear here."
      />
    </section>
  );
}
