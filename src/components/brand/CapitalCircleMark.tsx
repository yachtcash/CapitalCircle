import { cn } from "@/lib/cn";

/**
 * Capital Circle monogram — interlocking double-C, gold on transparent.
 * This is the single source of truth for the in-product brand mark; it matches
 * the favicon / app icon (src/app/icon.svg) so branding is consistent everywhere.
 *
 * Render it inside a container that provides the background (the sidebar uses a
 * gold-tinted disc). Pass `withRing` for a standalone mark (e.g. loading screens).
 */
export default function CapitalCircleMark({
  className,
  withRing = false,
  title = "Capital Circle",
}: {
  className?: string;
  withRing?: boolean;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("text-gold-500", className)}
      role="img"
      aria-label={title}
      fill="none"
    >
      <title>{title}</title>
      {withRing ? (
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" opacity="0.32" />
      ) : null}
      {/* Left C — mouth opens right */}
      <path
        d="M 53.02 37.38 A 22 22 0 1 0 53.02 62.62"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Right C — mouth opens left, interlocking */}
      <path
        d="M 46.98 37.38 A 22 22 0 1 1 46.98 62.62"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
