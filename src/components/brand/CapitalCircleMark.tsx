import { cn } from "@/lib/cn";

/**
 * Capital Circle brand mark — "La Órbita": an open blue ring with a glowing
 * orbit dot, symbolising constant connection and capital in motion. This is the
 * single source of truth for the in-product mark and matches the favicon /
 * app icon (src/app/icon.svg, public/branding/icon-master.svg).
 *
 * The mark carries its own brand-blue gradient, so it renders cleanly on any
 * background without a coloured container. The app's gold accent is unchanged.
 */
export default function CapitalCircleMark({
  className,
  title = "Capital Circle",
}: {
  className?: string;
  /** kept for backwards-compat; the standalone mark needs no extra ring */
  withRing?: boolean;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="ccRing" x1="15%" y1="90%" x2="85%" y2="10%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6F9BFF" />
          <stop offset="60%" stopColor="#2563FF" />
          <stop offset="100%" stopColor="#2563FF" />
        </linearGradient>
        <radialGradient id="ccDot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B86FF" />
          <stop offset="55%" stopColor="#2563FF" />
          <stop offset="100%" stopColor="#2563FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Orbit ring — open at the top-right where the dot sits */}
      <circle
        cx="50"
        cy="50"
        r="33"
        fill="none"
        stroke="url(#ccRing)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="181 26"
        transform="rotate(-30 50 50)"
      />

      {/* Orbit dot + soft glow */}
      <circle cx="70" cy="24" r="13" fill="url(#ccDot)" />
      <circle cx="70" cy="24" r="6.8" fill="#2563FF" />
    </svg>
  );
}
