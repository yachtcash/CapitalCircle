"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import Modal from "@/components/negotiations/Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Member } from "@/data/members";
import { featuredOpportunities } from "@/data/opportunities";
import { companies } from "@/data/companies";

const REASONS = [
  "Direct LP allocation",
  "Project sponsorship discussion",
  "Joint venture exploration",
  "Vendor / service offering",
  "General networking",
  "Other",
];

type Props = {
  open: boolean;
  onClose: () => void;
  member: Member;
};

export default function RequestIntroductionModal({ open, onClose, member }: Props) {
  const { submitIntroductionRequest } = useMessaging();
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState("");
  const [opportunitySlug, setOpportunitySlug] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason(REASONS[0]);
      setMessage("");
      setOpportunitySlug("");
      setCompanyId("");
      setSubmitted(null);
    }
  }, [open]);

  const opportunityChoices = useMemo(
    () =>
      featuredOpportunities.map((o) => ({
        slug: o.slug,
        title: o.title,
      })),
    []
  );
  const companyChoices = useMemo(
    () => companies.map((c) => ({ id: c.id, name: c.name })),
    []
  );

  const canSubmit = reason.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const opportunity = opportunityChoices.find((o) => o.slug === opportunitySlug);
    const company = companyChoices.find((c) => c.id === companyId);
    const id = submitIntroductionRequest({
      targetMemberId: member.id,
      targetMemberName: member.name,
      reason: reason.trim(),
      message: message.trim(),
      opportunitySlug: opportunity?.slug,
      opportunityTitle: opportunity?.title,
      companyId: company?.id,
      companyName: company?.name,
    });
    setSubmitted(id);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={submitted ? "Request submitted" : `Request introduction · ${member.name}`}
      description={
        submitted
          ? "Capital Circle has received your request and will review it shortly."
          : "Members never receive your direct contact details. Capital Circle reviews every request and brokers introductions."
      }
      maxWidth="lg"
      footer={
        submitted ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm transition-colors"
          >
            Done
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
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
        <div className="space-y-5">
          <div className="rounded-2xl bg-emerald-500/[0.08] ring-1 ring-emerald-500/30 p-5 flex gap-3">
            <CheckCircle2
              className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0"
              strokeWidth={2.2}
            />
            <div>
              <div className="font-semibold text-navy-900">
                Submitted to Capital Circle
              </div>
              <p className="mt-1 text-sm text-navy-700/80 leading-relaxed">
                Reference{" "}
                <span className="font-semibold text-navy-900 tabular-nums">
                  {submitted}
                </span>
                . An admin will review your request and decide whether to
                broker the introduction. You can track status under{" "}
                <span className="font-semibold text-navy-900">Dashboard → Introductions</span>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl bg-gold-500/[0.08] ring-1 ring-gold-500/25 p-4 flex gap-3">
            <ShieldCheck
              className="h-5 w-5 text-gold-700 mt-0.5 shrink-0"
              strokeWidth={2.2}
            />
            <div className="text-sm text-navy-900/85 leading-relaxed">
              <div className="font-semibold">Platform-brokered introduction</div>
              <p className="mt-1 text-navy-700/85">
                {member.contactPreferences.introductionNote ??
                  "Your message goes to Capital Circle. The platform reviews requests and reaches out to the member on your behalf."}
              </p>
            </div>
          </div>

          <Field label="Reason for introduction">
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
          </Field>

          <Field label="Message">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Briefly explain the context, the structure you're proposing, and what you'd like the platform to coordinate."
              className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/45 resize-none leading-relaxed"
              maxLength={1500}
            />
            <div className="mt-1 text-[11px] text-navy-700/55 text-right tabular-nums">
              {message.length}/1500
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Reference an opportunity (optional)">
              <select
                value={opportunitySlug}
                onChange={(e) => setOpportunitySlug(e.target.value)}
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900"
              >
                <option value="">— None —</option>
                {opportunityChoices.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reference a company (optional)">
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900"
              >
                <option value="">— None —</option>
                {companyChoices.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] p-3 flex gap-2">
            <Info
              className="h-4 w-4 text-gold-600 mt-0.5 shrink-0"
              strokeWidth={2.2}
            />
            <p className="text-xs text-navy-700/70 leading-relaxed">
              The platform owner reviews and routes every introduction. You
              will be notified once the request has been approved, rejected,
              or completed.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
