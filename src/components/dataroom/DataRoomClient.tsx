"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Lock,
  ShieldCheck,
  FilesIcon,
  Clock3,
  CheckCircle2,
  Eye,
  type LucideIcon,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { ListingRecord } from "@/data/listings";
import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import type { DocumentCategory } from "@/data/documents";

import DocumentRow from "@/components/documents/DocumentRow";
import AccessRequestRow from "@/components/documents/AccessRequestRow";
import DocumentActivityTimeline from "@/components/documents/DocumentActivityTimeline";
import RequestAccessModal from "@/components/documents/RequestAccessModal";
import ListingStatusBadge from "@/components/dashboard/listings/ListingStatusBadge";
import { cn } from "@/lib/cn";

type TabKey = "overview" | "documents" | "activity" | "requests";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "activity", label: "Activity" },
  { key: "requests", label: "Access Requests" },
];

type Props = {
  listing: ListingRecord;
  opportunity: Opportunity | null;
  company: Company | null;
};

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
    <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-2 text-xl md:text-2xl font-semibold text-navy-900 tabular-nums">
        {value}
      </div>
    </div>
  );
}

export default function DataRoomClient({ listing, opportunity, company }: Props) {
  const {
    documents: allDocuments,
    accessRequests: allRequests,
    documentActivity: allActivity,
  } = useMessaging();

  const listingDocuments = useMemo(
    () => allDocuments.filter((d) => d.listingId === listing.id),
    [allDocuments, listing.id]
  );
  const listingRequests = useMemo(
    () => allRequests.filter((r) => r.listingId === listing.id),
    [allRequests, listing.id]
  );
  const listingActivity = useMemo(
    () => allActivity.filter((a) => a.listingId === listing.id),
    [allActivity, listing.id]
  );

  const publicDocs = listingDocuments.filter((d) => d.visibility === "Public");
  const privateDocs = listingDocuments.filter((d) => d.visibility === "Private");

  const pendingRequests = listingRequests.filter((r) => r.status === "Requested");
  const approvedRequests = listingRequests.filter((r) => r.status === "Approved");
  const deniedRequests = listingRequests.filter((r) => r.status === "Denied");

  const [tab, setTab] = useState<TabKey>("overview");
  const [requestOpen, setRequestOpen] = useState(false);

  const docsByCategory = useMemo(() => {
    const map = new Map<DocumentCategory, typeof listingDocuments>();
    for (const d of listingDocuments) {
      const list = map.get(d.category) ?? [];
      list.push(d);
      map.set(d.category, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [listingDocuments]);

  const cover = opportunity?.images[0];

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      {/* Hero */}
      <section className="relative bg-navy-900">
        <div className="absolute inset-0 overflow-hidden">
          {cover ? (
            <>
              <Image
                src={cover}
                alt={`${listing.title} — cover`}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-navy-900/30 to-navy-900/80" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #0A1628 0%, #1A3160 60%, #294378 100%)",
              }}
            />
          )}
        </div>

        <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-7 md:pt-9 pb-8 md:pb-10 text-white">
          <nav className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/80">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3" strokeWidth={2} />
            <Link href="/dashboard/listings" className="hover:text-white transition-colors">
              Listings
            </Link>
            <ChevronRight className="h-3 w-3" strokeWidth={2} />
            <span className="text-white">{listing.id}</span>
          </nav>

          <div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-end gap-5 md:gap-8">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold bg-gold-500/15 text-gold-300 ring-1 ring-gold-400/40 rounded-full px-3 py-1 backdrop-blur">
                <Lock className="h-3 w-3" strokeWidth={2.6} />
                Private data room
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                {listing.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ListingStatusBadge status={listing.status} />
                {opportunity ? (
                  <Link
                    href={`/opportunity/${opportunity.slug}`}
                    className="text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-300 hover:text-gold-200 transition-colors"
                  >
                    View public listing →
                  </Link>
                ) : null}
                {company ? (
                  <Link
                    href={`/company/${company.slug}`}
                    className="text-[11px] uppercase tracking-[0.14em] font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    {company.name} →
                  </Link>
                ) : null}
              </div>
            </div>

            <Link
              href="/dashboard/listings"
              className="inline-flex items-center gap-1.5 self-start md:self-end rounded-full bg-white/[0.08] hover:bg-white/[0.14] ring-1 ring-white/20 backdrop-blur text-white font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
              All listings
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-6 md:py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          <Stat label="All documents" value={listingDocuments.length} icon={FilesIcon} />
          <Stat label="Public" value={publicDocs.length} icon={Eye} />
          <Stat label="Private" value={privateDocs.length} icon={Lock} />
          <Stat label="Pending requests" value={pendingRequests.length} icon={Clock3} />
          <Stat label="Approved" value={approvedRequests.length} icon={CheckCircle2} />
        </div>

        {/* Tabs */}
        <div className="mb-5 flex items-center gap-2 border-b border-navy-900/[0.08] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap",
                tab === t.key ? "text-navy-900" : "text-navy-700/60 hover:text-navy-900"
              )}
            >
              {t.label}
              {t.key === "requests" && pendingRequests.length > 0 ? (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold">
                  {pendingRequests.length}
                </span>
              ) : null}
              {tab === t.key ? (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] rounded bg-gold-500" />
              ) : null}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 md:gap-8">
            <div className="space-y-5">
              <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-7">
                <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
                  Listing
                </div>
                <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
                  Overview
                </h2>
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <Item label="Category" value={listing.category ?? "—"} />
                  <Item label="Deal type" value={listing.dealType ?? "—"} />
                  <Item
                    label="Location"
                    value={opportunity ? opportunity.location : "—"}
                  />
                  <Item
                    label="Investment range"
                    value={opportunity ? opportunity.investmentRange : "—"}
                  />
                  <Item
                    label="Expected return"
                    value={opportunity ? opportunity.expectedReturn : "—"}
                  />
                  <Item label="Sponsor" value={company?.name ?? "—"} />
                </dl>
                {opportunity?.executiveSummary ? (
                  <>
                    <div className="mt-6 text-[11px] uppercase tracking-[0.18em] text-navy-700/55 font-semibold">
                      Executive summary
                    </div>
                    <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-navy-700/90">
                      {opportunity.executiveSummary}
                    </p>
                  </>
                ) : null}
              </section>

              <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-7">
                <header className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
                      Activity
                    </div>
                    <h3 className="mt-1.5 text-base md:text-lg font-semibold text-navy-900">
                      Latest events
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("activity")}
                    className="text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
                  >
                    See all
                  </button>
                </header>
                <DocumentActivityTimeline
                  activity={listingActivity.slice(0, 4)}
                  emptyLabel="No activity yet for this data room."
                />
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl bg-navy-900 text-white p-5 md:p-6">
                <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Sponsor access
                </div>
                <p className="mt-2 text-sm text-white/85 leading-relaxed">
                  You&apos;re viewing the sponsor data room. All documents and access requests are
                  visible here.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("requests")}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
                >
                  <Clock3 className="h-4 w-4" strokeWidth={2.4} />
                  Review {pendingRequests.length} pending request
                  {pendingRequests.length === 1 ? "" : "s"}
                </button>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold">
                  Need to demo as a guest?
                </div>
                <p className="mt-2 text-sm text-navy-700/70 leading-relaxed">
                  Open the public opportunity page to experience the visitor side of the data
                  room — locked private docs + Request Access flow.
                </p>
                {opportunity ? (
                  <Link
                    href={`/opportunity/${opportunity.slug}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors"
                  >
                    View public listing →
                  </Link>
                ) : null}
              </div>
            </aside>
          </div>
        ) : null}

        {tab === "documents" ? (
          <div className="space-y-6">
            {docsByCategory.length === 0 ? (
              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 text-center">
                <p className="text-sm text-navy-700/60">
                  No documents uploaded to this data room yet.
                </p>
              </div>
            ) : (
              docsByCategory.map(([category, docs]) => (
                <section key={category}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-navy-900">
                      {category}
                      <span className="ml-2 text-xs text-navy-700/55 font-normal">
                        · {docs.length}
                      </span>
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
                    {docs.map((document) => (
                      <DocumentRow
                        key={document.id}
                        document={document}
                        unlocked={true}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        ) : null}

        {tab === "activity" ? (
          <DocumentActivityTimeline
            activity={listingActivity}
            emptyLabel="No data room activity yet."
          />
        ) : null}

        {tab === "requests" ? (
          <div className="space-y-6">
            <RequestsBucket
              title="Pending"
              icon={Clock3}
              requests={pendingRequests}
              emptyLabel="No pending requests."
            />
            <RequestsBucket
              title="Approved"
              icon={CheckCircle2}
              requests={approvedRequests}
              emptyLabel="No approved requests yet."
            />
            <RequestsBucket
              title="Denied"
              icon={Lock}
              requests={deniedRequests}
              emptyLabel="No denied requests."
            />
          </div>
        ) : null}
      </div>

      <RequestAccessModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        companyName={company?.name}
        privateDocsCount={privateDocs.length}
      />
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-semibold">
        {label}
      </div>
      <div className="mt-1 text-navy-900">{value}</div>
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
        <h3 className="text-base md:text-lg font-semibold text-navy-900 tracking-tight inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
          {title}
          <span className="text-navy-700/55 font-normal text-sm">· {requests.length}</span>
        </h3>
      </header>
      {requests.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-6 text-center">
          <p className="text-sm text-navy-700/60">{emptyLabel}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
          {requests.map((request) => (
            <AccessRequestRow key={request.id} request={request} />
          ))}
        </div>
      )}
    </section>
  );
}
