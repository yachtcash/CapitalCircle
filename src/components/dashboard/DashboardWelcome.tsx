"use client";

import { Crown, LayoutDashboard } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";

export default function DashboardWelcome() {
  const {
    hydrated,
    listings,
    conversations,
    savedOpportunityIds,
    totalUnreadConversations,
  } = useMessaging();

  const activeListingsCount = listings.filter(
    (l) =>
      l.status !== "Draft" && l.status !== "Archived" && l.status !== "Closed"
  ).length;
  const negotiationsCount = conversations.length;
  const savedCount = savedOpportunityIds.length;

  return (
    <section className="rounded-2xl bg-navy-900 text-white ring-1 ring-navy-900/10 overflow-hidden">
      <div className="px-5 md:px-8 py-6 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-500 font-semibold inline-flex items-center gap-1.5">
            <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2.2} />
            Dashboard
          </div>
          <h1 className="mt-1.5 text-2xl md:text-3xl font-semibold tracking-tight">
            Welcome back, Stevie.
          </h1>
          <p className="mt-2 text-sm text-white/65 inline-flex items-center gap-2">
            <Crown className="h-3.5 w-3.5 text-gold-400" strokeWidth={2.2} />
            <span className="uppercase tracking-[0.16em] text-[11px] font-semibold text-gold-400">
              Founding Member
            </span>
            <span className="text-white/40">·</span>
            <span>Private deal flow at a glance.</span>
          </p>
        </div>

        <dl className="grid grid-cols-4 gap-3 md:gap-6 md:shrink-0">
          <StatPill
            label="Listings"
            value={hydrated ? activeListingsCount : null}
          />
          <StatPill
            label="Negotiations"
            value={hydrated ? negotiationsCount : null}
          />
          <StatPill label="Saved" value={hydrated ? savedCount : null} />
          <StatPill
            label="Unread"
            value={hydrated ? totalUnreadConversations : null}
          />
        </dl>
      </div>
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center md:text-left">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-gold-400 font-semibold">
        {label}
      </dt>
      <dd className="mt-0.5 text-xl md:text-2xl font-semibold tracking-tight text-white">
        {value === null ? "—" : value}
      </dd>
    </div>
  );
}
