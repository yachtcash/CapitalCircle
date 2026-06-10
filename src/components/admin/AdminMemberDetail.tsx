"use client";

import { useState } from "react";
import Link from "next/link";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { ROLES, canManageRoles, type Role } from "@/lib/roles";
import type { Member } from "@/data/members";
import { AdminPage, ActBtn, StatusPill } from "./AdminShell";
import { formatDate, formatCurrency } from "@/components/dashboard/deals/DealBadges";
import { cn } from "@/lib/cn";

const TABS = ["Overview", "Listings", "Deals", "Introductions", "Messages", "Activity", "Permissions"] as const;
type Tab = (typeof TABS)[number];

export default function AdminMemberDetail({ member }: { member: Member }) {
  const {
    memberAdminState,
    deals,
    introductionRequests,
    conversations,
    auditEvents,
    listings,
    userOpportunities,
    setMemberRole,
    suspendMember,
    activateMember,
    currentRole,
  } = useMessaging();
  const [tab, setTab] = useState<Tab>("Overview");

  const admin = memberAdminState[member.id] ?? {};
  const role: Role = admin.role ?? "Member";
  const status = admin.status ?? "Active";

  const memberDeals = deals.filter(
    (d) => d.sponsor.memberId === member.id || d.investor?.memberId === member.id
  );
  const memberIntros = introductionRequests.filter(
    (r) => r.requesterId === member.id || r.targetMemberId === member.id
  );
  const memberAudit = auditEvents.filter((e) => e.targetId === member.id);
  // Listings owned by this member's opportunities (best-effort via slug links).
  const memberListings = listings.filter(
    (l) =>
      (l.opportunitySlug && member.opportunitySlugs.includes(l.opportunitySlug)) ||
      userOpportunities.some((o) => o.id === l.opportunityId)
  );

  return (
    <AdminPage title={member.name} subtitle={`${member.id} · ${member.memberType} · ${member.company}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill label={role} tone="navy" />
        <StatusPill label={status} tone={status === "Active" ? "emerald" : "rose"} />
        <StatusPill label={member.verification} tone="sky" />
        <span className="ml-auto flex gap-1.5">
          <ActBtn href={`/member/${member.slug}`}>Public Profile</ActBtn>
          {status === "Active" ? (
            <ActBtn onClick={() => suspendMember(member.id, member.name)} tone="rose">
              Suspend
            </ActBtn>
          ) : (
            <ActBtn onClick={() => activateMember(member.id, member.name)} tone="emerald">
              Activate
            </ActBtn>
          )}
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
          <p className="text-sm text-navy-700/85 leading-relaxed">{member.about}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Fact label="Location" value={`${member.city}, ${member.country}`} />
            <Fact label="Joined" value={String(member.joinedYear)} />
            <Fact label="Industry" value={member.industry} />
            <Fact label="Listings" value={String(member.listingsCount)} />
          </div>
        </div>
      ) : null}

      {tab === "Listings" ? (
        <CardList
          empty="No listings linked to this member."
          items={memberListings.map((l) => ({
            key: l.id,
            title: l.title,
            meta: `${l.id} · ${l.status}`,
            href: `/dashboard/listings/${l.id}`,
          }))}
        />
      ) : null}

      {tab === "Deals" ? (
        <CardList
          empty="No deals involve this member."
          items={memberDeals.map((d) => ({
            key: d.dealId,
            title: d.title,
            meta: `${d.dealId} · ${d.stage} · ${formatCurrency(d.targetInvestment)}`,
            href: `/deal-desk/${d.dealId}`,
          }))}
        />
      ) : null}

      {tab === "Introductions" ? (
        <CardList
          empty="No introductions involve this member."
          items={memberIntros.map((r) => ({
            key: r.id,
            title: `${r.requesterName} → ${r.targetMemberName}`,
            meta: `${r.id} · ${r.status} · ${formatDate(r.createdAt)}`,
            href: "/admin/introductions",
          }))}
        />
      ) : null}

      {tab === "Messages" ? (
        <CardList
          empty="No conversations are attributable to this member (messaging is company-scoped)."
          items={conversations
            .filter((c) => member.companySlugs.length > 0 && c.companyId === member.companyId)
            .map((c) => ({
              key: c.id,
              title: c.opportunityTitle ?? "Direct conversation",
              meta: `${c.messages.length} messages · ${c.stage}`,
              href: `/messages?conversation=${c.id}`,
            }))}
        />
      ) : null}

      {tab === "Activity" ? (
        memberAudit.length === 0 ? (
          <p className="text-sm text-navy-700/55">No audit events recorded for this member yet.</p>
        ) : (
          <ul className="space-y-2">
            {memberAudit.map((e) => (
              <li key={e.id} className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 text-sm">
                <span className="font-semibold text-navy-900">{e.action}</span>
                <span className="text-navy-700/65"> — {e.detail ?? e.targetLabel ?? ""}</span>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold">
                  {e.actorName} · {e.actorRole} · {formatDate(e.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "Permissions" ? (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 space-y-4 max-w-lg">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-1.5">
              Platform role
            </div>
            {canManageRoles(currentRole) ? (
              <select
                value={role}
                onChange={(e) => setMemberRole(member.id, e.target.value as Role, member.name)}
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/[0.06] px-3 py-2 text-sm text-navy-900"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-navy-700/65">
                Role changes require Super Admin. You are {currentRole}.
              </p>
            )}
          </div>
          <p className="text-xs text-navy-700/60 leading-relaxed">
            Promotions, demotions, and role removals are recorded in the audit
            stream and apply immediately across every admin gate.
          </p>
        </div>
      ) : null}
    </AdminPage>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
        {label}
      </div>
      <div className="mt-0.5 font-semibold text-navy-900">{value}</div>
    </div>
  );
}

function CardList({
  items,
  empty,
}: {
  items: { key: string; title: string; meta: string; href: string }[];
  empty: string;
}) {
  if (items.length === 0)
    return <p className="text-sm text-navy-700/55">{empty}</p>;
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
