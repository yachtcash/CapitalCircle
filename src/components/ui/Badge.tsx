import { tone as TONES, type Tone } from "@/lib/design/tokens";
import { cn } from "@/lib/cn";

export type BadgeSize = "sm" | "md" | "lg";

const SIZES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[10px]",
  lg: "px-3 py-1.5 text-[11px]",
};

/**
 * Canonical status/category badge shell. Every pill in the app shares this
 * shape: inline-flex, uppercase, tracked, bold, rounded-full, ring-1.
 *
 * Pass `tone` for a semantic tint, or omit it and supply your own color
 * classes via `className` (used by domain badges with bespoke color maps,
 * e.g. deal stages).
 */
export default function Badge({
  tone,
  size = "md",
  className,
  children,
}: {
  tone?: Tone;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full uppercase tracking-[0.14em] font-bold ring-1 whitespace-nowrap",
        SIZES[size],
        tone ? TONES[tone] : null,
        className
      )}
    >
      {children}
    </span>
  );
}
