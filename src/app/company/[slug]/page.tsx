import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  companies,
  getCompanyBySlug,
  getActiveOpportunitiesForCompany,
} from "@/data/companies";

import CompanyHero from "@/components/company/CompanyHero";
import CompanyKeyInfo from "@/components/company/CompanyKeyInfo";
import CompanyMediaManager from "@/components/company/CompanyMediaManager";
import CompanyAbout from "@/components/company/CompanyAbout";
import { CompanyDealsPanel } from "@/components/dashboard/deals/DealIntegrations";
import CompanyActiveOpportunities from "@/components/company/CompanyActiveOpportunities";
import CompanyPastProjects from "@/components/company/CompanyPastProjects";
import CompanyTeam from "@/components/company/CompanyTeam";
import CompanyGallery from "@/components/company/CompanyGallery";

type PageParams = { slug: string };

export function generateStaticParams(): PageParams[] {
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) {
    return { title: "Company not found — Capital Circle" };
  }
  return {
    title: `${company.name} — Capital Circle`,
    description: company.tagline,
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const active = getActiveOpportunitiesForCompany(company.id);

  return (
    <div className="bg-cream">
      <CompanyHero company={company} />

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14 space-y-10 md:space-y-14">
        <CompanyKeyInfo company={company} activeOpportunitiesCount={active.length} />
        <CompanyMediaManager company={company} />
        <CompanyDealsPanel company={company} />
        <CompanyAbout company={company} />
        <CompanyActiveOpportunities
          opportunities={active}
          companyName={company.name}
        />
        <CompanyPastProjects projects={company.pastProjects} />
        <CompanyTeam team={company.team} />
        <CompanyGallery company={company} />
      </div>
    </div>
  );
}
