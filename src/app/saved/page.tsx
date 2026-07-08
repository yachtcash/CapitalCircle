import type { Metadata } from "next";
import RoleGate from "@/components/common/RoleGate";
import PageHeader from "@/components/ui/PageHeader";
import SavedSections from "@/components/profile/SavedSections";

export const metadata: Metadata = {
  title: "Saved",
  description:
    "Your watchlist on Capital Circle — saved opportunities and the sponsors you follow, in one place.",
};

export default function SavedPage() {
  return (
    <RoleGate>
      <div className="bg-cream min-h-[calc(100vh-5rem)]">
        <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-6">
          <PageHeader
            eyebrow="Watchlist"
            title="Saved"
            subtitle="Opportunities you shortlisted and sponsors you follow — everything you bookmarked across the marketplace."
          />
          <SavedSections />
        </div>
      </div>
    </RoleGate>
  );
}
