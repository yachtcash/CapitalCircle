"use client";

import type { MapCluster } from "@/lib/map/types";

type Props = {
  cluster: MapCluster;
  onSelect?: (cluster: MapCluster) => void;
};

export default function MapClusterBadge({ cluster, onSelect }: Props) {
  const count = cluster.markers.length;
  return (
    <g
      transform={`translate(${cluster.x}, ${cluster.y})`}
      onClick={() => onSelect?.(cluster)}
      role="button"
      tabIndex={0}
      aria-label={`Cluster of ${count} opportunities`}
      className="cursor-pointer focus:outline-none"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(cluster);
        }
      }}
    >
      <circle r="24" fill="#D4AF37" fillOpacity="0.18" />
      <circle r="18" fill="#0A1628" stroke="#D4AF37" strokeWidth="2.5" />
      <text
        textAnchor="middle"
        y="4"
        fontSize="13"
        fontFamily="ui-sans-serif, system-ui"
        fontWeight="700"
        fill="#D4AF37"
        pointerEvents="none"
      >
        {count}
      </text>
    </g>
  );
}
