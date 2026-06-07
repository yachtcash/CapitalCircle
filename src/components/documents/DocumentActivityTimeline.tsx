"use client";

import {
  Upload,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowDownToLine,
  type LucideIcon,
} from "lucide-react";
import type { DocumentActivity, DocumentActivityKind } from "@/data/documents";
import { cn } from "@/lib/cn";

const META: Record<DocumentActivityKind, { icon: LucideIcon; tone: string }> = {
  uploaded: { icon: Upload, tone: "bg-gold-500/15 text-gold-700 ring-gold-500/40" },
  access_requested: { icon: Sparkles, tone: "bg-sky-500/15 text-sky-700 ring-sky-500/30" },
  access_approved: { icon: CheckCircle2, tone: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30" },
  access_denied: { icon: XCircle, tone: "bg-rose-500/15 text-rose-700 ring-rose-500/30" },
  viewed: { icon: Eye, tone: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15" },
  downloaded: { icon: ArrowDownToLine, tone: "bg-amber-500/15 text-amber-700 ring-amber-500/30" },
};

function formatExact(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Props = {
  activity: DocumentActivity[];
  emptyLabel?: string;
};

export default function DocumentActivityTimeline({ activity, emptyLabel }: Props) {
  if (activity.length === 0) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 text-center">
        <p className="text-sm text-navy-700/60">{emptyLabel ?? "No activity yet."}</p>
      </div>
    );
  }
  const sorted = [...activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <ol className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
      {sorted.map((entry) => {
        const m = META[entry.kind];
        const Icon = m.icon;
        return (
          <li key={entry.id} className="flex gap-3 md:gap-4 p-4 md:p-5">
            <span
              className={cn(
                "shrink-0 h-9 w-9 rounded-full inline-flex items-center justify-center ring-1",
                m.tone
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-navy-900 text-sm leading-snug">
                {entry.title}
              </div>
              <p className="mt-0.5 text-sm text-navy-700/80 leading-relaxed">
                {entry.body}
              </p>
              <div className="mt-1.5 text-[11px] text-navy-700/55">
                {entry.actor} · {formatExact(entry.createdAt)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
