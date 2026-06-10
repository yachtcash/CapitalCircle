"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  HandCoins,
  ListChecks,
  Briefcase,
  UserPlus,
  MessageSquare,
  FileText,
  Clock,
  Flag,
  ShieldAlert,
  ScrollText,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import { SEED_FLAGGED_MESSAGES, SEED_REPORTS } from "@/data/admin";
import { AdminPage } from "./AdminShell";
import { cn } from "@/lib/cn";

export default function AdminDashboard() {
  const {
    listings,
    deals,
    introductionRequests,
    conversations,
    documents,
    userOpportunities,
    memberAdminState,
    companyAdminState,
    opportunityAdminState,
    auditEvents,
  } = useMessaging();

  const activeMembers = MEMBERS.filter(
    (m) => (memberAdminState[m.id]?.status ?? "Active") !== "Deleted"
  ).length;
  const suspendedMembers = MEMBERS.filter(
    (m) => memberAdminState[m.id]?.status === "Suspended"
  ).length;
  const activeCompanies = companies.filter(
    (c) => (companyAdminState[c.id]?.status ?? "Active") !== "Deleted"
  ).length;
  const totalOpps =
    featuredOpportunities.filter((o) => !opportunityAdminState[o.id]?.deleted).length +
    userOpportunities.length;
  const pendingOpps = Object.values(opportunityAdminState).filter(
    (s) => s.moderation === "Pending"
  ).length;
  const pendingIntros = introductionRequests.filter((r) => r.status === "Pending").length;
  const pendingCompanies = companies.filter(
    (c) =>
      (companyAdminState[c.id]?.verificationOverride ?? c.verification) === "Pending"
  ).length;
  const pendingApprovals = pendingOpps + pendingIntros + pendingCompanies;
  const flagged =
    SEED_REPORTS.filter((r) => r.status === "Open").length +
    SEED_FLAGGED_MESSAGES.filter((f) => f.status === "Open").length;

  const cards: {
    label: string;
    value: number;
    Icon: typeof Users;
    href: string;
    tone?: "gold" | "rose" | "amber";
  }[] = [
    { label: "Members", value: activeMembers, Icon: Users, href: "/admin/members" },
    { label: "Companies", value: activeCompanies, Icon: Building2, href: "/admin/companies" },
    { label: "Opportunities", value: totalOpps, Icon: HandCoins, href: "/admin/opportunities" },
    { label: "Listings", value: listings.length, Icon: ListChecks, href: "/admin/listings" },
    { label: "Deals", value: deals.length, Icon: Briefcase, href: "/admin/deals" },
    { label: "Introductions", value: introductionRequests.length, Icon: UserPlus, href: "/admin/introductions" },
    { label: "Messages", value: conversations.length, Icon: MessageSquare, href: "/messages" },
    { label: "Documents", value: documents.length, Icon: FileText, href: "/documents" },
    { label: "Pending Approvals", value: pendingApprovals, Icon: Clock, href: "/admin/moderation", tone: "amber" },
    { label: "Flagged Content", value: flagged, Icon: Flag, href: "/admin/moderation", tone: "rose" },
    { label: "Suspended Members", value: suspendedMembers, Icon: ShieldAlert, href: "/admin/moderation", tone: "rose" },
    { label: "Audit Events", value: auditEvents.length, Icon: ScrollText, href: "/admin", tone: "gold" },
  ];

  return (
    <AdminPage
      title="Executive Dashboard"
      subtitle="Live counts across the entire platform. Every card opens the matching management surface."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {cards.map(({ label, value, Icon, href, tone }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "rounded-2xl ring-1 p-4 md:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
              tone === "amber"
                ? "bg-amber-500/[0.07] ring-amber-500/30"
                : tone === "rose"
                  ? "bg-rose-500/[0.06] ring-rose-500/30"
                  : tone === "gold"
                    ? "bg-gold-500/[0.08] ring-gold-500/40"
                    : "bg-white ring-navy-900/[0.06]"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/65 truncate">
                {label}
              </span>
              <Icon className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2.2} />
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-navy-900 tabular-nums">
              {value.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-navy-900 text-white p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-400 font-bold">
          Recent audit events
        </div>
        {auditEvents.length === 0 ? (
          <p className="mt-2 text-sm text-white/65">
            No audit events yet. Every privileged action — role changes,
            suspensions, approvals, deletions — lands here automatically.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {auditEvents.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center gap-3 text-sm">
                <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-gold-400 tabular-nums shrink-0">
                  {e.id}
                </span>
                <span className="font-semibold">{e.action}</span>
                <span className="text-white/60 truncate">
                  {e.targetLabel ?? e.targetId}
                  {e.detail ? ` — ${e.detail}` : ""}
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-white/45 shrink-0">
                  {e.actorRole}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}
