"use client";

import { Globe2, MapPinned } from "lucide-react";
import { MAP_REGIONS } from "@/data/map/regions";
import { cn } from "@/lib/cn";

type Props = {
  selectedCountries: string[];
  onSelectRegion: (regionId: string | null) => void;
};

export default function RegionPanel({ selectedCountries, onSelectRegion }: Props) {
  // A region is "active" if its country list is exactly the current
  // country filter set.
  const isActive = (regionId: string): boolean => {
    const region = MAP_REGIONS.find((r) => r.id === regionId);
    if (!region) return false;
    if (region.countries.length !== selectedCountries.length) return false;
    return region.countries.every((c) => selectedCountries.includes(c));
  };

  const anyActive = MAP_REGIONS.some((r) => isActive(r.id));

  return (
    <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-4 md:p-5">
      <header className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5" strokeWidth={2.2} />
            Explore by region
          </div>
          <h3 className="mt-1 text-sm font-semibold text-navy-900">
            Pick a market
          </h3>
        </div>
        {anyActive ? (
          <button
            type="button"
            onClick={() => onSelectRegion(null)}
            className="text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
          >
            Clear
          </button>
        ) : null}
      </header>

      <ul className="space-y-1.5">
        {MAP_REGIONS.map((region) => {
          const active = isActive(region.id);
          return (
            <li key={region.id}>
              <button
                type="button"
                onClick={() => onSelectRegion(active ? null : region.id)}
                aria-pressed={active}
                className={cn(
                  "w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg transition-colors",
                  active
                    ? "bg-gold-500/[0.10] ring-1 ring-gold-500/40"
                    : "hover:bg-bone/70"
                )}
              >
                <span
                  className={cn(
                    "shrink-0 h-7 w-7 rounded-full inline-flex items-center justify-center ring-1",
                    active
                      ? "bg-gold-500 text-navy-900 ring-gold-500"
                      : "bg-navy-900/[0.04] text-navy-700 ring-navy-900/15"
                  )}
                >
                  <MapPinned className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-navy-900">
                    {region.label}
                  </span>
                  <span className="block text-[11px] text-navy-700/65 leading-snug">
                    {region.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
