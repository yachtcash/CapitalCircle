"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

export type LightboxImage = {
  src: string;
  alt?: string;
  caption?: string;
};

type Props = {
  images: LightboxImage[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
};

/**
 * Universal full-screen lightbox.
 *
 * Features:
 *  - X close button
 *  - Click-outside to close
 *  - ESC to close
 *  - Left / right arrows (on-screen + keyboard)
 *  - "Image N of M" counter
 *  - Mobile swipe support (horizontal drag past ~50px advances)
 *  - Caption row beneath the image
 *
 * Pass `open={false}` to mount but hide. The component locks body scroll
 * while open and restores it on close/unmount.
 */
export default function Lightbox({ images, initialIndex, open, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);

  // Keep the index in range as `images` or `initialIndex` change.
  useEffect(() => {
    if (!open) return;
    if (initialIndex < 0 || initialIndex >= images.length) {
      setIndex(0);
    } else {
      setIndex(initialIndex);
    }
  }, [open, initialIndex, images.length]);

  const canPrev = images.length > 1;
  const canNext = images.length > 1;

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);
  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && canPrev) goPrev();
      else if (e.key === "ArrowRight" && canNext) goNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, goPrev, goNext, canPrev, canNext]);

  // Touch swipe
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const dx = endX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && canNext) goNext();
      else if (dx > 0 && canPrev) goPrev();
    }
    touchStartX.current = null;
  };

  if (!open || images.length === 0) return null;

  const active = images[index];

  return (
    <div
      className="fixed inset-0 z-[80] bg-navy-900/95 backdrop-blur-sm flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      onClick={onClose}
    >
      {/* Top bar */}
      <header
        className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3 text-white/85"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold inline-flex items-center gap-1.5">
          <Expand className="h-3.5 w-3.5 text-gold-500" strokeWidth={2.2} />
          Image{" "}
          <span className="tabular-nums text-white">
            {index + 1} of {images.length}
          </span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-bold text-white/80 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10"
        >
          <X className="h-4 w-4" strokeWidth={2.4} />
          Close
        </button>
      </header>

      {/* Main */}
      <div
        className="flex-1 flex items-center justify-center px-3 md:px-12 pb-4 select-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {canPrev ? (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="hidden md:inline-flex h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center mr-3 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
          </button>
        ) : null}

        <figure className="relative w-full max-w-5xl">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden ring-1 ring-white/15 bg-navy-900">
            {/* next/image accepts both raster and SVG — using fill so we don't depend on intrinsic dims. */}
            <Image
              key={active.src}
              src={active.src}
              alt={active.alt ?? `Image ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          {active.caption ? (
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {active.caption}
            </figcaption>
          ) : null}
        </figure>

        {canNext ? (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="hidden md:inline-flex h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center ml-3 transition-colors"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={2.2} />
          </button>
        ) : null}
      </div>

      {/* Mobile prev/next bar */}
      {images.length > 1 ? (
        <div
          className="md:hidden flex items-center justify-center gap-3 pb-5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <span className="text-xs uppercase tracking-[0.14em] text-white/70 font-semibold tabular-nums">
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      ) : null}

      {/* Filmstrip */}
      {images.length > 1 ? (
        <div
          className="hidden md:flex items-center justify-center gap-2 pb-5"
          onClick={(e) => e.stopPropagation()}
        >
          {images.slice(0, 10).map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative h-12 w-16 rounded-lg overflow-hidden ring-1 transition-all ${
                i === index
                  ? "ring-gold-500"
                  : "ring-white/15 opacity-65 hover:opacity-100"
              }`}
            >
              <Image src={img.src} alt="" fill sizes="64px" className="object-cover" unoptimized />
            </button>
          ))}
          {images.length > 10 ? (
            <span className="text-xs text-white/55 font-semibold ml-1">
              +{images.length - 10}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Helper hook — returns props you can spread onto a clickable thumbnail tile.
 * Pair with `<Lightbox open={open} onClose={close} images={images} initialIndex={index} />`.
 */
export function useLightbox(images: LightboxImage[]) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  return useMemo(
    () => ({ open, index, openAt, close, images }),
    [open, index, openAt, close, images]
  );
}
