"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  CloudUpload,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  ZoomIn,
} from "lucide-react";
import Lightbox, { useLightbox } from "@/components/common/Lightbox";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { AuditAction, AuditTargetKind } from "@/data/audit";
import {
  deleteImage as deleteStoredImage,
  isStoredImageToken,
  putImage,
  useResolvedImages,
} from "@/lib/imageStore";
import { cn } from "@/lib/cn";

export type GalleryAuditActions = {
  uploaded: AuditAction;
  replaced: AuditAction;
  deleted: AuditAction;
  reordered: AuditAction;
  cleared: AuditAction;
  coverChanged: AuditAction;
};

type Props = {
  /** Live image src list (URLs or idb:// tokens), first = cover. */
  images: string[];
  /** Human-readable entity name for alt text and audit labels. */
  title: string;
  /** Persist the full reordered/edited list. Called at event time. */
  onPersist: (next: string[]) => void;
  /** Audit action names for this entity (Company vs Member). */
  auditActions: GalleryAuditActions;
  /** Audit target identity. */
  auditTarget: { kind: AuditTargetKind; id: string };
  /** Section eyebrow, e.g. "Company Gallery Manager". */
  eyebrow: string;
};

/**
 * Shared gallery manager — the verified Opportunity Gallery Manager
 * blueprint, parameterized for companies and members. Identical
 * capabilities: add (button + drag-and-drop bulk upload), replace in
 * place, delete with confirm, delete all, reorder (left / right / first /
 * last), set cover, Lightbox preview. Autosaves via onPersist on every
 * action — computed at event time, never inside a state updater (the
 * pure-updater rule the persistence audit established).
 */
