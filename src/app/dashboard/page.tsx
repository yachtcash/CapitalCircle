import Link from "next/link";
import { Crown, ArrowRight, BarChart3 } from "lucide-react";
import DashboardWelcome from "@/components/dashboard/DashboardWelcome";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DealDeskCard from "@/components/dashboard/DealDeskCard";
import { DealInsightsPanel } from "@/components/dashboard/deals/DealIntegrations";
import CalendarDashboardWidgets from "@/components/calendar/CalendarDashboardWidgets";
import MyNegotiations from "@/components/dashboard/MyNegotiations";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SavedItemsCompact from "@/components/dashboard/SavedItemsCompact";
import MyListingsPreview from "@/components/dashboard/MyListingsPreview";
import DocumentCenterCard from "@/components/dashboard/DocumentCenterCard";
import DataRoomsPanel from "@/components/dashboard/DataRoomsPanel";
import PendingRequestsPanel from "@/components/dashboard/PendingRequestsPanel";

export const metadata = {
  title: "Dashboard",
  description:
    "Your private workspace on Capital Circle — listings, negotiations, saved deals, and activity at a glance.",
};

export default function DashboardPage() {
  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-8 md:space-y-10">
        <DashboardWelcome />

        <DealDeskCard />

        <DealInsightsPanel />

        <Link
          href="/analytics"
          className="group flex items-center justify-between gap-4 rounded-2xl bg-navy-900 text-white ring-1 ring-navy-900 p-5 md:p-6 hover:shadow-lg hover:shadow-navy-900/10 transition-shadow"
        >
          <div className="flex items-center gap-4 min-w-0">
            <span className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-xl bg-gold-500/15 ring-1 ring-gold-500/40">
              <BarChart3 className="h-5 w-5 text-gold-400" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.18em] text-gold-400 font-bold">
                Analytics &amp; Reporting Center
              </div>
              <div className="mt-0.5 text-base md:text-lg font-semibold tracking-tight truncate">
                Operational reporting across the entire platform
              </div>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-400">
            Open
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </span>
        </Link>

        <CalendarDashboardWidgets />

        <DashboardStats />

        <DocumentCenterCard />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8">
          <div className="space-y-6 md:space-y-8 min-w-0">
            <MyListingsPreview />
            <PendingRequestsPanel />
            <MyNegotiations />
            <RecentActivity />
          </div>

          <aside className="space-y-4">
            <DataRoomsPanel />
            <SavedItemsCompact />

            <div className="bg-gold-500/10 ring-1 ring-gold-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <Crown
                  className="h-3.5 w-3.5 text-gold-700"
                  strokeWidth={2.4}
                />
                <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-semibold">
                  Membership
                </div>
              </div>
              <div className="mt-2 text-base font-semibold text-navy-900">
                Founding Member
              </div>
              <p className="mt-2 text-sm text-navy-900/70 leading-relaxed">
                Priority access to closed-circle listings and the weekly
                editor&apos;s desk.
              </p>
              <Link
                href="/profile"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors group"
              >
                Manage membership
                <ArrowRight
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.4}
                />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
