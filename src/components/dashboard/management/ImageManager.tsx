"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Star,
  StarOff,
  Trash2,
  ZoomIn,
} from "lucide-react";
import Lightbox, { useLightbox } from "@/components/common/Lightbox";
import { cn } from "@/lib/cn";

type Props = {
  /** Initial image src list ordered by intended display. */
  initialImages: string[];
  /** Optional human-readable label for image alt text. */
  title?: string;
};

/**
 * Mock image manager — local state only, no backend.
 *
 * Capabilities:
 *  - Replace an individual image (file picker → object URL)
 *  - Delete an individual image
 *  - Add a new image
 *  - Reorder (up/down)
 *  - Set cover (move to index 0)
 *
 * Object URLs created via createObjectURL are revoked on unmount.
 */
export default function ImageManager({ initialImages, title = "Listing" }: Props) {
  const [images, setImages] = useState<string[]>(initialImages);
  const objectUrls = useRef<Set<string>>(new Set());

  const fileInput = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    };
  }, []);

  const lb = useLightbox(
    images.map((src, i) => ({ src, alt: `${title} — Photo ${i + 1}` }))
  );

  const setCover = (i: number) => {
    if (i === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(i, 1);
      next.unshift(picked);
      return next;
    });
  };

  const remove = (i: number) => {
    setImages((prev) => {
      const removed = prev[i];
      if (objectUrls.current.has(removed)) {
        URL.revokeObjectURL(removed);
        objectUrls.current.delete(removed);
      }
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const move = (i: number, delta: -1 | 1) => {
    setImages((prev) => {
      const target = i + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[target]] = [next[target], next[i]];
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const urls = files.map((f) => {
      const u = URL.createObjectURL(f);
      objectUrls.current.add(u);
      return u;
    });
    setImages((prev) => {
      const target = replaceTargetRef.current;
      if (target != null && urls.length > 0) {
        const next = [...prev];
        if (objectUrls.current.has(next[target])) {
          URL.revokeObjectURL(next[target]);
          objectUrls.current.delete(next[target]);
        }
        next[target] = urls[0];
        return next.concat(urls.slice(1));
      }
      return prev.concat(urls);
    });
    replaceTargetRef.current = null;
    // Reset value so picking the same file again still triggers onChange.
    e.target.value = "";
  };

  const coverIndex = useMemo(() => (images.length > 0 ? 0 : -1), [images.length]);

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
                  className="absolute inset-0 bg-navy-900/0 hover:bg-navy-900/35 transition-colors flex items-center justify-center text-white opacity-0 hover:opacity-100"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/35 px-3 py-1.5 text-xs uppercase tracking-[0.14em] font-bold">
                    <ZoomIn className="h-3.5 w-3.5" strokeWidth={2.4} />
                    Preview
                  </span>
                </button>
                {i === coverIndex ? (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold bg-gold-500 text-navy-900 rounded-full px-2 py-0.5">
                    <Star className="h-3 w-3" strokeWidth={2.4} />
                    Cover
                  </span>
                ) : null}
                <span className="absolute top-2 right-2 inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold bg-navy-900/65 text-white rounded-full px-2 py-0.5 backdrop-blur">
                  {i + 1} / {images.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 p-2.5">
                <div className="flex items-center gap-1">
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
                    onClick={() => setCover(i)}
                    disabled={i === coverIndex}
                    label="Set as cover"
                  >
                    {i === coverIndex ? (
                      <StarOff className="h-3.5 w-3.5" strokeWidth={2.4} />
                    ) : (
                      <Star className="h-3.5 w-3.5" strokeWidth={2.4} />
                    )}
                  </IconBtn>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn onClick={() => handleReplace(i)} label="Replace photo">
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </IconBtn>
                  <IconBtn onClick={() => remove(i)} label="Delete photo" tone="danger">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </IconBtn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-navy-700/55">
        Changes are local — refreshing the page will reset to the original photo set. Backend sync
        is not wired in this mock build.
      </p>

      <Lightbox
        images={lb.images}
        initialIndex={lb.index}
        open={lb.open}
        onClose={lb.close}
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
        "h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors",
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
