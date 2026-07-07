"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, UserPlus, Send, ShieldCheck, CheckCircle2 } from "lucide-react";

import Modal from "@/components/negotiations/Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Company } from "@/data/companies";

const REASONS = [
  "Direct LP allocation",
  "Project sponsorship discussion",
  "Joint venture exploration",
  "Co-investment interest",
  "Vendor / service offering",
  "General networking",
  "Other",
];

export default function CompanyContactActions({ company }: { company: Company }) {
  const router = useRouter();
  const { createInterestConversation, submitIntroductionRequest, currentRole } = useMessaging();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const lead = company.team?.[0];
  const targetName = lead ? lead.name : company.name;

  // Messaging and introductions are member capabilities.
  if (currentRole === "Guest") return null;

  const contact = () => {
    const id = createInterestConversation({ companyId: company.id });
    router.push(`/messages?conversation=${id}`);
  };

  const openModal = () => {
    setReason(REASONS[0]);
    setMessage("");
    setSubmitted(null);
    setOpen(true);
  };

  const canSubmit = message.trim().length > 0;
  const submit = () => {
    if (!canSubmit) return;
    const id = submitIntroductionRequest({
      // Company-level request: there is no specific member target, so leave the
      // member id empty rather than overloading it with a COMP id (which would
      // leak into deal sponsor ids / member analytics). The company is carried
      // via companyId/companyName; targetMemberName is the display label.
      targetMemberId: "",
      targetMemberName: targetName,
      reason: reason.trim(),
      message: message.trim(),
      companyId: company.id,
      companyName: company.name,
    });
    setSubmitted(id);
  };

  return (
    <>
      <button
        type="button"
        onClick={contact}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/10 hover:ring-navy-900/25 text-navy-900/80 hover:text-navy-900 text-[13px] font-medium px-4 py-2.5 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        Contact
      </button>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/10 hover:ring-navy-900/25 text-navy-900/80 hover:text-navy-900 text-[13px] font-medium px-4 py-2.5 transition-colors"
      >
        <UserPlus className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        Request Introduction
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={submitted ? "Request submitted" : `Request introduction · ${company.name}`}
        description={
          submitted
            ? "Capital Circle has received your request and will review it shortly."
            : "Capital Circle reviews every request and brokers introductions to the sponsor on your behalf."
        }
        maxWidth="lg"
        footer={
          submitted ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm transition-colors disabled:bg-navy-900/10 disabled:text-navy-700/40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" strokeWidth={2.3} />
                Submit Request
              </button>
            </>
          )
        }
      >
        {submitted ? (
          <div className="rounded-2xl bg-emerald-500/[0.08] ring-1 ring-emerald-500/30 p-5 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" strokeWidth={2.2} />
            <div>
              <div className="font-semibold text-navy-900">Submitted to Capital Circle</div>
              <p className="mt-1 text-sm text-navy-700/80 leading-relaxed">
                Reference{" "}
                <span className="font-semibold text-navy-900 tabular-nums">{submitted}</span>. An admin
                will review and broker the introduction. Track status under{" "}
                <span className="font-semibold text-navy-900">Dashboard → Introductions</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl bg-gold-500/[0.08] ring-1 ring-gold-500/25 p-4 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-gold-700 mt-0.5 shrink-0" strokeWidth={2.2} />
              <div className="text-sm text-navy-900/85 leading-relaxed">
                <div className="font-semibold">Platform-brokered introduction</div>
                <p className="mt-1 text-navy-700/85">
                  Your request goes to Capital Circle, which reaches out to{" "}
                  <span className="font-semibold text-navy-900">{targetName}</span>
                  {lead ? ` (${lead.role})` : ""} at {company.name} on your behalf.
                </p>
              </div>
            </div>

            <label className="block">
              <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-1.5">
                Reason for introduction
              </span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-1.5">
                Message
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Briefly explain the context and what you'd like the platform to coordinate."
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/45 resize-none leading-relaxed"
                maxLength={1500}
              />
              <div className="mt-1 text-[11px] text-navy-700/55 text-right tabular-nums">{message.length}/1500</div>
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
