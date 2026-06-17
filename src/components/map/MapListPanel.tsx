"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Building2, X, Globe2 } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { MARKER_STYLES, markerStyleFor, type MarkerStyleKey } from "@/lib/map/types";
import { MAP_REGIONS } from "@/data/map/regions";
import { cn } from "@/lib/cn";

// Category filter pills, in institutional order (matches marker colors).
const CATEGORY_ORDER: MarkerStyleKey[] = [
  "energy",
  "real-estate",
  "hotels",
  "land",
  "infrastructure",
  "businesses",
  "joint-ventures",
  "suppliers",
  "other",
];

type Props = {
  opportunities: Opportunity[];
  totalAvailable: number;
  query: string;
  onQueryChange: (q: string) => void;
  selectedSlug: string | null;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  selectedCountries: string[];
  onSelectRegion: (regionId: string | null) => void;
  regionCounts: Record<string, number>;
  categoryKeys: Set<MarkerStyleKey>;
  onToggleCategory: (key: MarkerStyleKey) => void;
  categoryCounts: Record<MarkerStyleKey, number>;
};

export default function MapListPanel({
  opportunities,
  totalAvailable,
  query,
  onQueryChange,
  selectedSlug,
  onSelectOpportunity,
  selectedCountries,
  onSelectRegion,
  regionCounts,
  categoryKeys,
  onToggleCategory,
  categoryCounts,
}: Props) {
  const regionActive = (regionId: string): boolean => {
    const region = MAP_REGIONS.find((r) => r.id === regionId);
    if (!region || selectedCountries.length === 0) return false;
    if (region.countries.length !== selectedCountries.length) return false;
    return region.countries.every((c) => selectedCountries.includes(c));
  };
  const anyRegionActive = MAP_REGIONS.some((r) => regionActive(r.id));
  // Most-inventory markets first — reads like a real marketplace.
  const sortedRegions = [...MAP_REGIONS].sort(
    (a, b) => (regionCounts[b.id] ?? 0) - (regionCounts[a.id] ?? 0)
  );
  const categories = CATEGORY_ORDER.filter((k) => (categoryCounts[k] ?? 0) > 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Fixed filters: Search → Category → count ─────────────── */}
      <div className="border-b border-navy-900/[0.08]">
        {/* 1. Search — the primary action */}
        <div className="px-4 pt-3 pb-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50" strokeWidth={2} />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search opportunities, companies, sponsors, locations…"
              className="w-full rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.08] focus:ring-2 focus:ring-gold-500 outline-none pl-10 pr-9 py-2.5 text-sm font-medium text-navy-900 placeholder:text-navy-700/45 placeholder:font-normal transition-shadow"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full hover:bg-bone text-navy-700/55 hover:text-navy-900 transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            ) : null}
          </div>
        </div>

        {/* 2. Category filters */}
        <div className="px-4 pb-2.5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold mb-1.5">
            Asset Class
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((k) => {
              const s = MARKER_STYLES[k];
              const active = categoryKeys.has(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => onToggleCategory(k)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition-colors",
                    active
                      ? "text-white ring-transparent shadow-sm"
                      : "bg-white text-navy-700 ring-navy-900/[0.1] hover:ring-navy-900/25"
                  )}
                  style={active ? { backgroundColor: s.fill } : undefined}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: active ? "rgba(255,255,255,.9)" : s.fill }}
                  />
                  {s.label}
                  <span className={cn("tabular-nums", active ? "text-white/75" : "text-navy-700/45")}>
                    {categoryCounts[k] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* count bar */}
        <div className="px-4 py-2 bg-bone/40 border-t border-navy-900/[0.06] flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.14em] text-navy-700/65 font-bold">
            <span className="text-navy-900 tabular-nums">{opportunities.length}</span>{" "}
            opportunit{opportunities.length === 1 ? "y" : "ies"}
            {opportunities.length !== totalAvailable ? (
              <span className="text-navy-700/40 normal-case tracking-normal font-medium"> · of {totalAvailable}</span>
            ) : null}
          </div>
          {categoryKeys.size > 0 ? (
            <button
              type="button"
              onClick={() => CATEGORY_ORDER.forEach((k) => categoryKeys.has(k) && onToggleCategory(k))}
              className="text-[10px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
            >
              Clear classes
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Scroll: Region filters → Results ─────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* 3. Region filters (scrolls away as you browse) */}
        <div className="px-4 pt-3 pb-3 border-b border-navy-900/[0.06]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold inline-flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
              Markets
            </div>
            {anyRegionActive ? (
              <button
                type="button"
                onClick={() => onSelectRegion(null)}
                className="text-[10px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {sortedRegions.map((r) => {
              const active = regionActive(r.id);
              const count = regionCounts[r.id] ?? 0;
              const empty = count === 0 && !active;
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={empty}
                  onClick={() => onSelectRegion(active ? null : r.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs ring-1 transition-colors text-left",
                    active
                      ? "bg-gold-500/[0.12] ring-gold-500/45 text-navy-900"
                      : empty
                        ? "bg-white ring-navy-900/[0.05] text-navy-700/35 cursor-default"
                        : "bg-white ring-navy-900/[0.08] hover:ring-navy-900/25 text-navy-900"
                  )}
                >
                  <span className="truncate font-semibold">{r.label}</span>
                  <span className={cn("tabular-nums shrink-0", active ? "text-gold-700" : "text-navy-700/50")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Results */}
        {opportunities.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-navy-700/60">
            No opportunities match. Try clearing filters or picking a different
            market.
          </div>
        ) : (
          <ul className="divide-y divide-navy-900/[0.06]">
            {opportunities.map((opportunity) => {
              const company = getCompanyById(opportunity.companyId);
              const style = MARKER_STYLES[markerStyleFor(opportunity.category)];
              const isSelected = selectedSlug === opportunity.slug;
              return (
                <li key={opportunity.id}>
                  <div
                    className={cn(
                      "relative flex gap-3 px-4 py-3 transition-colors",
                      isSelected ? "bg-bone" : "hover:bg-bone/60"
                    )}
                  >
                    {isSelected ? (
                      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-gold-500" />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onSelectOpportunity(opportunity)}
                      aria-label={`Show ${opportunity.title} on the map`}
                      className="relative shrink-0 h-16 w-16 rounded-xl overflow-hidden bg-navy-900/5 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <Image
                        src={opportunity.images[0]}
                        alt={opportunity.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: style.fill }}
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/opportunity/${opportunity.slug}`}
                          className="font-semibold text-navy-900 text-sm leading-snug hover:text-gold-700 transition-colors truncate"
                        >
                          {opportunity.title}
                        </Link>
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold tabular-nums">
                          {publicOpportunityId(opportunity)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] font-semibold truncate" style={{ color: style.fill }}>
                        {opportunity.category}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-2 text-[11px] text-navy-700/70 truncate">
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-gold-600 shrink-0" strokeWidth={2.2} />
                          <span className="truncate">{opportunity.location}</span>
                        </span>
                        {company ? (
                          <>
                            <span className="text-navy-700/30">·</span>
                            <span className="inline-flex items-center gap-1 truncate">
                              <Building2 className="h-3 w-3 text-gold-600 shrink-0" strokeWidth={2.2} />
                              <Link
                                href={`/company/${company.slug}`}
                                className="font-semibold text-navy-700/85 hover:text-gold-700 transition-colors truncate"
                              >
                                {company.name}
                              </Link>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
