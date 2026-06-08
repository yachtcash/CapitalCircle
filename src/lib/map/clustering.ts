// Simple distance-based marker clustering.
//
// Mock behaviour for the map view: any two markers whose projected SVG
// positions are within `threshold` pixels become part of the same cluster.
// Clustering is transitive — A near B, B near C → all three cluster together.

import type {
  MapCluster,
  MapMarkerData,
  MapMarkerOrCluster,
} from "./types";

const DEFAULT_THRESHOLD = 50;

export function clusterMarkers(
  markers: MapMarkerData[],
  threshold: number = DEFAULT_THRESHOLD
): MapMarkerOrCluster[] {
  const visited = new Set<string>();
  const out: MapMarkerOrCluster[] = [];

  for (let i = 0; i < markers.length; i++) {
    const seed = markers[i];
    if (visited.has(seed.opportunity.id)) continue;

    const group: MapMarkerData[] = [seed];
    visited.add(seed.opportunity.id);

    let added = true;
    while (added) {
      added = false;
      for (let j = 0; j < markers.length; j++) {
        const candidate = markers[j];
        if (visited.has(candidate.opportunity.id)) continue;
        const isNear = group.some(
          (g) => Math.hypot(g.x - candidate.x, g.y - candidate.y) < threshold
        );
        if (isNear) {
          group.push(candidate);
          visited.add(candidate.opportunity.id);
          added = true;
        }
      }
    }

    if (group.length > 1) {
      const cx = group.reduce((sum, m) => sum + m.x, 0) / group.length;
      const cy = group.reduce((sum, m) => sum + m.y, 0) / group.length;
      const cluster: MapCluster = {
        id: `cluster-${seed.opportunity.id}`,
        x: cx,
        y: cy,
        markers: group,
      };
      out.push({ kind: "cluster", cluster });
    } else {
      out.push({ kind: "marker", marker: group[0] });
    }
  }

  return out;
}
