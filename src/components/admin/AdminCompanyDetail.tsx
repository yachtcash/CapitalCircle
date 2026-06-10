"use client";

import { useState } from "react";
import Link from "next/link";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities } from "@/data/opportunities";
import { MEMBERS } from "@/data/members";
import type { Company } from "@/data/companies";
import { AdminPage, ActBtn, StatusPill } from "./AdminShell";
import { formatCurrency, formatDate } from "@/components/dashboard/deals/DealBadges";
import { cn } from "@/lib/cn";

const TABS = ["Overview", "Listings", "Deals", "Members", "Documents", "Activity"] as const;
type Tab = (typeof TABS)[number];

export default function AdminCompanyDetail({ company }: { company: Company }) {
  const {
    companyAdminState,
    deals,
    listings,
    documents,
    auditEvents,
    verifyCompany,
    toggleCompanyFeatured,
  } = useMessaging();
  const [tab, setTab] = useState<Tab>("Overview");

  const admin = companyAdminState[company.id] ?? {};
  const verification = admin.verificationOverride ?? company.verification;
  const featured = admin.featuredOverride ?? !!company.featured;
  const status = admin.status ?? "Active";

  const companyOpps = featuredOpportunities.filter((o) => o.companyId === company.id);
  const oppIds = new Set(companyOpps.map((o) => o.id));
  const companyListings = listings.filter((l) => l.opportunityId && oppIds.has(l.opportunityId));
  const listingIds = new Set(companyListings.map((l) => l.id));
  const companyDeals = deals.filter((d) => d.companyId === company.id);
  const companyMembers = MEMBERS.filter(
    (m) => m.companyId === company.id || m.companySlugs.includes(company.slug)
  );
  const companyDocs = documents.filter((d) => listingIds.has(d.listingId));
  const companyAudit = auditEvents.filter((e) => e.targetId === company.id);

  return (
    <AdminPage title={company.name} subtitle={`${company.id} · ${company.industry} · ${company.headquarters.city}, ${company.headquarters.country}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill
          label={verification}
          tone={verification === "Premium Verified" ? "gold" : verification === "Verified" ? "emerald" : "amber"}
        />
        {featured ? <StatusPill label="Featured" tone="gold" /> : null}
        <StatusPill label={status} tone={status === "Active" ? "emerald" : "rose"} />
        <span className="ml-auto flex gap-1.5">
          <ActBtn href={`/company/${company.slug}`}>Public Page</ActBtn>
          {verification === "Pending" ? (
            <ActBtn onClick={() => verifyCompany(company.id, company.name)} tone="emerald">
              Verify
            </ActBtn>
          ) : null}
          <ActBtn onClick={() => toggleCompanyFeatured(company.id, !featured, company.name)}>
            {featured ? "Unfeature" : "Feature"}
          </ActBtn>
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
          <p className="text-sm text-navy-700/85 leading-relaxed">{company.about.overview}</p>
          <p className="text-xs text-navy-700/65 leading-relaxed">{company.about.trackRecord}</p>
        </div>
      ) : null}

      {tab === "Listings" ? (
        <List
          empty="No platform listings map to this company."
          items={companyListings.map((l) => ({
            key: l.id,
            title: l.title,
            meta: `${l.id} · ${l.status}`,
            href: `/dashboard/listings/${l.id}`,
          }))}
        />
      ) : null}

      {tab === "Deals" ? (
        <List
          empty="No deals reference this company."
          items={companyDeals.map((d) => ({
            key: d.dealId,
            title: d.title,
            meta: `${d.dealId} · ${d.stage} · ${formatCurrency(d.targetInvestment)}`,
            href: `/deal-desk/${d.dealId}`,
          }))}
        />
      ) : null}

      {tab === "Members" ? (
        <List
          empty="No directory members are linked to this company."
          items={companyMembers.map((m) => ({
            key: m.id,
            title: m.name,
            meta: `${m.id} · ${m.memberType} · ${m.title}`,
            href: `/admin/members/${m.id}`,
          }))}
        />
      ) : null}

      {tab === "Documents" ? (
        <List
          empty="No data-room documents belong to this company's listings."
          items={companyDocs.map((d) => ({
            key: d.id,
            title: d.name,
            meta: `${d.id} · ${d.category} · ${d.visibility}`,
            href: `/data-room/${d.listingId}`,
          }))}
        />
      ) : null}

      {tab === "Activity" ? (
        companyAudit.length === 0 ? (
          <p className="text-sm text-navy-700/55">No audit events recorded for this company yet.</p>
        ) : (
          <ul className="space-y-2">
            {companyAudit.map((e) => (
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

function List({
  items,
  empty,
}: {
  items: { key: string; title: string; meta: string; href: string }[];
  empty: string;
}) {
  if (items.length === 0) return <p className="text-sm text-navy-700/55">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.key}>
          <Link
            href={i.href}
            className="block rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 hover:ring-gold-500/40 transition-all"
          >
            <div className="font-semibold text-navy-900 text-sm">{i.title}</div>
            <div className="text-[11px] text-navy-700/60 mt-0.5">{i.meta}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
