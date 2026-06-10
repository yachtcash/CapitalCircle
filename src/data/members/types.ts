// Member directory data model.
//
// Mock-only — every member is a seeded record. The platform owner sits in
// the middle of all introductions: members never receive each other's
// direct contact info from this surface.

export type MemberType =
  | "Investor"
  | "Developer"
  | "Sponsor"
  | "Broker"
  | "Service Provider"
  | "Supplier"
  | "Consultant"
  | "Contractor"
  | "Manufacturer"
  | "Attorney"
  | "Accountant"
  | "Lender"
  | "Architect"
  | "Engineer"
  | "Property Owner"
  | "Operator"
  | "General Member";

export type MemberVerification =
  | "Verified"
  | "Founding Member"
  | "Pending"
  | "Unverified";

export type MemberContactPrefs = {
  /** Whether the member can receive platform-brokered introductions at all. */
  acceptsIntroductions: boolean;
  /** Where they want context delivered: opportunities, companies, both. */
  introductionScope: "opportunity" | "company" | "both";
  /** Free-text guidance shown to requesters before they submit. */
  introductionNote?: string;
};

export type MemberRegion =
  | "Mexico"
  | "United States"
  | "Canada"
  | "Europe"
  | "Caribbean"
  | "South America";

export type Member = {
  id: string; // "MEM-XXXXXX"
  slug: string;
  name: string;
  /** Initials used as avatar fallback. */
  initials: string;
  /** Optional cover gradient name; mirrors the profile cover palette set. */
  coverGradient: "navy-gold" | "navy-deep" | "twilight" | "sunrise";

  memberType: MemberType;
  title: string;
  company: string;
  /** Optional reference to a COMP-XXXXXX record. */
  companyId?: string;

  industry: string;
  industries: string[];
  areasOfInterest: string[];

  country: string;
  state?: string;
  city: string;
  region: MemberRegion;

  bio: string;
  about: string;

  joinedYear: number;
  /** ISO timestamp — used for "Recently joined" sort. */
  joinedAt: string;

  verification: MemberVerification;
  featured: boolean;
  trending: boolean;

  /** Public-facing counts. Computed at build time from listings + opps. */
  listingsCount: number;
  opportunitiesCount: number;
  companiesCount: number;

  /** A small set of opportunity slugs this member has posted (for the profile page). */
  opportunitySlugs: string[];
  /** A small set of company slugs this member is associated with. */
  companySlugs: string[];

  /** A short list of documents this member has shared platform-wide. */
  sharedDocuments: { name: string; type: string; sharedAt: string }[];

  /** Recent activity timeline (display-only). */
  recentActivity: {
    id: string;
    kind: "listing" | "company" | "introduction" | "join" | "verification";
    title: string;
    description: string;
    at: string; // ISO timestamp
  }[];

  contactPreferences: MemberContactPrefs;
};
