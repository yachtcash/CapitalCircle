import type { Metadata } from "next";
import MemberDashboardClient from "@/components/my/MemberDashboardClient";

export const metadata: Metadata = {
  title: "My Dashboard",
  description:
    "Your personal Capital Circle desk — opportunities, saved deals, conversations, meetings, and requests.",
};

export default function MyDashboardPage() {
  return <MemberDashboardClient />;
}
