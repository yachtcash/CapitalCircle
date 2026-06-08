"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ConversationListItem from "./ConversationListItem";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { getCompanyById } from "@/data/companies";
import type { Conversation } from "@/data/messages";
import { cn } from "@/lib/cn";

function initialsForName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ACTIVE_STAGES = new Set([
  "Discussion Active",
  "Documents Shared",
  "Negotiation Active",
  "Under Review",
]);

type Filter = "all" | "unread" | "active";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function ConversationList({ selectedId, onSelect }: Props) {
  const { conversations, hydrated, totalUnreadConversations } = useMessaging();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const activeCount = useMemo(
    () => conversations.filter((c) => ACTIVE_STAGES.has(c.stage)).length,
    [conversations]
  );

  const filtered = useMemo<Conversation[]>(() => {
    const needle = query.trim().toLowerCase();
    let pool = [...conversations];
    if (filter === "unread") pool = pool.filter((c) => c.unreadCount > 0);
    if (filter === "active") pool = pool.filter((c) => ACTIVE_STAGES.has(c.stage));
    const sorted = pool.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    if (!needle) return sorted;
    return sorted.filter((c) => {
      const company = getCompanyById(c.companyId)?.name ?? "";
      const haystack = [
        company,
        c.opportunityTitle ?? "",
        c.opportunityCategory ?? "",
        c.opportunityLocation ?? "",
        c.lastMessagePreview,
      ]
        .join("\n")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [conversations, query, filter]);

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 md:px-5 py-4 border-b border-navy-900/[0.08] bg-white">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
              Inbox
            </div>
            <h2 className="mt-1 text-lg font-semibold text-navy-900">Conversations</h2>
          </div>
          {totalUnreadConversations > 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold bg-gold-500 text-navy-900 rounded-full px-2 py-0.5">
              {totalUnreadConversations} unread
            </span>
          ) : null}
        </div>

        <div className="mt-3 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50"
            strokeWidth={2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, opportunity, or message"
            className="w-full rounded-full bg-bone/60 ring-1 ring-navy-900/[0.06] focus:ring-2 focus:ring-gold-500 outline-none pl-9 pr-9 py-2 text-sm text-navy-900 placeholder:text-navy-700/45 transition-shadow"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-navy-900/[0.05]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")} count={conversations.length}>
            All
          </FilterPill>
          <FilterPill
            active={filter === "unread"}
            onClick={() => setFilter("unread")}
            count={totalUnreadConversations}
            tone="gold"
          >
            Unread
          </FilterPill>
          <FilterPill active={filter === "active"} onClick={() => setFilter("active")} count={activeCount}>
            Negotiating
          </FilterPill>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto divide-y divide-navy-900/[0.04]">
        {hydrated && filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-navy-700/60">
              {query ? "No conversations match your search." : "No conversations yet."}
            </p>
          </div>
        ) : null}
        {filtered.map((conversation) => {
          const company = getCompanyById(conversation.companyId);
          const name = company?.name ?? conversation.companyId;
          return (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              companyName={name}
              initials={initialsForName(name)}
              selected={selectedId === conversation.id}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  count,
  children,
  tone = "navy",
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
  tone?: "navy" | "gold";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em] font-bold transition-colors ring-1",
        active
          ? tone === "gold"
            ? "bg-gold-500 text-navy-900 ring-gold-600"
            : "bg-navy-900 text-white ring-navy-900"
          : "bg-white text-navy-700/70 ring-navy-900/[0.08] hover:ring-navy-900/30"
      )}
    >
      {children}
      <span
        className={cn(
          "tabular-nums",
          active ? "opacity-100" : "opacity-60"
        )}
      >
        {count}
      </span>
    </button>
  );
}
