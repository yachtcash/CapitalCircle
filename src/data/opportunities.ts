export type OpportunityStatus = "Open" | "Funding" | "Closing Soon";
export type DealType =
  | "Equity"
  | "Preferred Equity"
  | "Joint Venture"
  | "Acquisition"
  | "Project Finance"
  | "Land Sale / JV";

export type Sponsor = {
  name: string;
  description: string;
  location: string;
  verified: boolean;
  foundedYear: number;
  trackRecord: string;
};

export type OpportunityDocument = {
  name: string;
  type: "Pitch Deck" | "Financial Summary" | "Project Overview";
  pages: number;
  updated: string;
};

export type Opportunity = {
  id: string;
  slug: string;
  title: string;
  category: string;
  industry: string;
  dealType: DealType;
  location: string;
  investmentRange: string;
  expectedReturn: string;
  status: OpportunityStatus;
  description: string;
  executiveSummary: string;
  fullDescription: string[];
  fundingRequired: string;
  equityAvailable: string;
  minimumInvestment: string;
  expectedReturns: string;
  currentStage: string;
  timeline: string;
  projectStatus: string;
  postedBy: string;
  postedAgo: string;
  postedAt: string;
  images: string[];
  featured: boolean;
  trending: boolean;
  sponsor: Sponsor;
  documents: OpportunityDocument[];
};

