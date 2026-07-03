"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-gold-500 hover:bg-gold-400 text-navy-900",
  secondary: "bg-navy-900 hover:bg-navy-800 text-white",
  outline: "bg-white ring-1 ring-navy-900/[0.12] hover:ring-navy-900/30 text-navy-900",
  ghost: "text-navy-900 hover:bg-bone",
  danger: "bg-white ring-1 ring-rose-500/40 hover:bg-rose-500/10 text-rose-700",
  success: "bg-emerald-500/15 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 text-emerald-700",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-1.5",
  lg: "px-6 py-3 text-sm gap-2",
};

const ICON_ONLY: Record<ButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-11 w-11",
};

/**
 * Canonical button. One height, radius, weight, hover, focus, and disabled
 * language per size tier. Renders a <Link> when `href` is provided.
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  iconOnly = false,
  iconLeft,
  iconRight,
  className,
  children,
  href,
  target,
  rel,
  onClick,
  disabled,
  type = "button",
  title,
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  /** Render as a Link when set. */
  href?: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
}) {
  const cls = cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-colors select-none",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    iconOnly ? ICON_ONLY[size] : SIZES[size],
    fullWidth && "w-full",
    VARIANTS[variant],
    className
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} aria-hidden />
      ) : (
        iconLeft ?? null
      )}
      {iconOnly ? (loading || iconLeft ? null : children) : children}
      {iconRight ?? null}
    </>
  );

  if (href) {
    // Anchors never match the :disabled pseudo-class, so inert state must be
    // applied explicitly: block pointer AND keyboard activation.
    const inert = disabled || loading;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        title={title}
        aria-label={ariaLabel}
        aria-disabled={inert || undefined}
        aria-busy={loading || undefined}
        tabIndex={inert ? -1 : undefined}
        onClick={inert ? (e) => e.preventDefault() : undefined}
        className={cn(cls, inert && "opacity-50 cursor-not-allowed pointer-events-none")}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-busy={loading || undefined}
      className={cls}
    >
      {content}
    </button>
  );
}
