"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImages } from "@/lib/imageStore";
import type { Opportunity } from "@/data/opportunities";
import { AdminPage, ActBtn, StatusPill } from "./AdminShell";
import { formatCurrency, formatDate } from "@/components/dashboard/deals/DealBadges";
import { cn } from "@/lib/cn";

const TABS = ["Overview", "Images", "Documents", "Deals", "Introductions", "Activity"] as const;
type Tab = (typeof TABS)[number];

export default function AdminOpportunityDetail({ opportunity: seed }: { opportunity: Opportunity }) {
  const {
    getOpportunity,
    opportunityAdminState,
    deals,
    introductionRequests,
    listings,
    documents,
    auditEvents,
    approveOpportunity,
    rejectOpportunity,
    hydrated,
  } = useMessaging();
  const [tab, setTab] = useState<Tab>("Overview");

  const opportunity = (hydrated ? getOpportunity(seed.id) : undefined) ?? seed;
  const admin = opportunityAdminState[opportunity.id] ?? {};
  const moderation = admin.moderation ?? "Approved";

  const listing = listings.find((l) => l.opportunityId === opportunity.id);
  const oppDeals = deals.filter(
    (d) => d.opportunityId === opportunity.id || d.opportunitySlug === opportunity.slug
  );
  const oppIntros = introductionRequests.filter(
    (r) => r.opportunitySlug === opportunity.slug
  );
  const oppDocs = listing ? documents.filter((d) => d.listingId === listing.id) : [];
  const oppAudit = auditEvents.filter((e) => e.targetId === opportunity.id);
  const resolvedImages = useResolvedImages(opportunity.images);

  return (
    <AdminPage
      title={opportunity.title}
      subtitle={`${opportunity.id} · ${opportunity.category} · ${opportunity.postedBy}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill
          label={moderation}
          tone={moderation === "Approved" ? "emerald" : moderation === "Pending" ? "amber" : "rose"}
        />
        {admin.archived ? <StatusPill label="Archived" tone="navy" /> : null}
        <StatusPill label={formatCurrency(opportunity.fundingAmount)} tone="gold" />
        <span className="ml-auto flex gap-1.5">
          <ActBtn href={`/opportunity/${opportunity.slug}`}>Public Page</ActBtn>
          {listing ? (
            <ActBtn href={`/dashboard/listings/${listing.id}?tab=edit`}>Edit</ActBtn>
          ) : null}
          {moderation !== "Approved" ? (
            <ActBtn onClick={() => approveOpportunity(opportunity.id, opportunity.title)} tone="emerald">
              Approve
            </ActBtn>
          ) : null}
          {moderation !== "Rejected" ? (
            <ActBtn onClick={() => rejectOpportunity(opportunity.id, opportunity.title)} tone="rose">
              Reject
            </ActBtn>
          ) : null}
        </span>
      </div>

      <div className="flex flex-wrap gap-0.5 border-b border-navy-900/[0.06]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "relative px-3 py-2.5 text-sm font-semibold transition-colors",
              tab === t ? "text-navy-900" : "text-navy-700/60 hover:text-navy-900"
            )}
          >
            {t}
            <span
              className={cn(
                "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold-500 transition-opacity",
                tab === t ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 space-y-3">
          <p className="text-sm text-navy-700/85 leading-relaxed">{opportunity.executiveSummary}</p>
          <div className="text-xs text-navy-700/65">
            {opportunity.location} · {opportunity.dealType} · {opportunity.investmentRange}
          </div>
        </div>
      ) : null}

      {tab === "Images" ? (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {resolvedImages.map((src, i) =>
              src ? (
                <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-navy-900/5 ring-1 ring-navy-900/[0.06]">
                  <Image src={src} alt={`Photo ${i + 1}`} fill sizes="320px" className="object-cover" unoptimized />
                </div>
              ) : null
            )}
          </div>
          {listing ? (
            <div className="mt-3">
              <ActBtn href={`/dashboard/listings/${listing.id}#gallery-manager`} tone="gold">
                Open Gallery Manager
              </ActBtn>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "Documents" ? (
        oppDocs.length === 0 ? (
          <p className="text-sm text-navy-700/55">No data-room documents for this opportunity.</p>
        ) : (
          <ul className="space-y-2">
            {oppDocs.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/data-room/${d.listingId}`}
                  className="block rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 hover:ring-gold-500/40 transition-all"
                >
                  <div className="font-semibold text-navy-900 text-sm">{d.name}</div>
                  <div className="text-[11px] text-navy-700/60 mt-0.5">
                    {d.id} · {d.category} · {d.visibility}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "Deals" ? (
        oppDeals.length === 0 ? (
          <p className="text-sm text-navy-700/55">No deals reference this opportunity.</p>
        ) : (
          <ul className="space-y-2">
            {oppDeals.map((d) => (
              <li key={d.dealId}>
                <Link
                  href={`/deal-desk/${d.dealId}`}
                  className="block rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 hover:ring-gold-500/40 transition-all"
                >
                  <div className="font-semibold text-navy-900 text-sm">{d.title}</div>
                  <div className="text-[11px] text-navy-700/60 mt-0.5">
                    {d.dealId} · {d.stage} · {formatCurrency(d.targetInvestment)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "Introductions" ? (
        oppIntros.length === 0 ? (
          <p className="text-sm text-navy-700/55">No introductions reference this opportunity.</p>
        ) : (
          <ul className="space-y-2">
            {oppIntros.map((r) => (
              <li key={r.id} className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 text-sm">
                <span className="font-semibold text-navy-900">
                  {r.requesterName} → {r.targetMemberName}
                </span>
                <div className="text-[11px] text-navy-700/60 mt-0.5">
                  {r.id} · {r.status} · {formatDate(r.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "Activity" ? (
        oppAudit.length === 0 ? (
          <p className="text-sm text-navy-700/55">No audit events recorded for this opportunity yet.</p>
        ) : (
          <ul className="space-y-2">
            {oppAudit.map((e) => (
              <li key={e.id} className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 text-sm">
                <span className="font-semibold text-navy-900">{e.action}</span>
                <span className="text-navy-700/65"> — {e.detail ?? ""}</span>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold">
                  {e.actorName} · {e.actorRole} · {formatDate(e.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </AdminPage>
  );
}
