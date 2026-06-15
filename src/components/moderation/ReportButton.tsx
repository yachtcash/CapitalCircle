"use client";

import { useState } from "react";
import { Flag, CheckCircle2 } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import Modal from "@/components/negotiations/Modal";
import {
  REPORT_PRIORITIES,
  type ReportPriority,
  type ReportTargetKind,
} from "@/data/moderation";
import { cn } from "@/lib/cn";

const inputCls =
  "w-full rounded-lg bg-white ring-1 ring-navy-900/[0.12] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow";

type Props = {
  targetKind: ReportTargetKind;
  targetId: string;
  targetLabel: string;
  imageSrc?: string;
  variant?: "button" | "icon" | "chip";
  className?: string;
};

/**
 * Universal Report control. Drops onto any reportable surface (member,
 * company, opportunity, listing, image, document, message) and files a
 * structured report into the Moderation Center via the provider.
 */
export default function ReportButton({
  targetKind,
  targetId,
  targetLabel,
  imageSrc,
  variant = "chip",
  className,
}: Props) {
  const { submitReport } = useMessaging();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [priority, setPriority] = useState<ReportPriority>("Medium");

  const submit = () => {
    if (!reason.trim()) return;
    submitReport({
      targetKind,
      targetId,
      targetLabel,
      reason: reason.trim(),
      description: description.trim() || undefined,
      evidenceNotes: evidence.trim() || undefined,
      priority,
      imageSrc,
    });
    setDone(true);
    setReason("");
    setDescription("");
    setEvidence("");
    setPriority("Medium");
    window.setTimeout(() => {
      setDone(false);
      setOpen(false);
    }, 1200);
  };

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Report ${targetLabel}`}
        title="Report"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 ring-1 ring-navy-900/[0.08] text-rose-600 hover:bg-rose-500/10 transition-colors",
          className
        )}
      >
        <Flag className="h-3.5 w-3.5" strokeWidth={2.4} />
      </button>
    ) : variant === "button" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rose-500/40 hover:bg-rose-500/10 text-rose-700 font-semibold px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors",
          className
        )}
      >
        <Flag className="h-3.5 w-3.5" strokeWidth={2.4} />
        Report
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-rose-700/80 hover:text-rose-700 transition-colors",
          className
        )}
      >
        <Flag className="h-3 w-3" strokeWidth={2.4} />
        Report
      </button>
    );

  return (
    <>
      {trigger}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Report ${labelForKind(targetKind)}`}
        description={`Filing a report on “${targetLabel}”. It enters the Moderation Center queue for review.`}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone">
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!reason.trim() || done}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-semibold px-6 py-2.5 text-sm disabled:bg-navy-900/10 disabled:text-navy-700/40 disabled:cursor-not-allowed"
            >
              {done ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.4} /> : <Flag className="h-4 w-4" strokeWidth={2.4} />}
              {done ? "Report filed" : "Submit Report"}
            </button>
          </>
        }
      >
        {done ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" strokeWidth={2} />
            <p className="text-sm font-semibold text-navy-900">Report submitted to the Moderation Center.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1">Reason</span>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Misleading information" className={inputCls} />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What's wrong, and why?" className={cn(inputCls, "resize-none leading-relaxed")} />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1">Evidence notes</span>
              <textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} rows={2} placeholder="Links, message IDs, slide numbers…" className={cn(inputCls, "resize-none leading-relaxed")} />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1">Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as ReportPriority)} className={inputCls}>
                {REPORT_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}

function labelForKind(kind: ReportTargetKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}
