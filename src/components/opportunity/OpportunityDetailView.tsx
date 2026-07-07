"use client";

import { getCompanyById } from "@/data/companies";
import { MEMBERS } from "@/data/members";
import type { Opportunity } from "@/data/opportunities";
import { useMessaging } from "@/components/providers/MessagingProvider";

import OpportunityHero from "./OpportunityHero";
import OpportunityImages from "./OpportunityImages";
import InvestmentSnapshot from "./InvestmentSnapshot";
import OpportunitySnapshotSidebar from "./OpportunitySnapshotSidebar";
import ExecutiveSummaryBlock from "./ExecutiveSummaryBlock";
import OpportunityTimeline from "./OpportunityTimeline";
import OpportunitySponsor from "./OpportunitySponsor";
import OpportunityLeadSponsor from "./OpportunityLeadSponsor";
import OpportunityLocation from "./OpportunityLocation";
import OpportunityActivity from "./OpportunityActivity";
import OpportunityCredibility from "./OpportunityCredibility";
import OpportunityRelated from "./OpportunityRelated";

// Reused systems — data room (access-controlled) + engagement panel.
import OpportunityDataRoomBlock from "@/components/dataroom/OpportunityDataRoomBlock";
import ActionPanel from "@/components/ActionPanel";

// Out-of-scope owner / admin tooling — kept untouched.
import OwnerControlsPanel from "./OwnerControlsPanel";
import ReportButton from "@/components/moderation/ReportButton";
import { OpportunityDealsPanel } from "@/components/dashboard/deals/DealIntegrations";
import CalendarEventsPanel from "@/components/calendar/CalendarEventsPanel";

export default function OpportunityDetailView({
  opportunity: seedOpportunity,
}: {
  opportunity: Opportunity;
}) {
  const { getOpportunityBySlug, hydrated } = useMessaging();
  // Resolve the live overlay record so Listing Editor / Image Manager edits show.
  const opportunity = hydrated ? getOpportunityBySlug(seedOpportunity.slug) ?? seedOpportunity : seedOpportunity;

  const company = getCompanyById(opportunity.companyId);
  const companyName = company?.name ?? opportunity.postedBy;
  const leadMember = MEMBERS.find((m) => m.opportunitySlugs.includes(opportunity.slug)) ?? null;

  return (
    <div className="bg-cream">
      <OpportunityHero opportunity={opportunity} company={company} leadMember={leadMember} />
      <InvestmentSnapshot opportunity={opportunity} />
      <OpportunityImages images={opportunity.images} title={opportunity.title} />

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="order-2 lg:order-1 space-y-10 md:space-y-12 min-w-0">
            <ExecutiveSummaryBlock opportunity={opportunity} />
            <OpportunityTimeline opportunity={opportunity} />
            {company ? <OpportunitySponsor company={company} /> : null}
            {leadMember ? (
              <OpportunityLeadSponsor opportunity={opportunity} member={leadMember} companyName={companyName} />
            ) : null}
            <OpportunityDataRoomBlock opportunity={opportunity} companyName={companyName} />
            <OpportunityLocation opportunity={opportunity} />
            <OpportunityActivity opportunity={opportunity} />
            <OpportunityCredibility opportunity={opportunity} company={company} leadMember={leadMember} />
          </div>

          <aside className="order-1 lg:order-2 lg:w-[360px] min-w-0 space-y-5">
            <div className="lg:sticky lg:top-6 space-y-3">
              <OpportunitySnapshotSidebar opportunity={opportunity} company={company} />
              <ActionPanel opportunity={opportunity} />
              <div className="flex justify-center">
                <ReportButton targetKind="opportunity" targetId={opportunity.id} targetLabel={opportunity.title} variant="chip" />
              </div>
            </div>
            {/* Owner / admin tooling (role-gated) — unchanged */}
            <OwnerControlsPanel opportunity={opportunity} />
            <OpportunityDealsPanel opportunity={opportunity} />
            <CalendarEventsPanel
              relation={{ opportunityId: opportunity.id }}
              eyebrow="Opportunity Calendar"
              highlights={[
                { label: "Meetings", types: ["Meeting", "Investor Meeting"] },
                { label: "Site Visits", types: ["Inspection", "Due Diligence"] },
                { label: "Property Tours", types: ["Property Tour"] },
                { label: "Deadlines", types: ["Deadline"] },
              ]}
              quickTypes={["Meeting", "Property Tour", "Deadline", "Follow Up"]}
            />
          </aside>
        </div>
      </div>

      <OpportunityRelated opportunity={opportunity} />
    </div>
  );
}
