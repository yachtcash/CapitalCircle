import { cn } from "@/lib/cn";

export type CardVariant = "default" | "elevated" | "interactive" | "dark";
export type CardPadding = "none" | "compact" | "default" | "spacious";

const VARIANTS: Record<CardVariant, string> = {
  default: "rounded-2xl bg-white ring-1 ring-navy-900/[0.06]",
  elevated: "rounded-2xl bg-white ring-1 ring-navy-900/[0.06] shadow-xl shadow-navy-900/5",
  interactive:
    "rounded-2xl bg-white ring-1 ring-navy-900/[0.06] hover:ring-gold-500/50 hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 transition-all",
  dark: "rounded-2xl bg-navy-900 text-white ring-1 ring-white/5",
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  compact: "p-4",
  default: "p-5 md:p-6",
  spacious: "p-6 md:p-8",
};

/** Canonical surface. One radius, ring, shadow, and hover language. */
export default function Card({
  variant = "default",
  padding = "default",
  className,
  children,
  ...rest
}: {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn(VARIANTS[variant], PADDING[padding], "overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("px-5 md:px-6 py-4 border-b border-navy-900/[0.06]", className)}>{children}</div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5 md:p-6", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("px-5 md:px-6 py-4 border-t border-navy-900/[0.06] bg-bone/30", className)}>
      {children}
    </div>
  );
}
