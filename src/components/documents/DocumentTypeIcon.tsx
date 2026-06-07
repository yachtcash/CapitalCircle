import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileType2,
  Image as ImageIcon,
  FileArchive,
  type LucideIcon,
} from "lucide-react";
import type { DocumentFileType } from "@/data/documents";
import { cn } from "@/lib/cn";

const META: Record<DocumentFileType, { icon: LucideIcon; tone: string; label: string }> = {
  pdf: { icon: FileText, tone: "text-rose-700 bg-rose-500/10 ring-rose-500/20", label: "PDF" },
  xlsx: { icon: FileSpreadsheet, tone: "text-emerald-700 bg-emerald-500/10 ring-emerald-500/20", label: "XLSX" },
  pptx: { icon: Presentation, tone: "text-orange-600 bg-orange-500/10 ring-orange-500/20", label: "PPTX" },
  docx: { icon: FileType2, tone: "text-sky-700 bg-sky-500/10 ring-sky-500/20", label: "DOCX" },
  jpg: { icon: ImageIcon, tone: "text-fuchsia-600 bg-fuchsia-500/10 ring-fuchsia-500/20", label: "JPG" },
  png: { icon: ImageIcon, tone: "text-fuchsia-600 bg-fuchsia-500/10 ring-fuchsia-500/20", label: "PNG" },
  zip: { icon: FileArchive, tone: "text-amber-700 bg-amber-500/10 ring-amber-500/20", label: "ZIP" },
};

export function fileTypeLabel(type: DocumentFileType): string {
  return META[type].label;
}

type Props = {
  type: DocumentFileType;
  size?: "sm" | "md" | "lg";
};

export default function DocumentTypeIcon({ type, size = "md" }: Props) {
  const m = META[type];
  const Icon = m.icon;
  const dim =
    size === "lg"
      ? "h-12 w-12 [&_svg]:h-5 [&_svg]:w-5"
      : size === "md"
        ? "h-10 w-10 [&_svg]:h-[18px] [&_svg]:w-[18px]"
        : "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl ring-1 shrink-0",
        dim,
        m.tone
      )}
    >
      <Icon strokeWidth={1.9} />
    </span>
  );
}
