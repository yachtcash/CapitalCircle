"use client";

import {
  Sparkles,
  Handshake,
  FileCheck2,
  GitCommitVertical,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { SystemMessage as SystemMessageType } from "@/data/messages";
import { formatRelative } from "@/data/messages";

const VARIANT_META: Record<SystemMessageType["variant"], { icon: LucideIcon; tone: string }> = {
  interest: { icon: Sparkles, tone: "bg-gold-500/15 text-gold-700 ring-gold-500/40" },
  negotiation_start: {
    icon: Handshake,
    tone: "bg-navy-900 text-gold-400 ring-navy-900",
  },
  documents_shared: { icon: FileCheck2, tone: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30" },
  stage_change: { icon: GitCommitVertical, tone: "bg-sky-500/15 text-sky-700 ring-sky-500/30" },
  agreement: { icon: ShieldCheck, tone: "bg-violet-500/15 text-violet-700 ring-violet-500/30" },
};

export default function SystemMessage({ message }: { message: SystemMessageType }) {
  const { icon: Icon, tone } = VARIANT_META[message.variant];
  return (
    <div className="flex items-center gap-3 my-2" role="status">
      <span className="flex-1 h-px bg-navy-900/[0.08]" />
      <span
        className={`inline-flex items-center gap-1.5 rounded-full ring-1 px-3 py-1 text-[10px] uppercase tracking-[0.16em] font-bold ${tone}`}
      >
        <Icon className="h-3 w-3" strokeWidth={2.5} />
        {message.text}
      </span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-navy-700/45 font-semibold whitespace-nowrap">
        {formatRelative(message.createdAt)}
      </span>
      <span className="flex-1 h-px bg-navy-900/[0.08]" />
    </div>
  );
}
