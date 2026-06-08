"use client";

import { Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import { formatRelative, type Conversation } from "@/data/messages";
import { STAGE_META } from "@/data/negotiations";
import { cn } from "@/lib/cn";

type Props = {
  conversation: Conversation;
  companyName: string;
  initials: string;
  selected: boolean;
  onSelect: (id: string) => void;
};

function lastAttachmentSummary(conversation: Conversation): {
  hasAttachments: boolean;
  count: number;
  variant: "image" | "pdf" | "file";
} {
  let count = 0;
  let variant: "image" | "pdf" | "file" = "file";
  for (let i = conversation.messages.length - 1; i >= 0; i--) {
    const m = conversation.messages[i];
    if (m.kind !== "text" || !m.attachments?.length) continue;
    count = m.attachments.length;
    const first = m.attachments[0];
    if (first.type === "jpg" || first.type === "png") variant = "image";
    else if (first.type === "pdf") variant = "pdf";
    else variant = "file";
    return { hasAttachments: true, count, variant };
  }
  return { hasAttachments: false, count: 0, variant: "file" };
}

export default function ConversationListItem({
  conversation,
  companyName,
  initials,
  selected,
  onSelect,
}: Props) {
  const unread = conversation.unreadCount > 0;
  const stage = STAGE_META[conversation.stage];
  const att = lastAttachmentSummary(conversation);
  const AttIcon = att.variant === "image" ? ImageIcon : att.variant === "pdf" ? FileText : Paperclip;

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "w-full text-left relative flex gap-3 px-4 md:px-5 py-3.5 transition-colors",
        selected
          ? "bg-bone"
          : "hover:bg-bone/50 bg-white"
      )}
    >
      {selected ? (
        <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-gold-500" />
      ) : null}

      <div
        className={cn(
          "shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-xs font-semibold ring-1",
          unread
            ? "bg-navy-900 text-gold-500 ring-navy-900"
            : "bg-navy-900/[0.04] text-navy-900 ring-navy-900/10"
        )}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "text-sm truncate",
              unread ? "font-semibold text-navy-900" : "font-medium text-navy-900/90"
            )}
          >
            {companyName}
          </span>
          <span className="text-[11px] text-navy-700/55 shrink-0">
            {formatRelative(conversation.lastMessageAt)}
          </span>
        </div>

        {conversation.opportunityTitle ? (
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-gold-600 font-semibold truncate">
            Re: {conversation.opportunityTitle}
          </div>
        ) : null}

        <p
          className={cn(
            "mt-1 text-[13px] truncate",
            unread ? "text-navy-900/90 font-medium" : "text-navy-700/65"
          )}
        >
          {conversation.lastMessagePreview}
        </p>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-semibold text-navy-700/70 bg-navy-900/[0.04] rounded-full px-2 py-0.5">
            {stage.shortLabel}
          </span>
          {att.hasAttachments ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-navy-700/60">
              <AttIcon className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
              {att.count} {att.count === 1 ? "file" : "files"}
            </span>
          ) : null}
          {unread ? (
            <span
              className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold shadow-sm"
              aria-label={`${conversation.unreadCount} unread messages`}
            >
              {conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
