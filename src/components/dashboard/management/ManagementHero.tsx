"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Pencil,
  Copy,
  Archive,
  CheckCircle2,
  RotateCcw,
  Tag,
  Briefcase,
  Clock,
  ExternalLink,
  Trash2,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ActionToast, { useActionToast } from "@/components/ui/ActionToast";
import { useResolvedImage } from "@/lib/imageStore";
import type { ListingRecord, ListingStatus } from "@/data/listings";
import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import ReportButton from "@/components/moderation/ReportButton";
import { cn } from "@/lib/cn";

const statusStyles: Record<ListingStatus, string> = {
  Draft: "bg-navy-900/10 text-navy-700 ring-navy-900/15",
  Active: "bg-emerald-500 text-white ring-emerald-500/30",
  "Seeking Capital": "bg-gold-500 text-navy-900 ring-gold-500/30",
  Negotiating: "bg-amber-500 text-white ring-amber-500/30",
  "Under Review": "bg-sky-500 text-white ring-sky-500/30",
  Closed: "bg-rose-500 text-white ring-rose-500/30",
  Archived: "bg-navy-900 text-gold-400 ring-navy-900/30",
};

function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold rounded-full px-3 py-1 ring-1",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}

function relativeFromNow(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return `${years} yr ago`;
}

type Props = {
  listing: ListingRecord;
  opportunity?: Opportunity;
  company?: Company;
};

type DialogKind = "archive" | "close" | "delete" | null;

export default function ManagementHero({ listing, opportunity }: Props) {
  const router = useRouter();
  const {
    duplicateListing,
    archiveListing,
    markListingClosed,
    restoreListing,
    deleteListing,
  } = useMessaging();

  const { toast, show: showToast, dismiss: dismissToast } = useActionToast();
  const [dialog, setDialog] = useState<DialogKind>(null);

  const coverImage = useResolvedImage(opportunity?.images?.[0]);

  const handleDuplicate = () => {
    const newId = duplicateListing(listing.id);
    if (newId) {
      showToast(`Listing duplicated as ${newId}`, {
        href: `/dashboard/listings/${newId}`,
        linkLabel: "Open new listing",
      });
    }
  };

  const handleRestore = () => restoreListing(listing.id);
  const isArchived = listing.status === "Archived";

  const handleConfirm = () => {
    switch (dialog) {
      case "archive":
        archiveListing(listing.id);
        setDialog(null);
        router.push("/dashboard/listings");
        break;
      case "close":
        markListingClosed(listing.id);
        setDialog(null);
        break;
      case "delete":
        deleteListing(listing.id);
        setDialog(null);
        router.push("/dashboard/listings");
        break;
      default:
        setDialog(null);
    }
  };

  return (
    <section className="bg-white">
      {/* Cover band */}
      <div className="relative h-44 md:h-64 bg-navy-900 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={`${listing.title} — cover`}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-95"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgb(15,23,42) 0%, rgb(30,41,59) 55%, rgb(15,23,42) 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-navy-900/10 to-navy-900/55 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/45 to-transparent pointer-events-none" />

        {/* Breadcrumb */}
        <nav className="relative max-w-6xl mx-auto px-5 md:px-10 pt-6 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/85">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <Link
            href="/dashboard/listings"
            className="hover:text-white transition-colors"
          >
            Listings
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <span className="text-white">{listing.id}</span>
        </nav>
      </div>

      {/* Identity card overlapping cover */}
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        <div className="relative -mt-12 md:-mt-14 bg-white rounded-2xl ring-1 ring-navy-900/[0.06] shadow-sm p-5 md:p-7">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] font-semibold bg-navy-900/5 text-navy-700 ring-1 ring-navy-900/10 rounded-full px-2.5 py-1">
                  <Tag className="h-3 w-3" strokeWidth={2.4} />
                  {listing.id}
                </span>
                <StatusBadge status={listing.status} />
                {listing.category ? (
                  <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold bg-bone text-navy-900 ring-1 ring-navy-900/10 rounded-full px-3 py-1">
                    {listing.category}
                  </span>
                ) : null}
                {listing.dealType ? (
                  <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/30 rounded-full px-3 py-1">
                    {listing.dealType}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
                {opportunity?.slug ? (
                  <Link
                    href={`/opportunity/${opportunity.slug}`}
                    className="inline-flex items-center gap-2 hover:text-gold-700 transition-colors"
                  >
                    {listing.title}
                    <ExternalLink
                      className="h-4 w-4 text-navy-700/50"
                      strokeWidth={2}
                    />
                  </Link>
                ) : (
                  listing.title
                )}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-700/75">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Last updated {relativeFromNow(listing.lastUpdatedAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-gold-600" strokeWidth={2} />
                  Created {relativeFromNow(listing.createdAt)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
              <Link
                href={`/dashboard/listings/${listing.id}?tab=edit`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} />
                Edit Details
              </Link>
              <button
                type="button"
                onClick={handleDuplicate}
                className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-bone text-navy-900 font-semibold ring-1 ring-navy-900/10 px-4 py-2 text-xs transition-colors"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={2.4} />
                Duplicate
              </button>
              {isArchived ? (
                <button
                  type="button"
                  onClick={handleRestore}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-bone text-navy-900 font-semibold ring-1 ring-navy-900/10 px-4 py-2 text-xs transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.4} />
                  Restore
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setDialog("archive")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-bone text-navy-900 font-semibold ring-1 ring-navy-900/10 px-4 py-2 text-xs transition-colors"
                  >
                    <Archive className="h-3.5 w-3.5" strokeWidth={2.4} />
                    Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialog("close")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-bone text-navy-900 font-semibold ring-1 ring-navy-900/10 px-4 py-2 text-xs transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                    Mark Closed
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setDialog("delete")}
                className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-rose-500/10 text-rose-700 font-semibold ring-1 ring-rose-500/30 px-4 py-2 text-xs transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                Delete
              </button>
              <ReportButton
                targetKind="listing"
                targetId={listing.id}
                targetLabel={listing.title}
                variant="button"
              />
            </div>
          </div>

          <ActionToast toast={toast} onDismiss={dismissToast} />
        </div>
      </div>

      <ConfirmDialog
        open={dialog === "archive"}
        title={`Archive ${listing.id}?`}
        body={`“${listing.title}” will be removed from the active marketplace. You can restore it later from My Listings.`}
        confirmLabel="Archive listing"
        onCancel={() => setDialog(null)}
        onConfirm={handleConfirm}
      />
      <ConfirmDialog
        open={dialog === "close"}
        title={`Mark ${listing.id} as Closed?`}
        body={`“${listing.title}” will be marked Closed. Investors will no longer see it as an active raise. You can still view it from My Listings.`}
        confirmLabel="Mark Closed"
        onCancel={() => setDialog(null)}
        onConfirm={handleConfirm}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        title={`Permanently delete ${listing.id}?`}
        body={`“${listing.title}”, its gallery, documents, access requests, and activity history will be removed. This cannot be undone.`}
        confirmLabel="Delete listing"
        tone="danger"
        onCancel={() => setDialog(null)}
        onConfirm={handleConfirm}
      />
    </section>
  );
}
