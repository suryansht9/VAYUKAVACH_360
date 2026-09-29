"use client";

import React, { useEffect, useRef, useState } from "react";
import { InfrastructureAsset, CycloneTrack, InundationData } from "@/lib/api";
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  Wind, 
  Eye, 
  Droplet, 
  Navigation, 
  Maximize2,
  Minimize2,
  Crosshair,
  Compass
} from "lucide-react";

interface CommandMapProps {
  assets: InfrastructureAsset[];
  track: CycloneTrack | null;
  inundation: InundationData | null;
  selectedAsset: InfrastructureAsset | null;
  onSelectAsset: (asset: InfrastructureAsset) => void;
  showGEELayer: boolean;
  onToggleGEE: () => void;
}

export function CommandMap({
  assets,
  track,
  inundation,
  selectedAsset,
  onSelectAsset,
  showGEELayer,
  onToggleGEE,
}: CommandMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const trackPolylineRef = useRef<any>(null);
  const surgeLayerGroupRef = useRef<any>(null);

  const [activeBaseLayer, setActiveBaseLayer] = useState<"dark" | "satellite" | "streets">("dark");
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number }>({ lat: 20.2684, lon: 86.6715 });

  // Initialize Leaflet Map safely on client side
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Create map centered on Bay of Bengal / Odisha coast
      const map = L.map(mapContainerRef.current!, {
        center: [20.2684, 86.6715],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Track mouse coordinates
      map.on("mousemove", (e: any) => {
        if (isMounted) {
          setCursorCoords({
            lat: parseFloat(e.latlng.lat.toFixed(4)),
            lon: parseFloat(e.latlng.lng.toFixed(4)),
          });
        }
      });

      // Layer groups
      surgeLayerGroupRef.current = L.layerGroup().addTo(map);

      // Initial base layer (ESRI Dark Canvas)
      const baseTile = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18 }
      ).addTo(map);

      (map as any)._currentBaseTile = baseTile;

      if (isMounted) setMapLoaded(true);
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    const updateTile = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      if (map._currentBaseTile) {
        map.removeLayer(map._currentBaseTile);
      }

      let newTileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
      if (activeBaseLayer === "satellite") {
        newTileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      } else if (activeBaseLayer === "streets") {
        newTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      }

      const newTile = L.tileLayer(newTileUrl, { maxZoom: 18, subdomains: "abcd" }).addTo(map);
      map._currentBaseTile = newTile;
    };

    updateTile();
  }, [activeBaseLayer]);

  // Render Infrastructure Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || typeof window === "undefined") return;

    const renderMarkers = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      markersRef.current = {};

      assets.forEach((asset) => {
        const isSelected = selectedAsset?.id === asset.id;
        const isCriticalRisk = asset.elevation_m < 2.5;
        const isModerateRisk = asset.elevation_m >= 2.5 && asset.elevation_m < 4.0;

        const pinColor = isCriticalRisk ? "#EF4444" : isModerateRisk ? "#F59E0B" : "#10B981";
        const pulseEffect = isCriticalRisk ? "animation: pulse 1.5s infinite;" : "";

        // Custom HTML Marker Pin
        const customIcon = L.divIcon({
          className: "custom-gis-pin",
          html: `
            <div style="
              width: ${isSelected ? "32px" : "24px"};
              height: ${isSelected ? "32px" : "24px"};
              border-radius: 50%;
              background: ${pinColor};
              border: 2px solid ${isSelected ? "#00F2FE" : "#FFFFFF"};
              box-shadow: 0 0 ${isSelected ? "18px #00F2FE" : "10px " + pinColor};
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
              ${pulseEffect}
            ">
              <span style="font-size: 10px; font-weight: 900; color: #000;">
                ${asset.type.charAt(0)}
              </span>
            </div>
          `,
          iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
          iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
        });

        const marker = L.marker([asset.latitude, asset.longitude], { icon: customIcon })
          .addTo(map)
          .on("click", () => {
            onSelectAsset(asset);
          });

        // Popup with rich telemetry
        const popupContent = `
          <div style="color: #F3F4F6; font-family: sans-serif; font-size: 12px; min-width: 180px; padding: 4px;">
            <div style="font-weight: 800; font-size: 13px; color: #00F2FE; margin-bottom: 2px;">${asset.name}</div>
            <div style="color: #9CA3AF; font-size: 11px;">${asset.type} • ${asset.panchayat}</div>
            <div style="margin-top: 6px; padding: 4px 6px; background: rgba(255,255,255,0.08); border-radius: 6px; font-family: monospace; font-size: 11px;">
              Ground Elev: <b>${asset.elevation_m}m AMSL</b><br/>
              Criticality: <b style="color: ${pinColor}">${asset.criticality}</b><br/>
              Beneficiaries: <b>${(asset.serves_population || 0).toLocaleString()}</b>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);

        markersRef.current[asset.id] = marker;
      });
    };

    renderMarkers();
  }, [assets, selectedAsset, mapLoaded]);

  // Pan to selected asset
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedAsset) return;
    mapInstanceRef.current.panTo([selectedAsset.latitude, selectedAsset.longitude], {
      animate: true,
      duration: 0.8,
    });
  }, [selectedAsset]);

  // Render Cyclone Track Vector & Eye
  useEffect(() => {
    if (!mapInstanceRef.current || !track || !mapLoaded || typeof window === "undefined") return;

    const renderTrack = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      if (trackPolylineRef.current) {
        map.removeLayer(trackPolylineRef.current);
        trackPolylineRef.current = null;
      }

      if (track.forecast_track && track.forecast_track.length > 0) {
        const latlngs = track.forecast_track.map((pt): [number, number] => [pt.lat, pt.lon]);

        // Draw track polyline
        trackPolylineRef.current = L.polyline(latlngs as any, {
          color: "#F59E0B",
          weight: 3,
          dashArray: "6, 8",
          opacity: 0.85,
        }).addTo(map);

        // Add Eye of Cyclone Marker
        const eye = track.current_coordinates;
        if (eye) {
          const eyeIcon = L.divIcon({
            className: "cyclone-eye-pin",
            html: `
              <div style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.25);
                border: 2px dashed #EF4444;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: spin 8s linear infinite;
              ">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #EF4444; box-shadow: 0 0 12px #EF4444;"></div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          L.marker([eye.lat, eye.lon], { icon: eyeIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-size: 12px; font-family: sans-serif; color: #fff;">
                <b style="color: #EF4444;">CYCLONE EYE: ${track.name}</b><br/>
                Wind: <b>${track.max_sustained_wind_kmh} km/h</b><br/>
                Pressure: <b>${track.central_pressure_hpa} hPa</b>
              </div>
            `);
        }
      }
    };

    renderTrack();
  }, [track, mapLoaded]);

  // Render GEE Surge Inundation Polygons
  useEffect(() => {
    if (!surgeLayerGroupRef.current || !mapLoaded || typeof window === "undefined") return;

    const renderSurge = async () => {
      const L = (await import("leaflet")).default;
      surgeLayerGroupRef.current.clearLayers();

      if (showGEELayer && inundation?.flooded_zones) {
        inundation.flooded_zones.forEach((pt) => {
          const delta = 0.015;
          const bounds: [[number, number], [number, number]] = [
            [pt.lat - delta, pt.lon - delta],
            [pt.lat + delta, pt.lon + delta],
          ];

          const color = pt.surge_depth_m > 2.0 ? "#EF4444" : pt.surge_depth_m > 0.8 ? "#00F2FE" : "#3B82F6";

          L.rectangle(bounds as any, {
            color: color,
            weight: 1,
            fillColor: color,
            fillOpacity: 0.35,
          }).addTo(surgeLayerGroupRef.current);
        });
      }
    };

    renderSurge();
  }, [showGEELayer, inundation, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[580px] lg:min-h-[700px] rounded-3xl overflow-hidden bg-[#070A12] border border-white/10 flex flex-col shadow-2xl">
      
      {/* Top Map Control Bar */}
      <div className="p-4 bg-black/80 backdrop-blur-2xl border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-[#00F2FE]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm text-white tracking-wide">
                INTERACTIVE COASTAL GIS COMMAND MAP
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-accent rounded-full border border-cyan-400/30 font-mono font-bold">
                LEAFLET + NASADEM 30m
              </span>
            </div>
            <p className="text-xs text-zinc-400">High-Resolution Geospatial Telemetry & Pre-Landfall Infrastructure Overlay</p>
          </div>
        </div>

        {/* Map Actions & Layer Toggles */}
        <div className="flex items-center space-x-2">
          
          {/* Base Layer Switcher */}
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveBaseLayer("dark")}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeBaseLayer === "dark" ? "bg-cyan-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Dark GIS
            </button>
            <button
              onClick={() => setActiveBaseLayer("satellite")}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeBaseLayer === "satellite" ? "bg-cyan-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveBaseLayer("streets")}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeBaseLayer === "streets" ? "bg-cyan-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Terrain
            </button>
          </div>

          {/* GEE Inundation Surge Toggle */}
          <button
            onClick={onToggleGEE}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
              showGEELayer
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SURGE LAYER: {showGEELayer ? "ON (4.2m)" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Leaflet Interactive GIS Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[450px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Floating Top Left Cyclone Card */}
        <div className="absolute top-4 left-4 z-20 bg-black/85 backdrop-blur-xl p-4 rounded-3xl border border-white/15 max-w-xs shadow-2xl pointer-events-auto space-y-1.5">
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold">
            <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: "12s" }} />
            <span>{track?.name || "Super Cyclone VAYU-KAVACH"}</span>
          </div>
          <p className="text-xs text-white font-bold">{track?.category}</p>
          <div className="text-[11px] text-zinc-300 font-mono space-y-0.5 pt-1 border-t border-white/10">
            <div>Sustained Wind: <strong className="text-amber-400">{track?.max_sustained_wind_kmh || 213} km/h</strong></div>
            <div>Central Pressure: <strong className="text-[#00F2FE]">{track?.central_pressure_hpa || 942} hPa</strong></div>
            <div>Predicted Surge: <strong className="text-red-400">4.2 meters AMSL</strong></div>
          </div>
        </div>

        {/* Floating Top Right Legend */}
        <div className="absolute top-4 right-4 z-20 bg-black/85 backdrop-blur-xl p-3.5 rounded-2xl border border-white/15 text-[11px] space-y-1.5 shadow-2xl pointer-events-auto">
          <span className="font-extrabold text-zinc-200 text-xs block">ASSET RESILIENCE TIER</span>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
            <span className="text-zinc-300">Critical Submergence (&lt;2.5m)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            <span className="text-zinc-300">Moderate Risk (2.5m - 4.0m)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            <span className="text-zinc-300">Elevated Safe Ground (&gt;4.0m)</span>
          </div>
        </div>

        {/* Floating Bottom Left Coordinate Telemetry HUD */}
        <div className="absolute bottom-4 left-4 z-20 bg-black/85 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-xs font-mono text-zinc-400 flex items-center space-x-3 shadow-2xl pointer-events-auto">
          <Crosshair className="w-4 h-4 text-[#00F2FE]" />
          <span>CURSOR GPS: <strong className="text-white">{cursorCoords.lat}° N, {cursorCoords.lon}° E</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-cyan-accent">ASSETS MONITORED: <strong>{assets.length}</strong></span>
        </div>
      </div>

    </div>
  );
}
