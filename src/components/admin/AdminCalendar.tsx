"use client";

import { useMemo, useState } from "react";
import { Search, CalendarCheck, ShieldCheck } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { canManageCalendarGrants, type Role } from "@/lib/roles";
import { AdminPage } from "./AdminShell";
import CalendarWorkspace from "@/components/calendar/CalendarWorkspace";
import { cn } from "@/lib/cn";

export default function AdminCalendar() {
  const { currentRole } = useMessaging();
  return (
    <AdminPage
      title="Calendar"
      subtitle="Platform calendar — meetings, calls, tours, deadlines, and tasks. Drag to reschedule; everything is audited."
    >
      <CalendarWorkspace adminFrame />
      {canManageCalendarGrants(currentRole as Role) ? <CalendarGrantsPanel /> : null}
    </AdminPage>
  );
}

/** Super Admin only — grant per-member calendar edit access. */
function CalendarGrantsPanel() {
  const { calendarGrants, setCalendarGrant, memberAdminState } = useMessaging();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MEMBERS.filter((m) => {
      if ((memberAdminState[m.id]?.status ?? "Active") === "Deleted") return false;
      if (!query) return true;
      return `${m.name} ${m.id} ${m.company}`.toLowerCase().includes(query);
    }).slice(0, 40);
  }, [q, memberAdminState]);

  const grantedCount = Object.values(calendarGrants).filter(Boolean).length;

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
          Calendar Access Grants
        </div>
        <span className="text-[11px] text-navy-700/60">
          <span className="font-semibold text-navy-900 tabular-nums">{grantedCount}</span> member
          {grantedCount === 1 ? "" : "s"} granted edit access
        </span>
      </div>
      <p className="text-xs text-navy-700/65 mb-3 max-w-2xl">
        Admins and Super Admins always have full calendar access. Editors gain edit access only when granted here;
        granting a member gives them view access. Moderators are always read-only.
      </p>

      <div className="flex-1 mb-3 bg-bone/50 rounded-full ring-1 ring-navy-900/[0.08] flex items-center gap-2 max-w-md">
        <span className="pl-3.5 text-navy-700/60"><Search className="h-4 w-4" strokeWidth={2} /></span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search members"
          className="flex-1 bg-transparent outline-none py-2 text-sm text-navy-900 placeholder:text-navy-700/45"
        />
      </div>

      <ul className="divide-y divide-navy-900/[0.05] max-h-[360px] overflow-y-auto">
        {rows.map((m) => {
          const granted = !!calendarGrants[m.id];
          return (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-navy-900 truncate">{m.name}</div>
                <div className="text-[11px] text-navy-700/55 truncate">{m.id} · {m.company}</div>
              </div>
              <button
                type="button"
                onClick={() => setCalendarGrant(m.id, !granted, m.name)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] font-bold ring-1 transition-colors shrink-0",
                  granted
                    ? "bg-emerald-500 text-white ring-emerald-500 hover:bg-emerald-400"
                    : "bg-white text-navy-700 ring-navy-900/15 hover:ring-navy-900/30"
                )}
              >
                <CalendarCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
                {granted ? "Granted" : "Grant access"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
