"use client";

import { useMemo } from "react";
import {
  Activity,
  Sparkles,
  Star,
  Bookmark,
  Handshake,
  Building2,
  FileText,
  TrendingUp,
  Pencil,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Opportunity } from "@/data/opportunities";
import { type AuditAction, toneForAction } from "@/data/audit";
import { timeAgo } from "@/lib/home/format";

const LISTING_META: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  interest: { label: "Interest expressed", icon: Sparkles, tone: "emerald" },
  saved: { label: "Saved by an investor", icon: Bookmark, tone: "amber" },
  negotiation_start: { label: "Negotiation started", icon: Handshake, tone: "sky" },
  company_view: { label: "Sponsor profile viewed", icon: Building2, tone: "sky" },
  document_request: { label: "Data-room access requested", icon: FileText, tone: "violet" },
  stage_change: { label: "Stage updated", icon: TrendingUp, tone: "sky" },
  edit: { label: "Listing updated", icon: Pencil, tone: "amber" },
};

const AUDIT_META: Partial<Record<AuditAction, { label: string; icon: LucideIcon }>> = {
  "Opportunity Approved": { label: "Opportunity approved", icon: Sparkles },
  "Opportunity Featured": { label: "Featured opportunity", icon: Star },
  "Deal Created": { label: "Deal created", icon: Handshake },
  "Deal Closed": { label: "Deal closed", icon: CircleDollarSign },
};

const TONE_RING: Record<string, string> = {
  emerald: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20",
  amber: "text-gold-700 bg-gold-500/10 ring-gold-500/25",
  rose: "text-rose-600 bg-rose-500/10 ring-rose-500/20",
  sky: "text-sky-600 bg-sky-500/10 ring-sky-500/20",
  violet: "text-violet-600 bg-violet-500/10 ring-violet-500/20",
};

type Item = { id: string; label: string; detail: string; icon: LucideIcon; tone: string; dateMs: number };

export default function OpportunityActivity({ opportunity }: { opportunity: Opportunity }) {
  const { auditEvents, introductionRequests, listings, hydrated } = useMessaging();

  const items = useMemo<Item[]>(() => {
    if (!hydrated) return [];
    const out: Item[] = [];

    // Derived from the opportunity itself.
    const listedMs = Date.parse(opportunity.postedAt) || 0;
    out.push({ id: `${opportunity.id}-listed`, label: "Opportunity listed", detail: opportunity.title, icon: Sparkles, tone: "emerald", dateMs: listedMs });
    if (opportunity.featured) {
      out.push({ id: `${opportunity.id}-featured`, label: "Featured opportunity", detail: "Curated onto the marketplace", icon: Star, tone: "amber", dateMs: listedMs });
    }

    // Real audit events about this opportunity.
    for (const e of auditEvents) {
      if (e.targetKind !== "opportunity" || e.targetId !== opportunity.id) continue;
      const meta = AUDIT_META[e.action];
      if (!meta) continue;
      out.push({ id: e.id, label: meta.label, detail: e.detail ?? e.targetLabel ?? "", icon: meta.icon, tone: toneForAction(e.action), dateMs: Date.parse(e.createdAt) || 0 });
    }

    // Live per-listing activity (interest / saved / negotiation / docs / edits).
    const listing = listings.find((l) => l.opportunitySlug === opportunity.slug);
    for (const a of listing?.activity ?? []) {
      const meta = LISTING_META[a.kind] ?? { label: a.title, icon: Activity, tone: "amber" };
      out.push({ id: a.id, label: meta.label, detail: a.title || a.body || "", icon: meta.icon, tone: meta.tone, dateMs: Date.parse(a.createdAt) || 0 });
    }

    // Introductions referencing this opportunity.
    for (const r of introductionRequests) {
      if (r.opportunitySlug !== opportunity.slug) continue;
      out.push({ id: r.id, label: "Introduction requested", detail: r.companyName ? `${r.reason} · ${r.companyName}` : r.reason, icon: Handshake, tone: "violet", dateMs: Date.parse(r.createdAt) || 0 });
    }

    return out.sort((a, b) => b.dateMs - a.dateMs).slice(0, 7);
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

      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
        {!hydrated ? (
          <ul>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 md:px-5 py-3.5 border-b border-navy-900/[0.05] last:border-b-0">
                <div className="h-8 w-8 rounded-lg bg-navy-900/[0.05]" />
                <div className="flex-1">
                  <div className="h-3 w-44 rounded bg-navy-900/[0.06]" />
                  <div className="mt-1.5 h-2.5 w-28 rounded bg-navy-900/[0.04]" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {items.map((it) => (
              <li key={it.id} className="flex items-start gap-3 px-4 md:px-5 py-3.5 border-b border-navy-900/[0.05] last:border-b-0 hover:bg-cream/50 transition-colors">
                <div className={`h-8 w-8 rounded-lg ring-1 inline-flex items-center justify-center shrink-0 mt-0.5 ${TONE_RING[it.tone] ?? TONE_RING.amber}`}>
                  <it.icon className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-navy-900 leading-snug">{it.label}</div>
                  {it.detail ? <div className="mt-0.5 text-xs text-navy-700/60 leading-relaxed line-clamp-2">{it.detail}</div> : null}
                </div>
                <div className="text-[11px] text-navy-700/45 tabular-nums whitespace-nowrap shrink-0 mt-0.5">
                  {it.dateMs ? timeAgo(new Date(it.dateMs).toISOString(), now) : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
