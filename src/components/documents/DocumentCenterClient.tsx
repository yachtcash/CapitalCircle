"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  FilesIcon,
  Clock3,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { getListingById } from "@/data/listings";
import type { DocumentVisibility } from "@/data/documents";
import DocumentRow from "./DocumentRow";
import AccessRequestRow from "./AccessRequestRow";
import DocumentActivityTimeline from "./DocumentActivityTimeline";
import { cn } from "@/lib/cn";

const FILE_TYPE_OPTIONS = [
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "jpg",
  "png",
  "zip",
] as const;

type TabKey = "documents" | "requests" | "activity";

const TABS: { key: TabKey; label: string }[] = [
  { key: "documents", label: "Documents" },
  { key: "requests", label: "Access Requests" },
  { key: "activity", label: "Activity" },
];

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-4 md:p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tabular-nums">
        {value}
      </div>
    </div>
  );
}

export default function DocumentCenterClient() {
  const { documents, accessRequests, documentActivity } = useMessaging();
  const [tab, setTab] = useState<TabKey>("documents");
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<DocumentVisibility | "All">(
    "All"
  );
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  const filteredDocuments = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (visibilityFilter !== "All" && d.visibility !== visibilityFilter) return false;
      if (typeFilter.length > 0 && !typeFilter.includes(d.fileType)) return false;
      if (!needle) return true;
      const haystack = `${d.name} ${d.category} ${d.fileType}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [documents, query, visibilityFilter, typeFilter]);

  const stats = useMemo(() => {
    const publicCount = documents.filter((d) => d.visibility === "Public").length;
    const privateCount = documents.length - publicCount;
    const pendingCount = accessRequests.filter((r) => r.status === "Requested").length;
    const approvedCount = accessRequests.filter((r) => r.status === "Approved").length;
    const deniedCount = accessRequests.filter((r) => r.status === "Denied").length;
    return {
      total: documents.length,
      publicCount,
      privateCount,
      pendingCount,
      approvedCount,
      deniedCount,
    };
  }, [documents, accessRequests]);

  const toggleType = (t: string) => {
    setTypeFilter((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const sortedRequests = [...accessRequests].sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt)
  );

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      {/* Hero */}
      <div className="bg-white border-b border-navy-900/[0.06]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-7 md:py-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
            Document Center
          </div>
          <h1 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
            Manage every document across your data rooms.
          </h1>
          <p className="mt-2 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-3xl">
            All public and private documents from listings you own, plus access requests and
            activity — in one private vault.
          </p>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <Stat label="Total documents" value={stats.total} icon={FilesIcon} />
            <Stat label="Public" value={stats.publicCount} icon={ShieldCheck} />
            <Stat label="Private" value={stats.privateCount} icon={ShieldCheck} />
            <Stat label="Pending requests" value={stats.pendingCount} icon={Clock3} />
            <Stat label="Approved" value={stats.approvedCount} icon={CheckCircle2} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-6 md:py-8">
        {/* Tabs */}
        <div className="mb-5 flex items-center gap-2 border-b border-navy-900/[0.08]">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-semibold transition-colors",
                tab === t.key
                  ? "text-navy-900"
                  : "text-navy-700/60 hover:text-navy-900"
              )}
            >
              {t.label}
              {t.key === "requests" && stats.pendingCount > 0 ? (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold">
                  {stats.pendingCount}
                </span>
              ) : null}
              {tab === t.key ? (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] rounded bg-gold-500" />
              ) : null}
            </button>
          ))}
        </div>

        {tab === "documents" ? (
          <>
            {/* Search + filters */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1 max-w-xl">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50"
                  strokeWidth={2}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documents"
                  className="w-full rounded-full bg-white ring-1 ring-navy-900/[0.08] focus:ring-2 focus:ring-gold-500 outline-none pl-9 pr-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/45 transition-shadow"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {(["All", "Public", "Private"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibilityFilter(v)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
                      visibilityFilter === v
                        ? "bg-navy-900 text-gold-400"
                        : "bg-white text-navy-700 ring-1 ring-navy-900/[0.08] hover:ring-navy-900/20"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5 flex flex-wrap gap-1.5">
              {FILE_TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
                    typeFilter.includes(t)
                      ? "bg-gold-500 text-navy-900"
                      : "bg-white text-navy-700 ring-1 ring-navy-900/[0.08] hover:ring-navy-900/25"
                  )}
                >
                  {t.toUpperCase()}
                </button>
              ))}
              {typeFilter.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setTypeFilter([])}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-700 hover:text-gold-600 px-2 py-1 transition-colors"
                >
                  Clear types
                </button>
              ) : null}
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 text-center">
                <p className="text-sm text-navy-700/60">
                  No documents match your filters.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
                {filteredDocuments.map((document) => {
                  const listing = getListingById(document.listingId);
                  return (
                    <DocumentRow
                      key={document.id}
                      document={document}
                      listingHref={listing ? `/data-room/${listing.id}` : undefined}
                      listingLabel={listing ? listing.title : document.listingId}
                      unlocked={true}
                    />
                  );
                })}
              </div>
            )}
          </>
        ) : null}

        {tab === "requests" ? (
          <div className="space-y-6">
            <RequestsBucket
              title="Pending requests"
              icon={Clock3}
              requests={sortedRequests.filter((r) => r.status === "Requested")}
              emptyLabel="No pending requests right now."
            />
            <RequestsBucket
              title="Approved"
              icon={CheckCircle2}
              requests={sortedRequests.filter((r) => r.status === "Approved")}
              emptyLabel="No approvals yet."
            />
            <RequestsBucket
              title="Denied"
              icon={XCircle}
              requests={sortedRequests.filter((r) => r.status === "Denied")}
              emptyLabel="No denied requests."
            />
          </div>
        ) : null}

        {tab === "activity" ? (
          <DocumentActivityTimeline activity={documentActivity} />
        ) : null}

        {/* Bottom helper link to dashboard */}
        <div className="mt-10 flex items-center justify-between flex-wrap gap-3 text-sm text-navy-700/65">
          <span>
            Tip — request access to other sponsors&apos; data rooms from their{" "}
            <Link
              href="/#opportunities"
              className="font-semibold text-navy-900 hover:text-gold-700 transition-colors"
            >
              opportunity pages
            </Link>
            .
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 font-semibold text-navy-900 hover:text-gold-700 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function RequestsBucket({
  title,
  icon: Icon,
  requests,
  emptyLabel,
}: {
  title: string;
  icon: LucideIcon;
  requests: ReturnType<typeof useMessaging>["accessRequests"];
  emptyLabel: string;
}) {
  return (
    <section>
      <header className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base md:text-lg font-semibold text-navy-900 tracking-tight inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
          {title}
          <span className="text-navy-700/55 font-normal text-sm">· {requests.length}</span>
        </h2>
      </header>
      {requests.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-6 text-center">
          <p className="text-sm text-navy-700/60">{emptyLabel}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
          {requests.map((request) => (
            <AccessRequestRow
              key={request.id}
              request={request}
              showListing
            />
          ))}
        </div>
      )}
    </section>
  );
}
