"use client";

import { FileText, FileSpreadsheet, Presentation, FileType2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DocumentItem } from "./types";

type Props = {
  items: DocumentItem[];
  onRemove: (id: string) => void;
};

function iconFor(name: string, type: string): { icon: LucideIcon; color: string; label: string } {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf") || type === "application/pdf")
    return { icon: FileText, color: "text-rose-600 bg-rose-500/10 ring-rose-500/20", label: "PDF" };
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls"))
    return {
      icon: FileSpreadsheet,
      color: "text-emerald-700 bg-emerald-500/10 ring-emerald-500/20",
      label: "XLSX",
    };
  if (lower.endsWith(".pptx") || lower.endsWith(".ppt"))
    return {
      icon: Presentation,
      color: "text-orange-600 bg-orange-500/10 ring-orange-500/20",
      label: "PPTX",
    };
  if (lower.endsWith(".docx") || lower.endsWith(".doc"))
    return { icon: FileType2, color: "text-sky-700 bg-sky-500/10 ring-sky-500/20", label: "DOCX" };
  return { icon: FileText, color: "text-navy-900 bg-navy-900/5 ring-navy-900/10", label: "FILE" };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ items, onRemove }: Props) {
  if (items.length === 0) return null;
  return (
    <ul className="rounded-2xl ring-1 ring-navy-900/[0.06] bg-white divide-y divide-navy-900/[0.06] overflow-hidden">
      {items.map((item) => {
        const meta = iconFor(item.name, item.type);
        const Icon = meta.icon;
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-bone/30 transition-colors"
          >
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${meta.color}`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-navy-900 truncate">{item.name}</div>
              <div className="text-[11px] text-navy-700/60 mt-0.5">
                {meta.label} · {formatSize(item.size)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
              className="shrink-0 h-8 w-8 rounded-full bg-navy-900/[0.04] hover:bg-navy-900 hover:text-white text-navy-700 transition-colors flex items-center justify-center"
            >
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
