import type { LucideIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Action = { label: string; href?: string; onClick?: () => void };

/**
 * Canonical empty state (relocated from common/EmptyState): icon disc,
 * headline, short description, primary + secondary CTA.
 */
export default function EmptyState({
  Icon,
  title,
  description,
  action,
  secondary,
  compact = false,
  className,
}: {
  Icon?: LucideIcon;
  title: string;
  description?: string;
  action?: Action;
  secondary?: Action;
  compact?: boolean;
  className?: string;
}) {
  const renderAction = (a: Action, primary: boolean) => {
    const shared = {
      variant: (primary ? "primary" : "outline") as "primary" | "outline",
      size: "sm" as const,
      className: "uppercase tracking-[0.12em]",
    };
    return a.href ? (
      <Button {...shared} href={a.href}>
        {a.label}
      </Button>
    ) : (
      <Button {...shared} onClick={a.onClick}>
        {a.label}
      </Button>
    );
  };

  return (
    <div className={cn("text-center", compact ? "px-4 py-6" : "px-6 py-10 md:py-12", className)}>
      {Icon ? (
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 mx-auto">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
      ) : null}
      <h3 className="mt-3 text-sm font-semibold text-navy-900">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs text-navy-700/65 leading-relaxed max-w-xs mx-auto">{description}</p>
      ) : null}
      {action || secondary ? (
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          {action ? renderAction(action, true) : null}
          {secondary ? renderAction(secondary, false) : null}
        </div>
      ) : null}
    </div>
  );
}
