import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  featuredOpportunities,
  getOpportunityBySlug,
  getRelatedOpportunities,
} from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import DetailHero from "@/components/DetailHero";
import ImageGallery from "@/components/ImageGallery";
import InvestmentDetailsBlock from "@/components/InvestmentDetailsBlock";
import ProjectInfoBlock from "@/components/ProjectInfoBlock";
import SponsorBlock from "@/components/SponsorBlock";
import DocumentsBlock from "@/components/DocumentsBlock";
import OpportunityDataRoomBlock from "@/components/dataroom/OpportunityDataRoomBlock";
import ActionPanel from "@/components/ActionPanel";
import RelatedOpportunities from "@/components/RelatedOpportunities";

type PageParams = { slug: string };

export function generateStaticParams(): PageParams[] {
  return featuredOpportunities.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);
  if (!opportunity) {
    return { title: "Opportunity not found — Capital Circle" };
  }
  return {
    title: `${opportunity.title} — Capital Circle`,
    description: opportunity.executiveSummary,
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);

  if (!opportunity) {
    notFound();
  }

  const related = getRelatedOpportunities(slug, 3);
  const company = getCompanyById(opportunity.companyId);

  return (
    <div className="bg-cream">
      <DetailHero opportunity={opportunity} />

      <ImageGallery images={opportunity.images} title={opportunity.title} />

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="order-2 lg:order-1 space-y-10 md:space-y-12 min-w-0">
            <section>
              <div className="mb-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
                  Overview
                </div>
                <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
                  Executive Summary
                </h2>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-6 md:p-8 space-y-5">
                <p className="text-base md:text-[17px] leading-relaxed text-navy-900 font-medium">
                  {opportunity.executiveSummary}
                </p>
                <div className="h-px bg-navy-900/[0.06]" />
                <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-navy-700/85">
                  {opportunity.fullDescription.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>

            <InvestmentDetailsBlock opportunity={opportunity} />
            <ProjectInfoBlock opportunity={opportunity} />
            {company ? <SponsorBlock company={company} /> : null}
            <OpportunityDataRoomBlock
              opportunity={opportunity}
              companyName={company?.name ?? opportunity.postedBy}
            />
            <DocumentsBlock documents={opportunity.documents} />
          </div>

          <aside className="order-1 lg:order-2 lg:w-[360px]">
            <div className="lg:sticky lg:top-6">
              <ActionPanel opportunity={opportunity} />
            </div>
          </aside>
        </div>
      </div>

      <RelatedOpportunities opportunities={related} />
    </div>
  );
}
