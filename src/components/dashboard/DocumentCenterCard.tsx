"use client";

import Link from "next/link";
import {
  FilesIcon,
  ArrowRight,
  Clock3,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";

export default function DocumentCenterCard() {
  const { documents, accessRequests } = useMessaging();
  const totalDocs = documents.length;
  const publicCount = documents.filter((d) => d.visibility === "Public").length;
  const privateCount = totalDocs - publicCount;
  const pendingCount = accessRequests.filter((r) => r.status === "Requested").length;
  const approvedCount = accessRequests.filter((r) => r.status === "Approved").length;

  return (
    <Link
      href="/documents"
      className="group block bg-navy-900 text-white rounded-2xl ring-1 ring-white/5 p-5 md:p-6 hover:ring-gold-500/40 transition-shadow relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(212,175,55,0.30), transparent 55%)",
        }}
      />
      <div className="relative">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
          Document Center
        </div>
        <h2 className="mt-1 text-lg md:text-xl font-semibold tracking-tight">
          Your private document vault
        </h2>
        <p className="mt-1.5 text-xs md:text-sm text-white/70 leading-relaxed">
          Every document, request, and audit event across your data rooms.
        </p>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat icon={FilesIcon} label="Documents" value={totalDocs} />
          <Stat icon={ShieldCheck} label="Public / Private" value={`${publicCount}/${privateCount}`} />
          <Stat icon={Clock3} label="Pending" value={pendingCount} accent />
          <Stat icon={CheckCircle2} label="Approved" value={approvedCount} />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-semibold text-gold-400 group-hover:text-gold-300">
          Open document center
          <ArrowRight
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.4}
          />
        </div>
      </div>
    </Link>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof FilesIcon;
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/[0.05] ring-1 ring-white/10 p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/65 font-semibold inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-gold-400" strokeWidth={2.2} />
        {label}
      </div>
      <div
        className={`mt-1 text-lg md:text-xl font-semibold tabular-nums ${
          accent ? "text-gold-300" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
