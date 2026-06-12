"use client";

import { useRef } from "react";
import Image from "next/image";
import { RefreshCw, Trash2, Image as ImageIcon } from "lucide-react";
import {
  deleteImage as deleteStoredImage,
  isStoredImageToken,
  putImage,
  useResolvedImage,
} from "@/lib/imageStore";
import { cn } from "@/lib/cn";

type Props = {
  /** Control label, e.g. "Company Logo", "Cover Image", "Avatar". */
  label: string;
  /** Current src (URL or idb:// token); undefined = none set. */
  value?: string;
  /** Aspect of the preview tile. */
  shape?: "square" | "wide";
  /** Fallback letter/initials when no image is set. */
  fallbackText?: string;
  /**
   * Persist the new src (or undefined on remove). The caller records the
   * matching audit event — actions differ per slot (Logo / Cover / Avatar).
   */
  onChange: (next: string | undefined) => void;
  /** Allow clearing the slot back to its fallback. */
  removable?: boolean;
};

/**
 * Single-slot image control for logos, covers, and avatars. Same storage
 * path as every gallery: file → IndexedDB blob via putImage → idb:// token
 * → autosaved through the caller's overlay. Replacing frees the previous
 * IDB blob; URLs pass through untouched.
 */
export default function SingleImageManager({
  label,
  value,
  shape = "wide",
  fallbackText,
  onChange,
  removable = false,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const resolved = useResolvedImage(value);

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const token = await putImage(file, file.name);
    if (value && isStoredImageToken(value)) {
      void deleteStoredImage(value);
    }
    onChange(token);
  };

  const handleRemove = () => {
    if (value && isStoredImageToken(value)) {
      void deleteStoredImage(value);
    }
    onChange(undefined);
  };

  return (
    <div className="rounded-2xl bg-bone/40 ring-1 ring-navy-900/[0.05] p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/60 mb-2.5">
        {label}
      </div>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-navy-900 ring-1 ring-navy-900/10",
            shape === "square"
              ? "h-20 w-20 rounded-2xl"
              : "h-20 w-36 rounded-xl"
          )}
        >
          {resolved ? (
            <Image
              src={resolved}
              alt={label}
              fill
              sizes="160px"
              className="object-cover"
              unoptimized
            />
          ) : fallbackText ? (
            <span className="absolute inset-0 flex items-center justify-center text-gold-500 text-xl font-semibold tracking-wide">
              {fallbackText}
            </span>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-white/40">
              <ImageIcon className="h-6 w-6" strokeWidth={1.8} />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
            {value ? `Replace ${label}` : `Upload ${label}`}
          </button>
          {removable && value ? (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rose-500/40 hover:bg-rose-500/10 text-rose-700 font-semibold px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void handleFile(file);
        }}
      />
    </div>
  );
}
