// Analytics Center — the single source of truth for every metric.
//
// One pure function, `computeAnalytics`, takes a snapshot of LIVE provider state
// (seed arrays already merged with user-created records) plus the active time
// range, and returns every metric the Analytics Center renders. Nothing here is
// hardcoded or faked — every number is derived from the passed-in state.
//
// Live-status rules mirror AdminDashboard exactly so the numbers agree across
// the platform (e.g. a member is "Active" when memberAdminState[id].status is
// unset or "Active"; an opportunity is featured per opportunityPatches override).
//
// The time range is applied as a CREATION-DATE window to each entity set (by
// joinedAt / addedAt / postedAt / createdAt / createdDate / reportedAt), then all
// metrics are computed over the filtered sets — so changing the range updates
// every widget. "All Time" applies no filter. A handful of inherently now-
// relative calendar tiles (Today / This Week / Upcoming / Overdue) are computed
// from the full event set against `nowMs` and are labelled as such.

import type { Member } from "@/data/members";
import type { Company } from "@/data/companies";
import type { Opportunity } from "@/data/opportunities";
import type { ListingRecord } from "@/data/listings";
import type { IntroductionRequest } from "@/data/introductions";
import {
  DEAL_STAGES,
  isOpenStage,
  computeDealDeskMetrics,
  dealAlerts,
  type Deal,
  type DealHealth,
  type DealPriority,
} from "@/data/deals";
import {
  EVENT_TYPES,
  type CalendarEvent,
  type EventType,
} from "@/data/calendar";
import type { Notification } from "@/data/messages";
import {
  groupForAction,
  isModerationAction,
  type AuditEvent,
} from "@/data/audit";
import type {
  ModerationReport,
  Warning,
  Restriction,
  Suspension,
  Ban,
  ChangeRequest,
} from "@/data/moderation";
import type {
  MemberAdminState,
  CompanyAdminState,
  OpportunityAdminState,
} from "@/data/admin";
import { rangeBounds, inRange, type AnalyticsRange } from "./range";

// ---- Shared metric shapes (consumed by the visualization primitives) ----

export type Tone = "navy" | "gold" | "emerald" | "amber" | "rose" | "sky" | "violet";

export type Metric = {
  label: string;
  value: number;
  /** Pre-formatted display (money etc.); falls back to value.toLocaleString(). */
  display?: string;
  href?: string;
  tone?: Tone;
  format?: "number" | "money";
};

export type Dist = { label: string; value: number; tone?: Tone };

export type Rank = {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  display?: string;
  href?: string;
};

export type FunnelStep = { stage: string; count: number };

export type AnalyticsInput = {
  range: AnalyticsRange;
  nowMs: number;
  members: Member[];
  memberAdminState: Record<string, MemberAdminState>;
  companies: Company[];
  companyAdminState: Record<string, CompanyAdminState>;
  opportunities: Opportunity[];
  opportunityAdminState: Record<string, OpportunityAdminState>;
  opportunityPatches: Record<string, Partial<Opportunity>>;
  listings: ListingRecord[];
  introductions: IntroductionRequest[];
  deals: Deal[];
  calendarEvents: CalendarEvent[];
  notifications: Notification[];
  auditEvents: AuditEvent[];
  reports: ModerationReport[];
  warnings: Warning[];
  restrictions: Restriction[];
  suspensions: Suspension[];
  bans: Ban[];
  changeRequests: ChangeRequest[];
};

// ---- Small helpers ----

const DAY = 24 * 60 * 60 * 1000;
const fmtMoney = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

