"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  CloudUpload,
  Eye,
  ArrowDownToLine,
  RefreshCw,
  Trash2,
  Lock,
  Globe,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileType2,
  Image as ImageIcon,
  FileArchive,
  Plus,
} from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type {
  DataRoomDocument,
  DocumentCategory,
  DocumentFileType,
  DocumentVisibility,
} from "@/data/documents";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  downloadDocumentPlaceholder,
  openDocumentPlaceholder,
} from "@/lib/downloadDocument";
import { cn } from "@/lib/cn";

type Props = {
  listingId: string;
  listingTitle: string;
};

const FILE_TYPE_BY_EXT: Record<string, DocumentFileType> = {
  pdf: "pdf",
  docx: "docx",
  doc: "docx",
  xlsx: "xlsx",
  xls: "xlsx",
  pptx: "pptx",
  ppt: "pptx",
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  zip: "zip",
};

const CATEGORY_BY_NAME: Array<[RegExp, DocumentCategory]> = [
  [/deck|pitch|memorandum|cim/i, "Pitch Deck"],
  [/model|financial|model|p&l|cashflow|return/i, "Financial Model"],
  [/feasibility|study/i, "Feasibility Study"],
  [/survey|topo/i, "Survey"],
  [/plan|architectur|drawing|render/i, "Architectural Plans"],
  [/contract|agreement|loi|term sheet|nda/i, "Contracts"],
  [/photo|image|gallery/i, "Photos & Renderings"],
  [/operation|ops/i, "Operations"],
  [/legal|zoning|title/i, "Legal"],
  [/brochure|marketing/i, "Marketing Brochure"],
  [/overview|summary/i, "Project Overview"],
  [/investor|raise/i, "Investor Deck"],
];

function fileTypeFor(name: string): DocumentFileType {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  return FILE_TYPE_BY_EXT[ext] ?? "pdf";
}

function categoryFor(name: string): DocumentCategory {
  for (const [re, cat] of CATEGORY_BY_NAME) if (re.test(name)) return cat;
  return "Project Overview";
}

const ICONS: Record<DocumentFileType, { Icon: typeof FileText; tone: string }> = {
  pdf: { Icon: FileText, tone: "text-rose-700 bg-rose-500/10 ring-rose-500/20" },
  xlsx: {
    Icon: FileSpreadsheet,
    tone: "text-emerald-700 bg-emerald-500/10 ring-emerald-500/20",
  },
  pptx: {
    Icon: Presentation,
    tone: "text-orange-600 bg-orange-500/10 ring-orange-500/20",
  },
  docx: { Icon: FileType2, tone: "text-sky-700 bg-sky-500/10 ring-sky-500/20" },
  jpg: { Icon: ImageIcon, tone: "text-fuchsia-600 bg-fuchsia-500/10 ring-fuchsia-500/20" },
  png: { Icon: ImageIcon, tone: "text-fuchsia-600 bg-fuchsia-500/10 ring-fuchsia-500/20" },
  zip: { Icon: FileArchive, tone: "text-amber-700 bg-amber-500/10 ring-amber-500/20" },
};

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return date.toLocaleDateString();
}

/**
 * Post-publication document manager for `/dashboard/listings/[id]`.
 *
 * Users can upload, replace, delete, view, and download documents
 * individually — never returning to the wizard. Each action emits an
 * activity entry through the provider so it shows up on the dashboard,
 * data-room timeline, and listing activity feed.
 */
