import type { Metadata } from "next";
import DealsWorkspace from "@/components/dashboard/deals/DealsWorkspace";

export const metadata: Metadata = {
  title: "Deal Desk — Capital Circle",
  description:
    "Manage every relationship through the Deal Desk. Pipeline, table, and card views with stage-by-stage tracking, notes, follow-ups, and platform-brokered context.",
};

export default function DealsPage() {
  return <DealsWorkspace />;
}
