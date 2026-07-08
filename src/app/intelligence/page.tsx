import type { Metadata } from "next";
import IntelligenceClient from "@/components/intelligence/IntelligenceClient";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description:
    "The Capital Circle marketplace, explained — live capital flows, country and industry rankings, sponsor activity, and market health derived from every active mandate.",
};

export default function IntelligencePage() {
  return <IntelligenceClient />;
}
