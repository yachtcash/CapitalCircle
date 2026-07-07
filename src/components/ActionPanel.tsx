"use client";

import { useState } from "react";
import { Heart, Handshake, Sparkles, Lock, ShieldCheck } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { useMessaging } from "@/components/providers/MessagingProvider";
import ShowInterestModal from "@/components/negotiations/ShowInterestModal";
import StartNegotiationModal from "@/components/negotiations/StartNegotiationModal";
import { cn } from "@/lib/cn";

export default function ActionPanel({ opportunity }: { opportunity: Opportunity }) {
  const company = getCompanyById(opportunity.companyId);
  const companyName = company?.name ?? opportunity.postedBy;

  const { isOpportunitySaved, toggleSavedOpportunity, hydrated, currentRole } = useMessaging();
  const saved = hydrated && isOpportunitySaved(opportunity.id);

  const [interestOpen, setInterestOpen] = useState(false);
  const [negotiationOpen, setNegotiationOpen] = useState(false);

  // Guests browse only — engagement (interest, negotiation, saving) is for
  // members. Show the membership prompt instead of the action panel.
  if (currentRole === "Guest") {
    return (
      <div className="rounded-2xl bg-navy-900 text-white ring-1 ring-white/5 p-5 md:p-6">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold">
          <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
          Members only
        </div>
        <div className="mt-2 text-base font-semibold">Engage with this opportunity</div>
        <p className="mt-1.5 text-sm text-white/65 leading-relaxed">
          Members can express interest, open negotiations, and save deals to
          their watchlist.
        </p>
        <a
          href="/login"
          className="mt-4 inline-flex items-center justify-center gap-1.5 w-full rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
        >
          Member Login
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-navy-900 text-white ring-1 ring-white/5 overflow-hidden">
        <div className="relative p-5 md:p-6">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 100% 0%, rgba(212,175,55,0.35), transparent 55%)",
            }}
          />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold">
              Engage with the sponsor
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/55 font-semibold">
                  Minimum
                </div>
                <div className="mt-1 text-sm font-semibold">{opportunity.minimumInvestment}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/55 font-semibold">
                  Target return
                </div>
                <div className="mt-1 text-sm font-semibold">{opportunity.expectedReturn}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 pt-0 space-y-2.5">
          <button
            type="button"
            onClick={() => setInterestOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-5 py-3 text-sm transition-colors"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.3} />
            Show Interest
          </button>
          <button
            type="button"
            onClick={() => toggleSavedOpportunity(opportunity.id)}
            aria-pressed={saved}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 rounded-full ring-1 font-medium px-5 py-2.5 text-[13px] transition-colors",
              saved
                ? "bg-gold-500/15 text-gold-300 ring-gold-500/40 hover:bg-gold-500/20"
                : "bg-white/5 hover:bg-white/10 ring-white/15 text-white/85"
            )}
          >
            <Heart
              className={cn("h-3.5 w-3.5", saved ? "fill-gold-400" : "")}
              strokeWidth={2}
            />
            {saved ? "Saved" : "Save Opportunity"}
          </button>
          <button
            type="button"
            onClick={() => setNegotiationOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-transparent hover:bg-white/[0.04] ring-1 ring-white/10 text-white/70 font-medium px-5 py-2.5 text-[13px] transition-colors"
          >
            <Handshake className="h-3.5 w-3.5" strokeWidth={2} />
            Start Negotiation
          </button>
        </div>

        <div className="border-t border-white/5 px-5 md:px-6 py-4 flex items-start gap-2.5 text-[11px] text-white/55 leading-relaxed">
          <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gold-400" strokeWidth={2.2} />
          <span>
            All conversations are private between you and {opportunity.postedBy}. Documents
            unlock after NDA is countersigned.
          </span>
        </div>

        <div className="bg-white/[0.03] px-5 md:px-6 py-3.5 flex items-center gap-2 text-[11px] text-white/70">
          <ShieldCheck className="h-3.5 w-3.5 text-gold-400" strokeWidth={2.2} />
          <span>Verified sponsor · Vetted member access only</span>
        </div>
      </div>

      <ShowInterestModal
        open={interestOpen}
        onClose={() => setInterestOpen(false)}
        opportunity={opportunity}
        companyName={companyName}
      />
      <StartNegotiationModal
        open={negotiationOpen}
        onClose={() => setNegotiationOpen(false)}
        opportunity={opportunity}
        companyName={companyName}
      />
    </>
  );
}
