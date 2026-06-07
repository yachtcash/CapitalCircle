import { Eye, Lock } from "lucide-react";
import type { DocumentVisibility } from "@/data/documents";
import { cn } from "@/lib/cn";

type Props = {
  visibility: DocumentVisibility;
  size?: "sm" | "md";
};

export default function VisibilityBadge({ visibility, size = "sm" }: Props) {
  const isPublic = visibility === "Public";
  const Icon = isPublic ? Eye : Lock;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full ring-1 font-bold uppercase",
        size === "sm"
          ? "text-[10px] tracking-[0.14em] px-2 py-0.5"
          : "text-[11px] tracking-[0.16em] px-2.5 py-1",
        isPublic
          ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30"
          : "bg-navy-900/[0.05] text-navy-700 ring-navy-900/15"
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={2.4} />
      {visibility}
    </span>
  );
}
