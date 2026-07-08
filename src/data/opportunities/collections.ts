// Directory configuration: featured-of-the-week, quick filter pills,
// and themed collection rows. Uses the existing featuredOpportunities
// data but does NOT shadow `@/data/opportunities` — pull the core
// dataset via that import as usual; pull these directory-specific
// helpers from `@/data/opportunities/collections`.

import { featuredOpportunities, type Opportunity } from "@/data/opportunities";

// ---- Featured Opportunity of the Week --------------------------------------

const FEATURED_OF_THE_WEEK_ID = "cc-002"; // Mixed-Use Tower Development

export function getFeaturedOpportunityOfTheWeek(): Opportunity {
  return (
    featuredOpportunities.find((o) => o.id === FEATURED_OF_THE_WEEK_ID) ??
    featuredOpportunities[0]
  );
}

// ---- Quick filter pills above the directory grid ---------------------------

export type QuickFilter = {
  label: string;
  query: string; // URL search-params fragment, no leading "?"
};

export const QUICK_FILTERS: QuickFilter[] = [
  { label: "Hotels", query: "category=Hotels+%26+Resorts" },
  { label: "Land", query: "category=Land+Opportunities" },
  { label: "Joint Ventures", query: "category=Joint+Ventures" },
  { label: "Businesses For Sale", query: "dealType=Business+For+Sale" },
  { label: "Suppliers", query: "category=Suppliers+%26+Logistics" },
  { label: "Services", query: "listingType=Service" },
  { label: "Energy", query: "category=Energy" },
  { label: "Infrastructure", query: "category=Infrastructure" },
];

// ---- Themed collection rows ------------------------------------------------

export type CollectionPredicate = (opportunity: Opportunity) => boolean;

export type DirectoryCollection = {
  slug: string;
  title: string;
  description: string;
  query: string; // URL fragment for the "View all" link
  predicate: CollectionPredicate;
  /** Optional secondary predicate to widen the set when the primary is sparse. */
  fallbackPredicate?: CollectionPredicate;
  /** Optional ordering within the rail (e.g. newest first, largest raise first). */
  sort?: (a: Opportunity, b: Opportunity) => number;
  /** Rails hide below this size so sparse themes never render as a lonely card. */
  minCount?: number;
  /** Optional card ribbon reinforcing the rail's theme (Featured / New / ...). */
  ribbon?: "Featured" | "Trending" | "New" | "Closing Soon";
};

/** First percentage figure in the return string ("18% IRR · 2.3x MOIC" -> 18). */
function parseReturnPct(o: Opportunity): number | null {
  const m = /(\d+(?:\.\d+)?)\s*%/.exec(o.expectedReturns || o.expectedReturn || "");
  return m ? parseFloat(m[1]) : null;
}

const byNewest = (a: Opportunity, b: Opportunity) =>
  (b.postedAt || "").localeCompare(a.postedAt || "");

const EUROPE = new Set(["Spain", "Portugal", "Italy", "France", "Germany", "United Kingdom", "Greece"]);
const CARIBBEAN_CENTRAL = new Set([
  "Dominican Republic", "Bahamas", "Jamaica", "Puerto Rico", "Aruba",
  "Panama", "Costa Rica", "Belize",
]);
const SOUTH_AMERICA = new Set(["Chile", "Brazil", "Colombia", "Argentina", "Peru", "Uruguay", "Ecuador"]);