export const featuredOpportunities: Opportunity[] = [
  {
    id: "cc-001",
    slug: "beachfront-boutique-hotel",
    title: "Beachfront Boutique Hotel — 42 Keys",
    category: "Hotels & Resorts",
    industry: "Luxury Hospitality",
    dealType: "Equity",
    location: "Cabo San Lucas, Mexico",
    investmentRange: "$8M – $12M",
    expectedReturn: "18% IRR",
    status: "Funding",
    description:
      "Established cash-flowing boutique with expansion entitlements for 18 additional keys and a beach club.",
    executiveSummary:
      "A fully operating 42-key beachfront boutique on Médano Beach is raising growth equity to fund the addition of 18 keys, an oceanfront beach club, and a full F&B repositioning. The property has been independently owned and operated for nine years with stabilized occupancy of 78% and an ADR of $612.",
    fullDescription: [
      "The property occupies 1.2 acres of titled beachfront on Médano Beach — the most-trafficked sand in Cabo San Lucas — with 220 linear feet of ocean frontage. The existing hotel includes 42 keys across four buildings, two restaurants, a rooftop pool, and a spa.",
      "Entitlements for an 18-key expansion and a 4,200 sqft beach club are fully secured and shovel-ready. The proposed expansion adds incremental NOI of approximately $3.1M annually at stabilization while preserving the property's intimate, design-led positioning.",
      "Capital is being raised as common equity alongside the existing sponsor, who retains operational control and a meaningful co-invest. Distributions begin in year two, with a target hold of five years and a planned exit to a branded operator or institutional buyer.",
    ],
    fundingRequired: "$10.5M",
    equityAvailable: "32%",
    minimumInvestment: "$250,000",
    expectedReturns: "18% IRR · 2.3x MOIC",
    currentStage: "Operating · Expansion shovel-ready",
    timeline: "5-year hold · construction Q2 next year",
    projectStatus: "Permits secured, GMP contract priced",
    postedBy: "Pacific Coast Holdings",
    postedAgo: "2 days ago",
    postedAt: "2026-06-02",
    images: [
      "/listings/beachfront-boutique-hotel/1.jpg",
      "/listings/beachfront-boutique-hotel/2.jpg",
      "/listings/beachfront-boutique-hotel/3.jpg",
      "/listings/beachfront-boutique-hotel/4.jpg",
    ],
    featured: true,
    trending: false,
    sponsor: {
      name: "Pacific Coast Holdings",
      description:
        "Owner-operator of boutique hospitality assets across the Sea of Cortez and Pacific coast of Mexico. Vertically integrated with in-house design, construction, and F&B teams.",
      location: "Cabo San Lucas, Mexico",
      verified: true,
      foundedYear: 2013,
      trackRecord: "$420M deployed across 11 hospitality assets · 2 full-cycle exits at 2.6x and 2.9x MOIC",
    },
    documents: [
      { name: "Pacific Coast — Cabo Hotel Pitch Deck", type: "Pitch Deck", pages: 34, updated: "3 days ago" },
      { name: "Five-Year Financial Model & Sensitivity", type: "Financial Summary", pages: 18, updated: "1 week ago" },
      { name: "Expansion Project Overview & Renderings", type: "Project Overview", pages: 22, updated: "2 weeks ago" },
    ],
  },
  {
    id: "cc-002",
    slug: "mixed-use-tower-development",
    title: "Mixed-Use Tower Development",
    category: "Real Estate Development",
    industry: "Urban Mixed-Use",
    dealType: "Preferred Equity",
    location: "Miami, FL",
    investmentRange: "$45M – $60M",
    expectedReturn: "22% IRR",
    status: "Open",
    description:
      "32-story project with 240 residences, 18k sqft retail, and structured parking. Permits secured.",
    executiveSummary:
      "Ground-up 32-story mixed-use tower in Miami's Edgewater submarket with 240 condominium residences, 18,000 sqft of ground-floor retail, and 320 stalls of structured parking. Site is fully entitled with a GMP contract in place and 41% pre-sales at signed contract.",
    fullDescription: [
      "The site sits one block from Biscayne Bay with unobstructed northeast water views from floor twelve up. The architectural team — an internationally recognized studio — has delivered three completed towers in Miami over the past decade.",
      "Pre-sales are at 41% of total units with $94M of contract deposits in escrow. The remaining unit mix is weighted toward two- and three-bedroom layouts where current absorption is strongest. Average gross price is $1,180 PSF, with comparable closings in the submarket trading between $1,290 and $1,420 PSF.",
      "The preferred equity tranche prices at a 12% current pay with a 22% IRR cap and a four-year final maturity. Sponsor and senior debt are committed; this raise closes out the equity stack.",
    ],
    fundingRequired: "$52M",
    equityAvailable: "Pref equity tranche",
    minimumInvestment: "$1,000,000",
    expectedReturns: "22% IRR cap · 12% current pay",
    currentStage: "Pre-construction · 41% pre-sold",
    timeline: "30-month build · 18-month sell-out",
    projectStatus: "Permits issued, GMP signed, foundation Q3 next year",
    postedBy: "Aurora Capital Partners",
    postedAgo: "5 days ago",
    postedAt: "2026-05-30",
    images: [
      "/listings/mixed-use-tower-development/1.jpg",
      "/listings/mixed-use-tower-development/2.jpg",
      "/listings/mixed-use-tower-development/3.jpg",
      "/listings/mixed-use-tower-development/4.jpg",
    ],
    featured: true,
    trending: true,
    sponsor: {
      name: "Aurora Capital Partners",
      description:
        "Vertically integrated developer focused on for-sale high-rise residential in South Florida. In-house entitlement, construction, sales, and capital markets teams.",
      location: "Miami, FL",
      verified: true,
      foundedYear: 2007,
      trackRecord: "$2.1B of completed development · 6 towers delivered · zero principal losses",
    },
    documents: [
      { name: "Edgewater Tower — Investor Deck", type: "Pitch Deck", pages: 41, updated: "1 week ago" },
      { name: "Capital Stack & Returns Model", type: "Financial Summary", pages: 24, updated: "2 weeks ago" },
      { name: "Site, Renderings & Sales Comps", type: "Project Overview", pages: 30, updated: "2 weeks ago" },
    ],
  },
  {
    id: "cc-003",
    slug: "coastal-development-land",
    title: "Coastal Development Land — 84 Acres",
    category: "Land Opportunities",
    industry: "Master-Planned Resort Land",
    dealType: "Land Sale / JV",
    location: "Punta Mita, Mexico",
    investmentRange: "$14M",
    expectedReturn: "Sale + JV options",
    status: "Open",
    description:
      "Master-planned parcel with ocean views, road access, and tentative resort zoning approval.",
    executiveSummary:
      "84 contiguous acres on the Punta Mita peninsula with 1,140 meters of frontage on a paved municipal road and three distinct elevation bands offering ocean and mountain views. Offered for direct sale at $14M, or structured as a joint venture with a qualified resort developer.",
    fullDescription: [
      "The parcel was assembled from four neighboring titles between 2018 and 2021. Title is fully clean and registered, with no encumbrances or third-party claims. Surveys, topo, and environmental are complete and available in the data room.",
      "Local zoning has been pre-cleared for resort residential at densities up to 12 units per hectare, with an in-process amendment pending for a hotel parcel and a 9-hole short course. Water and electric connection points are at the parcel boundary.",
      "The seller is open to a direct sale at the listed price, a contribution as land equity into a JV at a $16M ascribed basis, or a structured earn-out tied to entitled lot count.",
    ],
    fundingRequired: "$14M (sale)",
    equityAvailable: "Up to 100% (sale or JV land contribution)",
    minimumInvestment: "$500,000 (JV)",
    expectedReturns: "Sale: immediate · JV: 2.0–2.4x MOIC over 5 years",
    currentStage: "Entitled, surveyed, marketed",
    timeline: "Close within 90 days",
    projectStatus: "Zoning amendment in process, utility stub at boundary",
    postedBy: "Riviera Land Group",
    postedAgo: "1 week ago",
    postedAt: "2026-05-28",
    images: [
      "/listings/coastal-development-land/1.jpg",
      "/listings/coastal-development-land/2.jpg",
      "/listings/coastal-development-land/3.jpg",
      "/listings/coastal-development-land/4.jpg",
    ],
    featured: false,
    trending: true,
    sponsor: {
      name: "Riviera Land Group",
      description:
        "Specialist land aggregator and broker active across the Riviera Nayarit and Costa Alegre. Focused on entitled and pre-entitled coastal parcels of 20+ acres.",
      location: "Punta Mita, Mexico",
      verified: true,
      foundedYear: 2011,
      trackRecord: "$310M of land transactions closed · 14 master-planned parcels assembled",
    },
    documents: [
      { name: "Punta Mita Parcel — Information Memorandum", type: "Pitch Deck", pages: 26, updated: "4 days ago" },
      { name: "Land Basis, Title & Comparables", type: "Financial Summary", pages: 12, updated: "1 week ago" },
      { name: "Survey, Topo & Entitlement Status", type: "Project Overview", pages: 38, updated: "2 weeks ago" },
    ],
  },
  {
    id: "cc-004",
    slug: "regional-logistics-acquisition",
    title: "Regional Logistics Operator Acquisition",
    category: "Business Acquisitions",
    industry: "Freight & Logistics",
    dealType: "Acquisition",
    location: "Dallas, TX",
    investmentRange: "$22M – $28M",
    expectedReturn: "4.2x EBITDA",
    status: "Closing Soon",
    description:
      "Profitable 28-truck fleet servicing Fortune 500 manufacturers. Owner retiring, clean books.",
    executiveSummary:
      "Acquisition of a profitable, owner-operated regional freight company with a 28-truck fleet, two contracted distribution centers, and an 11-year track record of EBITDA growth. Founder is retiring and will support a 12-month transition. Books and KPIs have been independently quality-of-earnings reviewed.",
    fullDescription: [
      "The company runs primarily dedicated lanes for three Fortune 500 manufacturers under multi-year master service agreements with built-in fuel escalators. Customer concentration is intentionally constrained at no single customer over 35% of revenue.",
      "Trailing-twelve-months revenue is $34.2M with $6.8M of normalized EBITDA. The trailing three-year EBITDA CAGR is 14%. The fleet is owned outright with an average tractor age of 3.8 years and no scheduled major capex through year two.",
      "The seller is asking 4.2x normalized EBITDA, which transacts the business at $28.5M on a cash-free, debt-free basis. SBA-eligible debt is pre-cleared for up to 60% of the purchase price.",
    ],
    fundingRequired: "$28.5M",
    equityAvailable: "Up to 100% (control sale)",
    minimumInvestment: "$2,000,000",
    expectedReturns: "4.2x trailing EBITDA · ~24% targeted equity IRR",
    currentStage: "Operating · seller transition planned",
    timeline: "Close within 60 days · LOI exclusivity available",
    projectStatus: "QofE complete, SBA term sheet in hand",
    postedBy: "Confidential Seller",
    postedAgo: "3 days ago",
    postedAt: "2026-06-01",
    images: [
      "/listings/regional-logistics-acquisition/1.jpg",
      "/listings/regional-logistics-acquisition/2.jpg",
      "/listings/regional-logistics-acquisition/3.jpg",
      "/listings/regional-logistics-acquisition/4.jpg",
    ],
    featured: false,
    trending: false,
    sponsor: {
      name: "Apex Transition Advisors",
      description:
        "M&A advisory representing the seller. Specialists in lower-middle-market industrial and logistics transitions across the South-Central US.",
      location: "Dallas, TX",
      verified: true,
      foundedYear: 2009,
      trackRecord: "62 closed transactions · $1.4B aggregate enterprise value",
    },
    documents: [
      { name: "Confidential Information Memorandum", type: "Pitch Deck", pages: 48, updated: "5 days ago" },
      { name: "Quality of Earnings Report (Summary)", type: "Financial Summary", pages: 32, updated: "2 weeks ago" },
      { name: "Operations & Fleet Overview", type: "Project Overview", pages: 19, updated: "1 week ago" },
    ],
  },
  {
    id: "cc-005",
    slug: "sonora-solar-storage-portfolio",
    title: "Solar + Storage Portfolio — 120 MW",
    category: "Energy",
    industry: "Utility-Scale Renewables",
    dealType: "Project Finance",
    location: "Sonora, Mexico",
    investmentRange: "$95M",
    expectedReturn: "14% IRR",
    status: "Funding",
    description:
      "Three interconnected utility-scale sites with signed PPAs and grid interconnection in place.",
    executiveSummary:
      "Project finance opportunity for a 120 MW solar and 60 MWh storage portfolio across three adjacent sites in Sonora. All three sites are interconnected, with 20-year inflation-linked PPAs signed with two investment-grade industrial offtakers. Construction begins next quarter; commercial operation expected within 18 months.",
    fullDescription: [
      "The portfolio comprises three brownfield-converted sites totaling 540 hectares with industry-leading irradiance (DNI > 2,400 kWh/m²/year). Grid interconnection has been awarded by CFE with reservation deposits paid, and substation upgrades are scheduled in parallel with project construction.",
      "Offtake is fully contracted: 84 MW under a 20-year PPA with an investment-grade mining major, and 36 MW under a 15-year PPA with a regional industrial cluster. Both PPAs include partial inflation indexation and a take-or-pay floor at 92%.",
      "Capital is being structured as senior secured project debt with a tax equity sleeve. The equity tranche is partially placed; this raise targets the remaining 24% of the project equity stack with a 14% targeted equity IRR and DSCR above 1.35x in every modeled year.",
    ],
    fundingRequired: "$95M total · $42M equity tranche",
    equityAvailable: "24% of project equity stack",
    minimumInvestment: "$1,500,000",
    expectedReturns: "14% IRR · 1.9x MOIC · 18-month cash-yield onset",
    currentStage: "Construction begins next quarter",
    timeline: "18-month build · 20-year asset life",
    projectStatus: "PPAs executed, interconnection awarded, NTP imminent",
    postedBy: "Helios Infrastructure",
    postedAgo: "1 day ago",
    postedAt: "2026-06-03",
    images: [
      "/listings/sonora-solar-storage-portfolio/1.jpg",
      "/listings/sonora-solar-storage-portfolio/2.jpg",
      "/listings/sonora-solar-storage-portfolio/3.jpg",
      "/listings/sonora-solar-storage-portfolio/4.jpg",
    ],
    featured: true,
    trending: true,
    sponsor: {
      name: "Helios Infrastructure",
      description:
        "Independent power producer developing, financing, and operating utility-scale renewables across Mexico and Central America. Long-term hold orientation.",
      location: "Hermosillo, Mexico",
      verified: true,
      foundedYear: 2016,
      trackRecord: "780 MW developed · 410 MW operating · 100% project completion on schedule",
    },
    documents: [
      { name: "Sonora Portfolio — Investor Deck", type: "Pitch Deck", pages: 52, updated: "2 days ago" },
      { name: "Capital Structure & DSCR Model", type: "Financial Summary", pages: 28, updated: "1 week ago" },
      { name: "Site, Resource & Interconnection Brief", type: "Project Overview", pages: 36, updated: "2 weeks ago" },
    ],
  },
  {
    id: "cc-006",
    slug: "branded-residences-tulum-jv",
    title: "Joint Venture — Branded Residences",
    category: "Joint Ventures",
    industry: "Branded Residential",
    dealType: "Joint Venture",
    location: "Tulum, Mexico",
    investmentRange: "$30M LP",
    expectedReturn: "2.4x MOIC",
    status: "Open",
    description:
      "Operator-led JV with major hospitality flag. Seeking LP for equity tranche, 4-year hold.",
    executiveSummary:
      "Joint venture opportunity to participate as LP in a branded residential development carrying a globally recognized hospitality flag. The development comprises 48 residences and 28 hotel keys on 6.2 acres of titled beachfront in the protected northern stretch of the Tulum coast.",
    fullDescription: [
      "The brand license is executed with a globally top-five hospitality group under a 25-year branded residence and hotel operating agreement. The hotel component is structured to drive both ADR and resale premiums on the residential component, with comparable branded projects in similar markets trading at 28–42% brand premium versus unbranded comps.",
      "The site is fully titled, with FONATUR-confirmed coastal setbacks and a federal concession in place for beach access. The architectural team has delivered three branded residence projects in the Caribbean over the past seven years.",
      "The JV is structured with the operator as GP holding 15% promote on a 9% pref. LP receives 85% of pre-promote distributions until 1.6x MOIC, then 70% thereafter. Target 4-year hold with full residential sell-out by month 36.",
    ],
    fundingRequired: "$30M LP commitment",
    equityAvailable: "LP tranche · GP retains operating control",
    minimumInvestment: "$1,000,000",
    expectedReturns: "2.4x MOIC · 24% IRR · 4-year hold",
    currentStage: "Pre-construction · brand license executed",
    timeline: "Vertical Q4 next year · 36-month sell-out",
    projectStatus: "Brand license executed, residential pre-marketing underway",
    postedBy: "Yucatán Development Co.",
    postedAgo: "6 days ago",
    postedAt: "2026-05-29",
    images: [
      "/listings/branded-residences-tulum-jv/1.jpg",
      "/listings/branded-residences-tulum-jv/2.jpg",
      "/listings/branded-residences-tulum-jv/3.jpg",
      "/listings/branded-residences-tulum-jv/4.jpg",
    ],
    featured: true,
    trending: false,
    sponsor: {
      name: "Yucatán Development Co.",
      description:
        "Branded residence developer across the Riviera Maya and the Caribbean basin. Track record of partnering with global hospitality flags on luxury coastal resorts.",
      location: "Tulum, Mexico",
      verified: true,
      foundedYear: 2015,
      trackRecord: "5 branded projects delivered · $1.1B aggregate residential sell-out · 100% brand renewal",
    },
    documents: [
      { name: "Tulum Branded Residences — LP Deck", type: "Pitch Deck", pages: 38, updated: "6 days ago" },
      { name: "JV Waterfall, Promote & Returns", type: "Financial Summary", pages: 22, updated: "1 week ago" },
      { name: "Site, Brand Agreement & Comparables", type: "Project Overview", pages: 29, updated: "2 weeks ago" },
    ],
  },
];

// ---- Helpers ----

export function getOpportunityBySlug(slug: string): Opportunity | undefined {
  return featuredOpportunities.find((o) => o.slug === slug);
}

export function getRelatedOpportunities(slug: string, limit = 3): Opportunity[] {
  const current = getOpportunityBySlug(slug);
  if (!current) {
    return featuredOpportunities.slice(0, limit);
  }
  const sameCategory = featuredOpportunities.filter(
    (o) => o.slug !== slug && o.category === current.category
  );
  const others = featuredOpportunities.filter(
    (o) => o.slug !== slug && o.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getFeaturedOpportunities(limit?: number): Opportunity[] {
  const featured = featuredOpportunities.filter((o) => o.featured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export function getRecentlyAddedOpportunities(limit?: number): Opportunity[] {
  const sorted = [...featuredOpportunities].sort((a, b) =>
    b.postedAt.localeCompare(a.postedAt)
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export function getTrendingOpportunities(limit?: number): Opportunity[] {
  const trending = featuredOpportunities.filter((o) => o.trending);
  return typeof limit === "number" ? trending.slice(0, limit) : trending;
}
