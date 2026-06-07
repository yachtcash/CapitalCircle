"use client";

import Link from "next/link";
import { Eye, ArrowDownToLine, Lock } from "lucide-react";
import type { DataRoomDocument } from "@/data/documents";
import { useMessaging } from "@/components/providers/MessagingProvider";
import DocumentTypeIcon, { fileTypeLabel } from "./DocumentTypeIcon";
import VisibilityBadge from "./VisibilityBadge";
import { cn } from "@/lib/cn";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type Props = {
  document: DataRoomDocument;
  listingHref?: string;
  listingLabel?: string;
  unlocked?: boolean;
  onRequestAccess?: () => void;
};

export default function DocumentRow({
  document,
  listingHref,
  listingLabel,
  unlocked = true,
  onRequestAccess,
}: Props) {
  const { markDocumentViewed, markDocumentDownloaded } = useMessaging();
  const accessible = document.visibility === "Public" || unlocked;

  return (
    <article className="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-bone/40 transition-colors">
      <DocumentTypeIcon type={document.fileType} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-semibold text-navy-900 text-sm md:text-[15px] truncate">
            {document.name}
          </div>
          <VisibilityBadge visibility={document.visibility} />
        </div>
        <div className="mt-1 text-[11px] text-navy-700/65 flex items-center gap-2 flex-wrap">
          <span className="font-semibold uppercase tracking-[0.12em] text-navy-700/55">
            {document.category}
          </span>
          <span className="text-navy-700/30">·</span>
          <span>
            {fileTypeLabel(document.fileType)} · {formatBytes(document.sizeBytes)}
            {document.pages ? ` · ${document.pages} pages` : ""}
          </span>
          <span className="text-navy-700/30">·</span>
          <span>Updated {formatRelative(document.updatedAt)}</span>
          {listingHref && listingLabel ? (
            <>
              <span className="text-navy-700/30">·</span>
              <Link
                href={listingHref}
                className="font-semibold text-gold-700 hover:text-gold-600 transition-colors truncate max-w-[200px]"
              >
                {listingLabel}
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {accessible ? (
          <>
            <button
              type="button"
              onClick={() => markDocumentViewed(document.id)}
              aria-label={`View ${document.name}`}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full text-navy-700/65 hover:text-navy-900 hover:bg-bone transition-colors"
            >
              <Eye className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => markDocumentDownloaded(document.id)}
              aria-label={`Download ${document.name}`}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full text-navy-700/65 hover:text-navy-900 hover:bg-bone transition-colors"
            >
              <ArrowDownToLine className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onRequestAccess}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-bone hover:bg-gold-500 text-navy-900 text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors"
            )}
          >
            <Lock className="h-3 w-3" strokeWidth={2.4} />
            Request access
          </button>
        )}
      </div>
    </article>
  );
}
