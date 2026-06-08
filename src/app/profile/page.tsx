import type { Metadata } from "next";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Your Capital Circle profile — bio, expertise, experience, contact preferences, and privacy settings.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
