"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

import Lightbox, { useLightbox } from "@/components/common/Lightbox";
import { useResolvedImages } from "@/lib/imageStore";
import { cn } from "@/lib/cn";

export default function OpportunityImages({ images, title }: { images: string[]; title: string }) {
  const resolved = useResolvedImages(images);
  const lb = useLightbox(resolved.map((src, i) => ({ src, alt: `${title} — Photo ${i + 1}` })));
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  const count = images.length;
  const go = (dir: -1 | 1) => setCurrent((c) => (c + dir + count) % count);

  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
              <Images className="h-3.5 w-3.5" strokeWidth={2.2} />
              Gallery · {count} {count === 1 ? "photo" : "photos"}
            </div>
            <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">Property &amp; renderings</h2>
          </div>
          <button
            type="button"
            onClick={() => lb.openAt(current)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 bg-white hover:bg-bone ring-1 ring-navy-900/10 rounded-full px-4 py-2 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.4} />
            Fullscreen
          </button>
        </div>

        {/* Main image */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-navy-900/5 ring-1 ring-navy-900/[0.06] group">
          <button
            type="button"
            onClick={() => lb.openAt(current)}
            className="absolute inset-0 z-0"
            aria-label={`Open ${title} photo ${current + 1} fullscreen`}
          >
            {resolved[current] ? (
              <Image
                key={current}
                src={resolved[current]}
                alt={`${title} — Photo ${current + 1}`}
                fill
                priority
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="object-cover transition-opacity duration-300"
                unoptimized
              />
            ) : null}
          </button>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-navy-900/55 hover:bg-navy-900/80 text-white inline-flex items-center justify-center ring-1 ring-white/15 backdrop-blur transition-colors"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-navy-900/55 hover:bg-navy-900/80 text-white inline-flex items-center justify-center ring-1 ring-white/15 backdrop-blur transition-colors"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </>
          ) : null}

          <span className="absolute bottom-3 right-3 z-10 inline-flex items-center text-[11px] font-semibold tabular-nums rounded-full px-2.5 py-1 bg-navy-900/70 text-white ring-1 ring-white/15 backdrop-blur">
            {current + 1} / {count}
          </span>
          <span className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-navy-900/55 text-white ring-1 ring-white/15 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Maximize2 className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </div>

        {/* Thumbnail strip */}
        {count > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 snap-x">
            {resolved.map((src, i) => (
              <button
                key={(src ?? "") + i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === current}
                className={cn(
                  "relative shrink-0 h-16 w-24 md:h-20 md:w-28 rounded-xl overflow-hidden bg-navy-900/5 ring-2 transition-all snap-start",
                  i === current ? "ring-gold-500" : "ring-transparent hover:ring-navy-900/15 opacity-80 hover:opacity-100"
                )}
              >
                {src ? (
                  <Image src={src} alt={`${title} — thumbnail ${i + 1}`} fill sizes="112px" className="object-cover" unoptimized />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Lightbox images={lb.images} initialIndex={lb.index} open={lb.open} onClose={lb.close} />
    </section>
  );
}
