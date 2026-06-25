import type { Member } from "@/data/members";

import MemberHero from "@/components/member/MemberHero";
import MemberStats from "@/components/member/MemberStats";
import MemberOverview from "@/components/member/MemberOverview";
import MemberOpportunities from "@/components/member/MemberOpportunities";
import MemberCompanies from "@/components/member/MemberCompanies";
import MemberCredibility from "@/components/member/MemberCredibility";
import MemberActivity from "@/components/member/MemberActivity";
import MemberMedia from "@/components/member/MemberMedia";
import MemberNetwork from "@/components/member/MemberNetwork";
import RelatedMembers from "@/components/member/RelatedMembers";

// Owner / admin tooling — out of scope for this profile pass, kept untouched.
import MemberMediaManager from "@/components/member/MemberMediaManager";
import { MemberDealsPanel } from "@/components/dashboard/deals/DealIntegrations";
import CalendarEventsPanel from "@/components/calendar/CalendarEventsPanel";

export default function MemberProfileView({ member }: { member: Member }) {
  return (
    <div className="bg-cream">
      <MemberHero member={member} />

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14 space-y-10 md:space-y-14">
        {/* Institutional executive profile */}
        <MemberStats member={member} />
        <MemberOverview member={member} />
        <MemberOpportunities member={member} />
        <MemberCompanies member={member} />
        <MemberCredibility member={member} />
        <MemberActivity member={member} />
        <MemberMedia member={member} />
        <MemberNetwork member={member} />
        <RelatedMembers member={member} />

        {/* Owner / admin tooling (role-gated) — unchanged */}
        <MemberMediaManager member={member} />
        <MemberDealsPanel member={member} />
        <CalendarEventsPanel
          relation={{ memberId: member.id }}
          eyebrow="Member Calendar"
          highlights={[
            { label: "Meetings", types: ["Meeting", "Investor Meeting"] },
            { label: "Calls", types: ["Call"] },
            { label: "Tasks", types: ["Task"] },
            { label: "Reminders", types: ["Reminder"] },
          ]}
          quickTypes={["Meeting", "Call", "Task", "Reminder"]}
        />
      </div>
    </div>
  );
}
