"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Handshake, ArrowUpRight } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import RoleGate from "@/components/common/RoleGate";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";
import CalendarEventsPanel from "@/components/calendar/CalendarEventsPanel";
import { toneForStatus } from "@/components/ui/StatusBadge";

const SELF_MEMBER_ID = "MEM-000001";

/**
 * The member calendar — personal schedule only. The internal operations
 * calendar stays at /calendar for Admin+; members see just their own
 * meetings, calls, site visits, introductions, and reminders.
 */
export default function MyCalendarClient() {
  return (
    <RoleGate>
      <MyCalendarInner />
    </RoleGate>
  );
}

function MyCalendarInner() {
  const { introductionRequests } = useMessaging();

  const myIntros = useMemo(
    () =>
      introductionRequests
        .filter((r) => r.requesterId === "me" || r.targetMemberId === SELF_MEMBER_ID)
        .slice(0, 8),
    [introductionRequests]
  );

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-8 md:space-y-10">
        <PageHeader
          eyebrow="My Calendar"
          title="Your schedule"
          subtitle="Meetings, calls, site visits, introductions, and reminders that involve you — nothing platform-wide."
        />

        <CalendarEventsPanel
          relation={{ memberId: SELF_MEMBER_ID }}
          eyebrow="My Schedule"
          highlights={[
            { label: "My Meetings", types: ["Meeting", "Investor Meeting"] },
            { label: "My Calls", types: ["Call"] },
            { label: "Site Visits", types: ["Inspection", "Property Tour"] },
            { label: "My Reminders", types: ["Reminder"] },
          ]}
          quickTypes={["Meeting", "Call", "Reminder"]}
        />

        <section>
          <SectionHeader
            eyebrow="Introductions"
            title="My introductions"
            action={
              <Link
                href="/dashboard/introductions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-gold-700 transition-colors"
              >
                Manage
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
              </Link>
            }
          />
          <ul className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.05] overflow-hidden">
            {myIntros.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-navy-700/55">
                No introduction requests yet.
              </li>
            ) : (
              myIntros.map((r) => (
                <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20">
                    <Handshake className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-navy-900 truncate">
                        {r.targetMemberName || r.companyName || r.id}
                      </span>
                      <Badge tone={toneForStatus(r.status)} size="sm">
                        {r.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-navy-700/60 truncate">{r.reason}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
