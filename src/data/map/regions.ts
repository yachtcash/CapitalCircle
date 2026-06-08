// Region definitions for the "Explore By Region" panel on /map.
//
// Each region knows:
//  - bbox in lat/lng (used to highlight on the map and to filter by location)
//  - canonical country names for filter integration

import type { MapBounds } from "@/lib/map/types";

export type MapRegion = {
  id: string;
  label: string;
  description: string;
  bbox: MapBounds;
  /** Canonical country values (matching opportunity.place.country) used to filter results. */
  countries: string[];
};

export const MAP_REGIONS: MapRegion[] = [
  {
    id: "mexico",
    label: "Mexico",
    description: "Riviera Maya, Pacific coast, Sonora",
    bbox: { minLng: -118, maxLng: -86, minLat: 14, maxLat: 33 },
    countries: ["Mexico"],
  },
  {
    id: "united-states",
    label: "United States",
    description: "Florida, Texas, and beyond",
    bbox: { minLng: -125, maxLng: -66, minLat: 24, maxLat: 50 },
    countries: ["United States"],
  },
  {
    id: "caribbean",
    label: "Caribbean",
    description: "Cuba, Dominican Republic, Bahamas, Cayman",
    bbox: { minLng: -86, maxLng: -60, minLat: 10, maxLat: 26 },
    countries: ["Cuba", "Dominican Republic", "Bahamas", "Cayman Islands"],
  },
  {
    id: "europe",
    label: "Europe",
    description: "Western and Mediterranean",
    bbox: { minLng: -12, maxLng: 30, minLat: 36, maxLat: 60 },
    countries: [
      "United Kingdom",
      "Ireland",
      "France",
      "Spain",
      "Portugal",
      "Italy",
    ],
  },
  {
    id: "middle-east",
    label: "Middle East",
    description: "GCC and Levant",
    bbox: { minLng: 25, maxLng: 60, minLat: 12, maxLat: 42 },
    countries: ["UAE", "Saudi Arabia", "Qatar", "Oman", "Israel"],
  },
];

export function getRegionById(id: string): MapRegion | undefined {
  return MAP_REGIONS.find((r) => r.id === id);
}
