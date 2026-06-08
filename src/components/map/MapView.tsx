"use client";

import { useMemo } from "react";
import { MapPinned } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { clusterMarkers } from "@/lib/map/clustering";
import { projectLngLat, rectForBounds, MAP_VIEWBOX } from "@/lib/map/projection";
import type { MapMarkerData, MapCluster } from "@/lib/map/types";
import { MAP_REGIONS } from "@/data/map/regions";
import WorldMapSvg from "./WorldMapSvg";
import MapMarker from "./MapMarker";
import MapClusterBadge from "./MapCluster";
import MarkerPreviewCard from "./MarkerPreviewCard";

type Props = {
  opportunities: Opportunity[];
  selectedSlug: string | null;
  onSelectOpportunity: (opportunity: Opportunity | null) => void;
  highlightedRegionId: string | null;
};

export default function MapView({
  opportunities,
  selectedSlug,
  onSelectOpportunity,
  highlightedRegionId,
}: Props) {
  const markers = useMemo<MapMarkerData[]>(() => {
    return opportunities
      .filter((o) => o.place?.coordinates)
      .map((o) => {
        const coords = o.place.coordinates!;
        const { x, y } = projectLngLat(coords.lng, coords.lat);
        return { opportunity: o, x, y };
      });
  }, [opportunities]);

  const items = useMemo(() => clusterMarkers(markers, 50), [markers]);

  const selected = selectedSlug
    ? markers.find((m) => m.opportunity.slug === selectedSlug) ?? null
    : null;

  const highlighted = highlightedRegionId
    ? MAP_REGIONS.find((r) => r.id === highlightedRegionId)
    : null;
  const highlightRect = highlighted ? rectForBounds(highlighted.bbox) : null;

  // Preview card position: clamp inside viewBox so it doesn't fall off
  // the right or bottom of the visible map.
  let previewX = 0;
  let previewY = 0;
  if (selected) {
    const CARD_W = 280;
    const CARD_H = 250;
    previewX = Math.min(
      MAP_VIEWBOX.width - CARD_W - 24,
      Math.max(24, selected.x - CARD_W / 2)
    );
    previewY = Math.max(24, selected.y - CARD_H - 32);
  }

  return (
    <div className="relative h-full w-full bg-bone/40 overflow-hidden">
      <WorldMapSvg
        ariaLabel="Map of opportunities"
        className="absolute inset-0 w-full h-full"
      >
        {highlightRect ? (
          <rect
            x={highlightRect.x}
            y={highlightRect.y}
            width={highlightRect.width}
            height={highlightRect.height}
            fill="#D4AF37"
            fillOpacity="0.10"
            stroke="#D4AF37"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeDasharray="6 4"
            rx="6"
          />
        ) : null}

        {items.map((it) => {
          if (it.kind === "marker") {
            const isSelected = selected?.opportunity.id === it.marker.opportunity.id;
            return (
              <MapMarker
                key={it.marker.opportunity.id}
                marker={it.marker}
                selected={isSelected}
                onSelect={(m) => onSelectOpportunity(m.opportunity)}
              />
            );
          }
          return (
            <MapClusterBadge
              key={it.cluster.id}
              cluster={it.cluster}
              onSelect={(c: MapCluster) => onSelectOpportunity(c.markers[0].opportunity)}
            />
          );
        })}
      </WorldMapSvg>

      {/* Floating preview overlay */}
      {selected ? (
        <div
          className="absolute z-10 w-[280px] pointer-events-auto"
          style={{
            left: `${(previewX / MAP_VIEWBOX.width) * 100}%`,
            top: `${(previewY / MAP_VIEWBOX.height) * 100}%`,
          }}
        >
          <MarkerPreviewCard
            opportunity={selected.opportunity}
            onClose={() => onSelectOpportunity(null)}
          />
        </div>
      ) : null}

      {/* Empty state */}
      {opportunities.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 ring-1 ring-navy-900/[0.08] rounded-2xl p-6 max-w-sm text-center shadow-lg pointer-events-auto">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 mx-auto">
              <MapPinned className="h-4 w-4" strokeWidth={2} />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-navy-900">
              No opportunities in view
            </h3>
            <p className="mt-1 text-xs text-navy-700/65 leading-relaxed">
              Try widening your filters or picking a different region.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
