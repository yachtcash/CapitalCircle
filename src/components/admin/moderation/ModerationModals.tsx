"use client";

import { useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import Modal from "@/components/negotiations/Modal";
import {
  RESTRICTION_TYPES,
  type ReportTargetKind,
  type RestrictionType,
} from "@/data/moderation";
import { cn } from "@/lib/cn";

const inputCls =
  "w-full rounded-lg bg-white ring-1 ring-navy-900/[0.12] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow";
const textareaCls = cn(inputCls, "resize-none leading-relaxed");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}

function Footer({ onClose, onSubmit, disabled, label, tone = "navy" }: { onClose: () => void; onSubmit: () => void; disabled: boolean; label: string; tone?: "navy" | "rose" | "amber" }) {
  return (
    <>
      <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone">Cancel</button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold px-6 py-2.5 text-sm text-white disabled:bg-navy-900/10 disabled:text-navy-700/40 disabled:cursor-not-allowed",
          tone === "rose" ? "bg-rose-500 hover:bg-rose-400" : tone === "amber" ? "bg-amber-500 hover:bg-amber-400" : "bg-navy-900 hover:bg-navy-800"
        )}
      >
        {label}
      </button>
    </>
  );
}

export type SanctionTarget = { id: string; name: string };
export type ContentTarget = { kind: ReportTargetKind; id: string; label: string };

export function RequestChangesModal({ open, onClose, target }: { open: boolean; onClose: () => void; target: ContentTarget | null }) {
  const { requestChanges } = useMessaging();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [due, setDue] = useState("");
  const submit = () => {
    if (!target || !reason.trim()) return;
    requestChanges({
      targetKind: target.kind,
      targetId: target.id,
      targetLabel: target.label,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      dueDate: due ? new Date(due).toISOString() : undefined,
    });
    setReason(""); setNotes(""); setDue("");
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Request Changes" description={target ? `Requesting changes on “${target.label}”.` : undefined}
      footer={<Footer onClose={onClose} onSubmit={submit} disabled={!reason.trim()} label="Request Changes" tone="amber" />}>
      <div className="space-y-4">
        <Field label="Reason"><input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What must change before approval?" className={inputCls} /></Field>
        <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Specific guidance for the owner…" className={textareaCls} /></Field>
        <Field label="Deadline"><input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputCls} /></Field>
      </div>
    </Modal>
  );
}

export function WarnModal({ open, onClose, member }: { open: boolean; onClose: () => void; member: SanctionTarget | null }) {
  const { warnMember } = useMessaging();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const submit = () => {
    if (!member || !reason.trim()) return;
    warnMember({ memberId: member.id, memberName: member.name, reason: reason.trim(), notes: notes.trim() || undefined });
    setReason(""); setNotes(""); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Warn Member" description={member ? `Issuing a warning to ${member.name}.` : undefined}
      footer={<Footer onClose={onClose} onSubmit={submit} disabled={!reason.trim()} label="Issue Warning" tone="amber" />}>
      <div className="space-y-4">
        <Field label="Reason"><input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for the warning" className={inputCls} /></Field>
        <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes (optional)…" className={textareaCls} /></Field>
      </div>
    </Modal>
  );
}

export function RestrictModal({ open, onClose, member }: { open: boolean; onClose: () => void; member: SanctionTarget | null }) {
  const { restrictMember } = useMessaging();
  const [types, setTypes] = useState<RestrictionType[]>([]);
  const [permanent, setPermanent] = useState(false);
  const [until, setUntil] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const toggle = (t: RestrictionType) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const submit = () => {
    if (!member || types.length === 0 || !reason.trim()) return;
    restrictMember({
      memberId: member.id, memberName: member.name, types, permanent,
      until: !permanent && until ? new Date(until).toISOString() : undefined,
      reason: reason.trim(), notes: notes.trim() || undefined,
    });
    setTypes([]); setPermanent(false); setUntil(""); setReason(""); setNotes(""); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Restrict Member" description={member ? `Applying restrictions to ${member.name}.` : undefined}
      footer={<Footer onClose={onClose} onSubmit={submit} disabled={types.length === 0 || !reason.trim()} label="Apply Restrictions" tone="rose" />}>
      <div className="space-y-4">
        <div>
          <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1.5">Restrictions</span>
          <div className="flex flex-wrap gap-1.5">
            {RESTRICTION_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => toggle(t)}
                className={cn("inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                  types.includes(t) ? "bg-rose-500 text-white ring-rose-500" : "bg-white text-navy-900 ring-navy-900/10 hover:ring-navy-900/30")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-navy-900">
          <input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} className="h-4 w-4 accent-rose-600" />
          Permanent restriction
        </label>
        {!permanent ? (
          <Field label="Temporary — lift on"><input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className={inputCls} /></Field>
        ) : null}
        <Field label="Reason"><input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for the restriction" className={inputCls} /></Field>
        <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Internal notes (optional)…" className={textareaCls} /></Field>
      </div>
    </Modal>
  );
}

export function SuspendModal({ open, onClose, member }: { open: boolean; onClose: () => void; member: SanctionTarget | null }) {
  const { suspendMemberFull } = useMessaging();
  const [reason, setReason] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const submit = () => {
    if (!member || !reason.trim()) return;
    suspendMemberFull({ memberId: member.id, memberName: member.name, reason: reason.trim(), endDate: end ? new Date(end).toISOString() : undefined, notes: notes.trim() || undefined });
    setReason(""); setEnd(""); setNotes(""); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Suspend Member" description={member ? `Suspending ${member.name}. Leave the end date blank for an indefinite suspension.` : undefined}
      footer={<Footer onClose={onClose} onSubmit={submit} disabled={!reason.trim()} label="Suspend" tone="rose" />}>
      <div className="space-y-4">
        <Field label="Reason"><input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for suspension" className={inputCls} /></Field>
        <Field label="End date (optional)"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} /></Field>
        <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Internal notes (optional)…" className={textareaCls} /></Field>
      </div>
    </Modal>
  );
}

export function BanModal({ open, onClose, member }: { open: boolean; onClose: () => void; member: SanctionTarget | null }) {
  const { banMember } = useMessaging();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const submit = () => {
    if (!member || !reason.trim()) return;
    banMember({ memberId: member.id, memberName: member.name, reason: reason.trim(), notes: notes.trim() || undefined });
    setReason(""); setNotes(""); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Ban Member" description={member ? `Permanently banning ${member.name}. This is a Super Admin action and is fully audited.` : undefined}
      footer={<Footer onClose={onClose} onSubmit={submit} disabled={!reason.trim()} label="Ban Member" tone="rose" />}>
      <div className="space-y-4">
        <Field label="Reason"><input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for the ban" className={inputCls} /></Field>
        <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Internal notes (optional)…" className={textareaCls} /></Field>
      </div>
    </Modal>
  );
}
