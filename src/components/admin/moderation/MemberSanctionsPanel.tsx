"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Gavel, Flag, Ban as BanIcon } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { memberSanctions } from "@/lib/moderation/state";
import { APPEAL_STATUSES, type AppealStatus } from "@/data/moderation";
import {
  canWarnMembers,
  canRestrictMembers,
  canSuspendAccounts,
  canRestoreMembers,
  canBanMembers,
} from "@/lib/roles";
import { StatusPill } from "../AdminShell";
import type { SanctionTarget } from "./ModerationModals";
import { cn } from "@/lib/cn";

export default function MemberSanctionsPanel({
  onWarn,
  onRestrict,
  onSuspend,
  onBan,
}: {
  onWarn: (t: SanctionTarget) => void;
  onRestrict: (t: SanctionTarget) => void;
  onSuspend: (t: SanctionTarget) => void;
  onBan: (t: SanctionTarget) => void;
}) {
  const {
    currentRole,
    warnings,
    restrictions,
    suspensions,
    bans,
    userMembers,
    liftRestriction,
    unsuspendMember,
    unbanMember,
    setAppealStatus,
  } = useMessaging();

  const allMembers = useMemo(() => [...userMembers, ...MEMBERS], [userMembers]);

  // Every member touched by any sanction.
  const sanctionedIds = useMemo(() => {
    const ids = new Set<string>();
    warnings.forEach((w) => ids.add(w.memberId));
    restrictions.forEach((r) => ids.add(r.memberId));
    suspensions.forEach((s) => ids.add(s.memberId));
    bans.forEach((b) => ids.add(b.memberId));
    return [...ids];
  }, [warnings, restrictions, suspensions, bans]);

  const rows = useMemo(
    () =>
      sanctionedIds
        .map((id) => {
          const member = allMembers.find((m) => m.id === id);
          return {
            id,
            name: member?.name ?? id,
            company: member?.company ?? "",
            summary: memberSanctions(id, { warnings, restrictions, suspensions, bans }),
          };
        })
        .sort((a, b) => {
          const score = (x: typeof a) => (x.summary.activeBan ? 4 : x.summary.activeSuspension ? 3 : x.summary.activeRestrictions.length ? 2 : 1);
          return score(b) - score(a);
        }),
    [sanctionedIds, allMembers, warnings, restrictions, suspensions, bans]
  );

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5 mb-3">
        <Gavel className="h-3.5 w-3.5" strokeWidth={2.4} />
        Member Sanctions
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-navy-700/60">No members under sanction. Warnings, restrictions, suspensions, and bans appear here with full history.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const t: SanctionTarget = { id: row.id, name: row.name };
            const s = row.summary;
            const ban = s.activeBan;
            return (
              <div key={row.id} className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.05] p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/members/${row.id}`} className="font-semibold text-navy-900 text-sm hover:text-gold-700">{row.name}</Link>
                      <span className="text-[11px] text-navy-700/55 tabular-nums">{row.id}</span>
                      {s.warningCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] font-bold text-amber-700 bg-amber-500/15 ring-1 ring-amber-500/30 rounded-full px-2 py-0.5">
                          <Flag className="h-3 w-3" strokeWidth={2.4} />
                          {s.warningCount} {s.warningCount === 1 ? "warning" : "warnings"}
                        </span>
                      ) : null}
                      {s.activeSuspension ? <StatusPill label="Suspended" tone="rose" /> : null}
                      {ban ? <StatusPill label="Banned" tone="rose" /> : null}
                      {s.restrictionTypes.length > 0 ? <StatusPill label={`${s.restrictionTypes.length} restrictions`} tone="amber" /> : null}
                    </div>
                    {row.company ? <div className="text-[11px] text-navy-700/55 mt-0.5">{row.company}</div> : null}

                    {s.restrictionTypes.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.restrictionTypes.map((rt) => (
                          <span key={rt} className="inline-flex items-center text-[10px] uppercase tracking-[0.1em] font-semibold text-navy-700/80 bg-white ring-1 ring-navy-900/10 rounded-full px-2 py-0.5">{rt}</span>
                        ))}
                      </div>
                    ) : null}

                    {ban ? (
                      <div className="mt-2 inline-flex items-center gap-2 text-[11px] text-navy-700/70">
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-700"><BanIcon className="h-3 w-3" strokeWidth={2.4} /> {ban.reason}</span>
                        {canBanMembers(currentRole) ? (
                          <select
                            value={ban.appealStatus}
                            onChange={(e) => setAppealStatus(ban.id, e.target.value as AppealStatus)}
                            className="rounded-full bg-white ring-1 ring-navy-900/[0.1] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-bold text-navy-900"
                          >
                            {APPEAL_STATUSES.map((a) => <option key={a} value={a}>Appeal: {a}</option>)}
                          </select>
                        ) : (
                          <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-navy-700/60">Appeal: {ban.appealStatus}</span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {canWarnMembers(currentRole) ? <Mini tone="amber" onClick={() => onWarn(t)}>Warn</Mini> : null}
                    {canRestrictMembers(currentRole) ? <Mini onClick={() => onRestrict(t)}>Restrict</Mini> : null}
                    {s.activeRestrictions.length > 0 && canRestoreMembers(currentRole) ? (
                      <Mini tone="emerald" onClick={() => s.activeRestrictions.forEach((r) => liftRestriction(r.id))}>Lift</Mini>
                    ) : null}
                    {s.activeSuspension ? (
                      canRestoreMembers(currentRole) ? <Mini tone="emerald" onClick={() => unsuspendMember(row.id, row.name)}>Unsuspend</Mini> : null
                    ) : canSuspendAccounts(currentRole) ? <Mini tone="rose" onClick={() => onSuspend(t)}>Suspend</Mini> : null}
                    {ban ? (
                      canBanMembers(currentRole) ? <Mini tone="emerald" onClick={() => unbanMember(row.id, row.name)}>Restore</Mini> : null
                    ) : canBanMembers(currentRole) ? <Mini tone="rose" onClick={() => onBan(t)}>Ban</Mini> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Mini({ children, onClick, tone = "default" }: { children: React.ReactNode; onClick: () => void; tone?: "default" | "rose" | "emerald" | "amber" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-bold ring-1 transition-colors",
        tone === "rose" && "bg-white hover:bg-rose-500/10 text-rose-700 ring-rose-500/40",
        tone === "emerald" && "bg-emerald-500 hover:bg-emerald-400 text-white ring-emerald-500",
        tone === "amber" && "bg-amber-500 hover:bg-amber-400 text-white ring-amber-500",
        tone === "default" && "bg-white hover:bg-bone text-navy-900 ring-navy-900/10"
      )}
    >
      {children}
    </button>
  );
}
