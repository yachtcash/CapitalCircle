"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import ConversationList from "./ConversationList";
import ConversationThread from "./ConversationThread";
import EmptyState from "./EmptyState";

type Props = {
  initialConversationId?: string | null;
};

export default function MessagesWorkspace({ initialConversationId = null }: Props) {
  const { conversations, hydrated } = useMessaging();

  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId
  );

  // Honour ?conversation= param once hydrated, then fall back to most recent
  // on desktop. We don't auto-select on mobile so users land on the list first.
  useEffect(() => {
    if (!hydrated) return;
    if (selectedId && conversations.some((c) => c.id === selectedId)) return;
    if (initialConversationId) {
      const exists = conversations.find((c) => c.id === initialConversationId);
      if (exists) {
        setSelectedId(exists.id);
        return;
      }
    }
    const sorted = [...conversations].sort((a, b) =>
      b.lastMessageAt.localeCompare(a.lastMessageAt)
    );
    if (
      sorted.length > 0 &&
      typeof window !== "undefined" &&
      window.innerWidth >= 1024
    ) {
      setSelectedId(sorted[0].id);
    }
  }, [hydrated, conversations, initialConversationId, selectedId]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:h-[calc(100vh-5rem)]">
        {/* Conversation list */}
        <aside
          className={`bg-white border-r border-navy-900/[0.08] lg:h-full lg:overflow-hidden flex flex-col ${
            selected ? "hidden lg:flex" : "flex"
          } lg:block`}
        >
          <ConversationList selectedId={selectedId} onSelect={handleSelect} />
        </aside>

        {/* Thread */}
        <main
          className={`lg:h-full lg:overflow-hidden flex flex-col ${
            selected ? "flex" : "hidden lg:flex"
          }`}
        >
          {selected ? (
            <ConversationThread
              conversation={selected}
              onBack={handleBack}
              showBackButton={true}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}
