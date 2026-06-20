"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Globe2, ArrowRight } from "lucide-react";

import WorldMapSvg from "@/components/map/WorldMapSvg";
import { projectLngLat, withinBounds, MAP_BOUNDS } from "@/lib/map/projection";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities } from "@/data/opportunities";

export default function HomeMapPreview() {
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;

  const markers = useMemo(() => {
    return pool
      .map((o) => o.place?.coordinates)
      .filter((c): c is { lat: number; lng: number } => !!c && withinBounds(c.lng, c.lat, MAP_BOUNDS))
      .map((c) => projectLngLat(c.lng, c.lat));
  }, [pool]);

  const countries = useMemo(
    () => new Set(pool.map((o) => o.place?.country).filter(Boolean)).size,
    [pool]
  );

  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="rounded-3xl bg-navy-900 text-white overflow-hidden ring-1 ring-navy-900">
          <div className="grid lg:grid-cols-[1fr_1.3fr] items-center">
            {/* Copy */}
            <div className="p-7 md:p-10">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold">
                <Globe2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                Global Marketplace
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                Deal flow across {countries} countries
              </h2>
              <p className="mt-3 text-sm md:text-base text-white/70 max-w-md leading-relaxed">
                Explore opportunities geographically — from coastal resort developments to
                infrastructure and energy across the Americas, Europe, and beyond.
              </p>
              <div className="mt-6 flex items-center gap-6">
                <div>
                  <div className="text-2xl font-semibold tabular-nums">{markers.length}</div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-gold-400/90">Mapped deals</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold tabular-nums">{countries}</div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-gold-400/90">Countries</div>
                </div>
              </div>
              <Link
                href="/map"
                className="group mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
              >
                Explore Global Opportunities
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Map */}
            <div className="relative h-full min-h-[280px] md:min-h-[360px] bg-navy-800/40">
              <Link href="/map" aria-label="Open the interactive map" className="block h-full">
                <WorldMapSvg className="w-full h-full opacity-95" ariaLabel="Opportunities by location">
                  {markers.map((m, i) => (
                    <g key={i}>
                      <circle cx={m.x} cy={m.y} r={10} fill="#D4AF37" opacity={0.18} />
                      <circle cx={m.x} cy={m.y} r={4.5} fill="#D4AF37" stroke="#0A1628" strokeWidth={1.2} />
                    </g>
                  ))}
                </WorldMapSvg>
                <div className="absolute inset-0 bg-gradient-to-r from-navy-900/40 via-transparent to-transparent pointer-events-none" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