export const DIRECTORY_COLLECTIONS: DirectoryCollection[] = [
  // ---- Freshness & momentum ------------------------------------------------
  {
    slug: "recently-added",
    title: "Recently Added",
    description: "The newest mandates to reach the marketplace.",
    query: "sort=newest",
    predicate: () => true,
    sort: byNewest,
    ribbon: "New",
  },
  {
    slug: "featured-now",
    title: "Featured Opportunities",
    description: "Placements curated by the Capital Circle desk.",
    query: "sort=featured",
    predicate: (o) => o.featured,
    sort: byNewest,
    ribbon: "Featured",
  },
  {
    slug: "trending-now",
    title: "Trending",
    description: "Drawing the most investor attention this week.",
    query: "sort=trending",
    predicate: (o) => o.trending,
    sort: byNewest,
    ribbon: "Trending",
  },
  {
    slug: "closing-soon",
    title: "Closing Soon",
    description: "In late-stage negotiation or under contract — final windows.",
    query: "status=Negotiating&status=Under+Contract",
    predicate: (o) => o.status === "Under Contract" || o.status === "Negotiating",
    sort: byNewest,
    ribbon: "Closing Soon",
  },

  // ---- Capital & return ----------------------------------------------------
  {
    slug: "flagship-raises",
    title: "Highest Capital Raises",
    description: "Flagship mandates at institutional scale.",
    query: "funding=10m%2B",
    predicate: (o) => o.fundingAmount > 0,
    sort: (a, b) => b.fundingAmount - a.fundingAmount,
  },
  {
    slug: "accessible-entries",
    title: "Smaller Raises",
    description: "Lower entry points and co-invest sized tickets.",
    query: "funding=u100k&funding=100k-500k",
    predicate: (o) => o.fundingAmount > 0,
    sort: (a, b) => a.fundingAmount - b.fundingAmount,
  },
  {
    slug: "highest-target-return",
    title: "Highest Target Returns",
    description: "Sponsors underwriting the strongest projected performance.",
    query: "",
    predicate: (o) => parseReturnPct(o) !== null,
    sort: (a, b) => (parseReturnPct(b) ?? 0) - (parseReturnPct(a) ?? 0),
  },

  {
    slug: "seeking-capital",
    title: "Seeking Capital",
    description: "Sponsors actively raising equity, pref equity, or debt.",
    query: "status=Seeking+Capital",
    predicate: (o) => o.status === "Seeking Capital",
    fallbackPredicate: (o) => o.dealType === "Seeking Investor",
  },
  {
    slug: "joint-ventures",
    title: "Joint Ventures",
    description: "LP and GP structures with established operators.",
    query: "dealType=Joint+Venture",
    predicate: (o) => o.dealType === "Joint Venture",
    fallbackPredicate: (o) => o.category === "Joint Ventures",
  },
  {
    slug: "land-opportunities",
    title: "Land Opportunities",
    description: "Entitled and pre-entitled coastal and inland parcels.",
    query: "category=Land+Opportunities",
    predicate: (o) => o.category === "Land Opportunities",
    fallbackPredicate: (o) => o.dealType === "Land For Sale",
  },
  {
    slug: "hotels-resorts",
    title: "Hotels & Resorts",
    description: "Boutique and branded hospitality assets.",
    query: "category=Hotels+%26+Resorts",
    predicate: (o) => o.category === "Hotels & Resorts",
    fallbackPredicate: (o) => /hotel|resort|hospitality/i.test(o.industry),
  },
  {
    slug: "businesses-for-sale",
    title: "Businesses For Sale",
    description: "Operating companies with founder transition timelines.",
    query: "dealType=Business+For+Sale",
    predicate: (o) => o.dealType === "Business For Sale",
    fallbackPredicate: (o) => o.category === "Business Acquisitions",
  },
  {
    slug: "suppliers-logistics",
    title: "Suppliers & Logistics",
    description: "Vendor capacity, freight, and distribution.",
    query: "category=Suppliers+%26+Logistics",
    predicate: (o) => o.category === "Suppliers & Logistics",
    fallbackPredicate: (o) => /logistic|freight|supplier/i.test(o.industry),
  },
  {
    slug: "real-estate-development",
    title: "Real Estate Development",
    description: "Ground-up and value-add development mandates.",
    query: "category=Real+Estate+Development",
    predicate: (o) => o.category === "Real Estate Development",
    fallbackPredicate: (o) => /real estate|mixed-use|residential|commercial/i.test(o.industry),
  },
  {
    slug: "energy",
    title: "Energy",
    description: "Generation, storage, and transition infrastructure.",
    query: "category=Energy",
    predicate: (o) => o.category === "Energy",
    fallbackPredicate: (o) => /energy|solar|wind|power/i.test(o.industry),
  },
  {
    slug: "infrastructure",
    title: "Infrastructure",
    description: "Long-duration assets with contracted cash flows.",
    query: "category=Infrastructure",
    predicate: (o) => o.category === "Infrastructure",
    fallbackPredicate: (o) => /infrastructure|utilit|transport/i.test(o.industry),
  },

  // ---- Geography -------------------------------------------------------------
  {
    slug: "united-states",
    title: "United States",
    description: "Domestic mandates across primary and growth markets.",
    query: "country=United+States",
    predicate: (o) => o.place?.country === "United States",
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "mexico",
    title: "Mexico",
    description: "Coastal hospitality, industrial, and nearshoring plays.",
    query: "country=Mexico",
    predicate: (o) => o.place?.country === "Mexico",
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "canada",
    title: "Canada",
    description: "Mandates across Canadian primary markets.",
    query: "country=Canada",
    predicate: (o) => o.place?.country === "Canada",
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "europe",
    title: "Europe",
    description: "Select mandates across European markets.",
    query: "country=Spain&country=Portugal&country=Italy",
    predicate: (o) => EUROPE.has(o.place?.country ?? ""),
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "caribbean-central-america",
    title: "Caribbean & Central America",
    description: "Resort, marina, and logistics corridors.",
    query: "country=Dominican+Republic&country=Panama&country=Costa+Rica",
    predicate: (o) => CARIBBEAN_CENTRAL.has(o.place?.country ?? ""),
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "south-america",
    title: "South America",
    description: "Growth-market mandates across the southern cone and beyond.",
    query: "country=Chile&country=Brazil",
    predicate: (o) => SOUTH_AMERICA.has(o.place?.country ?? ""),
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "international",
    title: "International",
    description: "Cross-border mandates outside the United States.",
    query: "",
    predicate: (o) => !!o.place?.country && o.place.country !== "United States",
    sort: byNewest,
    minCount: 2,
  },
];

/** Max cards per rail — keeps long rail pages light while "View all" carries the rest. */
const RAIL_LIMIT = 10;

export function getCollectionOpportunities(
  collection: DirectoryCollection,
  pool: Opportunity[] = featuredOpportunities
): Opportunity[] {
  let items = pool.filter(collection.predicate);
  if (items.length === 0 && collection.fallbackPredicate) {
    items = pool.filter(collection.fallbackPredicate);
  }
  if (items.length < (collection.minCount ?? 1)) return [];
  if (collection.sort) items = [...items].sort(collection.sort);
  return items.slice(0, RAIL_LIMIT);
}
