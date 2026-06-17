import type { Metadata } from "next";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Operational reporting across members, companies, opportunities, deals, introductions, calendar, notifications, audit, and moderation — computed live from platform state.",
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
