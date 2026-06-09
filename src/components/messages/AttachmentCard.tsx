"use client";

import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileType2,
  Image as ImageIcon,
  FileArchive,
  ArrowDownToLine,
  type LucideIcon,
} from "lucide-react";
import type { Attachment } from "@/data/messages";
import { attachmentLabel, formatBytes } from "@/data/messages";
import { downloadAttachmentPlaceholder } from "@/lib/downloadAttachment";

const ICONS: Record<Attachment["type"], { icon: LucideIcon; tone: string }> = {
  pdf: { icon: FileText, tone: "text-rose-700 bg-rose-500/10 ring-rose-500/20" },
  xlsx: { icon: FileSpreadsheet, tone: "text-emerald-700 bg-emerald-500/10 ring-emerald-500/20" },
  pptx: { icon: Presentation, tone: "text-orange-600 bg-orange-500/10 ring-orange-500/20" },
  docx: { icon: FileType2, tone: "text-sky-700 bg-sky-500/10 ring-sky-500/20" },
  jpg: { icon: ImageIcon, tone: "text-fuchsia-600 bg-fuchsia-500/10 ring-fuchsia-500/20" },
  png: { icon: ImageIcon, tone: "text-fuchsia-600 bg-fuchsia-500/10 ring-fuchsia-500/20" },
  zip: { icon: FileArchive, tone: "text-amber-700 bg-amber-500/10 ring-amber-500/20" },
};

export default function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const { icon: Icon, tone } = ICONS[attachment.type];
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white ring-1 ring-navy-900/[0.08] hover:ring-navy-900/20 px-3 py-2.5 transition-shadow min-w-0">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 shrink-0 ${tone}`}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-navy-900 truncate">{attachment.name}</div>
        <div className="text-[11px] text-navy-700/65 mt-0.5">
          {attachmentLabel(attachment.type)} · {formatBytes(attachment.sizeBytes)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => downloadAttachmentPlaceholder(attachment)}
        aria-label={`Download ${attachment.name}`}
        className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-full text-navy-700/65 hover:text-navy-900 hover:bg-bone transition-colors"
      >
        <ArrowDownToLine className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}
