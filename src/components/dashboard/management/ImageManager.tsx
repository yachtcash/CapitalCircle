"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUp,
  ChevronsDown,
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
import { cn } from "@/lib/cn";

type Props = {
  /** Initial image src list ordered by intended display. */
  initialImages: string[];
  /** Optional human-readable label for image alt text. */
  title?: string;
  /**
   * When provided AND the listing's backing opportunity is user-created,
   * every change is persisted through `updateListingImages`. Seed listings
   * keep local-only state (provider call is a no-op) and the panel shows a
   * "Local only — refresh resets" note.
   */
  listingId?: string;
};

/**
 * Live image manager for `/dashboard/listings/[id]` Gallery tab.
 *
 * Capabilities (all individual — no full-gallery re-upload):
 *  - Add image (file picker, multi-select)
 *  - Replace an individual image (preserves its index)
 *  - Delete an individual image (with confirmation)
 *  - Reorder: move up / move down / move to first / move to last
 *  - Set cover (move to index 0)
 *  - Preview every image in the universal Lightbox
 *
 * Persistence: changes flow through `updateListingImages` when a
 * `listingId` is provided. For user-created opportunities that means the
 * public marketplace surfaces (directory, search, map, detail) update
 * immediately. Seed opportunities remain immutable (the persistence call
 * silently no-ops in the provider).
 */
