// Factories for records created at runtime through the Admin Control Center.
//
// These produce fully-formed Member / Company objects from a small set of
// admin-entered fields, filling every required field with a sensible default
// so the new record is valid everywhere a seed record is. Created records are
// stored in the provider (userMembers / userCompanies), shown across the admin
// surfaces + global search, and persisted to localStorage.

import type { Member, MemberType, MemberVerification } from "@/data/members";
import type { Company } from "@/data/companies";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base || "record";
  let i = 2;
  while (taken.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export type CreateMemberInput = {
  name: string;
  memberType?: MemberType;
  title?: string;
  company?: string;
  companyId?: string;
  industry?: string;
  city?: string;
  country?: string;
  verification?: MemberVerification;
};

export function buildMember(
  input: CreateMemberInput,
  opts: { id: string; slug: string; nowIso: string }
): Member {
  const industry = input.industry?.trim() || "General Business";
  return {
    id: opts.id,
    slug: opts.slug,
    name: input.name.trim(),
    initials: initialsFor(input.name) || "CC",
    coverGradient: "navy-gold",
    memberType: input.memberType ?? "General Member",
    title: input.title?.trim() || "Member",
    company: input.company?.trim() || "Independent",
    companyId: input.companyId,
    industry,
    industries: [industry],
    areasOfInterest: [],
    country: input.country?.trim() || "United States",
    city: input.city?.trim() || "—",
    region: "United States",
    bio: "",
    about: "",
    joinedYear: new Date(opts.nowIso).getFullYear(),
    joinedAt: opts.nowIso,
    verification: input.verification ?? "Pending",
    featured: false,
    trending: false,
    listingsCount: 0,
    opportunitiesCount: 0,
    companiesCount: 0,
    opportunitySlugs: [],
    companySlugs: [],
    sharedDocuments: [],
    recentActivity: [],
    contactPreferences: {
      acceptsIntroductions: true,
      introductionScope: "both",
    },
  };
}

export type CreateCompanyInput = {
  name: string;
  industry?: string;
  tagline?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  employees?: string;
  foundedYear?: number;
};

export function buildCompany(
  input: CreateCompanyInput,
  opts: { id: string; slug: string; nowIso: string }
): Company {
  const website = input.website?.trim() || "";
  return {
    id: opts.id,
    slug: opts.slug,
    name: input.name.trim(),
    tagline: input.tagline?.trim() || "",
    industry: input.industry?.trim() || "General Business",
    headquarters: {
      city: input.city?.trim() || "—",
      state: input.state?.trim() || undefined,
      country: input.country?.trim() || "United States",
    },
    website,
    websiteLabel: website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    foundedYear: input.foundedYear ?? new Date(opts.nowIso).getFullYear(),
    employees: input.employees?.trim() || "1-10",
    verification: "Pending",
    coverImage: "",
    about: { overview: "", mission: "", background: "", trackRecord: "" },
    team: [],
    pastProjects: [],
    gallery: [],
    closedOpportunitiesCount: 0,
    searchKeywords: [],
    featured: false,
    addedAt: opts.nowIso,
  };
}
