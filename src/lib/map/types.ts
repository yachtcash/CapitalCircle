import type { Opportunity } from "@/data/opportunities";

export type MapMarkerData = {
  opportunity: Opportunity;
  /** Projected SVG coordinates (in viewBox space). */
  x: number;
  y: number;
};

export type MapCluster = {
  id: string;
  x: number;
  y: number;
  markers: MapMarkerData[];
};

export type MapMarkerOrCluster =
  | { kind: "marker"; marker: MapMarkerData }
  | { kind: "cluster"; cluster: MapCluster };

export type MapBounds = {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
};

export type MapViewBox = {
  width: number;
  height: number;
};

/**
 * Map a category string to a marker style. Used by both the SVG markers
 * on the map and the small legend chips.
 */
export type MarkerStyleKey =
  | "hotels"
  | "land"
  | "joint-ventures"
  | "energy"
  | "businesses"
  | "suppliers"
  | "real-estate"
  | "infrastructure"
  | "other";

export type MarkerStyle = {
  key: MarkerStyleKey;
  label: string;
  fill: string; // SVG color
  ring: string; // hover ring color
  glyph: string; // 1-2 letter glyph (instead of an icon)
};

/** Map a category label → marker style key. */
export function markerStyleFor(category: string): MarkerStyleKey {
  switch (category) {
    case "Hotels & Resorts":
    case "Hospitality":
      return "hotels";
    case "Land Opportunities":
      return "land";
    case "Joint Ventures":
      return "joint-ventures";
    case "Energy":
      return "energy";
    case "Business Acquisitions":
    case "Manufacturing & Materials":
    case "Commercial Services":
      return "businesses";
    case "Suppliers & Logistics":
      return "suppliers";
    case "Real Estate Development":
    case "Construction Projects":
      return "real-estate";
    case "Infrastructure":
    case "Investment Opportunities":
      return "infrastructure";
    default:
      return "other";
  }
}

export const MARKER_STYLES: Record<MarkerStyleKey, MarkerStyle> = {
  hotels: {
    key: "hotels",
    label: "Hotels & Hospitality",
    fill: "#D4AF37", // gold
    ring: "#8C6F14",
    glyph: "H",
  },
  land: {
    key: "land",
    label: "Land",
    fill: "#16a34a", // emerald-600
    ring: "#15803d",
    glyph: "L",
  },
  "joint-ventures": {
    key: "joint-ventures",
    label: "Joint Ventures",
    fill: "#0284c7", // sky-600
    ring: "#075985",
    glyph: "J",
  },
  energy: {
    key: "energy",
    label: "Energy",
    fill: "#ea580c", // orange-600
    ring: "#9a3412",
    glyph: "E",
  },
  businesses: {
    key: "businesses",
    label: "Businesses",
    fill: "#9333ea", // violet-600
    ring: "#6b21a8",
    glyph: "B",
  },
  suppliers: {
    key: "suppliers",
    label: "Suppliers & Logistics",
    fill: "#dc2626", // rose-600
    ring: "#991b1b",
    glyph: "S",
  },
  "real-estate": {
    key: "real-estate",
    label: "Real Estate",
    fill: "#0A1628", // navy
    ring: "#1A3160",
    glyph: "R",
  },
  infrastructure: {
    key: "infrastructure",
    label: "Infrastructure",
    fill: "#0d9488", // teal-600
    ring: "#115e59",
    glyph: "I",
  },
  other: {
    key: "other",
    label: "Other",
    fill: "#475569", // slate-600
    ring: "#334155",
    glyph: "•",
  },
};
