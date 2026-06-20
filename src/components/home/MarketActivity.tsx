"use client";

import { useMemo } from "react";
import {
  Activity,
  Handshake,
  CircleDollarSign,
  TrendingUp,
  ShieldCheck,
  Star,
  Sparkles,
  UserPlus,
  FileCheck2,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { type AuditAction, type AuditEvent, toneForAction } from "@/data/audit";
import { timeAgo } from "@/lib/home/format";

// Investor-facing relabel of the platform audit log. Only positive, market-moving
// actions are surfaced — moderation/member noise is filtered out.
const ACTIVITY: Partial<Record<AuditAction, { label: string; icon: LucideIcon }>> = {
  "Deal Created": { label: "New deal created", icon: Handshake },
  "Deal Closed": { label: "Deal closed", icon: CircleDollarSign },
  "Deal Stage Changed": { label: "Deal advanced", icon: TrendingUp },
  "Company Verified": { label: "Sponsor verified", icon: ShieldCheck },
  "Company Featured": { label: "Sponsor featured", icon: Star },
  "Opportunity Approved": { label: "New opportunity added", icon: Sparkles },
  "Introduction Approved": { label: "Introduction approved", icon: UserPlus },
  "Introduction Converted": { label: "Introduction converted to deal", icon: Handshake },
  "Access Approved": { label: "Data-room access granted", icon: FileCheck2 },
  "Document Uploaded": { label: "Financials updated", icon: FileText },
};

const TONE_DOT: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-gold-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

const TONE_RING: Record<string, string> = {
  emerald: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20",
  amber: "text-gold-700 bg-gold-500/10 ring-gold-500/25",
  rose: "text-rose-600 bg-rose-500/10 ring-rose-500/20",
  sky: "text-sky-600 bg-sky-500/10 ring-sky-500/20",
  violet: "text-violet-600 bg-violet-500/10 ring-violet-500/20",
};

export default function MarketActivity() {
  const { auditEvents, hydrated } = useMessaging();

  const items = useMemo(() => {
    if (!hydrated) return [] as AuditEvent[];
    return [...auditEvents]
      .filter((e) => ACTIVITY[e.action])
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 7);
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
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
              <Activity className="h-3.5 w-3.5" strokeWidth={2.4} />
              Market Activity
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
          {!hydrated ? (
            <ul>
              {Array.from({ length: 5 }).map((_, i) => (
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
            <p className="text-sm text-navy-700/55 text-center py-10">No recent activity.</p>
          ) : (
            <ul>
              {items.map((e) => {
                const cfg = ACTIVITY[e.action]!;
                const tone = toneForAction(e.action);
                const Icon = cfg.icon;
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 px-4 md:px-5 py-3.5 border-b border-navy-900/[0.05] last:border-b-0 hover:bg-cream/50 transition-colors"
                  >
                    <div
                      className={`h-8 w-8 rounded-lg ring-1 inline-flex items-center justify-center shrink-0 ${TONE_RING[tone] ?? TONE_RING.amber}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${TONE_DOT[tone] ?? TONE_DOT.amber}`} />
                        <span className="text-sm font-semibold text-navy-900">{cfg.label}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-navy-700/60 truncate pl-3.5">{e.targetLabel ?? e.targetId}</div>
                    </div>
                    <div className="text-[11px] text-navy-700/45 tabular-nums whitespace-nowrap shrink-0">
                      {timeAgo(e.createdAt, now)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="mt-3 text-[11px] text-navy-700/45">
          A live read of marketplace activity · names and figures reflect platform events
        </p>
      </div>
    </section>
  );
}
