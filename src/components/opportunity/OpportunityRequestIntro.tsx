"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import type { Member } from "@/data/members";
import RequestIntroductionModal from "@/components/members/RequestIntroductionModal";
import ShowInterestModal from "@/components/negotiations/ShowInterestModal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { cn } from "@/lib/cn";

/**
 * "Request Introduction" CTA for an opportunity. When a lead sponsor member is
 * linked, it opens the platform-brokered member introduction flow; otherwise it
 * falls back to the existing opportunity interest flow (which contacts the
 * sponsor). Reuses both existing modals — no new messaging logic.
 */
export default function OpportunityRequestIntro({
  opportunity,
  leadMember,
  companyName,
  label = "Request Introduction",
  className,
}: {
  opportunity: Opportunity;
  leadMember: Member | null;
  companyName: string;
  label?: string;
  className?: string;
}) {
  const { currentRole } = useMessaging();
  const [open, setOpen] = useState(false);

  // Introductions are a member capability.
  if (currentRole === "Guest") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors",
          className
        )}
      >
        <Sparkles className="h-4 w-4" strokeWidth={2.3} />
        {label}
      </button>
      {leadMember ? (
        <RequestIntroductionModal open={open} onClose={() => setOpen(false)} member={leadMember} />
      ) : (
        <ShowInterestModal open={open} onClose={() => setOpen(false)} opportunity={opportunity} companyName={companyName} />
      )}
    </>
  );
}
