import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileType2,
  FolderOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { OpportunityDocument } from "@/data/opportunities";

type IconMeta = { icon: LucideIcon; color: string; label: string };

function iconFor(name: string): IconMeta {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return {
      icon: FileText,
      color: "text-rose-600 bg-rose-500/10 ring-rose-500/20",
      label: "PDF",
    };
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return {
      icon: FileSpreadsheet,
      color: "text-emerald-700 bg-emerald-500/10 ring-emerald-500/20",
      label: "XLSX",
    };
  }
  if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) {
    return {
      icon: Presentation,
      color: "text-orange-600 bg-orange-500/10 ring-orange-500/20",
      label: "PPTX",
    };
  }
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    return {
      icon: FileType2,
      color: "text-sky-700 bg-sky-500/10 ring-sky-500/20",
      label: "DOCX",
    };
  }
  // Default by document type → PDF style (most decks are PDFs).
  return {
    icon: FileText,
    color: "text-rose-600 bg-rose-500/10 ring-rose-500/20",
    label: "PDF",
  };
}

export default function ListingDocumentsBlock({
  documents,
}: {
  documents: OpportunityDocument[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Data Room
        </div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
          Documents
        </h2>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 md:p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/5 text-navy-700/70 ring-1 ring-navy-900/10 mx-auto">
            <FolderOpen className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-navy-900">
            No documents attached yet
          </h3>
          <p className="mt-2 text-sm text-navy-700/70 max-w-md mx-auto">
            Upload a pitch deck, financial summary, or project overview to share
            with prospective investors after NDA.
          </p>
        </div>
      ) : (
        <ul className="rounded-2xl ring-1 ring-navy-900/[0.06] bg-white divide-y divide-navy-900/[0.06] overflow-hidden">
          {documents.map((doc) => {
            const meta = iconFor(doc.name);
            const Icon = meta.icon;
            return (
              <li
                key={doc.name}
                className="flex items-center gap-3 md:gap-4 p-4 md:p-5 hover:bg-bone/30 transition-colors"
              >
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${meta.color}`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
                    {doc.type}
                  </div>
                  <div className="mt-0.5 text-sm md:text-[15px] font-semibold text-navy-900 truncate">
                    {doc.name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-navy-700/60">
                    <span>
                      {meta.label} · {doc.pages} pages
                    </span>
                    <span className="text-navy-900/20">·</span>
                    <span>Updated {doc.updated}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
