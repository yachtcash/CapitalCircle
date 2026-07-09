import { Eye, Lock } from "lucide-react";
import type { DocumentVisibility } from "@/data/documents";
import Badge from "@/components/ui/Badge";

type Props = {
  visibility: DocumentVisibility;
  size?: "sm" | "md";
};

export default function VisibilityBadge({ visibility, size = "sm" }: Props) {
  const isPublic = visibility === "Public";
  const Icon = isPublic ? Eye : Lock;
  return (
    <Badge
      size={size}
      className={
        isPublic
          ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30"
          : "bg-navy-900/[0.05] text-navy-700 ring-navy-900/15"
      }
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2.4} />
      {visibility}
    </Badge>
  );
}
