"use client";

import Link from "next/link";
import {
  ArrowRight,
  Activity as ActivityIcon,
  Bookmark,
  Building2,
  FileText,
  GitCommitVertical,
  Handshake,
  Pencil,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  allRecentActivity,
  type ListingActivity,
  type ListingActivityKind,
} from "@/data/listings";
import { formatRelative } from "@/data/messages";
import { cn } from "@/lib/cn";

const KIND_META: Record<
  ListingActivityKind,
  { icon: LucideIcon; tone: string; label: string }
> = {
  interest: {
    icon: Sparkles,
    tone: "bg-gold-500/15 text-gold-700 ring-gold-500/40",
    label: "Interest",
  },
  negotiation_start: {
    icon: Handshake,
    tone: "bg-amber-500/15 text-amber-700 ring-amber-500/40",
    label: "Negotiation",
  },
  saved: {
    icon: Bookmark,
    tone: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/35",
    label: "Saved",
  },
  company_view: {
    icon: Building2,
    tone: "bg-sky-500/15 text-sky-700 ring-sky-500/35",
    label: "Company view",
  },
  document_request: {
    icon: FileText,
    tone: "bg-rose-500/15 text-rose-700 ring-rose-500/35",
    label: "Documents",
  },
  stage_change: {
    icon: GitCommitVertical,
    tone: "bg-navy-900/[0.06] text-navy-900 ring-navy-900/10",
    label: "Stage change",
  },
  edit: {
    icon: Pencil,
    tone: "bg-bone text-navy-900 ring-navy-900/10",
    label: "Edit",
  },
};

export default function RecentActivity() {
  const items = allRecentActivity(8);

  return (
    <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
      <header className="flex items-end justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <ActivityIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
            Activity Feed
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            Recent activity
          </h2>
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ol className="relative">
          {items.map((item, i) => (
            <ActivityRow
              key={item.id}
              item={item}
              isLast={i === items.length - 1}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function ActivityRow({
  item,
  isLast,
}: {
  item: ListingActivity;
  isLast: boolean;
}) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;

  return (
    <li className="relative pl-12 pb-5 last:pb-0">
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute left-4 top-9 bottom-0 w-px bg-navy-900/[0.08]"
        />
      ) : null}

      <span
        className={cn(
          "absolute left-0 top-0 h-9 w-9 rounded-xl flex items-center justify-center ring-1",
          meta.tone
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/55">
            {meta.label}
          </span>
          <span className="text-[11px] text-navy-700/55">
            {formatRelative(item.createdAt)}
          </span>
        </div>
        <div className="mt-0.5 text-sm font-semibold text-navy-900 leading-snug">
          {item.title}
        </div>
        <p className="mt-1 text-[13px] text-navy-700/75 leading-relaxed line-clamp-2">
          {item.body}
        </p>
        {item.opportunitySlug ? (
          <Link
            href={`/opportunity/${item.opportunitySlug}`}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors group"
          >
            View listing
            <ArrowRight
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.4}
            />
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.04] px-5 py-8 text-center">
      <ActivityIcon
        className="h-6 w-6 mx-auto text-navy-700/45"
        strokeWidth={2}
      />
      <div className="mt-3 text-sm font-semibold text-navy-900">
        No activity yet
      </div>
      <p className="mt-1.5 text-xs text-navy-700/65 leading-relaxed max-w-sm mx-auto">
        Activity on your listings will show up here as soon as it lands.
      </p>
    </div>
  );
}
