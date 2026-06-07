"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import type { AccessRequest } from "@/data/documents";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { getListingById } from "@/data/listings";
import AccessStatusBadge from "./AccessStatusBadge";

function formatRelative(iso: string): string {
  const then = new Date(iso);
  const now = new Date("2026-06-06T12:00:00.000Z");
  const diffMs = now.getTime() - then.getTime();
  const diffHr = Math.round(diffMs / 3_600_000);
  if (diffHr < 1) return "just now";
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type Props = {
  request: AccessRequest;
  showListing?: boolean;
};

export default function AccessRequestRow({ request, showListing = false }: Props) {
  const { approveAccessRequest, denyAccessRequest } = useMessaging();
  const pending = request.status === "Requested";
  const listing = showListing ? getListingById(request.listingId) : undefined;

  return (
    <article className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-4 md:p-5 hover:bg-bone/30 transition-colors">
      <div className="shrink-0 h-11 w-11 rounded-full bg-navy-900 text-gold-500 ring-1 ring-navy-900/10 flex items-center justify-center text-xs font-semibold">
        {request.requesterInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-navy-900 text-sm md:text-[15px]">
            {request.requesterName}
          </span>
          {request.requesterCompany ? (
            <span className="text-[11px] uppercase tracking-[0.12em] text-gold-600 font-semibold">
              {request.requesterCompany}
            </span>
          ) : null}
          <AccessStatusBadge status={request.status} />
        </div>
        {showListing && listing ? (
          <div className="mt-1 text-[11px] text-navy-700/65">
            For{" "}
            <Link
              href={`/data-room/${listing.id}`}
              className="font-semibold text-navy-900 hover:text-gold-700 transition-colors"
            >
              {listing.title}
            </Link>{" "}
            ({listing.id})
          </div>
        ) : null}
        {request.message ? (
          <p className="mt-2 text-sm text-navy-700/85 leading-relaxed">
            &ldquo;{request.message}&rdquo;
          </p>
        ) : null}
        <div className="mt-2 text-[11px] text-navy-700/55">
          Requested {formatRelative(request.requestedAt)}
          {request.decidedAt ? ` · Decided ${formatRelative(request.decidedAt)}` : ""}
        </div>
      </div>

      {pending ? (
        <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:items-stretch sm:gap-1.5">
          <button
            type="button"
            onClick={() => approveAccessRequest(request.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
            Approve
          </button>
          <button
            type="button"
            onClick={() => denyAccessRequest(request.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white hover:bg-bone text-navy-900 ring-1 ring-navy-900/10 hover:ring-navy-900/25 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            Deny
          </button>
        </div>
      ) : null}
    </article>
  );
}
