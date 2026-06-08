// Directory configuration: featured-of-the-week, quick filter pills,
// and themed collection rows for the /companies marketplace.

import { companies, type Company } from "@/data/companies";

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
};

const includesKeyword = (c: Company, terms: string[]): boolean => {
  const hay = `${c.industry} ${c.tagline} ${c.searchKeywords.join(" ")} ${c.name}`.toLowerCase();
  return terms.some((t) => hay.includes(t.toLowerCase()));
};

export const COMPANY_COLLECTIONS: CompanyDirectoryCollection[] = [
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

export function getCollectionCompanies(
  collection: CompanyDirectoryCollection,
  pool: Company[] = companies
): Company[] {
  const primary = pool.filter(collection.predicate);
  if (primary.length > 0) return primary;
  if (collection.fallbackPredicate) {
    const fb = pool.filter(collection.fallbackPredicate);
    if (fb.length > 0) return fb;
  }
  return [];
}
