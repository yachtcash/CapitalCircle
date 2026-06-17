"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Filter } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies as SEED_COMPANIES } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import { statusForStage } from "@/data/deals";
import { computeAnalytics } from "@/lib/analytics/compute";
import {
  RANGE_OPTIONS,
  ANALYTICS_NOW_MS,
  rangeLabel,
  type AnalyticsRange,
} from "@/lib/analytics/range";
import { downloadCsv, exportFilename, type CsvColumn } from "@/lib/export/csv";
import { cn } from "@/lib/cn";

import {
  ExecutiveOverviewSection,
  DealAnalyticsSection,
  IntroductionAnalyticsSection,
  ListingAnalyticsSection,
  OpportunityAnalyticsSection,
  MemberAnalyticsSection,
  CompanyAnalyticsSection,
  CalendarAnalyticsSection,
  NotificationAnalyticsSection,
  AuditAnalyticsSection,
  ModerationAnalyticsSection,
  type ExportEntity,
} from "./sections";

const SECTION_NAV: { id: string; label: string }[] = [
  { id: "executive", label: "Overview" },
  { id: "deals", label: "Deals" },
  { id: "introductions", label: "Introductions" },
  { id: "listings", label: "Listings" },
  { id: "opportunities", label: "Opportunities" },
  { id: "members", label: "Members" },
  { id: "companies", label: "Companies" },
  { id: "calendar", label: "Calendar" },
  { id: "notifications", label: "Notifications" },
  { id: "audit", label: "Audit" },
  { id: "moderation", label: "Moderation" },
];

