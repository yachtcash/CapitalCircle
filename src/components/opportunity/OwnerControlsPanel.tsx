"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Images,
  FileText,
  Archive,
  Trash2,
  CheckCircle2,
  Copy,
  ShieldCheck,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { canManageListing } from "@/lib/roles";
import type { Opportunity } from "@/data/opportunities";

type Props = {
  opportunity: Opportunity;
};

type DialogKind = "archive" | "close" | "delete" | null;

/**
 * Owner/admin action strip rendered on /opportunity/[slug]. Visible inline
 * above the action panel so the manager can jump straight into edit /
 * gallery / documents without leaving the public surface.
 *
 * Visibility rule: the listing owner always sees it (their opportunity sits
 * in `userOpportunities`); on top of that, `canManageListing` grants the
 * platform owner (Super Admin in this build) the same controls on EVERY
 * listing-backed opportunity — including the seed catalog.
 */
export default function OwnerControlsPanel({ opportunity }: Props) {
  const router = useRouter();
  const {
    listings,
    userOpportunities,
    duplicateListing,
    archiveListing,
    markListingClosed,
    deleteListing,
    currentRole,
  } = useMessaging();

  const isOwned = useMemo(
    () => userOpportunities.some((o) => o.id === opportunity.id),
    [userOpportunities, opportunity.id]
  );

  const listing = useMemo(
    () => listings.find((l) => l.opportunityId === opportunity.id),
    [listings, opportunity.id]
  );

  const [dialog, setDialog] = useState<DialogKind>(null);

  if (!canManageListing(isOwned, currentRole) || !listing) return null;

  const listingHref = `/dashboard/listings/${listing.id}`;
  const dupAndRedirect = () => {
    const newId = duplicateListing(listing.id);
    if (newId) router.push(`/dashboard/listings/${newId}`);
  };

  const onConfirm = () => {
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
    <aside
      aria-label="Owner controls"
      className="bg-navy-900 text-white rounded-2xl ring-1 ring-gold-500/30 shadow-md p-5 md:p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-navy-900 ring-1 ring-gold-400/40">
          <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold-400 font-bold">
            {isOwned ? "Owner controls" : `Admin controls · ${currentRole}`} · {listing.id}
          </div>
          <h3 className="mt-0.5 text-base font-semibold">
            {isOwned ? "You manage this listing" : "You can manage every listing"}
          </h3>
          <p className="mt-0.5 text-xs text-white/75 leading-relaxed">
            Public visitors don&apos;t see these actions. Everything below
            saves directly to the listing — no wizard required.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CTA
          href={`${listingHref}?tab=edit`}
          label="Edit Details"
          icon={Pencil}
          primary
        />
        <CTA
          href={`${listingHref}#gallery-manager`}
          label="Manage Gallery"
          icon={Images}
        />
        <CTA
          href={`${listingHref}?tab=documents`}
          label="Manage Documents"
          icon={FileText}
        />
        <CTA href={listingHref} label="Full Manager" icon={ShieldCheck} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={dupAndRedirect}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-white font-semibold px-3 py-2 text-xs transition-colors"
        >
          <Copy className="h-3.5 w-3.5" strokeWidth={2.4} />
          Duplicate
        </button>
        {listing.status !== "Archived" ? (
          <>
            <button
              type="button"
              onClick={() => setDialog("close")}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-white font-semibold px-3 py-2 text-xs transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
              Mark Closed
            </button>
            <button
              type="button"
              onClick={() => setDialog("archive")}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-white font-semibold px-3 py-2 text-xs transition-colors"
            >
              <Archive className="h-3.5 w-3.5" strokeWidth={2.4} />
              Archive
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => setDialog("delete")}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600/20 hover:bg-rose-600/30 ring-1 ring-rose-500/40 text-rose-200 font-semibold px-3 py-2 text-xs transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={dialog === "archive"}
        title={`Archive ${listing.id}?`}
        body={`“${listing.title}” will be removed from the active marketplace. You can restore it later from My Listings.`}
        confirmLabel="Archive listing"
        onCancel={() => setDialog(null)}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        open={dialog === "close"}
        title={`Mark ${listing.id} as Closed?`}
        body={`“${listing.title}” will be marked Closed. Investors will no longer see it as an active raise.`}
        confirmLabel="Mark Closed"
        onCancel={() => setDialog(null)}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        title={`Permanently delete ${listing.id}?`}
        body={`“${listing.title}”, its gallery, documents, access requests, and activity history will be removed. This cannot be undone.`}
        confirmLabel="Delete listing"
        tone="danger"
        onCancel={() => setDialog(null)}
        onConfirm={onConfirm}
      />
    </aside>
  );
}

function CTA({
  href,
  label,
  icon: Icon,
  primary = false,
}: {
  href: string;
  label: string;
  icon: typeof Pencil;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-3 py-2 text-xs transition-colors"
          : "inline-flex items-center justify-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-white font-semibold px-3 py-2 text-xs transition-colors"
      }
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {label}
    </Link>
  );
}
