"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { InundationData } from "@/lib/api";
import { 
  Layers, 
  MapPin, 
  Shield, 
  Navigation, 
  Crosshair, 
  Eye, 
  Droplet,
  Compass
} from "lucide-react";

interface GEEInundationMapProps {
  location: { name: string; lat: number; lon: number; desc?: string };
  surgeHeight: number;
  inundation: InundationData | null;
  selectedCell: any;
  onSelectCell: (cell: any) => void;
}

export function GEEInundationMap({
  location,
  surgeHeight,
  inundation,
  selectedCell,
  onSelectCell,
}: GEEInundationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const baseTileRef = useRef<any>(null);
  const surgeLayerRef = useRef<any>(null);
  const sheltersLayerRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [activeBaseLayer, setActiveBaseLayer] = useState<"dark" | "satellite" | "streets">("dark");
  const [showSurgeLayer, setShowSurgeLayer] = useState<boolean>(true);
  const [showSheltersLayer, setShowSheltersLayer] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number }>({ lat: location.lat, lon: location.lon });

  // 1. Initialize Leaflet Map (Runs ONLY ONCE on mount)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      // Ensure previous instance is safely cleaned up
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }

      // Clear any remaining _leaflet_id on container element
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current!, {
        center: [location.lat, location.lon],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Track cursor position
      map.on("mousemove", (e: any) => {
        if (isMounted) {
          setCursorCoords({
            lat: parseFloat(e.latlng.lat.toFixed(4)),
            lon: parseFloat(e.latlng.lng.toFixed(4)),
          });
        }
      });

      // Default Base Tile: ESRI World Dark Gray Canvas (No API key required)
      const darkTile = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
          attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
        }
      ).addTo(map);

      baseTileRef.current = darkTile;

      // Layer Groups for Overlays
      surgeLayerRef.current = L.layerGroup().addTo(map);
      sheltersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      if (isMounted) setMapLoaded(true);

      // Invalidate size shortly after mount to ensure crisp tile layout
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Center map when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    mapInstanceRef.current.setView([location.lat, location.lon], 11, {
      animate: true,
      duration: 0.8,
    });
  }, [location, mapLoaded]);

  // 3. Switch Base Layer Tile
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || typeof window === "undefined") return;

    const changeTile = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      if (baseTileRef.current) {
        map.removeLayer(baseTileRef.current);
      }

      let newTileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
      let subdomains = "abcd";

      if (activeBaseLayer === "satellite") {
        newTileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        subdomains = "abcd";
      } else if (activeBaseLayer === "streets") {
        newTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        subdomains = "abc";
      }

      const newTile = L.tileLayer(newTileUrl, {
        maxZoom: 18,
        subdomains: subdomains,
      }).addTo(map);

      baseTileRef.current = newTile;
    };

    changeTile();
  }, [activeBaseLayer, mapLoaded]);

  // 4. Render Flooded Inundation Polygons & Safe Shelter Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || typeof window === "undefined") return;

    const renderLayers = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      // Render Inundation Polygons
      if (surgeLayerRef.current) {
        surgeLayerRef.current.clearLayers();

        if (showSurgeLayer && inundation?.flooded_zones) {
          inundation.flooded_zones.forEach((zone: any) => {
            const delta = 0.009;
            const bounds: [[number, number], [number, number]] = [
              [zone.lat - delta, zone.lon - delta],
              [zone.lat + delta, zone.lon + delta]
            ];

            const isDeep = zone.surge_depth_m > 2.5;
            const isMedium = zone.surge_depth_m > 1.0;
            const color = isDeep ? "#EF4444" : isMedium ? "#00F2FE" : "#3B82F6";

            const rect = L.rectangle(bounds as any, {
              color: color,
              weight: 1.2,
              fillColor: color,
              fillOpacity: isDeep ? 0.55 : 0.38,
            }).addTo(surgeLayerRef.current);

            rect.bindPopup(`
              <div style="color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; min-width: 170px; padding: 2px;">
                <div style="font-weight: 800; color: #00F2FE; margin-bottom: 2px;">GEE CELL: ${zone.cell_id || "GRID"}</div>
                <div style="color: #94A3B8; font-size: 10px;">${zone.lat}°N, ${zone.lon}°E</div>
                <div style="margin-top: 6px; padding: 5px 7px; background: rgba(255,255,255,0.08); border-radius: 6px; font-family: monospace;">
                  Ground Elev: <b>${zone.elevation_m}m AMSL</b><br/>
                  Surge Depth: <b style="color: ${color}">${zone.surge_depth_m}m</b><br/>
                  Status: <b style="color: ${color}">${zone.risk_level}</b>
                </div>
              </div>
            `);

            rect.on("click", () => {
              onSelectCell(zone);
            });
          });
        }
      }

      // Render Safe Shelter High-Ground Pins
      if (sheltersLayerRef.current) {
        sheltersLayerRef.current.clearLayers();

        if (showSheltersLayer && inundation?.safe_shelter_zones) {
          inundation.safe_shelter_zones.slice(0, 12).forEach((safe: any, i: number) => {
            const clearance = (safe.elevation_m - surgeHeight).toFixed(1);
            const shelterIcon = L.divIcon({
              className: "safe-shelter-pin",
              html: `
                <div style="
                  width: 28px; height: 28px; border-radius: 50%;
                  background: #10B981; border: 2px solid #FFFFFF;
                  box-shadow: 0 0 14px #10B981;
                  display: flex; align-items: center; justify-content: center;
                  font-weight: 900; font-size: 10px; color: #000;
                  cursor: pointer;
                ">
                  S${i + 1}
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            const marker = L.marker([safe.lat, safe.lon], { icon: shelterIcon })
              .addTo(sheltersLayerRef.current)
              .bindPopup(`
                <div style="color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; min-width: 180px; padding: 2px;">
                  <div style="font-weight: 800; color: #10B981; margin-bottom: 2px;">SAFE HIGH-GROUND RIDGE #${i + 1}</div>
                  <div style="color: #94A3B8; font-size: 10px;">${safe.lat}°N, ${safe.lon}°E</div>
                  <div style="margin-top: 6px; padding: 5px 7px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; font-family: monospace;">
                    Ground Elev: <b style="color: #10B981;">${safe.elevation_m}m AMSL</b><br/>
                    Safety Buffer: <b style="color: #10B981;">+${clearance}m above surge</b><br/>
                    Status: <b style="color: #34D399;">NDRF STAGING DEPOT</b>
                  </div>
                </div>
              `);

            marker.on("click", () => {
              onSelectCell(safe);
            });
          });
        }
      }

      // Sector Center Marker
      if (centerMarkerRef.current) {
        map.removeLayer(centerMarkerRef.current);
      }
      const centerIcon = L.divIcon({
        className: "center-sector-pin",
        html: `
          <div style="
            width: 14px; height: 14px; border-radius: 50%;
            background: #00F2FE; border: 2px solid #FFFFFF;
            box-shadow: 0 0 12px #00F2FE;
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      centerMarkerRef.current = L.marker([location.lat, location.lon], { icon: centerIcon })
        .addTo(map)
        .bindPopup(`<b>${location.name}</b><br/>Sector Monitoring Point`);
    };

    renderLayers();
  }, [inundation, surgeHeight, showSurgeLayer, showSheltersLayer, location, mapLoaded]);

  return (
    <div className="space-y-3">
      {/* Top Map Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0B0F1A] p-2.5 rounded-2xl border border-white/10">
        
        {/* Base Layer Switcher */}
        <div className="flex items-center bg-white/5 p-0.5 rounded-xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveBaseLayer("dark")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeBaseLayer === "dark" ? "bg-cyan-500 text-black font-bold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Dark GIS
          </button>
          <button
            onClick={() => setActiveBaseLayer("satellite")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeBaseLayer === "satellite" ? "bg-cyan-500 text-black font-bold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBaseLayer("streets")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeBaseLayer === "streets" ? "bg-cyan-500 text-black font-bold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Terrain
          </button>
        </div>

        {/* Overlays Toggles & Recenter */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSurgeLayer(!showSurgeLayer)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
              showSurgeLayer
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                : "bg-white/5 text-zinc-400 border-white/10"
            }`}
          >
            SURGE: {showSurgeLayer ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setShowSheltersLayer(!showSheltersLayer)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
              showSheltersLayer
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/5 text-zinc-400 border-white/10"
            }`}
          >
            SHELTERS: {showSheltersLayer ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([location.lat, location.lon], 11, { animate: true });
              }
            }}
            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center space-x-1"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recenter</span>
          </button>
        </div>

      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-white/10 bg-[#070A12] shadow-inner">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Floating Top Left Legend */}
        <div className="absolute top-3 left-3 z-20 bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/15 text-[11px] space-y-1.5 shadow-2xl pointer-events-auto">
          <span className="font-extrabold text-zinc-200 text-xs block">SURGE BREACH CLASSIFICATION</span>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-red-500 inline-block shadow-[0_0_8px_#EF4444]" />
            <span className="text-zinc-300">&gt;2.5m Surge (Critical Submergence)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-cyan-400 inline-block shadow-[0_0_8px_#00F2FE]" />
            <span className="text-zinc-300">1.0m - 2.5m Surge (High Inundation)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span className="text-zinc-300">0.1m - 1.0m (Shallow Water Ingress)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#10B981]" />
            <span className="text-zinc-300">Safe Shelter High-Ground Ridges</span>
          </div>
        </div>

        {/* Floating Bottom Left GPS HUD */}
        <div className="absolute bottom-3 left-3 z-20 bg-black/80 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-zinc-400 flex items-center space-x-3 shadow-2xl pointer-events-auto">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>GPS: <strong className="text-white">{cursorCoords.lat}°N, {cursorCoords.lon}°E</strong></span>
          <span className="text-zinc-600">|</span>
          <span>GRID RESOLUTION: <strong className="text-cyan-400">NASADEM 30m</strong></span>
        </div>
      </div>

      {/* Selected Cell Telemetry Bar */}
      {selectedCell && (
        <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">SELECTED CELL TELEMETRY</span>
            <strong className="text-white text-sm">
              {selectedCell.cell_id} ({selectedCell.lat}°N, {selectedCell.lon}°E)
            </strong>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <span>Ground Elevation: <strong className="text-white">{selectedCell.elevation_m}m AMSL</strong></span>
            <span>Surge Water Depth: <strong className={selectedCell.is_flooded ? "text-red-400" : "text-emerald-400"}>{selectedCell.surge_depth_m}m</strong></span>
            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
              selectedCell.is_flooded ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            }`}>
              {selectedCell.risk_level}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
