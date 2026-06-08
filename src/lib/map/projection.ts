// Equirectangular projection from lat/lng to SVG viewBox coords.
//
// The mock map covers longitudes -180 → 60 (240°) and latitudes -55 → 75
// (130°) — enough to show the Americas, Atlantic, Europe, Africa, and the
// western edge of the Middle East. Pan / zoom is not implemented; this is
// a stylized backdrop.

import type { MapBounds, MapViewBox } from "./types";

export const MAP_VIEWBOX: MapViewBox = { width: 1200, height: 700 };

export const MAP_BOUNDS: MapBounds = {
  minLng: -180,
  maxLng: 60,
  minLat: -55,
  maxLat: 75,
};

export function projectLngLat(
  lng: number,
  lat: number,
  bounds: MapBounds = MAP_BOUNDS,
  viewBox: MapViewBox = MAP_VIEWBOX
): { x: number; y: number } {
  const x =
    ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * viewBox.width;
  const y =
    ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * viewBox.height;
  return { x, y };
}

export function withinBounds(
  lng: number,
  lat: number,
  bounds: MapBounds
): boolean {
  return (
    lng >= bounds.minLng &&
    lng <= bounds.maxLng &&
    lat >= bounds.minLat &&
    lat <= bounds.maxLat
  );
}

/**
 * Highlight rectangle for a region — SVG rect coords from the region's
 * lat/lng bbox.
 */
export function rectForBounds(bounds: MapBounds): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const tl = projectLngLat(bounds.minLng, bounds.maxLat);
  const br = projectLngLat(bounds.maxLng, bounds.minLat);
  return {
    x: tl.x,
    y: tl.y,
    width: br.x - tl.x,
    height: br.y - tl.y,
  };
}
