"use client";

import { Bookmark } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { cn } from "@/lib/cn";

/**
 * Save toggle for an opportunity — reuses the existing saved-opportunities store.
 * `tone="dark"` styles it for a navy hero, `tone="light"` for white surfaces.
 */
export default function OpportunitySaveButton({
  opportunityId,
  tone = "light",
  className,
}: {
  opportunityId: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const { isOpportunitySaved, toggleSavedOpportunity, hydrated, currentRole } = useMessaging();
  const saved = hydrated && isOpportunitySaved(opportunityId);

  // Saving is a member capability.
  if (currentRole === "Guest") return null;

  return (
    <button
      type="button"
      onClick={() => toggleSavedOpportunity(opportunityId)}
      aria-pressed={saved}
      aria-label={saved ? "Saved" : "Save opportunity"}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold px-5 py-2.5 text-sm ring-1 transition-colors",
        tone === "dark"
          ? saved
            ? "bg-gold-500 text-navy-900 ring-gold-500 hover:bg-gold-400"
            : "bg-white/5 hover:bg-white/10 ring-white/20 text-white"
          : saved
            ? "bg-gold-500 text-navy-900 ring-gold-500 hover:bg-gold-400"
            : "bg-white ring-navy-900/[0.12] hover:ring-navy-900/30 text-navy-900",
        className
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-navy-900")} strokeWidth={2.2} />
      {saved ? "Saved" : "Save Opportunity"}
    </button>
  );
}
