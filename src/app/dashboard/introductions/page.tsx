import type { Metadata } from "next";
import IntroductionsClient from "@/components/dashboard/introductions/IntroductionsClient";

export const metadata: Metadata = {
  title: "Introductions — Capital Circle",
  description:
    "Review platform-brokered introduction requests between members. Capital Circle remains the middleman on every connection.",
};

export default function IntroductionsAdminPage() {
  return <IntroductionsClient />;
}
