"use client";

import Link from "next/link";
import {
  Briefcase,
  Bookmark,
  Building2,
  Handshake,
  MessageSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { NegotiationStage } from "@/data/negotiations";
import { cn } from "@/lib/cn";

const ACTIVE_NEGOTIATION_STAGES: NegotiationStage[] = [
  "Discussion Active",
  "Documents Shared",
  "Negotiation Active",
  "Under Review",
];

type Tile = {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: "navy" | "gold" | "sky" | "emerald" | "amber" | "rose";
  href?: string;
};

const ACCENT_STYLES: Record<Tile["accent"], string> = {
  navy: "bg-navy-900/[0.06] text-navy-900 ring-navy-900/10",
  gold: "bg-gold-500/15 text-gold-700 ring-gold-500/40",
  sky: "bg-sky-500/15 text-sky-700 ring-sky-500/35",
  emerald: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/35",
  amber: "bg-amber-500/15 text-amber-700 ring-amber-500/40",
  rose: "bg-rose-500/15 text-rose-700 ring-rose-500/35",
};

export default function DashboardStats() {
  const {
    hydrated,
    listings,
    conversations,
    savedOpportunityIds,
    savedCompanyIds,
    totalUnreadConversations,
  } = useMessaging();

  const activeListings = listings.filter(
    (l) =>
      l.status !== "Draft" && l.status !== "Archived" && l.status !== "Closed"
  ).length;

  const activeNegotiations = conversations.filter((c) =>
    ACTIVE_NEGOTIATION_STAGES.includes(c.stage)
  ).length;

  const interestsReceived = listings.reduce(
    (sum, l) => sum + (l.interests ?? 0),
    0
  );

  const tiles: Tile[] = [
    {
      label: "Active Listings",
      value: activeListings,
      icon: Briefcase,
      accent: "emerald",
      href: "/dashboard/listings",
    },
    {
      label: "Saved Opportunities",
      value: savedOpportunityIds.length,
      icon: Bookmark,
      accent: "gold",
      href: "/profile",
    },
    {
      label: "Saved Companies",
      value: savedCompanyIds.length,
      icon: Building2,
      accent: "navy",
      href: "/profile",
    },
    {
      label: "Active Negotiations",
      value: activeNegotiations,
      icon: Handshake,
      accent: "amber",
      href: "/messages",
    },
    {
      label: "New Messages",
      value: totalUnreadConversations,
      icon: MessageSquare,
      accent: "sky",
      href: "/messages",
    },
    {
      label: "Interests Received",
      value: interestsReceived,
      icon: Sparkles,
      accent: "rose",
    },
  ];

  return (
    <section
      aria-label="Workspace stats"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
    >
      {tiles.map((tile) => (
        <StatTile key={tile.label} tile={tile} hydrated={hydrated} />
      ))}
    </section>
  );
}

function StatTile({ tile, hydrated }: { tile: Tile; hydrated: boolean }) {
  const Icon = tile.icon;
  const Wrapper: React.ElementType = tile.href ? Link : "div";
  const wrapperProps = tile.href ? { href: tile.href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "group bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-4 md:p-5 flex flex-col gap-3",
        tile.href && "hover:shadow-md hover:shadow-navy-900/5 transition-shadow"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "h-8 w-8 rounded-xl flex items-center justify-center ring-1",
            ACCENT_STYLES[tile.accent]
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-semibold tracking-tight text-navy-900 leading-none">
          {hydrated ? tile.value : "—"}
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold leading-snug">
          {tile.label}
        </div>
      </div>
    </Wrapper>
  );
}
