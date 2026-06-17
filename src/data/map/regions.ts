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
  {
    id: "canada",
    label: "Canada",
    description: "Toronto, Vancouver, Montréal",
    bbox: { minLng: -141, maxLng: -52, minLat: 42, maxLat: 70 },
    countries: ["Canada"],
  },
  {
    id: "central-america",
    label: "Central America",
    description: "Costa Rica, Panama, Belize",
    bbox: { minLng: -92, maxLng: -77, minLat: 7, maxLat: 18 },
    countries: ["Costa Rica", "Panama", "Guatemala", "Belize", "Nicaragua", "Honduras"],
  },
  {
    id: "south-america",
    label: "South America",
    description: "Brazil, Chile, Colombia, Argentina",
    bbox: { minLng: -82, maxLng: -34, minLat: -56, maxLat: 13 },
    countries: ["Brazil", "Chile", "Colombia", "Argentina", "Peru", "Uruguay"],
  },
  {
    id: "asia",
    label: "Asia",
    description: "Singapore, Japan, India, UAE",
    bbox: { minLng: 60, maxLng: 150, minLat: 5, maxLat: 55 },
    countries: ["Singapore", "Japan", "India", "China", "Thailand", "Indonesia", "Vietnam"],
  },
  {
    id: "africa",
    label: "Africa",
    description: "South Africa, Kenya, Morocco",
    bbox: { minLng: -18, maxLng: 52, minLat: -35, maxLat: 37 },
    countries: ["South Africa", "Kenya", "Nigeria", "Egypt", "Morocco", "Ghana"],
  },
];

export function getRegionById(id: string): MapRegion | undefined {
  return MAP_REGIONS.find((r) => r.id === id);
}
