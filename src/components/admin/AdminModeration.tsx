"use client";

import Link from "next/link";
import {
  ListChecks,
  Building2,
  HandCoins,
  Flag,
  ShieldAlert,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import { MEMBERS } from "@/data/members";
import { SEED_FLAGGED_MESSAGES, SEED_REPORTS } from "@/data/admin";
import { AdminPage, ActBtn, StatusPill } from "./AdminShell";

export default function AdminModeration() {
  const {
    listings,
    companyAdminState,
    opportunityAdminState,
    memberAdminState,
    verifyCompany,
    approveOpportunity,
    rejectOpportunity,
    activateMember,
  } = useMessaging();

  const pendingListings = listings.filter((l) => l.status === "Draft");
  const pendingCompanies = companies.filter(
    (c) =>
      (companyAdminState[c.id]?.verificationOverride ?? c.verification) === "Pending" &&
      (companyAdminState[c.id]?.status ?? "Active") !== "Deleted"
  );
  const pendingOpps = featuredOpportunities.filter(
    (o) => opportunityAdminState[o.id]?.moderation === "Pending"
  );
  const suspended = MEMBERS.filter(
    (m) => memberAdminState[m.id]?.status === "Suspended"
  );

  return (
    <AdminPage
      title="Content Moderation"
      subtitle="Everything awaiting review — pending submissions, reports, flags, and suspended accounts."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        <Queue Icon={HandCoins} title="Pending Opportunities" count={pendingOpps.length}>
          {pendingOpps.map((o) => (
            <Row
              key={o.id}
              title={o.title}
              meta={`${o.id} · ${o.postedBy}`}
              actions={
                <>
                  <ActBtn onClick={() => approveOpportunity(o.id, o.title)} tone="emerald">
                    Approve
                  </ActBtn>
                  <ActBtn onClick={() => rejectOpportunity(o.id, o.title)} tone="rose">
                    Reject
                  </ActBtn>
                  <ActBtn href={`/admin/opportunities/${o.id}`}>Review</ActBtn>
                </>
              }
            />
          ))}
        </Queue>

        <Queue Icon={Building2} title="Pending Companies" count={pendingCompanies.length}>
          {pendingCompanies.map((c) => (
            <Row
              key={c.id}
              title={c.name}
              meta={`${c.id} · ${c.industry}`}
              actions={
                <>
                  <ActBtn onClick={() => verifyCompany(c.id, c.name)} tone="emerald">
                    Verify
                  </ActBtn>
                  <ActBtn href={`/admin/companies/${c.id}`}>Review</ActBtn>
                </>
              }
            />
          ))}
        </Queue>

        <Queue Icon={ListChecks} title="Pending Listings" count={pendingListings.length}>
          {pendingListings.map((l) => (
            <Row
              key={l.id}
              title={l.title}
              meta={`${l.id} · Draft`}
              actions={<ActBtn href={`/dashboard/listings/${l.id}`}>Review</ActBtn>}
            />
          ))}
        </Queue>

        <Queue Icon={Flag} title="Reported Content" count={SEED_REPORTS.length}>
          {SEED_REPORTS.map((r) => (
            <Row
              key={r.id}
              title={r.targetLabel}
              meta={`${r.id} · ${r.targetKind} · by ${r.reportedBy}`}
              body={r.reason}
              actions={
                <StatusPill label={r.status} tone={r.status === "Open" ? "amber" : "emerald"} />
              }
            />
          ))}
        </Queue>

        <Queue Icon={ShieldAlert} title="Suspended Members" count={suspended.length}>
          {suspended.length === 0 ? (
            <p className="text-sm text-navy-700/55 px-1">No suspended members.</p>
          ) : (
            suspended.map((m) => (
              <Row
                key={m.id}
                title={m.name}
                meta={`${m.id} · ${m.company}`}
                actions={
                  <>
                    <ActBtn onClick={() => activateMember(m.id, m.name)} tone="emerald">
                      Activate
                    </ActBtn>
                    <ActBtn href={`/admin/members/${m.id}`}>Review</ActBtn>
                  </>
                }
              />
            ))
          )}
        </Queue>

        <Queue Icon={MessageSquare} title="Flagged Messages" count={SEED_FLAGGED_MESSAGES.length}>
          {SEED_FLAGGED_MESSAGES.map((f) => (
            <Row
              key={f.id}
              title={f.companyName}
              meta={`${f.id} · ${f.flagReason}`}
              body={`“${f.excerpt}”`}
              actions={
                <Link
                  href={`/messages?conversation=${f.conversationId}`}
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-bold ring-1 bg-white hover:bg-bone text-navy-900 ring-navy-900/10"
                >
                  Open Thread
                </Link>
              }
            />
          ))}
        </Queue>
      </div>
    </AdminPage>
  );
}

function Queue({
  Icon,
  title,
  count,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
      <header className="flex items-center justify-between gap-2 mb-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
          {title}
        </div>
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-navy-900 text-gold-400 text-[11px] font-bold tabular-nums">
          {count}
        </span>
      </header>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Row({
  title,
  meta,
  body,
  actions,
}: {
  title: string;
  meta: string;
  body?: string;
  actions: React.ReactNode;
}) {
  return (
    <article className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.04] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-navy-900 text-sm truncate">{title}</div>
          <div className="text-[11px] text-navy-700/60 mt-0.5 truncate">{meta}</div>
          {body ? (
            <p className="mt-1.5 text-xs text-navy-700/75 leading-relaxed">{body}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">{actions}</div>
      </div>
    </article>
  );
}
