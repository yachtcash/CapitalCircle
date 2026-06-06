"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Images,
  FileText,
  BarChart3,
  Activity,
} from "lucide-react";

import type { ListingRecord } from "@/data/listings";
import type { Opportunity } from "@/data/opportunities";
import type { Company } from "@/data/companies";
import ImageGallery from "@/components/ImageGallery";
import { cn } from "@/lib/cn";

import ListingInformationBlock from "./ListingInformationBlock";
import ListingDocumentsBlock from "./ListingDocumentsBlock";
import ListingAnalyticsDetail from "./ListingAnalyticsDetail";
import ListingActivityFeed from "./ListingActivityFeed";

type TabKey = "overview" | "gallery" | "documents" | "analytics" | "activity";

const TABS: { key: TabKey; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Overview", Icon: LayoutGrid },
  { key: "gallery", label: "Gallery", Icon: Images },
  { key: "documents", label: "Documents", Icon: FileText },
  { key: "analytics", label: "Analytics", Icon: BarChart3 },
  { key: "activity", label: "Activity", Icon: Activity },
];

type Props = {
  listing: ListingRecord;
  opportunity?: Opportunity;
  company?: Company;
};

export default function ManagementTabs({ listing, opportunity }: Props) {
  const [active, setActive] = useState<TabKey>("overview");

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
        {active === "gallery" ? (
          opportunity && opportunity.images.length > 0 ? (
            <div className="-mx-5 md:-mx-10">
              <ImageGallery
                images={opportunity.images}
                title={listing.title}
              />
            </div>
          ) : (
            <EmptyState
              title="No gallery yet"
              body="This listing doesn't have any photos attached. Add photos when editing the listing to showcase your project."
            />
          )
        ) : null}
        {active === "documents" ? (
          <ListingDocumentsBlock
            documents={opportunity?.documents ?? []}
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

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 md:p-12 text-center">
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm text-navy-700/70 max-w-md mx-auto">{body}</p>
    </div>
  );
}
