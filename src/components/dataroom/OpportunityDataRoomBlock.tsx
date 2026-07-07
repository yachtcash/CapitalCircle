"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck, ArrowRight, Eye } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { getListingByOpportunitySlug } from "@/data/listings";
import { useMessaging } from "@/components/providers/MessagingProvider";
import DocumentRow from "@/components/documents/DocumentRow";
import RequestAccessModal from "@/components/documents/RequestAccessModal";

type Props = {
  opportunity: Opportunity;
  companyName: string;
};

export default function OpportunityDataRoomBlock({ opportunity, companyName }: Props) {
  const { documents, hasApprovedAccess, hasPendingAccess } = useMessaging();
  const listing = getListingByOpportunitySlug(opportunity.slug);
  const [requestOpen, setRequestOpen] = useState(false);

  const listingId = listing?.id;
  const listingDocs = useMemo(
    () => (listingId ? documents.filter((d) => d.listingId === listingId) : []),
    [documents, listingId]
  );
  const publicDocs = listingDocs.filter((d) => d.visibility === "Public");
  const privateDocs = listingDocs.filter((d) => d.visibility === "Private");

  // Group by category (order of first appearance) so investors scan
  // decks / financials / legal as distinct sections, not one flat list.
  const groupedDocs = useMemo(() => {
    const groups: [string, typeof listingDocs][] = [];
    for (const d of listingDocs) {
      const g = groups.find(([c]) => c === d.category);
      if (g) g[1].push(d);
      else groups.push([d.category, [d]]);
    }
    return groups;
  }, [listingDocs]);

  const approved = listingId ? hasApprovedAccess(listingId) : false;
  const pending = listingId ? hasPendingAccess(listingId) : false;

  return (
    <section>
      <header className="flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
            Data Room
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            Documents available
          </h2>
        </div>
        {listingId ? (
          <Link
            href={`/data-room/${listingId}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors group"
          >
            Open data room
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </Link>
        ) : null}
      </header>

      {/* Data Room CTA card */}
      <div className="rounded-2xl bg-navy-900 text-white overflow-hidden mb-4">
        <div className="relative p-5 md:p-6">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 100% 0%, rgba(212,175,55,0.35), transparent 55%)",
            }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold">
                Data Room Available
              </div>
              <h3 className="mt-1 text-base md:text-lg font-semibold leading-snug">
                {listingDocs.length} documents · {publicDocs.length} public ·{" "}
                {privateDocs.length} private
              </h3>
              <p className="mt-2 text-xs md:text-sm text-white/70 leading-relaxed max-w-2xl">
                Public documents are available below. Private documents — pitch deck, financial
                model, contracts — unlock after {companyName} approves your access request.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:items-end shrink-0">
              {approved ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-300/40 px-4 py-2 text-xs uppercase tracking-[0.14em] font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.6} />
                  Access granted
                </span>
              ) : pending ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 text-gold-300 ring-1 ring-gold-400/40 px-4 py-2 text-xs uppercase tracking-[0.14em] font-bold">
                  <Lock className="h-3.5 w-3.5" strokeWidth={2.6} />
                  Request pending
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  disabled={!listingId}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
                >
                  <Lock className="h-4 w-4" strokeWidth={2.4} />
                  Request Access
                </button>
              )}
              {listingId ? (
                <Link
                  href={`/data-room/${listingId}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/15 text-white font-medium px-5 py-2.5 text-sm transition-colors"
                >
                  <Eye className="h-4 w-4" strokeWidth={2} />
                  Open data room
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Document list — grouped by category */}
      {listingDocs.length > 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
          {groupedDocs.map(([category, docs]) => (
            <div key={category} className="border-b border-navy-900/[0.06] last:border-b-0">
              <div className="px-4 md:px-5 pt-4 pb-1 flex items-baseline gap-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-gold-600 font-bold">
                  {category}
                </span>
                <span className="text-[10px] text-navy-700/45 font-semibold tabular-nums">
                  {docs.length}
                </span>
              </div>
              <div className="divide-y divide-navy-900/[0.05]">
                {docs.map((document) => (
                  <DocumentRow
                    key={document.id}
                    document={document}
                    unlocked={approved}
                    onRequestAccess={() => setRequestOpen(true)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 text-center text-sm text-navy-700/60">
          No documents have been uploaded to this data room yet.
        </div>
      )}

      {listingId ? (
        <RequestAccessModal
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
          listingId={listingId}
          listingTitle={opportunity.title}
          companyName={companyName}
          privateDocsCount={privateDocs.length}
        />
      ) : null}
    </section>
  );
}
