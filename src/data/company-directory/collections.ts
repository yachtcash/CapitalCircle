// Directory configuration: featured-of-the-week, quick filter pills,
// and themed collection rows for the /companies marketplace.

import { companies, type Company } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";

/** Live opportunity count per company — powers the Most Active rail. */
const OPP_COUNTS: Record<string, number> = {};
for (const o of featuredOpportunities) {
  OPP_COUNTS[o.companyId] = (OPP_COUNTS[o.companyId] ?? 0) + 1;
}
const oppCount = (c: Company) => OPP_COUNTS[c.id] ?? 0;

// ---- Featured Company of the Week ------------------------------------

const FEATURED_OF_THE_WEEK_ID = "COMP-000002"; // Aurora Capital Partners

export function getFeaturedCompanyOfTheWeek(): Company {
  return (
    companies.find((c) => c.id === FEATURED_OF_THE_WEEK_ID) ?? companies[0]
  );
}

// ---- Quick filter pills ----------------------------------------------

export type CompanyQuickFilter = {
  label: string;
  query: string; // URL search-params fragment, no leading "?"
};

export const COMPANY_QUICK_FILTERS: CompanyQuickFilter[] = [
  { label: "Developers", query: "q=Development" },
  { label: "Investors", query: "q=Capital" },
  { label: "Hotels", query: "q=Hospitality" },
  { label: "Construction", query: "q=Construction" },
  { label: "Energy", query: "q=Energy" },
  { label: "Suppliers", query: "q=Logistics" },
  { label: "Verified", query: "verification=Verified" },
  { label: "Premium Verified", query: "verification=Premium+Verified" },
];

// ---- Themed collection rows ------------------------------------------

export type CompanyCollectionPredicate = (company: Company) => boolean;

export type CompanyDirectoryCollection = {
  slug: string;
  title: string;
  description: string;
  query: string;
  predicate: CompanyCollectionPredicate;
  fallbackPredicate?: CompanyCollectionPredicate;
  /** Optional ordering within the rail (e.g. newest first, most active first). */
  sort?: (a: Company, b: Company) => number;
  /** Rails hide below this size so sparse themes never render as a lonely card. */
  minCount?: number;
};

const includesKeyword = (c: Company, terms: string[]): boolean => {
  const hay = `${c.industry} ${c.tagline} ${c.searchKeywords.join(" ")} ${c.name}`.toLowerCase();
  return terms.some((t) => hay.includes(t.toLowerCase()));
};

export const COMPANY_COLLECTIONS: CompanyDirectoryCollection[] = [
  // ---- Discovery angles ------------------------------------------------
  {
    slug: "featured-companies",
    title: "Featured Companies",
    description: "Sponsors and firms curated by the Capital Circle desk.",
    query: "sort=featured",
    predicate: (c) => !!c.featured,
    sort: (a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""),
    minCount: 2,
  },
  {
    slug: "newly-listed",
    title: "Newest Companies",
    description: "Firms that recently joined the marketplace.",
    query: "sort=newest",
    predicate: () => true,
    sort: (a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""),
  },
  {
    slug: "verified-companies",
    title: "Verified Companies",
    description: "Firms that completed Capital Circle verification.",
    query: "verification=Verified&verification=Premium+Verified",
    predicate: (c) => c.verification === "Verified" || c.verification === "Premium Verified",
    sort: (a, b) => oppCount(b) - oppCount(a),
    minCount: 2,
  },
  {
    slug: "most-active",
    title: "Most Active Companies",
    description: "Firms with the most live mandates on the platform.",
    query: "sort=most_opportunities",
    predicate: (c) => oppCount(c) > 0,
    sort: (a, b) => oppCount(b) - oppCount(a),
    minCount: 2,
  },

  // ---- Sector themes ---------------------------------------------------
  {
    slug: "developers",
    title: "Developers",
    description: "Ground-up and value-add real estate development firms.",
    query: "q=Development",
    predicate: (c) => includesKeyword(c, ["development", "developer"]),
  },
  {
    slug: "investors",
    title: "Investors",
    description: "Capital allocators and private investment firms.",
    query: "q=Capital",
    predicate: (c) => includesKeyword(c, ["capital", "partners", "fund"]),
  },
  {
    slug: "hospitality",
    title: "Hospitality",
    description: "Hotel operators, resorts, and boutique hospitality sponsors.",
    query: "q=Hospitality",
    predicate: (c) => includesKeyword(c, ["hospitality", "hotel", "resort"]),
  },
  {
    slug: "construction",
    title: "Construction",
    description: "Construction firms, builders, and project execution partners.",
    query: "q=Construction",
    predicate: (c) => includesKeyword(c, ["construction", "builder"]),
    fallbackPredicate: (c) => includesKeyword(c, ["development"]),
  },
  {
    slug: "energy",
    title: "Energy",
    description: "Renewable energy, project finance, and utility-scale operators.",
    query: "q=Energy",
    predicate: (c) => includesKeyword(c, ["energy", "renewable", "solar"]),
  },
  {
    slug: "suppliers-logistics",
    title: "Suppliers & Logistics",
    description: "Distribution, freight, and supplier capacity providers.",
    query: "q=Logistics",
    predicate: (c) => includesKeyword(c, ["logistics", "freight", "supplier"]),
  },
];

/** Max cards per rail — "View all" carries the rest into the filtered grid. */
const RAIL_LIMIT = 10;

export function getCollectionCompanies(
  collection: CompanyDirectoryCollection,
  pool: Company[] = companies
): Company[] {
  let items = pool.filter(collection.predicate);
  if (items.length === 0 && collection.fallbackPredicate) {
    items = pool.filter(collection.fallbackPredicate);
  }
  if (items.length < (collection.minCount ?? 1)) return [];
  if (collection.sort) items = [...items].sort(collection.sort);
  return items.slice(0, RAIL_LIMIT);
}
