/**
 * Capital Circle design tokens — the single source of truth for the visual
 * language. These are documented Tailwind class strings (not a runtime theme)
 * so components stay tree-shakeable and the JIT compiler sees every class.
 *
 * Rules:
 *  - New UI composes these tokens (directly or via src/components/ui/*).
 *  - Never invent a new radius / shadow / eyebrow style inline — extend here.
 *  - Gold is the UI accent; brand blue lives in the logo only.
 */

// ---- Typography scale ----
export const text = {
  /** Marketing hero display (homepage / final CTA only). */
  display: "text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight",
  /** Page title (H1). */
  pageTitle: "text-2xl md:text-3xl font-semibold tracking-tight text-navy-900",
  /** Section title (H2). */
  sectionTitle: "text-xl md:text-2xl font-semibold tracking-tight text-navy-900",
  /** Card / sub-block title (H3). */
  cardTitle: "text-[15px] md:text-base font-semibold text-navy-900 leading-snug",
  /** Gold section eyebrow. */
  eyebrow: "text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold",
  /** Small stat / caption label. */
  label: "text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold",
  /** Body copy. */
  body: "text-sm md:text-[15px] text-navy-700/85 leading-relaxed",
  /** Muted metadata. */
  muted: "text-xs text-navy-700/60",
} as const;

// ---- Surfaces ----
export const surface = {
  /** Standard light card. */
  card: "rounded-2xl bg-white ring-1 ring-navy-900/[0.06]",
  /** Elevated card (floats over heroes). */
  elevated: "rounded-2xl bg-white ring-1 ring-navy-900/[0.06] shadow-xl shadow-navy-900/5",
  /** Interactive card hover language. */
  interactive:
    "hover:ring-gold-500/50 hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 transition-all",
  /** Dark (navy) panel. */
  dark: "rounded-2xl bg-navy-900 text-white ring-1 ring-white/5",
  /** Muted inset (bone) chip/panel. */
  inset: "rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05]",
} as const;

// ---- Radius scale ----
export const radius = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  pill: "rounded-full",
} as const;

// ---- Shadow scale (always navy-tinted) ----
export const shadow = {
  sm: "shadow-sm",
  md: "shadow-md shadow-navy-900/5",
  lg: "shadow-lg shadow-navy-900/5",
  floating: "shadow-xl shadow-navy-900/5",
  modal: "shadow-2xl",
  hover: "shadow-xl shadow-navy-900/10",
} as const;

// ---- Motion ----
export const motion = {
  colors: "transition-colors",
  all: "transition-all",
  /** Slow image zoom on hover. */
  media: "transition-transform duration-500",
} as const;

// ---- Icon sizes ----
export const icon = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  nav: "h-[18px] w-[18px]",
} as const;

// ---- Semantic status tones (tinted pill: bg/text/ring) ----
export const tone = {
  neutral: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
  gold: "bg-gold-500/15 text-gold-700 ring-gold-500/40",
  success: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  danger: "bg-rose-500/15 text-rose-700 ring-rose-500/30",
  info: "bg-sky-500/15 text-sky-700 ring-sky-500/30",
  violet: "bg-violet-500/15 text-violet-700 ring-violet-500/30",
  navy: "bg-navy-900 text-gold-400 ring-navy-900",
} as const;

export type Tone = keyof typeof tone;
