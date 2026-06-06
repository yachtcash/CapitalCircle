import type { Metadata } from "next";
import ListingsWorkspace from "@/components/dashboard/listings/ListingsWorkspace";

export const metadata: Metadata = {
  title: "My Listings",
  description:
    "Portfolio of your private deal listings on Capital Circle — manage drafts, active raises, negotiations, closed deals, and archived opportunities.",
};

export default function MyListingsPage() {
  return <ListingsWorkspace />;
}
