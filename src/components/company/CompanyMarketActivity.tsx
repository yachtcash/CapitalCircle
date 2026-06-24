"use client";

import { useMemo } from "react";
import {
  Activity,
  ShieldCheck,
  Star,
  Sparkles,
  Handshake,
  CircleDollarSign,
  TrendingUp,
  UserPlus,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Company } from "@/data/companies";
import { type AuditAction, toneForAction } from "@/data/audit";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";
import { timeAgo } from "@/lib/home/format";

const ACTION_META: Partial<Record<AuditAction, { label: string; icon: LucideIcon }>> = {
  "Company Verified": { label: "Sponsor verified", icon: ShieldCheck },
  "Company Featured": { label: "Featured sponsor", icon: Star },
  "Opportunity Approved": { label: "Opportunity approved", icon: Sparkles },
  "Opportunity Featured": { label: "Opportunity featured", icon: Star },
  "Deal Created": { label: "Deal created", icon: Handshake },
  "Deal Closed": { label: "Deal closed", icon: CircleDollarSign },
  "Deal Stage Changed": { label: "Deal advanced", icon: TrendingUp },
  "Introduction Approved": { label: "Introduction approved", icon: UserPlus },
  "Introduction Converted": { label: "Introduction converted", icon: Handshake },
  "Document Uploaded": { label: "Financials updated", icon: FileText },
};

const TONE_RING: Record<string, string> = {
  emerald: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20",
  amber: "text-gold-700 bg-gold-500/10 ring-gold-500/25",
  rose: "text-rose-600 bg-rose-500/10 ring-rose-500/20",
  sky: "text-sky-600 bg-sky-500/10 ring-sky-500/20",
  violet: "text-violet-600 bg-violet-500/10 ring-violet-500/20",
};

type Item = { id: string; label: string; detail: string; icon: LucideIcon; tone: string; dateMs: number };

export default function CompanyMarketActivity({ company }: { company: Company }) {
  const { auditEvents, hydrated } = useMessaging();
  const { active } = useCompanyOpportunityProfile(company.id, 0);

  const items = useMemo<Item[]>(() => {
    if (!hydrated) return [];
    const oppIds = new Set(active.map((o) => o.id));
    const out: Item[] = [];

    // Real audit events about this company or its opportunities.
    for (const e of auditEvents) {
      const meta = ACTION_META[e.action];
      if (!meta) continue;
      const isCompany = e.targetKind === "company" && e.targetId === company.id;
      const isOpp = e.targetKind === "opportunity" && oppIds.has(e.targetId);
      if (!isCompany && !isOpp) continue;
      out.push({
        id: e.id,
        label: meta.label,
        detail: e.targetLabel ?? e.targetId,
        icon: meta.icon,
        tone: toneForAction(e.action),
        dateMs: Date.parse(e.createdAt) || 0,
      });
    }

    // Derived, real-data activity so the ledger reflects this sponsor's footprint.
    if (company.verification === "Verified" || company.verification === "Premium Verified") {
      const d = Date.parse(company.addedAt) || 0;
      if (!out.some((i) => i.label === "Sponsor verified")) {
        out.push({ id: `${company.id}-verified`, label: "Sponsor verified", detail: company.name, icon: ShieldCheck, tone: "sky", dateMs: d });
      }
    }
    if (company.featured) {
      const d = Date.parse(company.addedAt) || 0;
      out.push({ id: `${company.id}-featured`, label: "Featured sponsor", detail: company.name, icon: Star, tone: "amber", dateMs: d });
    }
    for (const o of active) {
      if (out.some((i) => i.detail === o.title)) continue;
      out.push({
        id: `${o.id}-listed`,
        label: "Opportunity listed",
        detail: o.title,
        icon: Sparkles,
        tone: "emerald",
        dateMs: Date.parse(o.postedAt) || 0,
      });
    }

    return out.sort((a, b) => b.dateMs - a.dateMs).slice(0, 7);
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

      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
        {!hydrated ? (
          <ul>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 md:px-5 py-3.5 border-b border-navy-900/[0.05] last:border-b-0">
                <div className="h-8 w-8 rounded-lg bg-navy-900/[0.05]" />
                <div className="flex-1">
                  <div className="h-3 w-40 rounded bg-navy-900/[0.06]" />
                  <div className="mt-1.5 h-2.5 w-24 rounded bg-navy-900/[0.04]" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <p className="text-sm text-navy-700/55 text-center py-10">No recent activity for this sponsor.</p>
        ) : (
          <ul>
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-3 px-4 md:px-5 py-3.5 border-b border-navy-900/[0.05] last:border-b-0 hover:bg-cream/50 transition-colors"
              >
                <div className={`h-8 w-8 rounded-lg ring-1 inline-flex items-center justify-center shrink-0 ${TONE_RING[it.tone] ?? TONE_RING.amber}`}>
                  <it.icon className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-navy-900">{it.label}</div>
                  <div className="mt-0.5 text-xs text-navy-700/60 truncate">{it.detail}</div>
                </div>
                <div className="text-[11px] text-navy-700/45 tabular-nums whitespace-nowrap shrink-0">
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