export default function DocumentManager({ listingId, listingTitle }: Props) {
  const { documents, addDocument, deleteDocument, replaceDocument } =
    useMessaging();

  const listingDocs = useMemo(
    () =>
      documents
        .filter((d) => d.listingId === listingId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [documents, listingId]
  );

  const uploadInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTargetIdRef = useRef<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DataRoomDocument | null>(
    null
  );

  const openUpload = () => uploadInput.current?.click();
  const openReplace = (id: string) => {
    replaceTargetIdRef.current = id;
    replaceInput.current?.click();
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      addDocument({
        listingId,
        name: file.name,
        fileType: fileTypeFor(file.name),
        category: categoryFor(file.name),
        visibility: "Private",
        sizeBytes: file.size,
        description: undefined,
      });
    }
    e.target.value = "";
  };

  const handleReplace = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = replaceTargetIdRef.current;
    if (file && targetId) {
      replaceDocument(targetId, {
        name: file.name,
        fileType: fileTypeFor(file.name),
        sizeBytes: file.size,
      });
    }
    replaceTargetIdRef.current = null;
    e.target.value = "";
  };

  const toggleVisibility = (doc: DataRoomDocument) => {
    const next: DocumentVisibility =
      doc.visibility === "Public" ? "Private" : "Public";
    replaceDocument(doc.id, { visibility: next });
  };

  return (
    <section>
      <header className="mb-5 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <CloudUpload className="h-3.5 w-3.5" strokeWidth={2.2} />
            Document manager
          </div>
          <h3 className="mt-1.5 text-lg md:text-xl font-semibold text-navy-900 tracking-tight">
            {listingDocs.length}{" "}
            {listingDocs.length === 1 ? "document" : "documents"}
          </h3>
        </div>
        <button
          type="button"
          onClick={openUpload}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-900/90 text-white font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          Upload document
        </button>
        <input
          ref={uploadInput}
          type="file"
          accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.zip"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <input
          ref={replaceInput}
          type="file"
          accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.zip"
          className="hidden"
          onChange={handleReplace}
        />
      </header>

      {listingDocs.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 text-center">
          <CloudUpload
            className="h-10 w-10 mx-auto text-navy-900/25 mb-3"
            strokeWidth={1.5}
          />
          <h4 className="text-sm font-semibold text-navy-900">
            No documents in this data room yet
          </h4>
          <p className="mt-1 text-xs text-navy-700/65 max-w-md mx-auto">
            Upload a pitch deck, financial model, feasibility study, or any
            supporting document. Files default to Private and unlock for
            investors after you approve their access request.
          </p>
          <button
            type="button"
            onClick={openUpload}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
            Upload first document
          </button>
        </div>
      ) : (
        <ul className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
          {listingDocs.map((doc) => {
            const { Icon, tone } = ICONS[doc.fileType] ?? ICONS.pdf;
            const isPublic = doc.visibility === "Public";
            return (
              <li
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 md:p-4 hover:bg-bone/40 transition-colors"
              >
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 shrink-0",
                    tone
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-navy-900 text-sm md:text-[15px] truncate">
                      {doc.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(doc)}
                      aria-label={`Toggle visibility (currently ${doc.visibility})`}
                      title={`Currently ${doc.visibility} — click to ${
                        isPublic ? "make Private" : "make Public"
                      }`}
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1 transition-colors",
                        isPublic
                          ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15 hover:bg-navy-900/10"
                      )}
                    >
                      {isPublic ? (
                        <Globe className="h-3 w-3" strokeWidth={2.4} />
                      ) : (
                        <Lock className="h-3 w-3" strokeWidth={2.4} />
                      )}
                      {doc.visibility}
                    </button>
                  </div>
                  <div className="mt-1 text-[11px] text-navy-700/65 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold uppercase tracking-[0.12em] text-navy-700/55">
                      {doc.category}
                    </span>
                    <span className="text-navy-700/30">·</span>
                    <span>
                      {doc.fileType.toUpperCase()} · {formatBytes(doc.sizeBytes)}
                      {doc.pages ? ` · ${doc.pages} pages` : ""}
                    </span>
                    <span className="text-navy-700/30">·</span>
                    <span>Updated {formatRelative(doc.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                  <IconBtn
                    onClick={() => openDocumentPlaceholder(doc)}
                    label={`View ${doc.name}`}
                  >
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => downloadDocumentPlaceholder(doc)}
                    label={`Download ${doc.name}`}
                  >
                    <ArrowDownToLine className="h-4 w-4" strokeWidth={2.2} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => openReplace(doc.id)}
                    label={`Replace ${doc.name}`}
                  >
                    <RefreshCw className="h-4 w-4" strokeWidth={2} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => setDeleteTarget(doc)}
                    label={`Delete ${doc.name}`}
                    tone="danger"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </IconBtn>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs text-navy-700/55">
        Uploads, replacements, and deletes persist via the local provider —
        all changes show up immediately on the data-room timeline, the
        dashboard activity feed, and (for Public docs) the public opportunity
        page for <span className="font-semibold text-navy-900">{listingTitle}</span>.
      </p>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this document?"
        body={
          deleteTarget
            ? `“${deleteTarget.name}” will be removed from the data room. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete document"
        tone="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteDocument(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </section>
  );
}

function IconBtn({
  onClick,
  label,
  children,
  tone = "default",
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors",
        tone === "danger"
          ? "text-rose-700 hover:bg-rose-500/10"
          : "text-navy-700/70 hover:text-navy-900 hover:bg-bone"
      )}
    >
      {children}
    </button>
  );
}
