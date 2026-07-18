"use client";

import { useCallback, useRef, useState } from "react";
import {
  Paperclip,
  Plus,
  FileText,
  ImageIcon,
  Replace,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

import { putImage, useResolvedImage, isStoredImageToken } from "@/lib/imageStore";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { attachmentKind, type CalendarEvent, type EventAttachment } from "@/data/calendar";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/cn";

const ACCEPT = "image/*,application/pdf";

function formatSize(bytes?: number): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** Build an EventAttachment from a freshly stored file. */
async function makeAttachment(file: File): Promise<EventAttachment> {
  const token = await putImage(file, file.name);
  return {
    id: crypto.randomUUID(),
    token,
    name: file.name,
    kind: attachmentKind(file.type, file.name),
    size: file.size,
  };
}

// ---- Image thumbnail (self-resolving) ----

function ImageThumb({
  token,
  name,
  onClick,
  className,
}: {
  token: string;
  name: string;
  onClick?: () => void;
  className?: string;
}) {
  const url = useResolvedImage(token);
  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-navy-900/[0.04] text-navy-900/30",
          className
        )}
      >
        <ImageIcon className="h-4 w-4" aria-hidden />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      onClick={onClick}
      className={cn(
        "h-full w-full object-cover",
        onClick && "cursor-zoom-in",
        className
      )}
    />
  );
}

// ---- Inline image preview overlay ----

function ImagePreview({
  token,
  name,
  onClose,
}: {
  token: string;
  name: string;
  onClose: () => void;
}) {
  const url = useResolvedImage(token);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-6 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-white/10"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="max-h-[80vh] w-auto object-contain" />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center text-navy-900/40">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          </div>
        )}
        <div className="truncate border-t border-navy-900/[0.06] px-4 py-2 text-xs font-medium text-navy-700">
          {name}
        </div>
      </div>
    </div>
  );
}

// ---- A single attachment row ----

