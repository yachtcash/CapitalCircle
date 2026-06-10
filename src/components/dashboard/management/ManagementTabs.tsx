"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Pencil,
  FileText,
  BarChart3,
  Activity,
} from "lucide-react";

import type { ListingRecord } from "@/data/listings";
import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import { cn } from "@/lib/cn";

import ListingInformationBlock from "./ListingInformationBlock";
import ListingEditor from "./ListingEditor";
import ListingAnalyticsDetail from "./ListingAnalyticsDetail";
import ListingActivityFeed from "./ListingActivityFeed";
import DocumentManager from "./DocumentManager";

type TabKey =
  | "overview"
  | "edit"
  | "documents"
  | "analytics"
  | "activity";

const TABS: { key: TabKey; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Overview", Icon: LayoutGrid },
  { key: "edit", label: "Edit Details", Icon: Pencil },
  { key: "documents", label: "Documents", Icon: FileText },
  { key: "analytics", label: "Analytics", Icon: BarChart3 },
  { key: "activity", label: "Activity", Icon: Activity },
];

const VALID_TABS = new Set<TabKey>(TABS.map((t) => t.key));

/**
 * The Gallery tab was retired — the Gallery Manager now sits permanently
 * above the tab strip. Legacy `?tab=gallery` deep links resolve to the
 * overview tab, which lands the user right next to the always-visible panel.
 */
function normalizeTab(raw: string | null): TabKey | null {
  if (!raw) return null;
  if (raw === "gallery") return "overview";
  return VALID_TABS.has(raw as TabKey) ? (raw as TabKey) : null;
}

type Props = {
  listing: ListingRecord;
  opportunity?: Opportunity;
  company?: Company;
};

export default function ManagementTabs({ listing, opportunity }: Props) {
  const searchParams = useSearchParams();
  // Honor `?tab=edit` (and similar) so deep links from the Edit / Manage
  // CTAs across the app land on the right surface. Falls back to overview.
  const initialTab = normalizeTab(searchParams?.get("tab") ?? null) ?? "overview";
  const [active, setActive] = useState<TabKey>(initialTab);

  // If the URL param changes after mount (e.g. user clicks an in-app link),
  // sync the active tab. We deliberately don't push back to the URL on tab
  // change to keep navigation cheap.
  useEffect(() => {
    const next = normalizeTab(searchParams?.get("tab") ?? null);
    if (next) setActive(next);
  }, [searchParams]);

  return (
    <section>
      {/* Tab bar */}
      <div className="bg-white border-b border-navy-900/[0.06] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 md:px-10">
          <div className="flex flex-wrap items-stretch gap-0.5 overflow-x-auto">
            {TABS.map(({ key, label, Icon }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={cn(
                    "relative inline-flex items-center gap-2 px-4 md:px-5 py-4 text-sm font-semibold transition-colors",
                    isActive
                      ? "text-navy-900"
                      : "text-navy-700/60 hover:text-navy-900"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {label}
                  <span
                    className={cn(
                      "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-opacity",
                      isActive ? "bg-gold-500 opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-10">
        {active === "overview" ? (
          <ListingInformationBlock listing={listing} opportunity={opportunity} />
        ) : null}
        {active === "edit" ? (
          <ListingEditor listing={listing} opportunity={opportunity} />
        ) : null}
        {active === "documents" ? (
          <DocumentManager
            listingId={listing.id}
            listingTitle={listing.title}
          />
        ) : null}
        {active === "analytics" ? (
          <ListingAnalyticsDetail listing={listing} />
        ) : null}
        {active === "activity" ? <ListingActivityFeed listing={listing} /> : null}
      </div>
    </section>
  );
}
