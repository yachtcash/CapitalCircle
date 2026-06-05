// Canonical option lists for filters and popular searches.

import { featuredOpportunities } from "@/data/opportunities";

export const CATEGORY_OPTIONS = [
  "Real Estate Development",
  "Hotels & Resorts",
  "Land Opportunities",
  "Construction Projects",
  "Investment Opportunities",
  "Manufacturing & Materials",
  "Infrastructure",
  "Energy",
  "Hospitality",
  "Commercial Services",
  "Business Acquisitions",
  "Joint Ventures",
  "Suppliers & Logistics",
] as const;

export const LISTING_TYPE_OPTIONS = ["Opportunity", "Product", "Service"] as const;

export const DEAL_TYPE_OPTIONS = [
  "Seeking Investor",
  "Joint Venture",
  "Land For Sale",
  "Business For Sale",
  "Acquisition",
  "Financing Needed",
  "Supplier Offering",
  "Strategic Partnership",
  "Development Project",
  "Franchise Opportunity",
  "Licensing Opportunity",
  "Service Offering",
  "Contact For Details",
] as const;

export const STATUS_OPTIONS = [
  "Open",
  "Seeking Capital",
  "Negotiating",
  "Under Contract",
  "Closed",
] as const;

export const SORT_LABELS: Record<string, string> = {
  newest: "Newest",
  oldest: "Oldest",
  featured: "Featured",
  trending: "Trending",
  alphabetical: "Alphabetical",
};

export const POPULAR_SEARCHES: { label: string; href: string }[] = [
  { label: "Hotels", href: "/search?q=Hotels" },
  { label: "Resort Development", href: "/search?q=Resort+Development" },
  { label: "Land For Sale", href: "/search?dealType=Land+For+Sale" },
  { label: "Joint Ventures", href: "/search?dealType=Joint+Venture" },
  { label: "Seeking Investors", href: "/search?dealType=Seeking+Investor" },
  { label: "Solar Projects", href: "/search?q=Solar" },
];

// Distinct location values derived from current mock data.
// Stable order: sorted alphabetically.
export function getCountryOptions(): string[] {
  const set = new Set<string>();
  for (const o of featuredOpportunities) {
    if (o.place?.country) set.add(o.place.country);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getCityOptions(): string[] {
  const set = new Set<string>();
  for (const o of featuredOpportunities) {
    if (o.place?.city) set.add(o.place.city);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
