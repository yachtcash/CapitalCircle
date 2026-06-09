"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { getCompanyById } from "@/data/companies";
import type { Conversation, Message, TextMessage } from "@/data/messages";
import { STAGE_META } from "@/data/negotiations";

import MessageBubble from "./MessageBubble";
import SystemMessage from "./SystemMessage";
import OpportunitySummaryCard from "./OpportunitySummaryCard";
import MessageComposer from "./MessageComposer";
import DateSeparator from "./DateSeparator";
import NegotiationTimeline from "@/components/negotiations/NegotiationTimeline";

function dateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function sameAuthorWithinWindow(a: TextMessage, b: TextMessage, ms = 5 * 60 * 1000): boolean {
  if (a.authorId !== b.authorId) return false;
  return Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) <= ms;
}

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
  conversation: Conversation;
  onBack?: () => void;
  showBackButton?: boolean;
};

export default function ConversationThread({
  conversation,
  onBack,
  showBackButton = false,
}: Props) {
  const { sendMessage, markConversationRead } = useMessaging();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const company = getCompanyById(conversation.companyId);
  const companyName = company?.name ?? conversation.companyId;

  // Mark conversation as read whenever it becomes visible
  useEffect(() => {
    if (conversation.unreadCount > 0) {
      markConversationRead(conversation.id);
    }
  }, [conversation.id, conversation.unreadCount, markConversationRead]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.messages.length]);

  const ordered = useMemo<Message[]>(
    () =>
      [...conversation.messages].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      ),
    [conversation.messages]
  );

  /** Annotate each text message with compact (top-of-group) and isGroupEnd (bottom-of-group) flags. */
  const rendered = useMemo(() => {
    return ordered.map((m, i) => {
      const prev = ordered[i - 1];
      const next = ordered[i + 1];

      const newDay =
        !prev ||
        dateKey(m.createdAt) !== dateKey(prev.createdAt);

      let compact = false;
      let isGroupEnd = true;
      if (m.kind === "text") {
        if (prev && prev.kind === "text" && !newDay && sameAuthorWithinWindow(prev, m)) {
          compact = true;
        }
        if (next && next.kind === "text") {
          const nextNewDay = dateKey(m.createdAt) !== dateKey(next.createdAt);
          if (!nextNewDay && sameAuthorWithinWindow(m, next)) {
            isGroupEnd = false;
          }
        }
      }

      return { message: m, newDay, compact, isGroupEnd };
    });
  }, [ordered]);

  const stageMeta = STAGE_META[conversation.stage];

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-navy-900/[0.08] px-4 md:px-6 py-3.5 md:py-4">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-bone text-navy-900 transition-colors -ml-2"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ) : null}

          <div className="h-10 w-10 rounded-full bg-navy-900 text-gold-500 ring-1 ring-navy-900/10 flex items-center justify-center text-xs font-semibold">
            {initialsForName(companyName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {company ? (
                <Link
                  href={`/company/${company.slug}`}
                  className="font-semibold text-navy-900 text-[15px] hover:text-gold-700 transition-colors truncate"
                >
                  {companyName}
                </Link>
              ) : (
                <span className="font-semibold text-navy-900 text-[15px]">{companyName}</span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/40 rounded-full px-2 py-0.5">
                <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                {company?.verification ?? "Verified"}
              </span>
            </div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-navy-700/55 font-semibold mt-0.5 truncate">
              {conversation.opportunityTitle ? (
                <span>
                  <span className="text-gold-700">Re:</span>{" "}
                  {conversation.opportunityTitle} ·{" "}
                  <span className="text-navy-700/70">{stageMeta.shortLabel}</span>
                </span>
              ) : (
                <>Stage · {stageMeta.shortLabel} — {stageMeta.description}</>
              )}
            </div>
          </div>

          {company ? (
            <Link
              href={`/company/${company.slug}`}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
            >
              Profile
              <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
            </Link>
          ) : null}
        </div>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 space-y-5">
        <NegotiationTimeline current={conversation.stage} />

        <OpportunitySummaryCard conversation={conversation} companyName={companyName} />

        <div>
          {rendered.map(({ message, newDay, compact, isGroupEnd }) => (
            <Fragment key={message.id}>
              {newDay ? <DateSeparator iso={message.createdAt} /> : null}
              {message.kind === "system" ? (
                <SystemMessage message={message} />
              ) : (
                <MessageBubble
                  message={message}
                  compact={compact}
                  isGroupEnd={isGroupEnd}
                />
              )}
            </Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <MessageComposer
        onSend={(text, attachments) =>
          sendMessage(conversation.id, text, attachments)
        }
        placeholder={`Message ${companyName}…`}
      />
    </div>
  );
}
