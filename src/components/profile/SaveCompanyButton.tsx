"use client";

import { Bookmark } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { cn } from "@/lib/cn";

type Props = {
  companyId: string;
  className?: string;
};

export default function SaveCompanyButton({ companyId, className }: Props) {
  const { isCompanySaved, toggleSavedCompany, hydrated } = useMessaging();
  const saved = hydrated && isCompanySaved(companyId);

  return (
    <button
      type="button"
      onClick={() => toggleSavedCompany(companyId)}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] px-3 py-2 ring-1 transition-colors",
        saved
          ? "bg-gold-500 text-navy-900 ring-gold-500 hover:bg-gold-400"
          : "bg-white text-navy-900 ring-navy-900/[0.12] hover:ring-navy-900/30",
        className
      )}
    >
      <Bookmark
        className={cn("h-3.5 w-3.5", saved ? "fill-navy-900" : "")}
        strokeWidth={2.2}
      />
      {saved ? "Saved" : "Save Company"}
    </button>
  );
}
