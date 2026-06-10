import type { Metadata } from "next";
import DealsWorkspace from "@/components/dashboard/deals/DealsWorkspace";

export const metadata: Metadata = {
  title: "Deal Desk — Capital Circle",
  description:
    "Platform Operations Center — track introductions, negotiations, capital raises, and deal progress across the full lifecycle from New Lead to Closed Won.",
};

export default function DealDeskPage() {
  return <DealsWorkspace />;
}
