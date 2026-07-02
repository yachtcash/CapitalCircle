import { cn } from "@/lib/cn";

/**
 * Canonical page header: eyebrow → H1 → subtitle, with right-aligned actions
 * and optional breadcrumbs / stats slots. Layout-neutral so existing pages can
 * adopt it without moving content.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  actions,
  stats,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-6 md:mb-8", className)}>
      {breadcrumbs ? <div className="mb-3">{breadcrumbs}</div> : null}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm md:text-[15px] text-navy-700/70 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div> : null}
      </div>
      {stats ? <div className="mt-5">{stats}</div> : null}
    </header>
  );
}
