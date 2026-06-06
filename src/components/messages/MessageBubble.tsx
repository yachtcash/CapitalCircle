"use client";

import { formatRelative, type TextMessage } from "@/data/messages";
import AttachmentCard from "./AttachmentCard";
import { cn } from "@/lib/cn";

export default function MessageBubble({ message }: { message: TextMessage }) {
  const isMe = message.authorId === "me";

  return (
    <div
      className={cn(
        "flex gap-3 items-end",
        isMe ? "flex-row-reverse justify-start" : "flex-row justify-start"
      )}
    >
      <div
        className={cn(
          "shrink-0 h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center ring-1",
          isMe
            ? "bg-gold-500 text-navy-900 ring-gold-600/40"
            : "bg-navy-900 text-gold-500 ring-navy-900/10"
        )}
      >
        {message.authorInitials}
      </div>

      <div className={cn("flex flex-col gap-1.5 max-w-[78%] md:max-w-[68%]", isMe ? "items-end" : "items-start")}>
        <div className="flex items-baseline gap-2 text-[11px] text-navy-700/55">
          <span className={cn("font-semibold text-navy-900/85", isMe && "order-2")}>{message.authorName}</span>
          <span className={cn(isMe && "order-1")}>{formatRelative(message.createdAt)}</span>
        </div>

        {message.text ? (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isMe
                ? "bg-navy-900 text-white rounded-br-md"
                : "bg-white text-navy-900 ring-1 ring-navy-900/[0.08] rounded-bl-md"
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          </div>
        ) : null}

        {message.attachments && message.attachments.length > 0 ? (
          <div className="flex flex-col gap-2 w-full max-w-md">
            {message.attachments.map((att) => (
              <AttachmentCard key={att.id} attachment={att} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
