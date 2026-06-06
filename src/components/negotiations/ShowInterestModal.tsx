"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import Modal from "./Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Opportunity } from "@/data/opportunities";

type Props = {
  open: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  companyName: string;
};

export default function ShowInterestModal({ open, onClose, opportunity, companyName }: Props) {
  const router = useRouter();
  const { createInterestConversation } = useMessaging();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    const id = createInterestConversation(
      {
        companyId: opportunity.companyId,
        opportunitySlug: opportunity.slug,
        opportunityTitle: opportunity.title,
        opportunityCategory: opportunity.category,
        opportunityLocation: opportunity.location,
        opportunityImage: opportunity.images[0],
      },
      note
    );
    setNote("");
    setSubmitting(false);
    onClose();
    router.push(`/messages?conversation=${id}`);
  };

  const reset = () => {
    if (submitting) return;
    setNote("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={reset}
      title="I'm interested in learning more about this opportunity."
      description={`Send your introduction to ${companyName}. They'll respond inside Capital Circle.`}
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
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.3} />
            Submit Interest
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </>
      }
    >
      <div className="rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.06] px-4 py-3 mb-4">
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

      <label className="block">
        <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-2">
          Add a note <span className="normal-case text-[10px] tracking-wider text-navy-700/40 font-medium">(optional)</span>
        </span>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Mention any specifics you'd like the sponsor to address — minimum check size, fund mandate, geography…"
          className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow resize-none"
        />
      </label>
    </Modal>
  );
}
