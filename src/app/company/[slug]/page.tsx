import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { companies, getCompanyBySlug } from "@/data/companies";

import CompanyHero from "@/components/company/CompanyHero";
import CompanyStats from "@/components/company/CompanyStats";
import CompanyOverview from "@/components/company/CompanyOverview";
import CompanyActiveOpportunities from "@/components/company/CompanyActiveOpportunities";
import CompanyCredibility from "@/components/company/CompanyCredibility";
import CompanyTeam from "@/components/company/CompanyTeam";
import CompanyPastProjects from "@/components/company/CompanyPastProjects";
import CompanyMedia from "@/components/company/CompanyMedia";
import CompanyMarketActivity from "@/components/company/CompanyMarketActivity";
import RelatedCompanyOpportunities from "@/components/company/RelatedCompanyOpportunities";

// Owner / admin tooling — out of scope for this profile pass, kept untouched.
import CompanyMediaManager from "@/components/company/CompanyMediaManager";
import { CompanyDealsPanel } from "@/components/dashboard/deals/DealIntegrations";
import CalendarEventsPanel from "@/components/calendar/CalendarEventsPanel";

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

  return (
    <div className="bg-cream">
      <CompanyHero company={company} />

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14 space-y-10 md:space-y-14">
        {/* Institutional sponsor profile */}
        <CompanyStats company={company} />
        <CompanyOverview company={company} />
        <CompanyActiveOpportunities companyId={company.id} companyName={company.name} />
        <CompanyCredibility company={company} />
        <CompanyTeam team={company.team} />
        <CompanyPastProjects projects={company.pastProjects} />
        <CompanyMedia company={company} />
        <CompanyMarketActivity company={company} />
        <RelatedCompanyOpportunities company={company} />

        {/* Owner / admin tooling (role-gated) — unchanged */}
        <CompanyMediaManager company={company} />
        <CompanyDealsPanel company={company} />
        <CalendarEventsPanel
          relation={{ companyId: company.id }}
          eyebrow="Company Calendar"
          highlights={[
            { label: "Investor Meetings", types: ["Investor Meeting", "Meeting"] },
            { label: "Calls", types: ["Call"] },
            { label: "Tasks", types: ["Task"] },
            { label: "Deadlines", types: ["Deadline"] },
          ]}
          quickTypes={["Investor Meeting", "Call", "Task", "Deadline"]}
        />
      </div>
    </div>
  );
}
