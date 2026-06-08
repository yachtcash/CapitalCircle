"use client";

import { formatRelative, type Attachment, type TextMessage } from "@/data/messages";
import AttachmentCard from "./AttachmentCard";
import { InlineImagePreview, PdfPreviewCard } from "./MediaPreview";
import { cn } from "@/lib/cn";

type Props = {
  message: TextMessage;
  /** True when the previous message is from the same author and same day. */
  compact?: boolean;
  /** True when this is the last message in a contiguous group from the same author. */
  isGroupEnd?: boolean;
};

function classifyAttachments(atts: Attachment[]) {
  const images: Attachment[] = [];
  const pdfs: Attachment[] = [];
  const docs: Attachment[] = [];
  atts.forEach((a) => {
    if (a.type === "jpg" || a.type === "png") images.push(a);
    else if (a.type === "pdf") pdfs.push(a);
    else docs.push(a);
  });
  return { images, pdfs, docs };
}

export default function MessageBubble({
  message,
  compact = false,
  isGroupEnd = true,
}: Props) {
  const isMe = message.authorId === "me";
  const { images, pdfs, docs } = classifyAttachments(message.attachments ?? []);

  return (
    <div
      className={cn(
        "flex gap-3 items-end",
        isMe ? "flex-row-reverse justify-start" : "flex-row justify-start",
        compact ? "mt-0.5" : "mt-3"
      )}
    >
      {/* Avatar — only when group starts (i.e. NOT compact). Spacer keeps alignment when compact. */}
      {compact ? (
        <div className="shrink-0 h-8 w-8" aria-hidden />
      ) : (
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
      )}

      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[82%] md:max-w-[68%]",
          isMe ? "items-end" : "items-start"
        )}
      >
        {!compact ? (
          <div className="flex items-baseline gap-2 text-[11px] text-navy-700/55 px-1">
            <span className={cn("font-semibold text-navy-900/85", isMe && "order-2")}>
              {message.authorName}
            </span>
            <span className={cn(isMe && "order-1")}>{formatRelative(message.createdAt)}</span>
          </div>
        ) : null}

        {message.text ? (
          <div
            className={cn(
              "px-4 py-2.5 text-sm leading-relaxed shadow-sm",
              isMe
                ? "bg-navy-900 text-white"
                : "bg-white text-navy-900 ring-1 ring-navy-900/[0.08]",
              isMe
                ? cn(
                    "rounded-2xl",
                    !compact && "rounded-tr-md",
                    !isGroupEnd && "rounded-br-md"
                  )
                : cn(
                    "rounded-2xl",
                    !compact && "rounded-tl-md",
                    !isGroupEnd && "rounded-bl-md"
                  )
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          </div>
        ) : null}

        {images.length > 0 ? (
          <div className="flex flex-col gap-2 w-full max-w-md">
            {images.map((att) => (
              <InlineImagePreview key={att.id} attachment={att} />
            ))}
          </div>
        ) : null}

        {pdfs.length > 0 ? (
          <div className="flex flex-col gap-2 w-full max-w-md">
            {pdfs.map((att) => (
              <PdfPreviewCard key={att.id} attachment={att} />
            ))}
          </div>
        ) : null}

        {docs.length > 0 ? (
          <div className="flex flex-col gap-2 w-full max-w-md">
            {docs.map((att) => (
              <AttachmentCard key={att.id} attachment={att} />
            ))}
          </div>
        ) : null}

        {isMe && isGroupEnd ? (
          <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/40 font-semibold px-1">
            Sent
          </span>
        ) : null}
      </div>
    </div>
  );
}
