import {
  Sparkles,
  Handshake,
  Bookmark,
  Building2,
  FileText,
  GitCommitVertical,
  Pencil,
  Activity as ActivityIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type {
  ListingActivity,
  ListingActivityKind,
  ListingRecord,
} from "@/data/listings";

type IconMeta = { icon: LucideIcon; color: string };

const ICON_MAP: Record<ListingActivityKind, IconMeta> = {
  interest: {
    icon: Sparkles,
    color: "text-gold-700 bg-gold-500/15 ring-gold-500/25",
  },
  negotiation_start: {
    icon: Handshake,
    color: "text-amber-700 bg-amber-500/15 ring-amber-500/25",
  },
  saved: {
    icon: Bookmark,
    color: "text-emerald-700 bg-emerald-500/15 ring-emerald-500/25",
  },
  company_view: {
    icon: Building2,
    color: "text-sky-700 bg-sky-500/15 ring-sky-500/25",
  },
  document_request: {
    icon: FileText,
    color: "text-rose-700 bg-rose-500/15 ring-rose-500/25",
  },
  stage_change: {
    icon: GitCommitVertical,
    color: "text-navy-900 bg-navy-900/10 ring-navy-900/20",
  },
  edit: {
    icon: Pencil,
    color: "text-navy-700 bg-navy-900/5 ring-navy-900/15",
  },
};

// Deterministic, server-safe formatter. UTC keeps SSR/CSR markup identical.
const FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

function formatExact(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${FORMATTER.format(d)} UTC`;
}

function sortDesc(activity: ListingActivity[]): ListingActivity[] {
  return [...activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default function ListingActivityFeed({
  listing,
}: {
  listing: ListingRecord;
}) {
  const entries = sortDesc(listing.activity);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Audit trail
        </div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
          Activity
        </h2>
        <p className="mt-1 text-sm text-navy-700/65">
          Chronological log of every event recorded against {listing.id}.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 md:p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/5 text-navy-700/70 ring-1 ring-navy-900/10 mx-auto">
            <ActivityIcon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-navy-900">
            No activity yet
          </h3>
          <p className="mt-2 text-sm text-navy-700/70 max-w-md mx-auto">
            Once your listing is published, every interest, save, and document
            request will appear here.
          </p>
        </div>
      ) : (
        <ol className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
          {entries.map((entry) => {
            const meta = ICON_MAP[entry.kind] ?? ICON_MAP.edit;
            const Icon = meta.icon;
            return (
              <li key={entry.id} className="flex items-start gap-4 p-4 md:p-5">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.color}`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="text-sm md:text-[15px] font-semibold text-navy-900 leading-snug">
                      {entry.title}
                    </div>
                    <time
                      dateTime={entry.createdAt}
                      className="text-[11px] text-navy-700/60 tabular-nums shrink-0"
                    >
                      {formatExact(entry.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1.5 text-sm text-navy-700/75 leading-relaxed">
                    {entry.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
