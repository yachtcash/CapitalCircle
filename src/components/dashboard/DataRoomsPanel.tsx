"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight, FilesIcon, Clock3, CheckCircle2 } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";

function statusTone(status: string): string {
  switch (status) {
    case "Active":
      return "bg-emerald-500 text-white";
    case "Seeking Capital":
      return "bg-gold-500 text-navy-900";
    case "Negotiating":
      return "bg-amber-500 text-white";
    case "Under Review":
      return "bg-sky-500 text-white";
    case "Closed":
      return "bg-rose-500 text-white";
    case "Archived":
      return "bg-navy-900 text-gold-400";
    default:
      return "bg-navy-900/[0.05] text-navy-700 ring-1 ring-navy-900/15";
  }
}

export default function DataRoomsPanel() {
  const { listings, documents, accessRequests } = useMessaging();

  const owned = listings
    .filter((l) => l.status !== "Archived")
    .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt))
    .slice(0, 4);

  return (
    <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <header className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
            Data Rooms
          </div>
          <h2 className="mt-1 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
            Your private vaults
          </h2>
        </div>
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
        >
          Document Center
          <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
        </Link>
      </header>

      <ul className="divide-y divide-navy-900/[0.06]">
        {owned.map((listing) => {
          const docCount = documents.filter((d) => d.listingId === listing.id).length;
          const pending = accessRequests.filter(
            (r) => r.listingId === listing.id && r.status === "Requested"
          ).length;
          const approved = accessRequests.filter(
            (r) => r.listingId === listing.id && r.status === "Approved"
          ).length;
          return (
            <li key={listing.id}>
              <Link
                href={`/data-room/${listing.id}`}
                className="group flex items-center gap-3 py-3 hover:bg-bone/40 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-navy-900 text-sm group-hover:text-gold-700 transition-colors truncate">
                      {listing.title}
                    </span>
                    <span
                      className={`inline-flex items-center text-[9px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ${statusTone(listing.status)}`}
                    >
                      {listing.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-navy-700/65 inline-flex items-center gap-3 flex-wrap">
                    <span className="font-semibold uppercase tracking-[0.12em] text-navy-700/55">
                      {listing.id}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FilesIcon className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
                      {docCount} docs
                    </span>
                    {pending > 0 ? (
                      <span className="inline-flex items-center gap-1 text-gold-700">
                        <Clock3 className="h-3 w-3" strokeWidth={2.4} />
                        {pending} pending
                      </span>
                    ) : null}
                    {approved > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" strokeWidth={2.4} />
                        {approved} approved
                      </span>
                    ) : null}
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 text-navy-700/30 group-hover:text-gold-700 transition-colors shrink-0"
                  strokeWidth={2.2}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
