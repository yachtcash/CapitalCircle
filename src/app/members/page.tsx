import type { Metadata } from "next";
import { Library } from "lucide-react";
import { MEMBERS } from "@/data/members";
import { MEMBER_COLLECTIONS } from "@/data/members/collections";
import MemberDirectoryHero from "@/components/members/MemberDirectoryHero";
import MemberDirectoryClient from "@/components/members/MemberDirectoryClient";
import MemberCollectionRow from "@/components/members/MemberCollectionRow";

export const metadata: Metadata = {
  title: "Members — Capital Circle Directory",
  description:
    "Discover sponsors, investors, operators, brokers, lenders, and service providers across the Capital Circle network. Every introduction is brokered by the platform — members never receive each other's direct contact info from this surface.",
};

export default function MembersDirectoryPage() {
  const totalVerified = MEMBERS.filter(
    (m) => m.verification === "Verified" || m.verification === "Founding Member"
  ).length;
  const totalFeatured = MEMBERS.filter((m) => m.featured).length;

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <MemberDirectoryHero
        totalMembers={MEMBERS.length}
        totalVerified={totalVerified}
        totalFeatured={totalFeatured}
      />

      {/* Curated discovery rails — presentation-only selection over MEMBERS */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-10 pt-8 md:pt-12 pb-2">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Library className="h-3.5 w-3.5" strokeWidth={2.2} />
            Curated discovery
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            Browse the network
          </h2>
        </div>
        {MEMBER_COLLECTIONS.map((collection) => (
          <MemberCollectionRow key={collection.slug} collection={collection} />
        ))}
      </section>

      <MemberDirectoryClient members={MEMBERS} />
    </div>
  );
}
