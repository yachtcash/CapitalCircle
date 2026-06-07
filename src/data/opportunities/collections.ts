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
};

export const DIRECTORY_COLLECTIONS: DirectoryCollection[] = [
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
];

export function getCollectionOpportunities(
  collection: DirectoryCollection,
  pool: Opportunity[] = featuredOpportunities
): Opportunity[] {
  const primary = pool.filter(collection.predicate);
  if (primary.length > 0) return primary;
  if (collection.fallbackPredicate) {
    const fallback = pool.filter(collection.fallbackPredicate);
    if (fallback.length > 0) return fallback;
  }
  return [];
}
