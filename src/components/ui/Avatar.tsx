"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, { box: string; text: string; sizes: string }> = {
  sm: { box: "h-9 w-9 rounded-lg", text: "text-xs", sizes: "36px" },
  md: { box: "h-12 w-12 rounded-xl", text: "text-sm", sizes: "48px" },
  lg: { box: "h-16 w-16 rounded-2xl", text: "text-lg", sizes: "64px" },
  xl: { box: "h-24 w-24 md:h-28 md:w-28 rounded-2xl", text: "text-3xl md:text-4xl", sizes: "112px" },
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Canonical avatar: navy tile with gold initials, replaced by the image when
 * one resolves. `circle` renders the round variant; `verified` adds the badge.
 */
export default function Avatar({
  name,
  src,
  size = "md",
  circle = false,
  verified = false,
  className,
}: {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  circle?: boolean;
  verified?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      <span
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-navy-900 text-gold-500 ring-1 ring-navy-900/10 font-semibold tracking-wide",
          s.box,
          s.text,
          circle && "rounded-full"
        )}
      >
        {src ? (
          <Image src={src} alt={name} fill sizes={s.sizes} className="object-cover" unoptimized />
        ) : (
          initialsFrom(name)
        )}
      </span>
      {verified ? (
        <span className="absolute -bottom-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-navy-900 ring-2 ring-white">
          <ShieldCheck className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      ) : null}
    </span>
  );
}
