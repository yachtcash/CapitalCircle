import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";
import DashboardWelcome from "@/components/dashboard/DashboardWelcome";
import DashboardStats from "@/components/dashboard/DashboardStats";
import MyNegotiations from "@/components/dashboard/MyNegotiations";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SavedItemsCompact from "@/components/dashboard/SavedItemsCompact";
import MyListingsPreview from "@/components/dashboard/MyListingsPreview";

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

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8">
          <div className="space-y-6 md:space-y-8 min-w-0">
            <MyListingsPreview />
            <MyNegotiations />
            <RecentActivity />
          </div>

          <aside className="space-y-4">
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
