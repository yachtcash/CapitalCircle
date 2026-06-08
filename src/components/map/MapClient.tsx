"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutList, Map as MapIcon } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { applyFilters } from "@/lib/search/filter";
import { serializeFilters } from "@/lib/search/params";
import type { SearchFilters } from "@/lib/search/types";
import { markerStyleFor, MARKER_STYLES, type MarkerStyleKey } from "@/lib/map/types";
import { MAP_REGIONS } from "@/data/map/regions";
import MapListPanel from "./MapListPanel";
import MapView from "./MapView";
import { cn } from "@/lib/cn";

type Props = {
  filters: SearchFilters;
  opportunities: Opportunity[];
  totalAvailable: number;
};

export default function MapClient({ filters, opportunities, totalAvailable }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("map");

  const pushFilters = (next: SearchFilters) => {
    const qs = serializeFilters(next);
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const onQueryChange = (q: string) => {
    pushFilters({ ...filters, q });
  };

  const onSelectRegion = (regionId: string | null) => {
    if (regionId === null) {
      pushFilters({ ...filters, country: [] });
      return;
    }
    const region = MAP_REGIONS.find((r) => r.id === regionId);
    if (!region) return;
    pushFilters({ ...filters, country: region.countries });
  };

  const onSelectOpportunity = (opportunity: Opportunity | null) => {
    setSelectedSlug(opportunity?.slug ?? null);
  };

  // Detect which region (if any) is currently active via the country filter.
  const highlightedRegionId = useMemo(() => {
    if (filters.country.length === 0) return null;
    for (const r of MAP_REGIONS) {
      if (r.countries.length !== filters.country.length) continue;
      if (r.countries.every((c) => filters.country.includes(c))) return r.id;
    }
    return null;
  }, [filters.country]);

  // Build the active marker-style legend (for the panel).
  const activeCategoryStyles = useMemo(() => {
    const set = new Set<MarkerStyleKey>();
    for (const o of opportunities) {
      set.add(markerStyleFor(o.category));
    }
    return set;
  }, [opportunities]);

  // Live-search applies on top of server-filtered results: if the user
  // is typing, narrow the list locally without a navigation round-trip.
  // (Server already narrowed by the URL's q; this is for parity if state
  // diverges briefly.)
  const visibleOpportunities = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    if (!q) return opportunities;
    return applyFilters(opportunities, { ...filters, q });
  }, [filters, opportunities]);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <header className="bg-white border-b border-navy-900/[0.06]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-5 md:py-7">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <MapIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
            Map view
          </div>
          <h1 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
            Find opportunities by location
          </h1>
          <p className="mt-2 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-2xl">
            Every active opportunity on Capital Circle, plotted by its
            sponsor-confirmed location. Pick a region, click a marker, or use the
            list on the left.
          </p>
        </div>
      </header>

      {/* Mobile view toggle */}
      <div className="lg:hidden bg-white border-b border-navy-900/[0.08]">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-2">
          <div className="inline-flex bg-bone rounded-full p-1">
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
                mobileView === "list"
                  ? "bg-navy-900 text-gold-400"
                  : "text-navy-700/65"
              )}
              aria-pressed={mobileView === "list"}
            >
              <LayoutList className="h-3.5 w-3.5" strokeWidth={2.2} />
              List
            </button>
            <button
              type="button"
              onClick={() => setMobileView("map")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
                mobileView === "map"
                  ? "bg-navy-900 text-gold-400"
                  : "text-navy-700/65"
              )}
              aria-pressed={mobileView === "map"}
            >
              <MapIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
              Map
            </button>
          </div>
          <span className="text-xs text-navy-700/55 ml-auto">
            {visibleOpportunities.length} of {totalAvailable}
          </span>
        </div>
      </div>

      {/* Workspace */}
      <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-0 lg:h-[calc(100vh-5rem-128px)]">
        <aside
          className={cn(
            "border-r border-navy-900/[0.08] lg:h-full lg:overflow-hidden flex flex-col",
            mobileView === "list" ? "flex" : "hidden",
            "lg:flex"
          )}
        >
          <MapListPanel
            opportunities={visibleOpportunities}
            totalAvailable={totalAvailable}
            query={filters.q}
            onQueryChange={onQueryChange}
            selectedSlug={selectedSlug}
            onSelectOpportunity={(o) => {
              setSelectedSlug(o.slug);
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                setMobileView("map");
              }
            }}
            selectedCountries={filters.country}
            onSelectRegion={onSelectRegion}
            activeCategoryStyles={activeCategoryStyles}
          />
        </aside>

        <main
          className={cn(
            "lg:h-full",
            mobileView === "map" ? "flex" : "hidden",
            "lg:flex"
          )}
        >
          <div className="relative flex-1 min-h-[60vh] lg:min-h-0">
            <MapView
              opportunities={visibleOpportunities}
              selectedSlug={selectedSlug}
              onSelectOpportunity={onSelectOpportunity}
              highlightedRegionId={highlightedRegionId}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
