import { featuredOpportunities, type Opportunity } from "@/data/opportunities";
import { companies } from "./data";
import type { Company } from "./types";

export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getOpportunitiesForCompany(companyId: string): Opportunity[] {
  return featuredOpportunities.filter((o) => o.companyId === companyId);
}

export function getActiveOpportunitiesForCompany(companyId: string): Opportunity[] {
  return getOpportunitiesForCompany(companyId).filter((o) => o.status !== "Closed");
}
