// Company data model + supporting types.
//
// Companies have a 1:N relationship with opportunities. Each opportunity
// stores a companyId that points back to a company in this collection.

export type VerificationStatus = "Pending" | "Verified" | "Premium Verified";

export type CompanyPlace = {
  country: string;
  state?: string;
  city: string;
  coordinates?: { lat: number; lng: number };
};

export type TeamRole =
  | "CEO"
  | "President"
  | "Director of Acquisitions"
  | "Director of Operations"
  | "Director of Capital Markets"
  | "Director of Engineering"
  | "Director of Design"
  | "Managing Partner";

export type TeamMember = {
  name: string;
  role: TeamRole;
  bio: string;
  initials: string;
  yearsAtFirm: number;
};

export type PastProject = {
  id: string;
  name: string;
  location: string;
  year: number;
  description: string;
  category?: string;
};

export type GalleryCategory = "Project" | "Office" | "Facility" | "Team";

export type GalleryImage = {
  src: string;
  alt: string;
  category: GalleryCategory;
  caption?: string;
};

export type Company = {
  id: string; // "COMP-000001"
  slug: string; // "pacific-coast-development-group"
  name: string;
  tagline: string;
  industry: string;
  headquarters: CompanyPlace;
  website: string;
  websiteLabel: string; // Display-friendly version of website
  foundedYear: number;
  employees: string; // "50-100", "100-250", etc.
  verification: VerificationStatus;
  coverImage: string;
  /**
   * Optional logo image (URL or idb:// token). When unset, the UI renders
   * the company's initials monogram. Editable via the Company Media Manager
   * through the provider's companyMediaPatches overlay.
   */
  logo?: string;

  about: {
    overview: string;
    mission: string;
    background: string;
    trackRecord: string;
  };

  team: TeamMember[];
  pastProjects: PastProject[];
  gallery: GalleryImage[];
  closedOpportunitiesCount: number;

  // Search integration prep — not yet surfaced in UI but kept on the model
  // so the future search index has a clean keyword set per company.
  searchKeywords: string[];

  // Directory-only metadata (used by the /companies marketplace).
  featured?: boolean;
  addedAt: string; // ISO timestamp the company joined Capital Circle
};
