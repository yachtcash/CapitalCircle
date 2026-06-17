"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Plus, Minus, LocateFixed, Satellite, Map as MapIcon, MapPinned } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import { markerStyleFor, MARKER_STYLES, type MarkerStyleKey } from "@/lib/map/types";
import MarkerPreviewCard from "./MarkerPreviewCard";

export type MapViewProps = {
  opportunities: Opportunity[];
  selectedSlug: string | null;
  onSelectOpportunity: (opportunity: Opportunity | null) => void;
  highlightedRegionId: string | null;
};

// ---- Category pin icons (white inline SVG inner glyphs, stroke-based) ----

const ICON_SVG: Record<MarkerStyleKey, string> = {
  hotels: '<path d="M3 18V9h12a4 4 0 0 1 4 4v5"/><path d="M3 13h16"/><circle cx="7" cy="12" r="1.4"/>',
  land: '<path d="M3 20 9 9l4 7 3-4 5 8z"/>',
  "joint-ventures": '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
  energy: '<path d="M13 2 4 14h7l-2 8 9-12h-7z"/>',
  businesses: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  suppliers: '<rect x="2" y="8" width="12" height="9"/><path d="M14 11h4l3 3v3h-7z"/><circle cx="6" cy="18.5" r="1.5"/><circle cx="18" cy="18.5" r="1.5"/>',
  "real-estate": '<rect x="5" y="3" width="14" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h6"/>',
  infrastructure: '<path d="M3 21V11l6 4V11l6 4V7l6 4v10z"/>',
  other: '<circle cx="12" cy="12" r="4.5"/>',
};

const pinCache = new Map<string, L.DivIcon>();
function pinIcon(styleKey: MarkerStyleKey, selected: boolean): L.DivIcon {
  const key = `${styleKey}:${selected ? 1 : 0}`;
  const cached = pinCache.get(key);
  if (cached) return cached;
  const s = MARKER_STYLES[styleKey];
  const size = selected ? 38 : 30;
  const icoSize = selected ? 17 : 14;
  const html = `<div class="cc-pin ${selected ? "cc-pin--sel" : ""}" style="width:${size}px;height:${size}px;">
    <span class="cc-pin__body" style="background:${s.fill};border-color:${selected ? "#D4AF37" : "#ffffff"};"></span>
    <span class="cc-pin__icon"><svg viewBox="0 0 24 24" width="${icoSize}" height="${icoSize}" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG[styleKey]}</svg></span>
  </div>`;
  const icon = L.divIcon({
    html,
    className: "cc-pin-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 6],
  });
  pinCache.set(key, icon);
  return icon;
}

