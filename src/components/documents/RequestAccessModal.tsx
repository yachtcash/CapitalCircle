"use client";

import { useState } from "react";
import { Sparkles, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import Modal from "@/components/negotiations/Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  companyName?: string;
  privateDocsCount?: number;
};

export default function RequestAccessModal({
  open,
  onClose,
  listingId,
  listingTitle,
  companyName,
  privateDocsCount,
}: Props) {
  const { requestDocumentAccess } = useMessaging();
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setMessage("");
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = () => {
    requestDocumentAccess(listingId, message);
    setSubmitted(true);
  };

  return (
    <Modal
      open={open}
      onClose={reset}
      title={submitted ? "Access request submitted" : "Request data room access"}
      description={
        submitted
          ? `The sponsor will review your request and reply through Capital Circle.`
          : `Send your request to the sponsor of ${listingTitle}. Private documents unlock once approved.`
      }
      footer={
        submitted ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.3} />
            Done
          </button>
        ) : (
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
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm transition-colors"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.3} />
              Submit request
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </>
        )
      }
    >
      <div className="rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.06] px-4 py-3 mb-4">
        <div className="text-[10px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
          Data room
        </div>
        <div className="mt-1 text-sm font-semibold text-navy-900 leading-snug">
          {listingTitle}
        </div>
        {companyName ? (
          <div className="mt-0.5 text-xs text-navy-700/65">
            Sponsor: {companyName}
            {typeof privateDocsCount === "number"
              ? ` · ${privateDocsCount} private documents`
              : ""}
          </div>
        ) : null}
      </div>

      {submitted ? (
        <div className="rounded-2xl bg-emerald-500/[0.06] ring-1 ring-emerald-500/30 p-5 flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" strokeWidth={2.2} />
          <div className="text-sm text-navy-900/90 leading-relaxed">
            <div className="font-semibold">You&apos;re in the queue.</div>
            <p className="mt-1 text-navy-700/85">
              We&apos;ll notify you the moment the sponsor decides. Activity will appear under the
              Data Room and on your Dashboard.
            </p>
          </div>
        </div>
      ) : (
        <>
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-2">
              Add a note{" "}
              <span className="normal-case text-[10px] tracking-wider text-navy-700/40 font-medium">
                (optional)
              </span>
            </span>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly describe your firm, your fund mandate, or what you'd like to review first."
              className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow resize-none"
            />
          </label>
          <div className="mt-4 flex gap-2 items-start rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] px-4 py-3">
            <Lock className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-xs text-navy-700/75 leading-relaxed">
              All conversations stay inside Capital Circle. Documents are released only after the
              sponsor approves your request.
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}
