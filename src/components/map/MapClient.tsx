"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutList, Map as MapIcon } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { applyFilters } from "@/lib/search/filter";
import { serializeFilters } from "@/lib/search/params";
import type { SearchFilters } from "@/lib/search/types";
import { markerStyleFor, type MarkerStyleKey } from "@/lib/map/types";
import { MAP_REGIONS } from "@/data/map/regions";
import { useAllOpportunities } from "@/lib/opportunities/all";
import MapListPanel from "./MapListPanel";
import MapView from "./MapView";
import { cn } from "@/lib/cn";

type Props = {
  filters: SearchFilters;
  opportunities: Opportunity[];
  totalAvailable: number;
};

export default function MapClient({ filters, opportunities: ssrOpportunities, totalAvailable: ssrTotalAvailable }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("map");
  // Map-local category filter (by marker-style group). Kept local so it composes
  // with the URL-based search/region filters without touching that system.
  const [categoryKeys, setCategoryKeys] = useState<Set<MarkerStyleKey>>(new Set());

  const onToggleCategory = (key: MarkerStyleKey) => {
    setCategoryKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Merge user-created opportunities into the map view so newly published
  // listings appear immediately. Pre-hydration we use the server-rendered
  // set to avoid a hydration mismatch.
  const allOpps = useAllOpportunities();
  const opportunities = useMemo(
    () => applyFilters(allOpps, filters),
    [allOpps, filters]
  );
  const totalAvailable = allOpps.length;
  void ssrOpportunities;
  void ssrTotalAvailable;

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

  // Inventory counts per category group + per region, from the full catalog —
  // shown beside the filter pills like a real marketplace ("United States (28)").
  const categoryCounts = useMemo(() => {
    const m = {} as Record<MarkerStyleKey, number>;
    for (const o of allOpps) {
      const k = markerStyleFor(o.category);
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  }, [allOpps]);

  const regionCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of MAP_REGIONS) {
      m[r.id] = allOpps.filter((o) => r.countries.includes(o.place?.country ?? "")).length;
    }
    return m;
  }, [allOpps]);

  // Apply the local category filter on top of the URL-filtered set.
  const visibleOpportunities = useMemo(() => {
    if (categoryKeys.size === 0) return opportunities;
    return opportunities.filter((o) => categoryKeys.has(markerStyleFor(o.category)));
  }, [opportunities, categoryKeys]);

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <header className="bg-white border-b border-navy-900/[0.06]">
        <div className="px-5 md:px-10 py-3 flex items-center gap-3">
          <span className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-navy-900 text-gold-400 ring-1 ring-navy-900/5">
            <MapIcon className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600 font-bold leading-none">
              Capital Circle
            </div>
            <h1 className="mt-1 text-lg md:text-xl font-semibold text-navy-900 tracking-tight leading-none">
              Opportunity Map
            </h1>
          </div>
          <div className="ml-auto hidden lg:flex items-baseline gap-1.5 text-sm text-navy-700/70">
            <span className="font-semibold text-navy-900 tabular-nums">{visibleOpportunities.length}</span>
            <span>of {totalAvailable} opportunities</span>
          </div>
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
      <div className="lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-0 lg:h-[calc(100vh-5rem-61px)]">
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
            regionCounts={regionCounts}
            categoryKeys={categoryKeys}
            onToggleCategory={onToggleCategory}
            categoryCounts={categoryCounts}
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
