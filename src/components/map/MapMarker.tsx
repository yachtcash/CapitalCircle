"use client";

import type { MapMarkerData } from "@/lib/map/types";
import { MARKER_STYLES, markerStyleFor } from "@/lib/map/types";

type Props = {
  marker: MapMarkerData;
  selected?: boolean;
  onSelect?: (marker: MapMarkerData) => void;
};

export default function MapMarker({ marker, selected = false, onSelect }: Props) {
  const styleKey = markerStyleFor(marker.opportunity.category);
  const style = MARKER_STYLES[styleKey];

  return (
    <g
      transform={`translate(${marker.x}, ${marker.y})`}
      onClick={() => onSelect?.(marker)}
      role="button"
      tabIndex={0}
      aria-label={`${marker.opportunity.title} — ${marker.opportunity.location}`}
      className="cursor-pointer focus:outline-none"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(marker);
        }
      }}
    >
      {/* Soft glow ring (selected only) */}
      {selected ? (
        <circle r="22" fill={style.fill} fillOpacity="0.18" />
      ) : null}
      {/* Outer ring */}
      <circle
        r={selected ? "16" : "13"}
        fill="white"
        stroke={style.fill}
        strokeWidth={selected ? "3" : "2"}
      />
      {/* Inner dot */}
      <circle r={selected ? "10" : "8"} fill={style.fill} />
      {/* Category glyph */}
      <text
        textAnchor="middle"
        y="3.5"
        fontSize="10"
        fontFamily="ui-sans-serif, system-ui"
        fontWeight="700"
        fill="white"
        pointerEvents="none"
      >
        {style.glyph}
      </text>
    </g>
  );
}
