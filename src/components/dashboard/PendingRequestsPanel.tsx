"use client";

import Link from "next/link";
import { Clock3, ArrowRight, Inbox } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { getListingById } from "@/data/listings";
import AccessRequestRow from "@/components/documents/AccessRequestRow";
import EmptyState from "@/components/common/EmptyState";

export default function PendingRequestsPanel() {
  const { accessRequests } = useMessaging();
  const pending = accessRequests
    .filter((r) => r.status === "Requested")
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

  return (
    <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-b border-navy-900/[0.06]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" strokeWidth={2.2} />
            Pending requests
          </div>
          <h2 className="mt-1 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
            Awaiting your decision
            <span className="ml-1.5 text-navy-700/55 font-normal text-sm">
              · {pending.length}
            </span>
          </h2>
        </div>
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
        >
          Review all
          <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
        </Link>
      </header>

      {pending.length === 0 ? (
        <EmptyState
          Icon={Inbox}
          title="No pending requests"
          description="When members request access to your data rooms, they'll appear here for review."
          action={{ label: "Document Center", href: "/documents" }}
          compact
        />
      ) : (
        <div className="divide-y divide-navy-900/[0.06]">
          {pending.slice(0, 4).map((request) => {
            const listing = getListingById(request.listingId);
            return (
              <div key={request.id}>
                <AccessRequestRow request={request} showListing={Boolean(listing)} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