function rank<T>(
  items: T[],
  keyFn: (t: T) => string | undefined,
  labelFn: (key: string) => string,
  hrefFn?: (key: string) => string | undefined,
  limit = 5
): Rank[] {
  const counts = new Map<string, number>();
  for (const it of items) {
    const k = keyFn(it);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, value]) => ({ id, label: labelFn(id), value, href: hrefFn?.(id) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

// ---- Main ----

export type Analytics = ReturnType<typeof computeAnalytics>;

export function computeAnalytics(input: AnalyticsInput) {
  const {
    range,
    nowMs,
    memberAdminState,
    companyAdminState,
    opportunityAdminState,
    opportunityPatches,
  } = input;
  const bounds = rangeBounds(range, nowMs);
  const within = (iso?: string) => inRange(iso, bounds);

  // ---- Range-filtered entity sets (creation-window) ----
  const members = input.members.filter((m) => within(m.joinedAt));
  const companies = input.companies.filter((c) => within(c.addedAt));
  const opportunities = input.opportunities.filter((o) => within(o.postedAt));
  const listings = input.listings.filter((l) => within(l.createdAt));
  const introductions = input.introductions.filter((r) => within(r.createdAt));
  const deals = input.deals.filter((d) => within(d.createdDate));
  const reports = input.reports.filter((r) => within(r.reportedAt));
  const warnings = input.warnings.filter((w) => within(w.date));
  const restrictions = input.restrictions.filter((r) => within(r.date));
  const suspensions = input.suspensions.filter((s) => within(s.startDate));
  const bans = input.bans.filter((b) => within(b.date));
  const changeRequests = input.changeRequests.filter((c) => within(c.createdAt));
  const auditEvents = input.auditEvents.filter((e) => within(e.createdAt));
  const notifications = input.notifications.filter((n) => within(n.createdAt));
  const calendarCreated = input.calendarEvents.filter((e) => within(e.createdAt));

  // ===================================================================
  // MEMBERS
  // ===================================================================
  const memberStatus = (id: string) => memberAdminState[id]?.status ?? "Active";
  const restrictedIds = new Set(
    restrictions.filter((r) => r.active).map((r) => r.memberId)
  );
  const liveMembers = members.filter((m) => memberStatus(m.id) !== "Deleted");
  const memberVerified = (m: Member) => {
    const v = memberAdminState[m.id]?.verificationOverride ?? m.verification;
    return /Verified|Founding/.test(v);
  };

  const totalMembers = liveMembers.length;
  const activeMembers = liveMembers.filter((m) => memberStatus(m.id) === "Active").length;
  const restrictedMembers = liveMembers.filter((m) => restrictedIds.has(m.id)).length;
  const suspendedMembers = liveMembers.filter((m) => memberStatus(m.id) === "Suspended").length;
  const bannedMembers = liveMembers.filter((m) => memberStatus(m.id) === "Banned").length;
  const verifiedMembers = liveMembers.filter(memberVerified).length;
  const newMembersWindow = liveMembers.length; // already window-filtered by joinedAt

  // Activity rankings (use the UNfiltered deals/intros so a member's lifetime
  // engagement shows even when filtering by their join window would hide it).
  const allDeals = input.deals;
  const allIntros = input.introductions;
  const memberName = (id: string) =>
    input.members.find((m) => m.id === id)?.name ?? id;
  const memberHref = (id: string) => {
    const slug = input.members.find((m) => m.id === id)?.slug;
    return slug ? `/member/${slug}` : undefined;
  };
  const dealsByMemberCount = (id: string) =>
    allDeals.filter((d) => d.sponsor.memberId === id || d.investor?.memberId === id).length;
  const introsSentBy = (id: string) => allIntros.filter((r) => r.requesterId === id).length;
  const introsRecvBy = (id: string) => allIntros.filter((r) => r.targetMemberId === id).length;
  const eventsByMemberCount = (id: string) =>
    input.calendarEvents.filter((e) => e.relations.memberId === id).length;

  const memberPool = liveMembers.length ? liveMembers : input.members;
  const mostActiveMembers = [...memberPool]
    .map((m) => ({
      id: m.id,
      label: m.name,
      value: dealsByMemberCount(m.id) + introsSentBy(m.id) + introsRecvBy(m.id),
      sublabel: `${dealsByMemberCount(m.id)} deals · ${introsSentBy(m.id) + introsRecvBy(m.id)} intros`,
      href: memberHref(m.id),
    }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topIntrosSent = rank(allIntros, (r) => r.requesterId, memberName, memberHref);
  const topIntrosReceived = rank(allIntros, (r) => r.targetMemberId, memberName, memberHref);
  const mostDealsCreated = [...memberPool]
    .map((m) => ({ id: m.id, label: m.name, value: dealsByMemberCount(m.id), href: memberHref(m.id) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const mostCalendarMembers = [...memberPool]
    .map((m) => ({ id: m.id, label: m.name, value: eventsByMemberCount(m.id), href: memberHref(m.id) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // ===================================================================
  // COMPANIES
  // ===================================================================
  const companyStatus = (id: string) => companyAdminState[id]?.status ?? "Active";
  const liveCompanies = companies.filter((c) => companyStatus(c.id) !== "Deleted");
  const companyVerification = (c: Company) =>
    companyAdminState[c.id]?.verificationOverride ?? c.verification;
  const companyFeatured = (c: Company) =>
    companyAdminState[c.id]?.featuredOverride ?? c.featured ?? false;

  const totalCompanies = liveCompanies.length;
  const verifiedCompanies = liveCompanies.filter((c) => /Verified/.test(companyVerification(c))).length;
  const featuredCompanies = liveCompanies.filter(companyFeatured).length;
  const pendingCompanies = liveCompanies.filter((c) => companyVerification(c) === "Pending").length;

  const companyName = (id: string) => input.companies.find((c) => c.id === id)?.name ?? id;
  const companyHref = (id: string) => {
    const slug = input.companies.find((c) => c.id === id)?.slug;
    return slug ? `/company/${slug}` : undefined;
  };
  const dealsByCompany = (id: string) => allDeals.filter((d) => d.companyId === id).length;
  const oppsByCompany = (id: string) =>
    input.opportunities.filter((o) => o.companyId === id).length;
  const introsByCompany = (id: string) => allIntros.filter((r) => r.companyId === id).length;
  const eventsByCompany = (id: string) =>
    input.calendarEvents.filter((e) => e.relations.companyId === id).length;

  const companyPool = liveCompanies.length ? liveCompanies : input.companies;
  const mostActiveCompanies = [...companyPool]
    .map((c) => ({
      id: c.id,
      label: c.name,
      value: dealsByCompany(c.id) + oppsByCompany(c.id) + introsByCompany(c.id),
      sublabel: `${dealsByCompany(c.id)} deals · ${oppsByCompany(c.id)} opps`,
      href: companyHref(c.id),
    }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const companiesByOpps = [...companyPool]
    .map((c) => ({ id: c.id, label: c.name, value: oppsByCompany(c.id), href: companyHref(c.id) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const companiesByDeals = [...companyPool]
    .map((c) => ({ id: c.id, label: c.name, value: dealsByCompany(c.id), href: companyHref(c.id) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const companiesByIntros = [...companyPool]
    .map((c) => ({ id: c.id, label: c.name, value: introsByCompany(c.id), href: companyHref(c.id) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const companiesByCalendar = [...companyPool]
    .map((c) => ({ id: c.id, label: c.name, value: eventsByCompany(c.id), href: companyHref(c.id) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const companyIndustries = topGroups(liveCompanies, (c) => c.industry);
  const companyLocations = topGroups(liveCompanies, (c) => c.headquarters?.country);

  // ===================================================================
  // OPPORTUNITIES
  // ===================================================================
  const oppMod = (id: string) => opportunityAdminState[id]?.moderation;
  const oppArchived = (id: string) => opportunityAdminState[id]?.archived === true;
  const oppDeleted = (id: string) => opportunityAdminState[id]?.deleted === true;
  const oppFeatured = (o: Opportunity) => opportunityPatches[o.id]?.featured ?? o.featured;

  const liveOpps = opportunities.filter((o) => !oppDeleted(o.id));
  const totalOpps = liveOpps.length;
  const activeOpps = liveOpps.filter(
    (o) => !oppArchived(o.id) && oppMod(o.id) !== "Rejected" && o.status !== "Closed"
  ).length;
  const pendingOpps = liveOpps.filter((o) => oppMod(o.id) === "Pending").length;
  const rejectedOpps = liveOpps.filter((o) => oppMod(o.id) === "Rejected").length;
  const featuredOpps = liveOpps.filter(oppFeatured).length;
  const archivedOpps = liveOpps.filter((o) => oppArchived(o.id)).length;

  const oppCategories = topGroups(liveOpps, (o) => o.category);
  const oppIndustries = topGroups(liveOpps, (o) => o.industry);
  const oppLocations = topGroups(liveOpps, (o) => o.place?.country ?? o.location);
  // Opportunity views/saves live on the linked listing (no field on Opportunity
  // itself). Join through listings by opportunityId / opportunitySlug.
  const listingForOpp = (o: Opportunity) =>
    input.listings.find((l) => l.opportunityId === o.id || l.opportunitySlug === o.slug);
  const oppHref = (o: Opportunity) => `/opportunity/${o.slug}`;
  const oppViewRanked = [...liveOpps]
    .map((o) => ({ o, l: listingForOpp(o) }))
    .filter((x) => x.l && x.l.views > 0)
    .map((x) => ({ id: x.o.id, label: x.o.title, value: x.l!.views, href: oppHref(x.o) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const oppSaveRanked = [...liveOpps]
    .map((o) => ({ o, l: listingForOpp(o) }))
    .filter((x) => x.l && x.l.saves > 0)
    .map((x) => ({ id: x.o.id, label: x.o.title, value: x.l!.saves, href: oppHref(x.o) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const oppContactRanked = [...liveOpps]
    .map((o) => ({ o, l: listingForOpp(o) }))
    .filter((x) => x.l && x.l.interests > 0)
    .map((x) => ({ id: x.o.id, label: x.o.title, value: x.l!.interests, href: oppHref(x.o) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // ===================================================================
  // LISTINGS
  // ===================================================================
  const listingStatusCount = (s: string) => listings.filter((l) => l.status === s).length;
  const listingHref = (l: ListingRecord) =>
    l.opportunitySlug ? `/opportunity/${l.opportunitySlug}` : `/dashboard/listings/${l.id}`;
  const introsForListing = (l: ListingRecord) =>
    allIntros.filter((r) => r.opportunitySlug && r.opportunitySlug === l.opportunitySlug).length;
  const dealsForListing = (l: ListingRecord) =>
    allDeals.filter(
      (d) => (l.opportunityId && d.opportunityId === l.opportunityId) ||
        (l.opportunitySlug && d.opportunitySlug === l.opportunitySlug)
    ).length;
  const topBy = (sel: (l: ListingRecord) => number) =>
    [...listings]
      .map((l) => ({ id: l.id, label: l.title, value: sel(l), href: listingHref(l) }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  const listingsByViews = topBy((l) => l.views);
  const listingsBySaves = topBy((l) => l.saves);
  const listingsByContacts = topBy((l) => l.interests);
  const listingsByIntros = [...listings]
    .map((l) => ({ id: l.id, label: l.title, value: introsForListing(l), href: listingHref(l) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const listingsByDeals = [...listings]
    .map((l) => ({ id: l.id, label: l.title, value: dealsForListing(l), href: listingHref(l) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const listingsRecent = [...listings]
    .sort((a, b) => Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt))
    .slice(0, 6)
    .map((l) => ({ id: l.id, label: l.title, sublabel: l.status, value: l.views, href: listingHref(l) }));
  const listingCategories = topGroups(listings, (l) => l.category);
  const listingDealTypes = topGroups(listings, (l) => l.dealType);

  // ===================================================================
  // DEALS
  // ===================================================================
  const dealMetrics = computeDealDeskMetrics(deals, nowMs);
  const dealHealth = (d: Deal): DealHealth => d.health ?? "Healthy";
  const dealsByStage = DEAL_STAGES.map((s) => ({
    label: s,
    value: deals.filter((d) => d.stage === s).length,
  })).filter((x) => x.value > 0);
  const HEALTHS: DealHealth[] = ["Healthy", "Needs Attention", "At Risk", "Critical"];
  const dealsByHealth = HEALTHS.map((h) => ({
    label: h,
    value: deals.filter((d) => dealHealth(d) === h).length,
    tone: (h === "Healthy" ? "emerald" : h === "Critical" || h === "At Risk" ? "rose" : "amber") as Tone,
  })).filter((x) => x.value > 0);
  const PRIORITIES: DealPriority[] = ["Urgent", "High", "Normal", "Low"];
  const dealsByPriority = PRIORITIES.map((p) => ({
    label: p,
    value: deals.filter((d) => d.priority === p).length,
  })).filter((x) => x.value > 0);
  const dealsByAdmin = rank(deals, (d) => d.assignedAdmin || "Unassigned", (k) => k, () => "/deal-desk", 8);
  const dealsByMonth = monthSeries(deals.map((d) => d.createdDate));
  const dealsBySource = topGroups(deals, (d) => d.sourceType);

  const funnel: FunnelStep[] = DEAL_STAGES.filter((s) => s !== "Archived").map((s) => ({
    stage: s,
    count: deals.filter((d) => d.stage === s).length,
  }));

  const openDeals = deals.filter((d) => isOpenStage(d.stage));
  const avgDealSize = openDeals.length
    ? Math.round(openDeals.reduce((s, d) => s + d.targetInvestment, 0) / openDeals.length)
    : 0;
  const largestDeals = [...deals]
    .sort((a, b) => (b.actualInvestment ?? b.targetInvestment) - (a.actualInvestment ?? a.targetInvestment))
    .slice(0, 5)
    .map((d) => ({
      id: d.dealId,
      label: d.title,
      sublabel: d.stage,
      value: d.actualInvestment ?? d.targetInvestment,
      display: fmtMoney(d.actualInvestment ?? d.targetInvestment),
      href: `/deal-desk/${d.dealId}`,
    }));
  const recentlyUpdatedDeals = [...deals]
    .sort((a, b) => Date.parse(b.updatedDate) - Date.parse(a.updatedDate))
    .slice(0, 6)
    .map((d) => ({ id: d.dealId, label: d.title, sublabel: d.stage, value: 0, href: `/deal-desk/${d.dealId}` }));
  const closingThisMonth = openDeals
    .filter((d) => {
      if (!d.expectedCloseDate) return false;
      const t = Date.parse(d.expectedCloseDate);
      return !Number.isNaN(t) && t >= nowMs && t <= nowMs + 30 * DAY;
    })
    .sort((a, b) => Date.parse(a.expectedCloseDate!) - Date.parse(b.expectedCloseDate!))
    .map((d) => ({
      id: d.dealId,
      label: d.title,
      sublabel: d.expectedCloseDate?.slice(0, 10),
      value: d.targetInvestment,
      display: fmtMoney(d.targetInvestment),
      href: `/deal-desk/${d.dealId}`,
    }));
  const overdueDeals = openDeals
    .filter((d) => {
      if (!d.expectedCloseDate) return false;
      const t = Date.parse(d.expectedCloseDate);
      return !Number.isNaN(t) && t < nowMs;
    })
    .map((d) => ({ id: d.dealId, label: d.title, sublabel: d.expectedCloseDate?.slice(0, 10), value: 0, href: `/deal-desk/${d.dealId}` }));
  const atRiskDeals = openDeals
    .filter((d) => dealHealth(d) === "At Risk" || dealHealth(d) === "Critical")
    .map((d) => ({ id: d.dealId, label: d.title, sublabel: dealHealth(d), value: 0, href: `/deal-desk/${d.dealId}` }));
  const needsAttentionDeals = openDeals
    .filter((d) => dealAlerts(d, nowMs).length > 0)
    .map((d) => ({
      id: d.dealId,
      label: d.title,
      sublabel: dealAlerts(d, nowMs)[0],
      value: dealAlerts(d, nowMs).length,
      href: `/deal-desk/${d.dealId}`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const healthyDeals = openDeals.filter((d) => dealHealth(d) === "Healthy").length;
  const closedWon = deals.filter((d) => d.stage === "Closed Won").length;
  const closedLost = deals.filter((d) => d.stage === "Closed Lost").length;
  const archivedDeals = deals.filter((d) => d.stage === "Archived").length;
  const largestDealValue = largestDeals[0]?.value ?? 0;

  // ===================================================================
  // INTRODUCTIONS
  // ===================================================================
  const introByStatus = (s: string) => introductions.filter((r) => r.status === s).length;
  const introTotal = introductions.length;
  const introApproved = introByStatus("Approved");
  const introRejected = introByStatus("Rejected");
  const introCompleted = introByStatus("Completed");
  const introPending = introByStatus("Pending");
  // Converted = an introduction that has a deal pointing back to it.
  const dealIntroIds = new Set(
    input.deals.map((d) => d.introductionId).filter(Boolean) as string[]
  );
  const introConverted = introductions.filter((r) => dealIntroIds.has(r.id)).length;
  const introConversionPct = introTotal ? Math.round((introConverted / introTotal) * 100) : 0;
  const decided = introductions.filter((r) => r.decidedAt);
  const avgApprovalHours = decided.length
    ? Math.round(
        (decided.reduce((s, r) => s + (Date.parse(r.decidedAt!) - Date.parse(r.createdAt)), 0) /
          decided.length /
          (60 * 60 * 1000)) * 10
      ) / 10
    : 0;
  const topIntroducers = rank(introductions, (r) => r.requesterId, memberName, memberHref);
  const mostRequested = rank(introductions, (r) => r.targetMemberId, memberName, memberHref);
  const mostApproved = rank(
    introductions.filter((r) => r.status === "Approved" || r.status === "Completed"),
    (r) => r.targetMemberId,
    memberName,
    memberHref
  );
  const mostRejected = rank(
    introductions.filter((r) => r.status === "Rejected"),
    (r) => r.targetMemberId,
    memberName,
    memberHref
  );

  // ===================================================================
  // CALENDAR  (range-driven metrics use createdAt window; tiles are now-based)
  // ===================================================================
  const startToday = new Date(nowMs); startToday.setHours(0, 0, 0, 0);
  const endToday = new Date(nowMs); endToday.setHours(23, 59, 59, 999);
  const startWeek = new Date(nowMs); startWeek.setDate(startWeek.getDate() - startWeek.getDay()); startWeek.setHours(0, 0, 0, 0);
  const endWeek = new Date(startWeek.getTime() + 7 * DAY - 1);
  const startMonth = new Date(nowMs); startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0);
  const endMonth = new Date(startMonth); endMonth.setMonth(endMonth.getMonth() + 1); endMonth.setTime(endMonth.getTime() - 1);
  const evStart = (e: CalendarEvent) => Date.parse(e.start);
  const evEnd = (e: CalendarEvent) => Date.parse(e.end);
  const isClosed = (e: CalendarEvent) => e.status === "Completed" || e.status === "Cancelled";
  const allEvents = input.calendarEvents;
  const eventsToday = allEvents.filter((e) => evStart(e) >= startToday.getTime() && evStart(e) <= endToday.getTime()).length;
  const eventsThisWeek = allEvents.filter((e) => evStart(e) >= startWeek.getTime() && evStart(e) <= endWeek.getTime()).length;
  const eventsThisMonth = allEvents.filter((e) => evStart(e) >= startMonth.getTime() && evStart(e) <= endMonth.getTime()).length;
  const upcomingEvents = allEvents.filter((e) => !isClosed(e) && evStart(e) >= nowMs).length;
  const overdueEvents = allEvents.filter((e) => !isClosed(e) && evEnd(e) < nowMs && (e.type === "Task" || e.type === "Deadline")).length;
  const completedEvents = calendarCreated.filter((e) => e.status === "Completed").length;
  const recurringEvents = calendarCreated.filter((e) => e.recurrence && e.recurrence.freq !== "None").length;
  const eventsByType = EVENT_TYPES.map((t: EventType) => ({
    label: t,
    value: calendarCreated.filter((e) => e.type === t).length,
  })).filter((x) => x.value > 0);
  const countType = (...types: EventType[]) => calendarCreated.filter((e) => types.includes(e.type)).length;
  const calMeetings = countType("Meeting", "Investor Meeting");
  const calCalls = countType("Call");
  const calFollowUps = countType("Follow Up");
  const calDeadlines = countType("Deadline");
  const calTasks = countType("Task");
  const calMostMembers = rank(calendarCreated, (e) => e.relations.memberId, memberName, memberHref);
  const calMostCompanies = rank(calendarCreated, (e) => e.relations.companyId, companyName, companyHref);
  const calMostDeals = rank(
    calendarCreated,
    (e) => e.relations.dealId,
    (id) => input.deals.find((d) => d.dealId === id)?.title ?? id,
    (id) => `/deal-desk/${id}`
  );

  // ===================================================================
  // NOTIFICATIONS
  // ===================================================================
  const notifUnread = notifications.filter((n) => !n.read).length;
  const notifRead = notifications.filter((n) => n.read).length;
  const notifByKind = topGroups(notifications, (n) => n.kind, 8);
  const calNotif = notifications.filter((n) => n.kind.startsWith("calendar")).length;
  const dealNotif = notifications.filter((n) => n.kind === "negotiation_update" || n.kind === "company_response").length;
  const msgNotif = notifications.filter((n) => n.kind === "message" || n.kind === "attachment").length;

  // ===================================================================
  // AUDIT
  // ===================================================================
  const auditToday = auditEvents.filter((e) => Date.parse(e.createdAt) >= startToday.getTime() && Date.parse(e.createdAt) <= endToday.getTime()).length;
  const auditWeek = auditEvents.filter((e) => Date.parse(e.createdAt) >= startWeek.getTime() && Date.parse(e.createdAt) <= endWeek.getTime()).length;
  const auditMonth = auditEvents.filter((e) => Date.parse(e.createdAt) >= startMonth.getTime() && Date.parse(e.createdAt) <= endMonth.getTime()).length;
  const auditByAction = topGroups(auditEvents, (e) => e.action, 8);
  const auditByGroup = topGroups(auditEvents, (e) => groupForAction(e.action), 12);
  const auditByRole = topGroups(auditEvents, (e) => e.actorRole);
  const auditByActor = rank(auditEvents, (e) => e.actorName, (k) => k, undefined, 8);
  const auditByTarget = topGroups(auditEvents, (e) => e.targetKind, 11);
  const auditModeration = auditEvents.filter((e) => isModerationAction(e.action)).length;

  // ===================================================================
  // MODERATION
  // ===================================================================
  const reportsTotal = reports.length;
  const reportsOpen = reports.filter((r) => r.status === "Open").length;
  const reportsClosed = reports.filter((r) => r.status !== "Open").length;
  const reportsResolved = reports.filter((r) => r.status === "Resolved").length;
  const reportsDismissed = reports.filter((r) => r.status === "Dismissed").length;
  const reportsByStatus: Dist[] = (["Open", "Resolved", "Dismissed", "Archived"] as const).map((s) => ({
    label: s,
    value: reports.filter((r) => r.status === s).length,
    tone: (s === "Open" ? "amber" : s === "Resolved" ? "emerald" : "navy") as Tone,
  })).filter((x) => x.value > 0);
  const reportsByPriority: Dist[] = (["Critical", "High", "Medium", "Low"] as const).map((p) => ({
    label: p,
    value: reports.filter((r) => r.priority === p).length,
    tone: (p === "Critical" || p === "High" ? "rose" : p === "Medium" ? "amber" : "navy") as Tone,
  })).filter((x) => x.value > 0);
  const reportsByReason = topGroups(reports, (r) => r.reason, 6);
  const mostReported = rank(
    reports,
    (r) => `${r.targetKind}:${r.targetId}`,
    (k) => k.split(":").join(" · "),
    undefined,
    6
  );
  const activeWarnings = warnings.length;
  const activeRestrictions = restrictions.filter((r) => r.active).length;
  const activeSuspensions = suspensions.filter((s) => s.active).length;
  const activeBans = bans.filter((b) => b.active).length;
  const changeRequestsOpen = changeRequests.filter((c) => c.status === "Open").length;
  const changeRequestsClosed = changeRequests.filter((c) => c.status === "Resolved").length;

  // ===================================================================
  // EXECUTIVE OVERVIEW (KPI cards, all clickable)
  // ===================================================================
  const m = (label: string, value: number, extra?: Partial<Metric>): Metric => ({ label, value, ...extra });
  const executive: Metric[] = [
    // Members
    m("Total Members", totalMembers, { href: "/admin/members", tone: "navy" }),
    m("Active Members", activeMembers, { href: "/admin/members?status=Active", tone: "emerald" }),
    m("Restricted Members", restrictedMembers, { href: "/admin/moderation", tone: restrictedMembers ? "amber" : "navy" }),
    m("Suspended Members", suspendedMembers, { href: "/admin/members?status=Suspended", tone: suspendedMembers ? "rose" : "navy" }),
    m("Banned Members", bannedMembers, { href: "/admin/members?status=Banned", tone: bannedMembers ? "rose" : "navy" }),
    // Companies
    m("Total Companies", totalCompanies, { href: "/admin/companies", tone: "navy" }),
    m("Verified Companies", verifiedCompanies, { href: "/admin/companies", tone: "emerald" }),
    m("Featured Companies", featuredCompanies, { href: "/admin/companies", tone: "gold" }),
    m("Pending Verification", pendingCompanies, { href: "/admin/companies", tone: pendingCompanies ? "amber" : "navy" }),
    // Opportunities
    m("Total Opportunities", totalOpps, { href: "/admin/opportunities", tone: "navy" }),
    m("Active Opportunities", activeOpps, { href: "/opportunities", tone: "emerald" }),
    m("Pending Approval", pendingOpps, { href: "/admin/opportunities", tone: pendingOpps ? "amber" : "navy" }),
    m("Featured Opportunities", featuredOpps, { href: "/admin/opportunities", tone: "gold" }),
    m("Archived Opportunities", archivedOpps, { href: "/admin/opportunities", tone: "navy" }),
    // Introductions
    m("Total Introductions", introTotal, { href: "/admin/introductions", tone: "navy" }),
    m("Approved Introductions", introApproved, { href: "/admin/introductions", tone: "emerald" }),
    m("Rejected Introductions", introRejected, { href: "/admin/introductions", tone: introRejected ? "rose" : "navy" }),
    m("Completed Introductions", introCompleted, { href: "/admin/introductions", tone: "emerald" }),
    m("Converted To Deals", introConverted, { href: "/deal-desk", tone: "gold" }),
    // Deals
    m("Total Deals", deals.length, { href: "/deal-desk", tone: "navy" }),
    m("Open Deals", openDeals.length, { href: "/deal-desk?bucket=open", tone: "sky" }),
    m("Closed Won", closedWon, { href: "/deal-desk?bucket=closed", tone: "emerald" }),
    m("Closed Lost", closedLost, { href: "/deal-desk?bucket=closed", tone: closedLost ? "rose" : "navy" }),
    m("Archived Deals", archivedDeals, { href: "/deal-desk?bucket=archived", tone: "navy" }),
    m("Capital Raising", dealMetrics.capitalBeingRaised, { href: "/deal-desk", tone: "gold", format: "money", display: fmtMoney(dealMetrics.capitalBeingRaised) }),
    m("Capital Closed", deals.filter((d) => d.stage === "Closed Won").reduce((s, d) => s + (d.actualInvestment ?? d.targetInvestment), 0), { href: "/deal-desk", tone: "gold", format: "money", display: fmtMoney(deals.filter((d) => d.stage === "Closed Won").reduce((s, d) => s + (d.actualInvestment ?? d.targetInvestment), 0)) }),
    m("Average Deal Size", avgDealSize, { href: "/deal-desk", tone: "navy", format: "money", display: fmtMoney(avgDealSize) }),
    m("Largest Deal", largestDealValue, { href: "/deal-desk", tone: "gold", format: "money", display: fmtMoney(largestDealValue) }),
    m("Deals Closing Soon", closingThisMonth.length, { href: "/deal-desk?bucket=open", tone: closingThisMonth.length ? "amber" : "navy" }),
    m("At Risk Deals", atRiskDeals.length, { href: "/deal-desk?bucket=open", tone: atRiskDeals.length ? "rose" : "navy" }),
  ];

  return {
    range,
    nowMs,
    counts: {
      members: liveMembers.length,
      companies: liveCompanies.length,
      opportunities: liveOpps.length,
      listings: listings.length,
      introductions: introductions.length,
      deals: deals.length,
      events: calendarCreated.length,
      reports: reports.length,
      audit: auditEvents.length,
    },
    executive,
    deals: {
      kpis: [
        m("Total Deals", deals.length, { href: "/deal-desk" }),
        m("Open", openDeals.length, { tone: "sky", href: "/deal-desk?bucket=open" }),
        m("Closed Won", closedWon, { tone: "emerald", href: "/deal-desk?bucket=closed" }),
        m("Closed Lost", closedLost, { tone: closedLost ? "rose" : "navy", href: "/deal-desk?bucket=closed" }),
        m("Healthy", healthyDeals, { tone: "emerald" }),
        m("Avg Size", avgDealSize, { format: "money", display: fmtMoney(avgDealSize) }),
        m("Capital Raising", dealMetrics.capitalBeingRaised, { tone: "gold", format: "money", display: fmtMoney(dealMetrics.capitalBeingRaised) }),
        m("Total Value", dealMetrics.totalDealValue, { tone: "gold", format: "money", display: fmtMoney(dealMetrics.totalDealValue) }),
      ] as Metric[],
      byStage: dealsByStage,
      byHealth: dealsByHealth,
      byPriority: dealsByPriority,
      byAdmin: dealsByAdmin,
      byMonth: dealsByMonth,
      bySource: dealsBySource,
      funnel,
      largestDeals,
      recentlyUpdatedDeals,
      closingThisMonth,
      overdueDeals,
      atRiskDeals,
      needsAttentionDeals,
    },
    introductions: {
      kpis: [
        m("Requests", introTotal, { href: "/admin/introductions" }),
        m("Approved", introApproved, { tone: "emerald" }),
        m("Rejected", introRejected, { tone: introRejected ? "rose" : "navy" }),
        m("Completed", introCompleted, { tone: "emerald" }),
        m("Converted", introConverted, { tone: "gold", href: "/deal-desk" }),
        m("Pending", introPending, { tone: introPending ? "amber" : "navy" }),
        m("Conversion %", introConversionPct, { display: `${introConversionPct}%` }),
        m("Avg Approval", avgApprovalHours, { display: avgApprovalHours ? `${avgApprovalHours}h` : "—" }),
      ] as Metric[],
      topIntroducers,
      mostRequested,
      mostApproved,
      mostRejected,
    },
    listings: {
      kpis: [
        m("Total", listings.length, { href: "/dashboard/listings" }),
        m("Active", listingStatusCount("Active"), { tone: "emerald" }),
        m("Draft", listingStatusCount("Draft"), { tone: "amber" }),
        m("Closed", listingStatusCount("Closed"), { tone: "navy" }),
        m("Archived", listingStatusCount("Archived"), { tone: "navy" }),
        m("Total Views", listings.reduce((s, l) => s + l.views, 0)),
        m("Total Saves", listings.reduce((s, l) => s + l.saves, 0)),
        m("Total Contacts", listings.reduce((s, l) => s + l.interests, 0)),
      ] as Metric[],
      byStatus: (["Draft", "Active", "Seeking Capital", "Negotiating", "Under Review", "Closed", "Archived"] as const)
        .map((s) => ({ label: s, value: listingStatusCount(s) }))
        .filter((x) => x.value > 0),
      mostViewed: listingsByViews,
      mostSaved: listingsBySaves,
      mostContacted: listingsByContacts,
      mostIntros: listingsByIntros,
      mostDeals: listingsByDeals,
      recent: listingsRecent,
      categories: listingCategories,
      dealTypes: listingDealTypes,
    },
    opportunities: {
      kpis: [
        m("Total", totalOpps, { href: "/opportunities" }),
        m("Active", activeOpps, { tone: "emerald", href: "/opportunities" }),
        m("Featured", featuredOpps, { tone: "gold" }),
        m("Pending Approval", pendingOpps, { tone: pendingOpps ? "amber" : "navy", href: "/admin/opportunities" }),
        m("Rejected", rejectedOpps, { tone: rejectedOpps ? "rose" : "navy" }),
        m("Archived", archivedOpps, { tone: "navy" }),
      ] as Metric[],
      mostViewed: oppViewRanked,
      mostSaved: oppSaveRanked,
      mostContacted: oppContactRanked,
      categories: oppCategories,
      industries: oppIndustries,
      locations: oppLocations,
    },
    members: {
      kpis: [
        m("Total", totalMembers, { href: "/admin/members" }),
        m("New (window)", newMembersWindow, { tone: "emerald" }),
        m("Verified", verifiedMembers, { tone: "emerald" }),
        m("Restricted", restrictedMembers, { tone: restrictedMembers ? "amber" : "navy" }),
        m("Suspended", suspendedMembers, { tone: suspendedMembers ? "rose" : "navy", href: "/admin/members?status=Suspended" }),
        m("Banned", bannedMembers, { tone: bannedMembers ? "rose" : "navy", href: "/admin/members?status=Banned" }),
      ] as Metric[],
      mostActive: mostActiveMembers,
      mostIntrosSent: topIntrosSent,
      mostIntrosReceived: topIntrosReceived,
      mostDealsCreated,
      mostCalendar: mostCalendarMembers,
      byType: topGroups(liveMembers, (mm) => mm.memberType, 8),
      byRegion: topGroups(liveMembers, (mm) => mm.country, 8),
    },
    companies: {
      kpis: [
        m("Total", totalCompanies, { href: "/admin/companies" }),
        m("Verified", verifiedCompanies, { tone: "emerald" }),
        m("Pending Verification", pendingCompanies, { tone: pendingCompanies ? "amber" : "navy" }),
        m("Featured", featuredCompanies, { tone: "gold" }),
      ] as Metric[],
      mostActive: mostActiveCompanies,
      mostOpps: companiesByOpps,
      mostDeals: companiesByDeals,
      mostIntros: companiesByIntros,
      mostCalendar: companiesByCalendar,
      industries: companyIndustries,
      locations: companyLocations,
    },
    calendar: {
      tiles: [
        m("Events Today", eventsToday, { href: "/calendar", tone: "navy" }),
        m("This Week", eventsThisWeek, { href: "/calendar", tone: "navy" }),
        m("This Month", eventsThisMonth, { href: "/calendar", tone: "navy" }),
        m("Upcoming", upcomingEvents, { href: "/calendar", tone: "sky" }),
        m("Overdue", overdueEvents, { href: "/calendar", tone: overdueEvents ? "rose" : "navy" }),
        m("Completed", completedEvents, { tone: "emerald" }),
      ] as Metric[],
      typeKpis: [
        m("Meetings", calMeetings),
        m("Calls", calCalls),
        m("Follow Ups", calFollowUps),
        m("Deadlines", calDeadlines),
        m("Tasks", calTasks),
        m("Recurring", recurringEvents),
      ] as Metric[],
      byType: eventsByType,
      mostMembers: calMostMembers,
      mostCompanies: calMostCompanies,
      mostDeals: calMostDeals,
    },
    notifications: {
      kpis: [
        m("Unread", notifUnread, { tone: notifUnread ? "gold" : "navy" }),
        m("Read", notifRead, { tone: "navy" }),
        m("Calendar", calNotif, { tone: "sky" }),
        m("Deal", dealNotif, { tone: "emerald" }),
        m("Messages", msgNotif, { tone: "navy" }),
        m("Total", notifications.length),
      ] as Metric[],
      byKind: notifByKind,
    },
    audit: {
      kpis: [
        m("Today", auditToday, { href: "/admin/audit" }),
        m("This Week", auditWeek, { href: "/admin/audit" }),
        m("This Month", auditMonth, { href: "/admin/audit" }),
        m("Moderation Actions", auditModeration, { tone: "rose", href: "/admin/audit" }),
        m("Total (window)", auditEvents.length, { href: "/admin/audit" }),
      ] as Metric[],
      byAction: auditByAction,
      byGroup: auditByGroup,
      byRole: auditByRole,
      byActor: auditByActor,
      byTarget: auditByTarget,
    },
    moderation: {
      kpis: [
        m("Reports Filed", reportsTotal, { href: "/admin/moderation" }),
        m("Open", reportsOpen, { tone: reportsOpen ? "amber" : "navy", href: "/admin/moderation?status=Open" }),
        m("Closed", reportsClosed, { tone: "navy" }),
        m("Resolved", reportsResolved, { tone: "emerald" }),
        m("Dismissed", reportsDismissed, { tone: "navy" }),
        m("Warnings", activeWarnings, { tone: activeWarnings ? "amber" : "navy" }),
        m("Restrictions", activeRestrictions, { tone: activeRestrictions ? "amber" : "navy" }),
        m("Suspensions", activeSuspensions, { tone: activeSuspensions ? "rose" : "navy" }),
        m("Bans", activeBans, { tone: activeBans ? "rose" : "navy" }),
        m("Change Requests", changeRequestsOpen, { tone: changeRequestsOpen ? "amber" : "navy" }),
      ] as Metric[],
      byStatus: reportsByStatus,
      byPriority: reportsByPriority,
      byReason: reportsByReason,
      mostReported,
      changeRequestsClosed,
    },
    // Range-filtered raw records for CSV export (honor the active filter).
    records: {
      deals,
      members: liveMembers,
      companies: liveCompanies,
      listings,
      introductions,
      audit: auditEvents,
      reports,
    },
  };
}

// ---- grouping helpers (defined after use; hoisted) ----

function topGroups<T>(
  items: T[],
  keyFn: (t: T) => string | undefined | null,
  limit = 6
): Dist[] {
  const counts = new Map<string, number>();
  for (const it of items) {
    const k = keyFn(it);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function monthSeries(isoDates: string[]): Dist[] {
  const counts = new Map<string, number>();
  for (const iso of isoDates) {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) continue;
    const d = new Date(t);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => {
      const [y, mo] = key.split("-");
      return { label: `${MONTHS[parseInt(mo, 10) - 1]} ${y}`, value };
    });
}