export default function MediaGalleryManager({
  images: liveImages,
  title,
  onPersist,
  auditActions,
  auditTarget,
  eyebrow,
}: Props) {
  const { recordAudit } = useMessaging();
  const [images, setImages] = useState<string[]>(liveImages);
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  // Track the freshest list for async flows (file uploads).
  const imagesRef = useRef<string[]>(liveImages);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Re-sync when the live record changes underneath us.
  const liveKey = liveImages.join("|");
  useEffect(() => {
    setImages(liveImages);
    imagesRef.current = liveImages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveKey]);

  const displayImages = useResolvedImages(images);

  const updateAndPersist = (updater: (prev: string[]) => string[]) => {
    const next = updater(imagesRef.current);
    imagesRef.current = next;
    setImages(next);
    onPersist(next);
  };

  const audit = (
    action: AuditAction,
    detail: string,
    change?: { before?: string; after?: string }
  ) => {
    recordAudit(
      action,
      { kind: auditTarget.kind, id: auditTarget.id, label: title },
      detail,
      change
    );
  };

  const lb = useLightbox(
    displayImages.map((src, i) => ({ src, alt: `${title} — Photo ${i + 1}` }))
  );

  const setCover = (i: number) => {
    if (i === 0) return;
    updateAndPersist((prev) => {
      const next = [...prev];
      const [picked] = next.splice(i, 1);
      next.unshift(picked);
      return next;
    });
    audit(auditActions.coverChanged, `Photo ${i + 1} promoted to cover`, {
      before: "Photo 1",
      after: `Photo ${i + 1}`,
    });
  };

  const performRemove = (i: number) => {
    const removed = imagesRef.current[i];
    updateAndPersist((prev) => prev.filter((_, idx) => idx !== i));
    if (removed && isStoredImageToken(removed)) {
      void deleteStoredImage(removed);
    }
    audit(auditActions.deleted, `Photo ${i + 1} removed`);
    setDeleteIndex(null);
  };

  const performRemoveAll = () => {
    const removedTokens = imagesRef.current.filter(isStoredImageToken);
    const count = imagesRef.current.length;
    updateAndPersist(() => []);
    for (const token of removedTokens) void deleteStoredImage(token);
    audit(auditActions.cleared, `All ${count} photos removed`);
    setDeleteAllOpen(false);
  };

  const move = (i: number, delta: -1 | 1) => {
    updateAndPersist((prev) => {
      const target = i + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
    audit(
      auditActions.reordered,
      `Photo ${i + 1} moved ${delta < 0 ? "left" : "right"}`
    );
  };

  const moveTo = (i: number, position: "first" | "last") => {
    updateAndPersist((prev) => {
      if (prev.length < 2) return prev;
      const next = [...prev];
      const [picked] = next.splice(i, 1);
      if (position === "first") next.unshift(picked);
      else next.push(picked);
      return next;
    });
    audit(auditActions.reordered, `Photo ${i + 1} moved to ${position}`);
  };

  const handleAdd = () => {
    replaceTargetRef.current = null;
    fileInput.current?.click();
  };

  const handleReplace = (i: number) => {
    replaceTargetRef.current = i;
    fileInput.current?.click();
  };

  const acceptFiles = async (
    files: File[],
    targetIndex: number | null
  ): Promise<void> => {
    if (files.length === 0) return;
    const accepted = files.filter((f) => f.type.startsWith("image/"));
    if (accepted.length === 0) return;
    const tokens = await Promise.all(accepted.map((f) => putImage(f, f.name)));
    updateAndPersist((prev) => {
      if (targetIndex != null && tokens.length > 0) {
        const next = [...prev];
        const replaced = next[targetIndex];
        if (isStoredImageToken(replaced)) {
          void deleteStoredImage(replaced);
        }
        next[targetIndex] = tokens[0];
        return next.concat(tokens.slice(1));
      }
      return prev.concat(tokens);
    });
    if (targetIndex != null) {
      audit(auditActions.replaced, `Photo ${targetIndex + 1} replaced`);
    } else {
      audit(
        auditActions.uploaded,
        `${tokens.length} ${tokens.length === 1 ? "photo" : "photos"} added`
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const targetIndex = replaceTargetRef.current;
    replaceTargetRef.current = null;
    e.target.value = "";
    void acceptFiles(files, targetIndex);
  };

  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files ?? []);
    void acceptFiles(files, null);
  };

  const coverIndex = images.length > 0 ? 0 : -1;
  const targetForDelete = deleteIndex != null ? images[deleteIndex] : undefined;

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-700 font-bold inline-flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
            {eyebrow}
          </div>
          <h3 className="mt-1 text-lg md:text-xl font-semibold text-navy-900 tracking-tight">
            {images.length} {images.length === 1 ? "photo" : "photos"} ·{" "}
            <span className="text-navy-700/65 font-medium">first is cover</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {images.length > 0 ? (
            <button
              type="button"
              onClick={() => setDeleteAllOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rose-500/40 hover:bg-rose-500/10 text-rose-700 font-semibold px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
              Delete All
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
            Add Images
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </header>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAdd}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAdd();
          }
        }}
        aria-label={`Bulk upload images for ${title} — drop files or click to browse`}
        className={cn(
          "mb-4 rounded-2xl ring-2 ring-dashed transition-all p-4 md:p-5 text-center cursor-pointer focus:outline-none focus-visible:ring-gold-500",
          dragOver
            ? "ring-gold-500 bg-gold-500/10"
            : "ring-navy-900/15 hover:ring-gold-500/60 hover:bg-bone/40 bg-white"
        )}
      >
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900">
          <CloudUpload className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
          {dragOver ? "Drop to upload" : "Drop images here or click to browse"}
        </div>
        <div className="mt-1 text-[11px] text-navy-700/65">
          Bulk upload supported · JPG · PNG · WEBP · multi-select OK
        </div>
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl bg-bone/40 ring-1 ring-navy-900/[0.05] p-8 text-center">
          <ImageIcon
            className="h-8 w-8 mx-auto text-navy-900/25 mb-2"
            strokeWidth={1.5}
          />
          <p className="text-xs text-navy-700/65 max-w-md mx-auto">
            No photos yet. The first photo you add becomes the cover.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {images.map((token, i) => (
            <li
              key={token + i}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-white ring-1",
                i === coverIndex ? "ring-gold-500/60" : "ring-navy-900/[0.06]"
              )}
            >
              <div className="relative aspect-[4/3]">
                {displayImages[i] ? (
                  <Image
                    src={displayImages[i]}
                    alt={`${title} — Photo ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-navy-900/[0.06] animate-pulse" />
                )}
                <button
                  type="button"
                  onClick={() => lb.openAt(i)}
                  aria-label={`Preview photo ${i + 1}`}
                  className="absolute inset-0 bg-navy-900/0 hover:bg-navy-900/25 focus-visible:bg-navy-900/25 transition-colors flex items-center justify-center text-white opacity-0 hover:opacity-100 focus-visible:opacity-100"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/35 px-3 py-1.5 text-xs uppercase tracking-[0.14em] font-bold -translate-y-4">
                    <ZoomIn className="h-3.5 w-3.5" strokeWidth={2.4} />
                    Preview
                  </span>
                </button>
                {i === coverIndex ? (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold bg-gold-500 text-navy-900 rounded-full px-2 py-0.5 shadow-sm">
                    <Star className="h-3 w-3 fill-navy-900" strokeWidth={2.4} />
                    Cover
                  </span>
                ) : null}
                <span className="absolute top-2 right-2 inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold bg-navy-900/65 text-white rounded-full px-2 py-0.5 backdrop-blur">
                  {i + 1} / {images.length}
                </span>

                <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-8 bg-gradient-to-t from-navy-900/85 via-navy-900/40 to-transparent flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <OverlayBtn
                      onClick={() => moveTo(i, "first")}
                      disabled={i === 0}
                      label="Move to first"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </OverlayBtn>
                    <OverlayBtn
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      label="Move left"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </OverlayBtn>
                    <OverlayBtn
                      onClick={() => move(i, 1)}
                      disabled={i === images.length - 1}
                      label="Move right"
                    >
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </OverlayBtn>
                    <OverlayBtn
                      onClick={() => moveTo(i, "last")}
                      disabled={i === images.length - 1}
                      label="Move to last"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </OverlayBtn>
                  </div>
                  <div className="flex items-center gap-1">
                    <OverlayBtn
                      onClick={() => setCover(i)}
                      disabled={i === coverIndex}
                      label={i === coverIndex ? "Already cover" : "Set as cover"}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          i === coverIndex && "fill-gold-400 text-gold-400"
                        )}
                        strokeWidth={2.4}
                      />
                    </OverlayBtn>
                    <OverlayBtn
                      onClick={() => handleReplace(i)}
                      label="Replace photo"
                    >
                      <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </OverlayBtn>
                    <OverlayBtn
                      onClick={() => setDeleteIndex(i)}
                      label="Delete photo"
                      tone="danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </OverlayBtn>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] text-navy-700/55">
        Changes save automatically and persist immediately across the
        platform. Uploaded photos are stored in this browser (IndexedDB) and
        survive refreshes and restarts.
      </p>

      <Lightbox
        images={lb.images}
        initialIndex={lb.index}
        open={lb.open}
        onClose={lb.close}
      />

      <ConfirmDialog
        open={deleteIndex != null}
        title="Delete this photo?"
        body={
          targetForDelete
            ? `Photo ${(deleteIndex ?? 0) + 1} will be removed from this gallery. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete photo"
        tone="danger"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex != null) performRemove(deleteIndex);
        }}
      />

      <ConfirmDialog
        open={deleteAllOpen}
        title="Delete all photos?"
        body={`All ${images.length} ${images.length === 1 ? "photo" : "photos"} will be removed from this gallery everywhere it appears. This cannot be undone.`}
        confirmLabel="Delete all photos"
        tone="danger"
        onCancel={() => setDeleteAllOpen(false)}
        onConfirm={performRemoveAll}
      />
    </section>
  );
}

function OverlayBtn({
  onClick,
  disabled,
  label,
  children,
  tone = "default",
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-full backdrop-blur transition-colors",
        disabled
          ? "bg-white/10 text-white/30 cursor-not-allowed"
          : tone === "danger"
          ? "bg-white/15 text-rose-200 hover:bg-rose-500/80 hover:text-white ring-1 ring-rose-400/40"
          : "bg-white/15 text-white hover:bg-white/35 ring-1 ring-white/25"
      )}
    >
      {children}
    </button>
  );
}
