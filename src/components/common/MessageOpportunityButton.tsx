"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Opportunity } from "@/data/opportunities";
import { cn } from "@/lib/cn";

type Props = {
  opportunity: Opportunity;
  /** Tight icon-only button for card overlays, full button for sidebars. */
  variant?: "icon" | "full";
  className?: string;
};

/**
 * Universal "Message sponsor" button. Creates a project-aware conversation
 * (system "Interest Submitted" + opportunity context) and routes to the
 * thread. Reusable anywhere a user sees a listing: cards, map preview,
 * sponsor blocks, etc.
 */
export default function MessageOpportunityButton({
  opportunity,
  variant = "full",
  className,
}: Props) {
  const router = useRouter();
  const { createInterestConversation } = useMessaging();

  const handle = (e: React.MouseEvent) => {
    // Stop propagation so clicks on an enclosing card link don't navigate.
    e.preventDefault();
    e.stopPropagation();
    const id = createInterestConversation({
      companyId: opportunity.companyId,
      opportunitySlug: opportunity.slug,
      opportunityTitle: opportunity.title,
      opportunityCategory: opportunity.category,
      opportunityLocation: opportunity.location,
      opportunityImage: opportunity.images[0],
    });
    router.push(`/messages?conversation=${id}`);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={`Message sponsor about ${opportunity.title}`}
        title="Message sponsor"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-900/85 hover:bg-navy-900 text-gold-500 ring-1 ring-white/15 backdrop-blur shadow-sm transition-colors",
          className
        )}
      >
        <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.4} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-900/90 text-white font-semibold px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors",
        className
      )}
    >
      <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.4} />
      Message
    </button>
  );
}
