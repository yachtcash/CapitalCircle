"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { MediaItem } from "./types";

type Props = {
  items: MediaItem[];
  onRemove: (id: string) => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPreviews({ items, onRemove }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((item, index) => (
        <figure
          key={item.id}
          className="group relative aspect-square rounded-xl overflow-hidden bg-navy-900/5 ring-1 ring-navy-900/[0.06]"
        >
          <Image
            src={item.previewUrl}
            alt={item.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
            unoptimized
          />
          {index === 0 ? (
            <span className="absolute top-2 left-2 inline-flex items-center text-[9px] uppercase tracking-[0.14em] font-bold bg-gold-500 text-navy-900 rounded-full px-2 py-0.5">
              Cover
            </span>
          ) : null}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            aria-label={`Remove ${item.name}`}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-navy-900/85 text-white hover:bg-navy-900 transition-colors flex items-center justify-center shadow-md"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
          <figcaption className="absolute inset-x-0 bottom-0 px-3 pt-6 pb-2 bg-gradient-to-t from-navy-900/90 to-transparent text-white">
            <div className="text-[11px] font-medium truncate">{item.name}</div>
            <div className="text-[10px] text-white/70">{formatSize(item.size)}</div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
