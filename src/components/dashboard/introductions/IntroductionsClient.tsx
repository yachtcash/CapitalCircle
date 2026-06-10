"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  HandCoins,
  Sparkles,
  Inbox,
  ShieldCheck,
  ChevronRight,
  Building2,
  Calendar,
  UserPlus,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type {
  IntroductionRequest,
  IntroductionStatus,
} from "@/data/introductions";
import type { Deal } from "@/data/deals";
import { getMemberById } from "@/data/members";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import {
  DealHealthBadge,
  DealStageBadge,
} from "@/components/dashboard/deals/DealBadges";
import { cn } from "@/lib/cn";

type TabKey = "Pending" | "Approved" | "Rejected" | "Completed" | "All";

const STATUS_TABS: TabKey[] = ["Pending", "Approved", "Rejected", "Completed", "All"];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusStyles: Record<IntroductionStatus, string> = {
  Pending: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  Approved: "bg-sky-500/15 text-sky-700 ring-sky-500/30",
  Rejected: "bg-rose-500/15 text-rose-700 ring-rose-500/30",
  Completed: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
};

export default function IntroductionsClient() {
  const {
    introductionRequests,
    approveIntroduction,
    rejectIntroduction,
    completeIntroduction,
    createDirectConnection,
    directConnections,
    deals,
    convertIntroductionToDeal,
  } = useMessaging();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("Pending");

  const counts = useMemo(() => {
    const c: Record<IntroductionStatus, number> = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Completed: 0,
    };
    for (const r of introductionRequests) c[r.status] += 1;
    return c;
  }, [introductionRequests]);

  const filtered = useMemo<IntroductionRequest[]>(() => {
    if (tab === "All") return introductionRequests;
    return introductionRequests.filter((r) => r.status === tab);
  }, [introductionRequests, tab]);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-8">
        <header>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-700 font-bold">
            Admin · Introductions
          </div>
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-navy-900">
            Introduction Requests
          </h1>
          <p className="mt-2 text-sm md:text-base text-navy-700/75 max-w-2xl leading-relaxed">
            Every member-to-member introduction flows through Capital Circle.
            Review pending requests and broker the introductions.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-navy-900/[0.06]">
          {STATUS_TABS.map((t) => {
            const active = tab === t;
            const count =
              t === "All"
                ? introductionRequests.length
                : counts[t as IntroductionStatus] ?? 0;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors",
                  active ? "text-navy-900" : "text-navy-700/55 hover:text-navy-900"
                )}
              >
                {t}
                <span
                  className={cn(
                    "tabular-nums inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold transition-colors",
                    active
                      ? "bg-gold-500 text-navy-900"
                      : "bg-navy-900/[0.06] text-navy-700/65"
                  )}
                >
                  {count}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-opacity",
                    active ? "bg-gold-500 opacity-100" : "opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 md:p-14 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-4 ring-navy-900/5">
              <Inbox className="h-5 w-5" strokeWidth={2} />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-navy-900">
              No {tab.toLowerCase()} introductions
            </h3>
            <p className="mt-1 text-sm text-navy-700/65 max-w-md mx-auto">
              When members submit a Request Introduction, the request will
              appear here for review.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((r) => (
              <li key={r.id}>
                <Row
                  request={r}
                  onApprove={(note) => approveIntroduction(r.id, note)}
                  onReject={(note) => rejectIntroduction(r.id, note)}
                  onComplete={(note) => completeIntroduction(r.id, note)}
                  onCreateConnection={() =>
                    createDirectConnection({
                      memberA: r.requesterId,
                      memberB: r.targetMemberId,
                      introductionId: r.id,
                    })
                  }
                  hasConnection={directConnections.some(
                    (c) => c.introductionId === r.id
                  )}
                  onConvertToDeal={() => {
                    const id = convertIntroductionToDeal(r.id);
                    if (id) router.push(`/deal-desk/${id}`);
                  }}
                  existingDeal={deals.find(
                    (d) =>
                      d.introductionId === r.id ||
                      (d.sourceType === "Introduction Request" &&
                        d.sourceId === r.id)
                  )}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({
  request,
  onApprove,
  onReject,
  onComplete,
  onCreateConnection,
  hasConnection,
  onConvertToDeal,
  existingDeal,
}: {
  request: IntroductionRequest;
  onApprove: (note?: string) => void;
  onReject: (note?: string) => void;
  onComplete: (note?: string) => void;
  onCreateConnection: () => void;
  hasConnection: boolean;
  onConvertToDeal: () => void;
  existingDeal?: Deal;
}) {
  const [note, setNote] = useState("");
  const targetSlug = getMemberById(request.targetMemberId)?.slug;

  const decided =
    request.status === "Approved" ||
    request.status === "Rejected" ||
    request.status === "Completed";

  return (
    <article className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold bg-navy-900/[0.06] text-navy-700 ring-1 ring-navy-900/15 rounded-full px-2.5 py-1 tabular-nums">
              {request.id}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2.5 py-1 ring-1",
                statusStyles[request.status]
              )}
            >
              <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
              {request.status}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
              <Calendar className="h-3 w-3" strokeWidth={2.4} />
              {fmtDate(request.createdAt)}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-navy-900 tracking-tight">
            {request.requesterName}
            <span className="text-navy-700/55 font-normal mx-2">→</span>
            {targetSlug ? (
              <Link
                href={`/member/${targetSlug}`}
                className="hover:text-gold-700 transition-colors"
              >
                {request.targetMemberName}
              </Link>
            ) : (
              <span>{request.targetMemberName}</span>
            )}
          </h3>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-navy-700/75">
        {request.opportunityTitle ? (
          <span className="inline-flex items-center gap-1.5 truncate max-w-full">
            <HandCoins className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
            <Link
              href={`/opportunity/${request.opportunitySlug}`}
              className="font-semibold text-navy-900 hover:text-gold-700 transition-colors truncate"
            >
              {request.opportunityTitle}
            </Link>
          </span>
        ) : null}
        {request.companyName ? (
          <span className="inline-flex items-center gap-1.5 truncate max-w-full">
            <Building2
              className="h-3.5 w-3.5 text-gold-600"
              strokeWidth={2.2}
            />
            <span className="font-semibold text-navy-900 truncate">
              {request.companyName}
            </span>
          </span>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl bg-bone/60 p-4">
        <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
          Reason
        </div>
        <div className="mt-1 text-sm font-semibold text-navy-900">
          {request.reason}
        </div>
        <p className="mt-3 text-sm text-navy-700/85 leading-relaxed whitespace-pre-wrap">
          {request.message}
        </p>
      </div>

      {request.decisionNote ? (
        <div className="mt-3 rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-3 text-xs text-navy-700/70">
          <span className="font-semibold text-navy-900">Decision note · </span>
          {request.decisionNote}
        </div>
      ) : null}

      {existingDeal ? (
        <div className="mt-3 rounded-xl bg-gold-500/[0.08] ring-1 ring-gold-500/40 p-4 flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-bold text-gold-700">
            <Briefcase className="h-3.5 w-3.5" strokeWidth={2.4} />
            Deal Created
          </span>
          <span className="text-xs font-bold text-navy-900 tabular-nums">
            {existingDeal.dealId}
          </span>
          <DealStageBadge stage={existingDeal.stage} />
          <DealHealthBadge health={existingDeal.health} hideHealthy />
          <span className="text-xs text-navy-700/70">
            Admin · {existingDeal.assignedAdmin || "Unassigned"}
          </span>
          <Link
            href={`/deal-desk/${existingDeal.dealId}`}
            className="ml-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
          >
            Open Deal
            <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
          </Link>
        </div>
      ) : null}

      {!decided ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional decision note (visible on the request)…"
            rows={2}
            className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/[0.06] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/45 resize-none leading-relaxed"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onApprove(note.trim() || undefined)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
              Approve
            </button>
            <button
              type="button"
              onClick={() => onReject(note.trim() || undefined)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rose-500/40 hover:bg-rose-500/10 text-rose-700 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" strokeWidth={2.4} />
              Reject
            </button>
            <button
              type="button"
              onClick={() => onComplete(note.trim() || undefined)}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
              Mark Completed
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {existingDeal ? (
            <Link
              href={`/deal-desk/${existingDeal.dealId}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
            >
              <Briefcase className="h-3.5 w-3.5" strokeWidth={2.4} />
              Open {existingDeal.dealId}
            </Link>
          ) : request.status === "Approved" || request.status === "Completed" ? (
            <button
              type="button"
              onClick={onConvertToDeal}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
            >
              <Briefcase className="h-3.5 w-3.5" strokeWidth={2.4} />
              Create Deal
            </button>
          ) : null}
          {request.status === "Approved" || request.status === "Completed" ? (
            <button
              type="button"
              onClick={onCreateConnection}
              disabled={hasConnection}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors",
                hasConnection
                  ? "bg-navy-900/10 text-navy-700/40 cursor-not-allowed"
                  : "bg-white ring-1 ring-navy-900/15 hover:ring-navy-900/30 text-navy-900"
              )}
            >
              <UserPlus className="h-3.5 w-3.5" strokeWidth={2.4} />
              {hasConnection ? "Connection on file" : "Create Direct Connection"}
            </button>
          ) : null}
          {request.status === "Approved" ? (
            <button
              type="button"
              onClick={() => onComplete()}
              className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/15 hover:ring-navy-900/30 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
              Mark Completed
            </button>
          ) : null}
        </div>
      )}

      <div className="mt-4 text-[10px] uppercase tracking-[0.14em] text-navy-700/45 font-semibold inline-flex items-center gap-1">
        <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
        Requester · {request.requesterId}
        <span className="mx-1.5">·</span>
        Target · {request.targetMemberId}
      </div>
    </article>
  );
}
