import { cn } from "@/lib/cn";

/**
 * Canonical table shell — consistent header, row hover, spacing, and
 * typography. Sorting/selection stay with the caller; these primitives only
 * standardize presentation.
 */
export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-x-auto", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ sticky = false, children }: { sticky?: boolean; children: React.ReactNode }) {
  return (
    <thead className={cn("bg-bone/50", sticky && "sticky top-0 z-10")}>
      <tr className="border-b border-navy-900/[0.06]">{children}</tr>
    </thead>
  );
}

export function TH({
  align = "left",
  className,
  children,
}: {
  align?: "left" | "right" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold whitespace-nowrap",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-navy-900/[0.05]">{children}</tbody>;
}

export function TR({
  selected = false,
  className,
  children,
  ...rest
}: {
  selected?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      {...rest}
      className={cn("hover:bg-cream/50 transition-colors", selected && "bg-gold-500/[0.06]", className)}
    >
      {children}
    </tr>
  );
}

export function TD({
  align = "left",
  className,
  children,
}: {
  align?: "left" | "right" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-navy-900 align-middle",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {children}
    </td>
  );
}
