"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { publicOpportunityId } from "@/lib/opportunities/id";
import {
  MARKER_STYLES,
  markerStyleFor,
  type MarkerStyleKey,
} from "@/lib/map/types";
import { cn } from "@/lib/cn";
import RegionPanel from "./RegionPanel";

type Props = {
  opportunities: Opportunity[];
  totalAvailable: number;
  query: string;
  onQueryChange: (q: string) => void;
  selectedSlug: string | null;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  selectedCountries: string[];
  onSelectRegion: (regionId: string | null) => void;
  activeCategoryStyles: Set<MarkerStyleKey>;
};

function MarkerDot({ style }: { style: { fill: string; glyph: string } }) {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full text-white text-[10px] font-bold ring-2 ring-white shadow-sm"
      style={{ backgroundColor: style.fill }}
    >
      {style.glyph}
    </span>
  );
}

type LegendChip = { key: MarkerStyleKey; label: string; color: string; glyph: string };
function Legend({ activeStyles }: { activeStyles: Set<MarkerStyleKey> }) {
  const chips: LegendChip[] = Array.from(activeStyles).map((k) => ({
    key: k,
    label: MARKER_STYLES[k].label,
    color: MARKER_STYLES[k].fill,
    glyph: MARKER_STYLES[k].glyph,
  }));
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1 rounded-full bg-white ring-1 ring-navy-900/[0.06] px-2 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-navy-700"
        >
          <span
            className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full text-white text-[8px] font-bold"
            style={{ backgroundColor: c.color }}
          >
            {c.glyph}
          </span>
          {c.label}
        </span>
      ))}
    </div>
  );
}

export default function MapListPanel({
  opportunities,
  totalAvailable,
  query,
  onQueryChange,
  selectedSlug,
  onSelectOpportunity,
  selectedCountries,
  onSelectRegion,
  activeCategoryStyles,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-5 py-4 border-b border-navy-900/[0.08]">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Map view
        </div>
        <h2 className="mt-1 text-lg font-semibold text-navy-900">
          Explore opportunities
        </h2>

        <div className="mt-3 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50"
            strokeWidth={2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Title, company, location"
            className="w-full rounded-full bg-bone/60 ring-1 ring-navy-900/[0.06] focus:ring-2 focus:ring-gold-500 outline-none pl-9 pr-9 py-2 text-sm text-navy-900 placeholder:text-navy-700/45 transition-shadow"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full hover:bg-bone text-navy-700/55 hover:text-navy-900 transition-colors"
            >
              <X className="h-3 w-3" strokeWidth={2.4} />
            </button>
          ) : null}
        </div>

        <div className="mt-3">
          <Legend activeStyles={activeCategoryStyles} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <RegionPanel
            selectedCountries={selectedCountries}
            onSelectRegion={onSelectRegion}
          />
        </div>

        <div className="px-5 pb-4 sticky top-0 bg-white border-b border-navy-900/[0.06]">
          <div className="py-2 text-xs text-navy-700/70">
            <span className="font-semibold text-navy-900 tabular-nums">
              {opportunities.length}
            </span>{" "}
            opportunit{opportunities.length === 1 ? "y" : "ies"}
            {opportunities.length !== totalAvailable ? (
              <span className="text-navy-700/55">
                {" "}
                · of {totalAvailable} total
              </span>
            ) : null}
          </div>
        </div>

        {opportunities.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-navy-700/60">
            No opportunities in view. Try clearing filters or picking a different
            region.
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
                      "relative flex gap-3 px-5 py-3.5 transition-colors",
                      isSelected ? "bg-bone" : "hover:bg-bone/60"
                    )}
                  >
                    {isSelected ? (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r bg-gold-500" />
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
                      <span className="absolute -bottom-1 -right-1">
                        <MarkerDot style={style} />
                      </span>
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
                      <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-gold-600 font-semibold truncate">
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
