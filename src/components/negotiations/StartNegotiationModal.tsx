"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Handshake, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import Modal from "./Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Opportunity } from "@/data/opportunities";

type Props = {
  open: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  companyName: string;
};

export default function StartNegotiationModal({
  open,
  onClose,
  opportunity,
  companyName,
}: Props) {
  const router = useRouter();
  const { createNegotiationConversation } = useMessaging();
  const [agreed, setAgreed] = useState(false);

  const reset = () => {
    setAgreed(false);
    onClose();
  };

  const handleAccept = () => {
    if (!agreed) return;
    const id = createNegotiationConversation({
      companyId: opportunity.companyId,
      opportunitySlug: opportunity.slug,
      opportunityTitle: opportunity.title,
      opportunityCategory: opportunity.category,
      opportunityLocation: opportunity.location,
      opportunityImage: opportunity.images[0],
    });
    setAgreed(false);
    onClose();
    router.push(`/messages?conversation=${id}`);
  };

  return (
    <Modal
      open={open}
      onClose={reset}
      title="Begin a formal negotiation"
      description={`Open a private negotiation channel with ${companyName}. All communication, documents, and term iterations stay inside Capital Circle.`}
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={reset}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!agreed}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
              agreed
                ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
                : "bg-navy-900/10 text-navy-700/40 cursor-not-allowed"
            }`}
          >
            <Handshake className="h-4 w-4" strokeWidth={2.3} />
            Accept &amp; Begin
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </>
      }
    >
      <div className="rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.06] px-4 py-3 mb-5">
        <div className="text-[10px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
          {opportunity.category}
        </div>
        <div className="mt-1 text-sm font-semibold text-navy-900 leading-snug">
          {opportunity.title}
        </div>
        <div className="mt-0.5 text-xs text-navy-700/65">
          {companyName} · {opportunity.location}
        </div>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.08] p-5 mb-5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
          Terms and conditions
        </div>
        <ol className="mt-3 space-y-2.5 text-sm text-navy-700/85 leading-relaxed list-decimal pl-5">
          <li>
            All communication, document exchange, and term iteration will take place inside
            Capital Circle. Out-of-band negotiation is prohibited until terms are finalized.
          </li>
          <li>
            Documents shared in this negotiation are confidential. By accepting, you agree not to
            distribute them outside your immediate diligence team without sponsor consent.
          </li>
          <li>
            Capital Circle does not provide investment advice. You are responsible for your own
            due diligence and any decision to commit capital.
          </li>
          <li>
            Either party may withdraw from the negotiation at any time. Doing so closes the
            channel but preserves the conversation history for your records.
          </li>
        </ol>
      </div>

      <label className="flex items-start gap-3 rounded-xl bg-gold-500/[0.06] ring-1 ring-gold-500/30 px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-gold-600 h-4 w-4"
        />
        <span className="text-sm text-navy-900 leading-relaxed">
          <span className="font-semibold">I agree to conduct negotiations through Capital Circle.</span>
          <span className="block text-xs text-navy-700/65 mt-0.5 inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
            Required to open the negotiation channel.
          </span>
        </span>
      </label>
    </Modal>
  );
}
