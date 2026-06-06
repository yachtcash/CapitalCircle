"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ConversationListItem from "./ConversationListItem";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { getCompanyById } from "@/data/companies";
import type { Conversation } from "@/data/messages";

function initialsForName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function ConversationList({ selectedId, onSelect }: Props) {
  const { conversations, hydrated } = useMessaging();
  const [query, setQuery] = useState("");

  const filtered = useMemo<Conversation[]>(() => {
    const needle = query.trim().toLowerCase();
    const sorted = [...conversations].sort((a, b) =>
      b.lastMessageAt.localeCompare(a.lastMessageAt)
    );
    if (!needle) return sorted;
    return sorted.filter((c) => {
      const company = getCompanyById(c.companyId)?.name ?? "";
      const haystack = [
        company,
        c.opportunityTitle ?? "",
        c.lastMessagePreview,
      ]
        .join("\n")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [conversations, query]);

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 md:px-5 py-4 border-b border-navy-900/[0.08] bg-white">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Inbox
        </div>
        <h2 className="mt-1 text-lg font-semibold text-navy-900">Conversations</h2>
        <div className="mt-3 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50"
            strokeWidth={2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-full bg-bone/60 ring-1 ring-navy-900/[0.06] focus:ring-2 focus:ring-gold-500 outline-none pl-9 pr-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/45 transition-shadow"
          />
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