export default function ImageManager({
  initialImages,
  title = "Listing",
  listingId,
}: Props) {
  const { updateListingImages } = useMessaging();
  const [images, setImages] = useState<string[]>(initialImages);
  const objectUrls = useRef<Set<string>>(new Set());
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    };
  }, []);

  const persist = (next: string[]) => {
    if (listingId) updateListingImages(listingId, next);
  };

  const updateAndPersist = (
    updater: (prev: string[]) => string[],
    sideEffect?: (next: string[]) => void
  ) => {
    setImages((prev) => {
      const next = updater(prev);
      sideEffect?.(next);
      persist(next);
      return next;
    });
  };

  const lb = useLightbox(
    images.map((src, i) => ({ src, alt: `${title} — Photo ${i + 1}` }))
  );

  const setCover = (i: number) => {
    if (i === 0) return;
    updateAndPersist((prev) => {
      const next = [...prev];
      const [picked] = next.splice(i, 1);
      next.unshift(picked);
      return next;
    });
  };

  const performRemove = (i: number) => {
    updateAndPersist(
      (prev) => prev.filter((_, idx) => idx !== i),
      () => {
        const removed = images[i];
        if (removed && objectUrls.current.has(removed)) {
          URL.revokeObjectURL(removed);
          objectUrls.current.delete(removed);
        }
      }
    );
    setDeleteIndex(null);
  };

  const move = (i: number, delta: -1 | 1) => {
    updateAndPersist((prev) => {
      const target = i + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
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
  };

  const handleAdd = () => {
    replaceTargetRef.current = null;
    fileInput.current?.click();
  };

  const handleReplace = (i: number) => {
    replaceTargetRef.current = i;
    fileInput.current?.click();
  };

  const acceptFiles = (files: File[], targetIndex: number | null) => {
    if (files.length === 0) return;
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    const urls = images.map((f) => {
      const u = URL.createObjectURL(f);
      objectUrls.current.add(u);
      return u;
    });
    updateAndPersist((prev) => {
      if (targetIndex != null && urls.length > 0) {
        // Replace ONE image at the target index. Position preserved.
        // Extra files (if multi-select on Replace) append at the end.
        const next = [...prev];
        if (objectUrls.current.has(next[targetIndex])) {
          URL.revokeObjectURL(next[targetIndex]);
          objectUrls.current.delete(next[targetIndex]);
        }
        next[targetIndex] = urls[0];
        return next.concat(urls.slice(1));
      }
      return prev.concat(urls);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    acceptFiles(files, replaceTargetRef.current);
    replaceTargetRef.current = null;
    // Reset value so picking the same file again still triggers onChange.
    e.target.value = "";
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
    acceptFiles(files, null);
  };

  const coverIndex = useMemo(() => (images.length > 0 ? 0 : -1), [images.length]);
  const targetForDelete =
    deleteIndex != null ? images[deleteIndex] : undefined;

  return (
    <section>
      <header className="mb-5 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
            Image manager
          </div>
          <h3 className="mt-1.5 text-lg md:text-xl font-semibold text-navy-900 tracking-tight">
            {images.length} {images.length === 1 ? "photo" : "photos"} ·{" "}
            <span className="text-navy-700/65 font-medium">first is cover</span>
          </h3>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-900/90 text-white font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          Add photo
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </header>

      {/* Drag-and-drop bulk upload zone — sits above the grid. */}
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
        aria-label="Bulk upload images — drop files or click to browse"
        className={cn(
          "mb-5 rounded-2xl ring-2 ring-dashed transition-all p-5 md:p-6 text-center cursor-pointer focus:outline-none focus-visible:ring-gold-500",
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
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 text-center">
          <ImageIcon className="h-10 w-10 mx-auto text-navy-900/25 mb-3" strokeWidth={1.5} />
          <h4 className="text-sm font-semibold text-navy-900">No photos yet</h4>
          <p className="mt-1 text-xs text-navy-700/65 max-w-md mx-auto">
            Add photos to give investors a sense of the project. The first photo becomes the cover.
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
            Add first photo
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {images.map((src, i) => (
            <li
              key={src + i}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-white ring-1",
                i === coverIndex ? "ring-gold-500/60" : "ring-navy-900/[0.06]"
              )}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={src}
                  alt={`${title} — Photo ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => lb.openAt(i)}
                  aria-label={`Preview photo ${i + 1}`}
                  className="absolute inset-0 bg-navy-900/0 hover:bg-navy-900/35 focus-visible:bg-navy-900/35 transition-colors flex items-center justify-center text-white opacity-0 hover:opacity-100 focus-visible:opacity-100"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/35 px-3 py-1.5 text-xs uppercase tracking-[0.14em] font-bold">
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
              </div>
              <div className="grid grid-cols-2 gap-2 p-2.5">
                <div className="flex items-center gap-1">
                  <IconBtn
                    onClick={() => moveTo(i, "first")}
                    disabled={i === 0}
                    label="Move to first"
                  >
                    <ChevronsUp className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => moveTo(i, "last")}
                    disabled={i === images.length - 1}
                    label="Move to last"
                  >
                    <ChevronsDown className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </IconBtn>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <IconBtn
                    onClick={() => setCover(i)}
                    disabled={i === coverIndex}
                    label={i === coverIndex ? "Already cover" : "Set as cover"}
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        i === coverIndex && "fill-gold-500"
                      )}
                      strokeWidth={2.4}
                    />
                  </IconBtn>
                  <IconBtn onClick={() => handleReplace(i)} label="Replace photo">
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => setDeleteIndex(i)}
                    label="Delete photo"
                    tone="danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </IconBtn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-navy-700/55">
        Changes persist immediately to your listing&apos;s gallery and update
        the public marketplace, search, and map views. Uploaded images are
        kept as in-browser blob URLs — they survive within this browser
        session but will not display after a hard refresh until a real upload
        backend is wired up.
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
            ? `Photo ${(deleteIndex ?? 0) + 1} will be removed from your gallery. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete photo"
        tone="danger"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex != null) performRemove(deleteIndex);
        }}
      />
    </section>
  );
}

function IconBtn({
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
        "h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors",
        disabled
          ? "text-navy-700/25 cursor-not-allowed"
          : tone === "danger"
          ? "text-rose-700 hover:bg-rose-500/10"
          : "text-navy-700 hover:bg-navy-900/[0.06] hover:text-navy-900"
      )}
    >
      {children}
    </button>
  );
}
