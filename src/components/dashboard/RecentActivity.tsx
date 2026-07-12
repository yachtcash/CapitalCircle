"use client";

import { useMemo } from "react";
import { Activity as ActivityIcon } from "lucide-react";

import { allRecentActivity } from "@/data/listings";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { fromListingActivity } from "@/lib/activity/adapters";
import ActivityFeed from "@/components/activity/ActivityFeed";

export default function RecentActivity() {
  const { hydrated } = useMessaging();

  const events = useMemo(
    () =>
      allRecentActivity(8).map((a) =>
        fromListingActivity(a, {
          detail: [a.title, a.body].filter(Boolean).join(" — "),
          href: a.opportunitySlug ? `/opportunity/${a.opportunitySlug}` : undefined,
        })
      ),
    []
  );

  return (
    <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
      <header className="flex items-end justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <ActivityIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
            Activity Feed
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            Recent activity
          </h2>
        </div>
      </header>

      <ActivityFeed
        events={events}
        loading={!hydrated}
        nowMs={hydrated ? Date.now() : 0}
        emptyTitle="No activity yet"
        emptyDescription="Activity on your listings will show up here as soon as it lands."
      />
    </section>
  );
}
