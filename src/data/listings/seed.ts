import type {
  ListingActivity,
  ListingActivityKind,
  ListingAnalyticsPoint,
  ListingRecord,
} from "./types";

// Fixed reference date — keeps the seed deterministic across renders.
// All timestamps are derived from index arithmetic against this anchor.
const REFERENCE_ISO = "2026-06-06T12:00:00.000Z";
const REFERENCE_MS = Date.parse(REFERENCE_ISO);
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function isoAt(daysAgo: number, hoursAgo: number = 0): string {
  const ms = REFERENCE_MS - daysAgo * DAY_MS - hoursAgo * HOUR_MS;
  return new Date(ms).toISOString();
}

function dayKey(daysAgo: number): string {
  // YYYY-MM-DD slice of the deterministic ISO timestamp.
  return isoAt(daysAgo).slice(0, 10);
}

function buildAnalyticsSeries(
  baseViews: number,
  baseSaves: number,
  baseInterests: number,
  baseMessages: number,
  spread: number
): ListingAnalyticsPoint[] {
  const series: ListingAnalyticsPoint[] = [];
  // 30 entries for days 0..29 back from the reference date.
  // Index-based variation keeps numbers deterministic and bounded.
  for (let i = 0; i < 30; i++) {
    const dailyViews = clamp(
      baseViews + ((i * 7) % spread) - Math.floor(spread / 2) + (i % 5) * 4,
      10,
      120
    );
    const dailySaves = clamp(baseSaves + ((i * 3) % 6) - 1, 0, 8);
    const dailyInterests = clamp(baseInterests + (i % 4) - 1, 0, 3);
    const dailyMessages = clamp(baseMessages + (i % 3) - 1, 0, 2);
    series.push({
      day: dayKey(29 - i),
      views: dailyViews,
      saves: dailySaves,
      interests: dailyInterests,
      messages: dailyMessages,
    });
  }
  return series;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function makeActivity(
  listingId: string,
  seq: number,
  kind: ListingActivityKind,
  title: string,
  body: string,
  daysAgo: number,
  hoursAgo: number,
  extras: { opportunitySlug?: string; companyId?: string } = {}
): ListingActivity {
  return {
    id: `${listingId}-act-${String(seq).padStart(2, "0")}`,
    kind,
    title,
    body,
    createdAt: isoAt(daysAgo, hoursAgo),
    listingId,
    opportunitySlug: extras.opportunitySlug,
    companyId: extras.companyId,
  };
}

export const SEED_LISTINGS: ListingRecord[] = [
  // LST-000001 → cc-001 Beachfront Boutique Hotel
  {
    id: "LST-000001",
    opportunityId: "cc-001",
    opportunitySlug: "beachfront-boutique-hotel",
    title: "Beachfront Boutique Hotel — 42 Keys",
    category: "Hotels & Resorts",
    dealType: "Seeking Investor",
    status: "Active",
    views: 2412,
    saves: 184,
    interests: 32,
    negotiations: 4,
    messages: 11,
    lastUpdatedAt: isoAt(2),
    createdAt: isoAt(48),
    analyticsSeries: buildAnalyticsSeries(78, 5, 1, 1, 30),
    activity: [
      makeActivity(
        "LST-000001",
        1,
        "interest",
        "New interest from Aurora Capital Partners",
        "An institutional investor expressed interest after reviewing the pitch deck.",
        2,
        4,
        { opportunitySlug: "beachfront-boutique-hotel", companyId: "COMP-000002" }
      ),
      makeActivity(
        "LST-000001",
        2,
        "saved",
        "Saved by 12 new investors this week",
        "Weekly saves rose 18% versus the prior week, driven by traffic from the Hotels & Resorts category.",
        3,
        0,
        { opportunitySlug: "beachfront-boutique-hotel" }
      ),
      makeActivity(
        "LST-000001",
        3,
        "negotiation_start",
        "Negotiation opened with Pacific Coast Development Group",
        "A qualified LP moved from interest to formal negotiation with a draft term sheet attached.",
        5,
        2,
        { opportunitySlug: "beachfront-boutique-hotel", companyId: "COMP-000001" }
      ),
      makeActivity(
        "LST-000001",
        4,
        "document_request",
        "Pitch deck requested by Riviera Land Group",
        "Investor requested the latest investor deck and the five-year financial model.",
        7,
        6,
        { opportunitySlug: "beachfront-boutique-hotel", companyId: "COMP-000003" }
      ),
    ],
  },
  // LST-000002 → cc-002 Mixed-Use Tower Development
  {
    id: "LST-000002",
    opportunityId: "cc-002",
    opportunitySlug: "mixed-use-tower-development",
    title: "Mixed-Use Tower Development",
    category: "Real Estate Development",
    dealType: "Seeking Investor",
    status: "Seeking Capital",
    views: 1843,
    saves: 142,
    interests: 28,
    negotiations: 3,
    messages: 9,
    lastUpdatedAt: isoAt(5),
    createdAt: isoAt(52),
    analyticsSeries: buildAnalyticsSeries(62, 4, 1, 1, 28),
    activity: [
      makeActivity(
        "LST-000002",
        1,
        "stage_change",
        "Status changed to Seeking Capital",
        "Listing moved into active raise mode after permits were issued and the GMP was signed.",
        5,
        0,
        { opportunitySlug: "mixed-use-tower-development" }
      ),
      makeActivity(
        "LST-000002",
        2,
        "company_view",
        "Sonora Energy Partners viewed your company page",
        "Their team viewed your sponsor profile shortly after opening the pitch deck.",
        6,
        3,
        { opportunitySlug: "mixed-use-tower-development", companyId: "COMP-000005" }
      ),
      makeActivity(
        "LST-000002",
        3,
        "interest",
        "Interest received from Global Logistics Holdings",
        "Investor flagged Edgewater submarket exposure and asked for the capital stack breakdown.",
        8,
        2,
        { opportunitySlug: "mixed-use-tower-development", companyId: "COMP-000004" }
      ),
    ],
  },
  // LST-000003 → cc-003 Coastal Development Land
  {
    id: "LST-000003",
    opportunityId: "cc-003",
    opportunitySlug: "coastal-development-land",
    title: "Coastal Development Land — 84 Acres",
    category: "Land Opportunities",
    dealType: "Land For Sale",
    status: "Negotiating",
    views: 921,
    saves: 56,
    interests: 14,
    negotiations: 2,
    messages: 6,
    lastUpdatedAt: isoAt(7),
    createdAt: isoAt(60),
    analyticsSeries: buildAnalyticsSeries(34, 2, 0, 0, 24),
    activity: [
      makeActivity(
        "LST-000003",
        1,
        "negotiation_start",
        "Negotiation opened with Yucatán Development Co.",
        "LOI exchanged — exclusivity request pending counter-signature.",
        7,
        1,
        { opportunitySlug: "coastal-development-land", companyId: "COMP-000006" }
      ),
      makeActivity(
        "LST-000003",
        2,
        "stage_change",
        "Status changed to Negotiating",
        "Listing moved from Active to Negotiating after the first LOI was received.",
        9,
        0,
        { opportunitySlug: "coastal-development-land" }
      ),
      makeActivity(
        "LST-000003",
        3,
        "document_request",
        "Survey + topo requested",
        "Buyer requested the most recent survey, topography overlay, and FONATUR setback letter.",
        12,
        4,
        { opportunitySlug: "coastal-development-land" }
      ),
    ],
  },
  // LST-000004 → cc-004 Regional Logistics Acquisition
  {
    id: "LST-000004",
    opportunityId: "cc-004",
    opportunitySlug: "regional-logistics-acquisition",
    title: "Regional Logistics Operator Acquisition",
    category: "Business Acquisitions",
    dealType: "Business For Sale",
    status: "Under Review",
    views: 1207,
    saves: 88,
    interests: 19,
    negotiations: 2,
    messages: 7,
    lastUpdatedAt: isoAt(3),
    createdAt: isoAt(45),
    analyticsSeries: buildAnalyticsSeries(45, 3, 1, 0, 26),
    activity: [
      makeActivity(
        "LST-000004",
        1,
        "edit",
        "Listing edited — financial summary updated",
        "Owner replaced the financial summary with the latest QofE-adjusted EBITDA figures.",
        3,
        2,
        { opportunitySlug: "regional-logistics-acquisition" }
      ),
      makeActivity(
        "LST-000004",
        2,
        "stage_change",
        "Status changed to Under Review",
        "Listing entered Under Review after the SBA term sheet was received.",
        4,
        0,
        { opportunitySlug: "regional-logistics-acquisition" }
      ),
      makeActivity(
        "LST-000004",
        3,
        "interest",
        "Interest received from Pacific Coast Development Group",
        "Buyer flagged appetite for Texas freight exposure and asked for the customer concentration breakdown.",
        6,
        5,
        { opportunitySlug: "regional-logistics-acquisition", companyId: "COMP-000001" }
      ),
      makeActivity(
        "LST-000004",
        4,
        "saved",
        "Saved by 8 new investors this week",
        "Saves accelerated after the listing was featured in the Business Acquisitions section.",
        9,
        0,
        { opportunitySlug: "regional-logistics-acquisition" }
      ),
    ],
  },
  // LST-000005 → cc-005 Solar + Storage Portfolio
  {
    id: "LST-000005",
    opportunityId: "cc-005",
    opportunitySlug: "sonora-solar-storage-portfolio",
    title: "Solar + Storage Portfolio — 120 MW",
    category: "Energy",
    dealType: "Financing Needed",
    status: "Seeking Capital",
    views: 1564,
    saves: 124,
    interests: 21,
    negotiations: 3,
    messages: 8,
    lastUpdatedAt: isoAt(1),
    createdAt: isoAt(40),
    analyticsSeries: buildAnalyticsSeries(56, 4, 1, 1, 30),
    activity: [
      makeActivity(
        "LST-000005",
        1,
        "company_view",
        "Aurora Capital Partners viewed your sponsor page",
        "Their team reviewed your sponsor profile and saved the listing within ten minutes.",
        1,
        3,
        { opportunitySlug: "sonora-solar-storage-portfolio", companyId: "COMP-000002" }
      ),
      makeActivity(
        "LST-000005",
        2,
        "saved",
        "Saved by 14 new investors this week",
        "The listing crossed 120 total saves, driven by renewable-energy LPs.",
        2,
        0,
        { opportunitySlug: "sonora-solar-storage-portfolio" }
      ),
      makeActivity(
        "LST-000005",
        3,
        "negotiation_start",
        "Negotiation opened with Riviera Land Group",
        "LP committed to a working session and requested the DSCR model with downside sensitivities.",
        4,
        1,
        { opportunitySlug: "sonora-solar-storage-portfolio", companyId: "COMP-000003" }
      ),
    ],
  },
  // LST-000006 → cc-006 Joint Venture — Branded Residences
  {
    id: "LST-000006",
    opportunityId: "cc-006",
    opportunitySlug: "branded-residences-tulum-jv",
    title: "Joint Venture — Branded Residences",
    category: "Joint Ventures",
    dealType: "Joint Venture",
    status: "Active",
    views: 1184,
    saves: 98,
    interests: 16,
    negotiations: 2,
    messages: 5,
    lastUpdatedAt: isoAt(6),
    createdAt: isoAt(55),
    analyticsSeries: buildAnalyticsSeries(42, 3, 0, 0, 22),
    activity: [
      makeActivity(
        "LST-000006",
        1,
        "edit",
        "Listing edited — JV waterfall updated",
        "Owner refreshed the JV waterfall narrative to reflect updated promote terms.",
        6,
        1,
        { opportunitySlug: "branded-residences-tulum-jv" }
      ),
      makeActivity(
        "LST-000006",
        2,
        "interest",
        "Interest received from Global Logistics Holdings",
        "Investor asked about minimum LP ticket size and the resale premium assumptions.",
        8,
        4,
        { opportunitySlug: "branded-residences-tulum-jv", companyId: "COMP-000004" }
      ),
      makeActivity(
        "LST-000006",
        3,
        "document_request",
        "Brand license requested",
        "Investor requested the executed brand license agreement and the operating-agreement summary.",
        11,
        2,
        { opportunitySlug: "branded-residences-tulum-jv" }
      ),
    ],
  },
  // LST-000007 → Draft (no opportunity link)
  {
    id: "LST-000007",
    title: "Rooftop Wellness Retreat — 28 Keys",
    category: "Hotels & Resorts",
    dealType: "Seeking Investor",
    status: "Draft",
    views: 0,
    saves: 0,
    interests: 0,
    negotiations: 0,
    messages: 0,
    lastUpdatedAt: isoAt(0, 4),
    createdAt: isoAt(2),
    analyticsSeries: buildAnalyticsSeries(0, 0, 0, 0, 0),
    activity: [
      makeActivity(
        "LST-000007",
        1,
        "edit",
        "Draft created",
        "New draft started for a 28-key rooftop wellness retreat — listing type Opportunity.",
        2,
        0
      ),
      makeActivity(
        "LST-000007",
        2,
        "edit",
        "Executive summary in progress",
        "Half-written executive summary saved automatically.",
        0,
        4
      ),
    ],
    draftPayload: {
      listingType: "Opportunity",
      category: "Hotels & Resorts",
      title: "Rooftop Wellness Retreat — 28 Keys",
      executiveSummary:
        "A 28-key adults-only wellness retreat positioned above a stabilized boutique hotel asset, offering a rooftop spa, two cold plunge gardens, and a 60-seat plant-based restaurant. The retreat targets the longevity-and-recovery segment with",
    },
  },
  // LST-000008 → Archived (no opportunity link)
  {
    id: "LST-000008",
    title: "Andean Resort — Closed at 2.4x",
    status: "Archived",
    views: 2890,
    saves: 211,
    interests: 38,
    negotiations: 6,
    messages: 17,
    lastUpdatedAt: isoAt(42),
    createdAt: isoAt(420),
    analyticsSeries: [],
    activity: [
      makeActivity(
        "LST-000008",
        1,
        "stage_change",
        "Listing closed at 2.4x MOIC",
        "Deal closed with a final MOIC of 2.4x — archived for historical reference.",
        42,
        0
      ),
      makeActivity(
        "LST-000008",
        2,
        "edit",
        "Archived",
        "Listing was archived after final distributions were paid to LPs.",
        42,
        0
      ),
    ],
  },
  // ---- Expanded sponsor listings — link to new opportunities ----
  // LST-000009 → cc-007 Pacific Bluff Resort Development
  {
    id: "LST-000009",
    opportunityId: "cc-007",
    opportunitySlug: "pacific-bluff-resort-development",
    title: "Pacific Bluff Resort Development — 88 Keys",
    category: "Hotels & Resorts",
    dealType: "Seeking Investor",
    status: "Seeking Capital",
    views: 1320, saves: 102, interests: 17, negotiations: 2, messages: 4,
    lastUpdatedAt: isoAt(3), createdAt: isoAt(38),
    analyticsSeries: buildAnalyticsSeries(48, 4, 1, 0, 26),
    activity: [
      makeActivity("LST-000009", 1, "interest", "Interest from Meridian Investment Partners", "Reviewing LP allocation in our hospitality private credit thesis.", 2, 4, { opportunitySlug: "pacific-bluff-resort-development", companyId: "COMP-000016" }),
      makeActivity("LST-000009", 2, "saved", "Saved by 9 new investors this week", "Strong inflow from the Hotels & Resorts category.", 4, 0, { opportunitySlug: "pacific-bluff-resort-development" }),
    ],
  },
  // LST-000010 → cc-019 Tiny Home Factory
  {
    id: "LST-000010",
    opportunityId: "cc-019",
    opportunitySlug: "tiny-home-factory",
    title: "Tiny Home Factory — 80 Units/Year",
    category: "Manufacturing & Materials",
    dealType: "Seeking Investor",
    status: "Seeking Capital",
    views: 1810, saves: 144, interests: 24, negotiations: 3, messages: 7,
    lastUpdatedAt: isoAt(2), createdAt: isoAt(34),
    analyticsSeries: buildAnalyticsSeries(64, 5, 1, 1, 26),
    activity: [
      makeActivity("LST-000010", 1, "interest", "Interest from Sunrise Land Holdings", "Looking at growth equity exposure in modular manufacturing.", 1, 5, { opportunitySlug: "tiny-home-factory", companyId: "COMP-000018" }),
      makeActivity("LST-000010", 2, "company_view", "Aurora Capital Partners viewed your company page", "Reviewed your sponsor profile after the deck download.", 3, 1, { opportunitySlug: "tiny-home-factory", companyId: "COMP-000002" }),
      makeActivity("LST-000010", 3, "saved", "Saved by 14 new investors this week", "Modular manufacturing seeing renewed LP interest.", 5, 0, { opportunitySlug: "tiny-home-factory" }),
    ],
  },
  // LST-000011 → cc-025 Solar Farm 80 MW
  {
    id: "LST-000011",
    opportunityId: "cc-025",
    opportunitySlug: "solar-farm-80mw",
    title: "Solar Farm — 80 MW",
    category: "Energy",
    dealType: "Financing Needed",
    status: "Active",
    views: 1124, saves: 78, interests: 12, negotiations: 1, messages: 3,
    lastUpdatedAt: isoAt(1), createdAt: isoAt(28),
    analyticsSeries: buildAnalyticsSeries(48, 3, 1, 0, 22),
    activity: [
      makeActivity("LST-000011", 1, "interest", "Interest from Cerro Ventures", "Renewables LP looking at the equity tranche.", 1, 6, { opportunitySlug: "solar-farm-80mw" }),
      makeActivity("LST-000011", 2, "document_request", "DSCR model requested", "Investor requested the DSCR model and PPA structures.", 3, 4, { opportunitySlug: "solar-farm-80mw" }),
    ],
  },
  // LST-000012 → cc-028 Marble Supplier
  {
    id: "LST-000012",
    opportunityId: "cc-028",
    opportunitySlug: "marble-supplier-carrara",
    title: "Marble Supplier — Carrara Direct",
    category: "Suppliers & Logistics",
    dealType: "Supplier Offering",
    status: "Active",
    views: 2240, saves: 168, interests: 31, negotiations: 6, messages: 12,
    lastUpdatedAt: isoAt(3), createdAt: isoAt(45),
    analyticsSeries: buildAnalyticsSeries(72, 5, 2, 1, 32),
    activity: [
      makeActivity("LST-000012", 1, "interest", "Interest from Aurora Capital Partners", "Hotel-tower supply contract sought.", 2, 3, { opportunitySlug: "marble-supplier-carrara", companyId: "COMP-000002" }),
      makeActivity("LST-000012", 2, "interest", "Interest from Yucatán Development Co.", "Branded residence project — marble specification phase.", 5, 1, { opportunitySlug: "marble-supplier-carrara", companyId: "COMP-000006" }),
      makeActivity("LST-000012", 3, "saved", "Saved by 22 new buyers this week", "Strong inflow from hospitality developers.", 7, 0, { opportunitySlug: "marble-supplier-carrara" }),
    ],
  },
  // LST-000013 → cc-022 Highway Expansion
  {
    id: "LST-000013",
    opportunityId: "cc-022",
    opportunitySlug: "highway-expansion-38km",
    title: "Highway Expansion — 38 km Toll Road",
    category: "Infrastructure",
    dealType: "Financing Needed",
    status: "Negotiating",
    views: 980, saves: 64, interests: 9, negotiations: 2, messages: 5,
    lastUpdatedAt: isoAt(5), createdAt: isoAt(42),
    analyticsSeries: buildAnalyticsSeries(38, 2, 0, 0, 18),
    activity: [
      makeActivity("LST-000013", 1, "negotiation_start", "Negotiation opened with Meridian Investment Partners", "Project debt structure under negotiation.", 5, 2, { opportunitySlug: "highway-expansion-38km", companyId: "COMP-000016" }),
      makeActivity("LST-000013", 2, "document_request", "Traffic model requested", "Investor requested the traffic model and DSCR sensitivity.", 8, 4, { opportunitySlug: "highway-expansion-38km" }),
    ],
  },
  // LST-000014 → cc-039 Roofing Contractor
  {
    id: "LST-000014",
    opportunityId: "cc-039",
    opportunitySlug: "roofing-contractor-founder-exit",
    title: "Roofing Contractor — Founder Exit",
    category: "Business Acquisitions",
    dealType: "Business For Sale",
    status: "Active",
    views: 642, saves: 38, interests: 7, negotiations: 1, messages: 2,
    lastUpdatedAt: isoAt(4), createdAt: isoAt(30),
    analyticsSeries: buildAnalyticsSeries(28, 2, 0, 0, 14),
    activity: [
      makeActivity("LST-000014", 1, "interest", "Interest from Global Logistics Holdings", "Reviewing as a roll-up opportunity.", 3, 6, { opportunitySlug: "roofing-contractor-founder-exit", companyId: "COMP-000004" }),
    ],
  },
];