export default function AnalyticsClient() {
  const {
    deals,
    introductionRequests,
    listings,
    userOpportunities,
    opportunityPatches,
    opportunityAdminState,
    userMembers,
    userCompanies,
    memberAdminState,
    companyAdminState,
    auditEvents,
    calendarEvents,
    notifications,
    moderationReports,
    warnings,
    restrictions,
    suspensions,
    bans,
    changeRequests,
    hydrated,
  } = useMessaging();

  const [range, setRange] = useState<AnalyticsRange>("all");

  const allMembers = useMemo(
    () => (hydrated ? [...userMembers, ...MEMBERS] : MEMBERS),
    [userMembers, hydrated]
  );
  const allCompanies = useMemo(
    () => (hydrated ? [...userCompanies, ...SEED_COMPANIES] : SEED_COMPANIES),
    [userCompanies, hydrated]
  );
  const allOpps = useMemo(
    () => (hydrated ? [...userOpportunities, ...featuredOpportunities] : featuredOpportunities),
    [userOpportunities, hydrated]
  );

  const analytics = useMemo(
    () =>
      computeAnalytics({
        range,
        nowMs: ANALYTICS_NOW_MS,
        members: allMembers,
        memberAdminState,
        companies: allCompanies,
        companyAdminState,
        opportunities: allOpps,
        opportunityAdminState,
        opportunityPatches,
        listings,
        introductions: introductionRequests,
        deals,
        calendarEvents,
        notifications,
        auditEvents,
        reports: moderationReports,
        warnings,
        restrictions,
        suspensions,
        bans,
        changeRequests,
      }),
    [
      range,
      allMembers,
      memberAdminState,
      allCompanies,
      companyAdminState,
      allOpps,
      opportunityAdminState,
      opportunityPatches,
      listings,
      introductionRequests,
      deals,
      calendarEvents,
      notifications,
      auditEvents,
      moderationReports,
      warnings,
      restrictions,
      suspensions,
      bans,
      changeRequests,
    ]
  );

  const onExport = (entity: ExportEntity) => {
    const r = analytics.records;
    const label = rangeLabel(range);
    const file = exportFilename(entity, label);
    switch (entity) {
      case "deals": {
        const cols: CsvColumn<(typeof r.deals)[number]>[] = [
          { key: "dealId", label: "Deal ID" },
          { key: "title", label: "Title" },
          { key: "stage", label: "Stage" },
          { key: "status", label: "Status", get: (d) => statusForStage(d.stage) },
          { key: "priority", label: "Priority" },
          { key: "health", label: "Health", get: (d) => d.health ?? "Healthy" },
          { key: "assignedAdmin", label: "Admin" },
          { key: "companyId", label: "Company" },
          { key: "targetInvestment", label: "Target Investment", get: (d) => d.targetInvestment },
          { key: "actualInvestment", label: "Actual Investment", get: (d) => d.actualInvestment ?? "" },
          { key: "estimatedCommission", label: "Est. Commission", get: (d) => d.estimatedCommission },
          { key: "createdDate", label: "Created", get: (d) => d.createdDate.slice(0, 10) },
          { key: "expectedCloseDate", label: "Expected Close", get: (d) => d.expectedCloseDate?.slice(0, 10) ?? "" },
        ];
        downloadCsv(file, r.deals, cols);
        break;
      }
      case "members": {
        const cols: CsvColumn<(typeof r.members)[number]>[] = [
          { key: "id", label: "Member ID" },
          { key: "name", label: "Name" },
          { key: "memberType", label: "Type" },
          { key: "verification", label: "Verification", get: (m) => memberAdminState[m.id]?.verificationOverride ?? m.verification },
          { key: "status", label: "Status", get: (m) => memberAdminState[m.id]?.status ?? "Active" },
          { key: "country", label: "Country" },
          { key: "joinedAt", label: "Joined", get: (m) => m.joinedAt.slice(0, 10) },
        ];
        downloadCsv(file, r.members, cols);
        break;
      }
      case "companies": {
        const cols: CsvColumn<(typeof r.companies)[number]>[] = [
          { key: "id", label: "Company ID" },
          { key: "name", label: "Name" },
          { key: "industry", label: "Industry" },
          { key: "verification", label: "Verification", get: (c) => companyAdminState[c.id]?.verificationOverride ?? c.verification },
          { key: "country", label: "Country", get: (c) => c.headquarters?.country ?? "" },
          { key: "featured", label: "Featured", get: (c) => (companyAdminState[c.id]?.featuredOverride ?? c.featured) ? "Yes" : "No" },
          { key: "addedAt", label: "Added", get: (c) => c.addedAt.slice(0, 10) },
        ];
        downloadCsv(file, r.companies, cols);
        break;
      }
      case "listings": {
        const cols: CsvColumn<(typeof r.listings)[number]>[] = [
          { key: "id", label: "Listing ID" },
          { key: "title", label: "Title" },
          { key: "status", label: "Status" },
          { key: "category", label: "Category", get: (l) => l.category ?? "" },
          { key: "dealType", label: "Deal Type", get: (l) => l.dealType ?? "" },
          { key: "views", label: "Views" },
          { key: "saves", label: "Saves" },
          { key: "interests", label: "Contacts" },
          { key: "negotiations", label: "Negotiations" },
          { key: "messages", label: "Messages" },
          { key: "createdAt", label: "Created", get: (l) => l.createdAt.slice(0, 10) },
        ];
        downloadCsv(file, r.listings, cols);
        break;
      }
      case "introductions": {
        const cols: CsvColumn<(typeof r.introductions)[number]>[] = [
          { key: "id", label: "Introduction ID" },
          { key: "requesterName", label: "Requester" },
          { key: "targetMemberName", label: "Target" },
          { key: "status", label: "Status" },
          { key: "reason", label: "Reason" },
          { key: "createdAt", label: "Created", get: (r2) => r2.createdAt.slice(0, 10) },
          { key: "decidedAt", label: "Decided", get: (r2) => r2.decidedAt?.slice(0, 10) ?? "" },
          { key: "completedAt", label: "Completed", get: (r2) => r2.completedAt?.slice(0, 10) ?? "" },
        ];
        downloadCsv(file, r.introductions, cols);
        break;
      }
      case "audit": {
        const cols: CsvColumn<(typeof r.audit)[number]>[] = [
          { key: "id", label: "Audit ID" },
          { key: "action", label: "Action" },
          { key: "actorName", label: "Actor" },
          { key: "actorRole", label: "Role" },
          { key: "targetKind", label: "Target Kind" },
          { key: "targetId", label: "Target ID" },
          { key: "createdAt", label: "Timestamp", get: (e) => e.createdAt.slice(0, 16).replace("T", " ") },
        ];
        downloadCsv(file, r.audit, cols);
        break;
      }
      case "reports": {
        const cols: CsvColumn<(typeof r.reports)[number]>[] = [
          { key: "id", label: "Report ID" },
          { key: "targetKind", label: "Target Kind" },
          { key: "targetId", label: "Target ID" },
          { key: "reason", label: "Reason" },
          { key: "priority", label: "Priority" },
          { key: "status", label: "Status" },
          { key: "reportedBy", label: "Reported By" },
          { key: "reportedAt", label: "Reported", get: (rep) => rep.reportedAt.slice(0, 10) },
        ];
        downloadCsv(file, r.reports, cols);
        break;
      }
    }
  };

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      {/* Command header + global filter (sticky) */}
      <div className="sticky top-0 z-30 bg-navy-900 text-white">
        <div className="max-w-[1500px] mx-auto px-5 md:px-10 py-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold-400 font-bold inline-flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" strokeWidth={2.4} />
                Analytics &amp; Reporting Center
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
                Platform Command
              </h1>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-gold-400 mr-0.5" strokeWidth={2.4} />
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRange(opt.key)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors",
                    range === opt.key
                      ? "bg-gold-500 text-navy-900"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Jump nav */}
          <nav className="mt-4 flex items-center gap-1 overflow-x-auto -mb-px">
            {SECTION_NAV.map((s) => (
              <Link
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.1em] font-semibold text-white/55 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-[1500px] mx-auto px-5 md:px-10 py-8 md:py-10 space-y-12 md:space-y-14">
        <ExecutiveOverviewSection a={analytics} />
        <DealAnalyticsSection a={analytics} onExport={onExport} />
        <IntroductionAnalyticsSection a={analytics} onExport={onExport} />
        <ListingAnalyticsSection a={analytics} onExport={onExport} />
        <OpportunityAnalyticsSection a={analytics} />
        <MemberAnalyticsSection a={analytics} onExport={onExport} />
        <CompanyAnalyticsSection a={analytics} onExport={onExport} />
        <CalendarAnalyticsSection a={analytics} />
        <NotificationAnalyticsSection a={analytics} />
        <AuditAnalyticsSection a={analytics} onExport={onExport} />
        <ModerationAnalyticsSection a={analytics} onExport={onExport} />
      </main>
    </div>
  );
}
