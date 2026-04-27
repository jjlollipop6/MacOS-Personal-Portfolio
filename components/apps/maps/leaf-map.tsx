"use client";

import { useEffect, useRef } from "react";

const LOOP_LAT = 41.8827;
const LOOP_LNG = -87.6233;
const ZOOM = 15;

export interface MapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface LeafMapProps {
  mapType?: "standard" | "transit" | "satellite";
  onReady?: (handle: MapHandle) => void;
}

// CTA L train routes through The Loop (accurate coordinates)
const CTA_LOOP_ELEVATED: [number, number][] = [
  [41.8857, -87.6280],
  [41.8857, -87.6266],
  [41.8857, -87.6252],
  [41.8857, -87.6239],
  [41.8857, -87.6225],
  [41.8838, -87.6225],
  [41.8818, -87.6225],
  [41.8800, -87.6225],
  [41.8800, -87.6252],
  [41.8800, -87.6266],
  [41.8800, -87.6280],
  [41.8818, -87.6280],
  [41.8838, -87.6280],
  [41.8857, -87.6280],
];

const BLUE_LINE: [number, number][] = [
  [41.8782, -87.6296],
  [41.8800, -87.6280],
  [41.8818, -87.6266],
  [41.8830, -87.6248],
  [41.8840, -87.6234],
];

const GREEN_LINE: [number, number][] = [
  [41.8767, -87.6225],
  [41.8783, -87.6225],
  [41.8800, -87.6225],
];

const ORANGE_LINE: [number, number][] = [
  [41.8800, -87.6280],
  [41.8790, -87.6295],
  [41.8775, -87.6318],
];

const PINK_LINE: [number, number][] = [
  [41.8800, -87.6280],
  [41.8800, -87.6310],
  [41.8800, -87.6340],
];

const STATIONS = [
  { lat: 41.8857, lng: -87.6280, name: "Lake" },
  { lat: 41.8857, lng: -87.6225, name: "Randolph/Wabash" },
  { lat: 41.8838, lng: -87.6225, name: "Washington/Wabash" },
  { lat: 41.8818, lng: -87.6225, name: "Adams/Wabash" },
  { lat: 41.8800, lng: -87.6252, name: "Harold Washington Library" },
  { lat: 41.8800, lng: -87.6280, name: "Quincy" },
  { lat: 41.8818, lng: -87.6280, name: "LaSalle/Van Buren" },
  { lat: 41.8838, lng: -87.6280, name: "Clark/Lake" },
];

const TILE_URLS = {
  standard: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  transit:  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

const TILE_ATTR = {
  standard: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
  transit:  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
  satellite: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA',
};

function injectLeafletCSS(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById("leaflet-css-link")) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.id = "leaflet-css-link";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

export function LeafMap({ mapType = "transit", onReady }: LeafMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transitGroupRef = useRef<any>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    injectLeafletCSS().then(() => {
      import("leaflet").then((L) => {
        if (!mapDivRef.current || mapRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapDivRef.current!, {
          center: [LOOP_LAT, LOOP_LNG],
          zoom: ZOOM,
          zoomControl: false,
          attributionControl: true,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
        });
        mapRef.current = map;

        // Force correct size after mount
        setTimeout(() => map.invalidateSize(), 50);

        // Base tile layer
        const tile = L.tileLayer(TILE_URLS.transit, {
          attribution: TILE_ATTR.transit,
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(map);
        tileRef.current = tile;

        // Transit overlay group
        const transitGroup = L.layerGroup().addTo(map);
        transitGroupRef.current = transitGroup;

        const addLine = (coords: [number, number][], color: string, w = 4) =>
          L.polyline(coords, { color, weight: w, opacity: 0.92 }).addTo(transitGroup);

        addLine(CTA_LOOP_ELEVATED, "#C60C30", 5);
        addLine(BLUE_LINE, "#00A1DE", 4);
        addLine(GREEN_LINE, "#009B3A", 4);
        addLine(ORANGE_LINE, "#F9461C", 4);
        addLine(PINK_LINE, "#E27EA6", 4);

        const stationIcon = L.divIcon({
          html: `<div style="width:11px;height:11px;background:white;border:2.5px solid #555;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          className: "",
          iconSize: [11, 11],
          iconAnchor: [5.5, 5.5],
        });

        STATIONS.forEach((s) => {
          L.marker([s.lat, s.lng], { icon: stationIcon })
            .bindTooltip(`<b>${s.name}</b>`, { direction: "top", offset: [0, -10] })
            .addTo(transitGroup);
        });

        // Location pin
        const pinIcon = L.divIcon({
          html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C7.27 0 1 6.27 1 14C1 24.75 15 40 15 40C15 40 29 24.75 29 14C29 6.27 22.73 0 15 0Z"
              fill="#FF3B30" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))"/>
            <circle cx="15" cy="14" r="6.5" fill="white"/>
            <circle cx="15" cy="14" r="3" fill="#FF3B30"/>
          </svg>`,
          className: "",
          iconSize: [30, 40],
          iconAnchor: [15, 40],
        });

        L.marker([LOOP_LAT, LOOP_LNG], { icon: pinIcon })
          .bindPopup(
            `<div style="font-family:-apple-system,sans-serif;font-size:13px;font-weight:700">The Loop</div>
             <div style="font-family:-apple-system,sans-serif;font-size:12px;color:#666;margin-top:2px">Chicago, IL</div>`
          )
          .addTo(map);

        // Expose handle via callback
        onReady?.({
          zoomIn: () => map.zoomIn(),
          zoomOut: () => map.zoomOut(),
        });
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        tileRef.current = null;
        transitGroupRef.current = null;
      }
    };
    // onReady is intentionally excluded to avoid re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tile layer when mapType changes
  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;

      tileRef.current.remove();
      const url = TILE_URLS[mapType];
      const attr = TILE_ATTR[mapType];

      const newTile = L.tileLayer(url, {
        attribution: attr,
        subdomains: "abcd",
        maxZoom: 20,
      });
      newTile.addTo(map);
      newTile.bringToBack();
      tileRef.current = newTile;

      // Show/hide transit layer
      if (transitGroupRef.current) {
        if (mapType === "satellite") {
          map.removeLayer(transitGroupRef.current);
        } else {
          if (!map.hasLayer(transitGroupRef.current)) {
            map.addLayer(transitGroupRef.current);
          }
        }
      }
    });
  }, [mapType]);

  return (
    <div
      ref={mapDivRef}
      style={{ width: "100%", height: "100%" }}
    >
      <style>{`
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.72) !important;
          border-radius: 4px 0 0 0 !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.18) !important;
          padding: 0 !important;
        }
        .leaflet-popup-content { margin: 12px 16px !important; }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-tooltip {
          background: rgba(255,255,255,0.95) !important;
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 3px 12px rgba(0,0,0,0.15) !important;
          font-family: -apple-system, sans-serif !important;
          font-size: 12px !important;
          padding: 5px 10px !important;
        }
        .leaflet-tooltip::before { display: none !important; }
      `}</style>
    </div>
  );
}
