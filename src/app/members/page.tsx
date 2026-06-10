import type { Metadata } from "next";
import { MEMBERS } from "@/data/members";
import MemberDirectoryHero from "@/components/members/MemberDirectoryHero";
import MemberDirectoryClient from "@/components/members/MemberDirectoryClient";

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
      <MemberDirectoryClient members={MEMBERS} />
    </div>
  );
}
