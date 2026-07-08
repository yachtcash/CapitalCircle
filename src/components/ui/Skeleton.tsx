import { cn } from "@/lib/cn";

/**
 * Loading placeholders — one pulse treatment everywhere so pre-hydration
 * surfaces settle without layout jumps. Presentation only.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-xl bg-navy-900/[0.06]", className)}
    />
  );
}

/** Card-shaped skeleton matching the marketplace card silhouette (16:10 image + text). */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden",
        className
      )}
    >
      <div className="aspect-[16/10] animate-pulse bg-navy-900/[0.06]" />
      <div className="p-5 space-y-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