function AttachmentItem({
  att,
  canEdit,
  onPreview,
  onReplace,
  onDelete,
  busy,
}: {
  att: EventAttachment;
  canEdit: boolean;
  onPreview: (att: EventAttachment) => void;
  onReplace: (att: EventAttachment) => void;
  onDelete: (att: EventAttachment) => void;
  busy: boolean;
}) {
  const isImage = att.kind === "image" && isStoredImageToken(att.token);
  const size = formatSize(att.size);

  return (
    <li className="group flex items-center gap-3 rounded-2xl bg-white p-2 ring-1 ring-navy-900/[0.06] transition hover:ring-navy-900/[0.12]">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-navy-900/[0.03] ring-1 ring-navy-900/[0.06]">
        {isImage ? (
          <ImageThumb token={att.token} name={att.name} onClick={() => onPreview(att)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-navy-700/60">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={isImage ? () => onPreview(att) : undefined}
          className={cn(
            "block w-full truncate text-left text-sm font-medium text-navy-900",
            isImage && "hover:text-gold-700"
          )}
          title={att.name}
        >
          {att.name}
        </button>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-navy-700/60">
          <span className="rounded-full bg-navy-900/[0.04] px-2 py-0.5 font-semibold uppercase tracking-[0.1em] text-navy-700/70">
            {att.kind}
          </span>
          {size && <span>{size}</span>}
        </div>
      </div>

      {canEdit && (
        <div className="flex shrink-0 items-center gap-1 opacity-70 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onReplace(att)}
            disabled={busy}
            aria-label={`Replace ${att.name}`}
            title="Replace"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-navy-700/70 transition hover:bg-navy-900/[0.05] hover:text-navy-900 disabled:opacity-40"
          >
            <Replace className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDelete(att)}
            disabled={busy}
            aria-label={`Delete ${att.name}`}
            title="Delete"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500/80 transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </li>
  );
}

// ---- Main component ----

export default function EventAttachments({
  event,
  canEdit,
}: {
  event: CalendarEvent;
  canEdit: boolean;
}) {
  const { addCalendarAttachment, removeCalendarAttachment } = useMessaging();

  const addInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const replaceTargetRef = useRef<EventAttachment | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<EventAttachment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventAttachment | null>(null);

  const attachments = event.attachments ?? [];

  const ingest = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setBusy(true);
      try {
        for (const file of list) {
          const att = await makeAttachment(file);
          addCalendarAttachment(event.id, att);
        }
      } finally {
        setBusy(false);
      }
    },
    [addCalendarAttachment, event.id]
  );

  const onAddFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length) await ingest(files);
      e.target.value = "";
    },
    [ingest]
  );

  const onReplaceFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const target = replaceTargetRef.current;
      e.target.value = "";
      replaceTargetRef.current = null;
      if (!file || !target) return;
      setBusy(true);
      try {
        const att = await makeAttachment(file);
        // Add the replacement first, then drop the old one so the list never
        // momentarily empties (and the old idb blob is freed by the provider).
        addCalendarAttachment(event.id, att);
        removeCalendarAttachment(event.id, target.id);
      } finally {
        setBusy(false);
      }
    },
    [addCalendarAttachment, removeCalendarAttachment, event.id]
  );

  const requestReplace = useCallback((att: EventAttachment) => {
    replaceTargetRef.current = att;
    replaceInputRef.current?.click();
  }, []);

  const requestDelete = useCallback((att: EventAttachment) => {
    setDeleteTarget(att);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!canEdit) return;
      const files = e.dataTransfer?.files;
      if (files && files.length) void ingest(files);
    },
    [canEdit, ingest]
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-navy-900">
          <Paperclip className="h-4 w-4 text-navy-700/70" aria-hidden />
          <span className="text-sm font-semibold">Attachments</span>
          <span className="rounded-full bg-navy-900/[0.05] px-2 py-0.5 text-[11px] font-semibold text-navy-700/70">
            {attachments.length}
          </span>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => addInputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1.5 text-xs font-semibold text-cream ring-1 ring-navy-900 transition hover:bg-navy-700 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-3.5 w-3.5" aria-hidden />
            )}
            Add Attachment
          </button>
        )}
      </div>

      {/* Hidden inputs */}
      {canEdit && (
        <>
          <input
            ref={addInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={onAddFiles}
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={onReplaceFile}
          />
        </>
      )}

      {/* Drop zone (edit only) */}
      {canEdit && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!dragOver) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => addInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-4 py-6 text-center transition",
            dragOver
              ? "border-gold-500 bg-gold-500/10 ring-1 ring-gold-500/40"
              : "border-navy-900/15 bg-navy-900/[0.02] hover:border-navy-900/25 hover:bg-navy-900/[0.03]"
          )}
        >
          <Paperclip
            className={cn(
              "h-5 w-5 transition",
              dragOver ? "text-gold-700" : "text-navy-700/50"
            )}
            aria-hidden
          />
          <p className="text-xs text-navy-700/70">
            <span className="font-semibold text-navy-900">Drop files here</span> or click to
            browse
          </p>
          <p className="text-[11px] text-navy-700/50">Images and PDFs</p>
        </div>
      )}

      {/* List */}
      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <AttachmentItem
              key={att.id}
              att={att}
              canEdit={canEdit}
              busy={busy}
              onPreview={setPreview}
              onReplace={requestReplace}
              onDelete={requestDelete}
            />
          ))}
        </ul>
      ) : (
        !canEdit && (
          <p className="rounded-xl bg-navy-900/[0.02] px-4 py-6 text-center text-xs text-navy-700/50 ring-1 ring-navy-900/[0.04]">
            No attachments.
          </p>
        )
      )}

      {/* Preview overlay */}
      {preview && isStoredImageToken(preview.token) && (
        <ImagePreview
          token={preview.token}
          name={preview.name}
          onClose={() => setPreview(null)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this attachment?"
        body={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from this event. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete Attachment"
        tone="danger"
        onConfirm={() => {
          if (deleteTarget) removeCalendarAttachment(event.id, deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