const clusterCache = new Map<number, L.DivIcon>();
function clusterIcon(count: number): L.DivIcon {
  const cached = clusterCache.get(count);
  if (cached) return cached;
  const size = count >= 25 ? 54 : count >= 10 ? 46 : 40;
  const html = `<div class="cc-cluster" style="width:${size}px;height:${size}px;font-size:${count >= 100 ? 13 : 15}px;">${count}</div>`;
  const icon = L.divIcon({
    html,
    className: "cc-cluster-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  clusterCache.set(count, icon);
  return icon;
}

// ---- Zoom-aware clustering (pixel-distance, transitive) ----

type Projected = { o: Opportunity; lat: number; lng: number; x: number; y: number };
type Group =
  | { kind: "single"; o: Opportunity; lat: number; lng: number }
  | { kind: "cluster"; id: string; lat: number; lng: number; count: number };

// Cluster radius scales DOWN as you zoom in, so deals reveal themselves quickly:
//   world (z<=3)  → cluster      continent (4)  → smaller clusters
//   country (5–6) → mostly individual           state/city (>=7) → all individual
function clusterRadiusForZoom(zoom: number): number {
  if (zoom >= 7) return 0; // country / state / city → never cluster
  if (zoom >= 6) return 24;
  if (zoom >= 5) return 32;
  if (zoom >= 4) return 40; // continent → smaller clusters
  return 48; // world → clustering allowed
}

function buildGroups(map: L.Map, opportunities: Opportunity[]): Group[] {
  const radius = clusterRadiusForZoom(map.getZoom());
  const pts: Projected[] = [];
  for (const o of opportunities) {
    const c = o.place?.coordinates;
    if (!c) continue;
    const p = map.latLngToContainerPoint([c.lat, c.lng]);
    pts.push({ o, lat: c.lat, lng: c.lng, x: p.x, y: p.y });
  }
  // Above the clustering ceiling, every opportunity is its own marker.
  if (radius === 0) {
    return pts.map((p) => ({ kind: "single", o: p.o, lat: p.lat, lng: p.lng }));
  }
  const visited = new Set<string>();
  const out: Group[] = [];
  for (let i = 0; i < pts.length; i++) {
    const seed = pts[i];
    if (visited.has(seed.o.id)) continue;
    const group: Projected[] = [seed];
    visited.add(seed.o.id);
    let added = true;
    while (added) {
      added = false;
      for (let j = 0; j < pts.length; j++) {
        const cand = pts[j];
        if (visited.has(cand.o.id)) continue;
        if (group.some((g) => Math.hypot(g.x - cand.x, g.y - cand.y) < radius)) {
          group.push(cand);
          visited.add(cand.o.id);
          added = true;
        }
      }
    }
    if (group.length > 1) {
      const lat = group.reduce((s, g) => s + g.lat, 0) / group.length;
      const lng = group.reduce((s, g) => s + g.lng, 0) / group.length;
      out.push({ kind: "cluster", id: `cl-${seed.o.id}`, lat, lng, count: group.length });
    } else {
      out.push({ kind: "single", o: seed.o, lat: seed.lat, lng: seed.lng });
    }
  }
  return out;
}

// ---- Marker layer (recomputes clusters on move/zoom) ----

function MarkerLayer({
  opportunities,
  selectedSlug,
  onSelectOpportunity,
}: {
  opportunities: Opportunity[];
  selectedSlug: string | null;
  onSelectOpportunity: (o: Opportunity | null) => void;
}) {
  const map = useMap();
  const [version, setVersion] = useState(0);
  useMapEvents({
    zoomend: () => setVersion((v) => v + 1),
    moveend: () => setVersion((v) => v + 1),
  });

  const groups = useMemo(
    () => buildGroups(map, opportunities),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, opportunities, version]
  );

  // Selection sync from the list: fly to the chosen opportunity, then open it.
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const pendingOpen = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedSlug) return;
    const opp = opportunities.find((o) => o.slug === selectedSlug);
    const c = opp?.place?.coordinates;
    if (!c) return;
    pendingOpen.current = selectedSlug;
    map.flyTo([c.lat, c.lng], Math.max(map.getZoom(), 11), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);
  useEffect(() => {
    if (!pendingOpen.current) return;
    const mk = markerRefs.current.get(pendingOpen.current);
    if (mk) {
      mk.openPopup();
      pendingOpen.current = null;
    }
  }, [groups]);

  return (
    <>
      {groups.map((g) => {
        if (g.kind === "cluster") {
          return (
            <Marker
              key={g.id}
              position={[g.lat, g.lng]}
              icon={clusterIcon(g.count)}
              eventHandlers={{
                click: () => map.flyTo([g.lat, g.lng], Math.min(map.getZoom() + 2, 13), { duration: 0.5 }),
              }}
            />
          );
        }
        const styleKey = markerStyleFor(g.o.category);
        const isSel = selectedSlug === g.o.slug;
        return (
          <Marker
            key={g.o.id}
            position={[g.lat, g.lng]}
            icon={pinIcon(styleKey, isSel)}
            ref={(m) => {
              if (m) markerRefs.current.set(g.o.slug, m as unknown as L.Marker);
            }}
            eventHandlers={{ click: () => onSelectOpportunity(g.o) }}
          >
            <Popup className="cc-popup" maxWidth={320} minWidth={300} closeButton={false} autoPan>
              <MarkerPreviewCard
                opportunity={g.o}
                onClose={() => {
                  map.closePopup();
                  onSelectOpportunity(null);
                }}
              />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// ---- Fit bounds to visible markers on mount + filter change ----

function FitBounds({ points, fitKey }: { points: { lat: number; lng: number }[]; fitKey: string }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8, animate: !first.current });
    first.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);
  return null;
}

// Lift the Leaflet map instance up so the overlay controls can use it.
function MapReady({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

// Leaflet caches the container size at init; if the map mounts inside a hidden
// or zero-size element (e.g. the mobile list/map toggle, or a collapsed panel)
// it never zooms/pans correctly until invalidateSize() runs. A ResizeObserver
// keeps Leaflet's size in sync with the real container at all times.
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const sync = () => map.invalidateSize({ animate: false });
    sync();
    const t = setTimeout(sync, 200);
    const ro = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    ro.observe(el);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [map]);
  return null;
}

// ---- Main ----

const CSS = `
.cc-pin-wrap{background:transparent;border:0;}
.cc-pin{position:relative;transition:transform .12s ease;}
.cc-pin:hover{transform:scale(1.08);z-index:1000;}
.cc-pin__body{position:absolute;inset:0;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:1.5px solid #fff;box-shadow:0 2px 5px rgba(10,22,40,.30),0 0 0 0.5px rgba(10,22,40,.08);}
.cc-pin__icon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
.cc-pin--sel .cc-pin__body{box-shadow:0 0 0 4px rgba(212,175,55,.35),0 3px 9px rgba(10,22,40,.42);}
.cc-cluster-wrap{background:transparent;border:0;}
.cc-cluster{display:flex;align-items:center;justify-content:center;border-radius:9999px;background:rgba(10,22,40,.94);color:#fff;font-weight:700;letter-spacing:.01em;border:2px solid #D4AF37;box-shadow:0 0 0 4px rgba(255,255,255,.55),0 4px 12px rgba(10,22,40,.32);transition:transform .12s ease;}
.cc-cluster:hover{transform:scale(1.06);}
.leaflet-popup.cc-popup .leaflet-popup-content-wrapper{padding:0;border-radius:18px;overflow:hidden;box-shadow:0 18px 44px rgba(10,22,40,.26);}
.leaflet-popup.cc-popup .leaflet-popup-content{margin:0;width:312px!important;}
.leaflet-popup.cc-popup .leaflet-popup-tip{background:#fff;}
.leaflet-container{font-family:inherit;background:#eef2f6;}
.leaflet-bar,.leaflet-control-attribution{font-family:inherit;}
.leaflet-control-attribution{font-size:10px;background:rgba(255,255,255,.7);}
`;

export default function LeafletMap({
  opportunities,
  selectedSlug,
  onSelectOpportunity,
}: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [basemap, setBasemap] = useState<"light" | "satellite">("light");

  const points = useMemo(
    () =>
      opportunities
        .filter((o) => o.place?.coordinates)
        .map((o) => ({ lat: o.place.coordinates!.lat, lng: o.place.coordinates!.lng })),
    [opportunities]
  );
  const fitKey = useMemo(
    () => opportunities.map((o) => o.slug).sort().join("|"),
    [opportunities]
  );

  const resetView = () => {
    if (!map || points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 8, duration: 0.6 });
  };

  return (
    <div className="absolute inset-0">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MapContainer
        center={[19, -82]}
        zoom={3}
        minZoom={2}
        zoomControl={false}
        scrollWheelZoom
        worldCopyJump
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        {basemap === "light" ? (
          <>
            {/* Esri "Light Gray Canvas" — institutional, English-first labels. */}
            <TileLayer
              key="esri-gray-base"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri — Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
              maxNativeZoom={16}
              maxZoom={19}
              zIndex={1}
            />
            <TileLayer
              key="esri-gray-ref"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={16}
              maxZoom={19}
              zIndex={2}
            />
          </>
        ) : (
          <>
            <TileLayer
              key="esri-sat"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
              maxZoom={19}
              zIndex={1}
            />
            {/* English place + boundary labels over the imagery. */}
            <TileLayer
              key="esri-sat-ref"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              zIndex={2}
            />
          </>
        )}
        <MarkerLayer
          opportunities={opportunities}
          selectedSlug={selectedSlug}
          onSelectOpportunity={onSelectOpportunity}
        />
        <FitBounds points={points} fitKey={fitKey} />
        <ResizeHandler />
        <MapReady onReady={setMap} />
      </MapContainer>

      {/* Controls */}
      {map ? (
        <div className="absolute top-3 right-3 z-[600] flex flex-col gap-2">
          <div className="flex flex-col rounded-xl bg-white ring-1 ring-navy-900/[0.1] shadow-md overflow-hidden">
            <CtrlBtn label="Zoom in" onClick={() => map.zoomIn()}>
              <Plus className="h-4 w-4" strokeWidth={2.4} />
            </CtrlBtn>
            <div className="h-px bg-navy-900/[0.08]" />
            <CtrlBtn label="Zoom out" onClick={() => map.zoomOut()}>
              <Minus className="h-4 w-4" strokeWidth={2.4} />
            </CtrlBtn>
          </div>
          <CtrlBtn label="Reset view" onClick={resetView} rounded>
            <LocateFixed className="h-4 w-4" strokeWidth={2.2} />
          </CtrlBtn>
          <button
            type="button"
            onClick={() => setBasemap((b) => (b === "light" ? "satellite" : "light"))}
            aria-pressed={basemap === "satellite"}
            title={basemap === "light" ? "Switch to satellite" : "Switch to map"}
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-white ring-1 ring-navy-900/[0.1] shadow-md text-navy-900 hover:ring-gold-500/50 transition-colors"
          >
            {basemap === "light" ? (
              <Satellite className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
            ) : (
              <MapIcon className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
            )}
          </button>
        </div>
      ) : null}

      {/* Empty state */}
      {opportunities.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
          <div className="bg-white/95 ring-1 ring-navy-900/[0.08] rounded-2xl p-6 max-w-sm text-center shadow-lg pointer-events-auto">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 mx-auto">
              <MapPinned className="h-4 w-4" strokeWidth={2} />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-navy-900">No opportunities in view</h3>
            <p className="mt-1 text-xs text-navy-700/65 leading-relaxed">
              Try widening your filters or picking a different region.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CtrlBtn({
  label,
  onClick,
  children,
  rounded,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  rounded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`h-9 w-9 inline-flex items-center justify-center text-navy-900 hover:bg-bone/70 transition-colors ${
        rounded ? "rounded-xl bg-white ring-1 ring-navy-900/[0.1] shadow-md" : ""
      }`}
    >
      {children}
    </button>
  );
}
