"use client";

import dynamic from "next/dynamic";
import { MapPinned } from "lucide-react";
import type { MapViewProps } from "./LeafletMap";

// Leaflet touches `window`/`document`, so the real map is client-only.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-bone/40">
      <div className="inline-flex items-center gap-2 text-sm text-navy-700/55">
        <MapPinned className="h-4 w-4 animate-pulse text-gold-600" strokeWidth={2.2} />
        Loading map…
      </div>
    </div>
  ),
});

export default function MapView(props: MapViewProps) {
  return <LeafletMap {...props} />;
}
