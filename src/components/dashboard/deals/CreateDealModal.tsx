"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import Modal from "@/components/negotiations/Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  DEAL_PRIORITIES,
  DEAL_STAGES,
  SAMPLE_ADMINS,
  type DealPriority,
  type DealStage,
} from "@/data/deals";

/**
 * Prefill values for launching the modal from anywhere on the platform —
 * an opportunity page, a company profile, a member profile, a
 * conversation, or the admin area. Only the fields you pass are seeded;
 * everything else stays editable.
 */
export type DealPrefill = {
  title?: string;
  sponsorName?: string;
  sponsorMemberId?: string;
  sponsorCompanyId?: string;
  investorName?: string;
  investorMemberId?: string;
  opportunityId?: string;
  opportunitySlug?: string;
  listingId?: string;
  companyId?: string;
  conversationIds?: string[];
  introductionId?: string;
  targetInvestment?: number;
  stage?: DealStage;
  tags?: string[];
  summaryNote?: string;
};

export default function CreateDealModal({
  open,
  onClose,
  prefill,
}: {
  open: boolean;
  onClose: () => void;
  prefill?: DealPrefill;
}) {
  const { createDeal, profile } = useMessaging();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [investorName, setInvestorName] = useState("");
  const [target, setTarget] = useState("");
  const [stage, setStage] = useState<DealStage>("New Lead");
  const [priority, setPriority] = useState<DealPriority>("Normal");

  useEffect(() => {
    if (open) {
      setTitle(prefill?.title ?? "");
      setSponsorName(prefill?.sponsorName ?? "");
      setInvestorName(prefill?.investorName ?? "");
      setTarget(
        prefill?.targetInvestment ? String(prefill.targetInvestment) : ""
      );
      setStage(prefill?.stage ?? "New Lead");
      setPriority("Normal");
    }
  }, [open, prefill]);

  const canSubmit = title.trim() && sponsorName.trim();

  const submit = () => {
    if (!canSubmit) return;
    const t = Number(target.replace(/[^\d]/g, "")) || 0;
    const pct = 2.5;
    const id = createDeal({
      title: title.trim(),
      sponsor: {
        name: sponsorName.trim(),
        memberId: prefill?.sponsorMemberId,
        companyId: prefill?.sponsorCompanyId ?? prefill?.companyId,
      },
      investor: investorName.trim()
        ? { name: investorName.trim(), memberId: prefill?.investorMemberId }
        : undefined,
      assignedAdmin: profile.name || SAMPLE_ADMINS[0],
      stage,
      priority,
      targetInvestment: t,
      commissionPct: pct,
      estimatedCommission: Math.round((t * pct) / 100),
      sourceType: prefill?.introductionId
        ? "Introduction Request"
        : prefill?.opportunityId || prefill?.opportunitySlug
          ? "Opportunity Inquiry"
          : prefill?.companyId
            ? "Company Inquiry"
            : "Manual Entry",
      sourceId: prefill?.introductionId ?? prefill?.opportunityId,
      opportunityId: prefill?.opportunityId,
      opportunitySlug: prefill?.opportunitySlug,
      listingId: prefill?.listingId,
      companyId: prefill?.companyId,
      introductionId: prefill?.introductionId,
      conversationIds: prefill?.conversationIds,
      summaryNote: prefill?.summaryNote,
      tags: prefill?.tags ?? [],
    });
    onClose();
    router.push(`/deal-desk/${id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Deal"
      description="Open a deal record. Linked context (opportunity, company, conversation, introduction) carries over automatically."
      maxWidth="md"
      footer={
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
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm transition-colors disabled:bg-navy-900/10 disabled:text-navy-700/40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Create Deal
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Solar Portfolio Funding — 120 MW"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Sponsor">
            <input
              type="text"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Investor (optional)">
            <input
              type="text"
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Target investment (USD)">
            <input
              type="text"
              inputMode="numeric"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="10,000,000"
              className={inputCls}
            />
          </Field>
          <Field label="Stage">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as DealStage)}
              className={inputCls}
            >
              {DEAL_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as DealPriority)}
              className={inputCls}
            >
              {DEAL_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>
        {prefill?.opportunitySlug || prefill?.companyId || prefill?.conversationIds?.length || prefill?.introductionId ? (
          <p className="text-[11px] text-navy-700/60 leading-relaxed rounded-lg bg-bone/60 px-3 py-2">
            Linked on create:{" "}
            {[
              prefill?.opportunitySlug && `opportunity ${prefill.opportunityId ?? prefill.opportunitySlug}`,
              prefill?.companyId && `company ${prefill.companyId}`,
              prefill?.conversationIds?.length && `${prefill.conversationIds.length} conversation(s)`,
              prefill?.introductionId && `introduction ${prefill.introductionId}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

const inputCls =
  "w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
