"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchInundation, InundationData } from "@/lib/api";
import { 
  Layers, 
  Activity, 
  Droplet, 
  Shield, 
  ArrowLeft, 
  Sliders, 
  MapPin, 
  Eye, 
  RefreshCw,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Maximize2
} from "lucide-react";
import Link from "next/link";

const PRESET_COASTAL_LOCATIONS = [
  { name: "Paradeep Port (Odisha)", lat: 20.2684, lon: 86.6715, desc: "Mahanadi River Estuary & Major Deepwater Port" },
  { name: "Digha & Sagar Island (West Bengal)", lat: 21.6265, lon: 87.5097, desc: "Lowland Coastal Plain & Tidal Sea Wall" },
  { name: "Balasore Coast (Odisha)", lat: 21.4934, lon: 86.9135, desc: "Subarnarekha River Basin & Estuarine Mudflats" },
  { name: "Puri Sea Beach (Odisha)", lat: 19.8135, lon: 85.8312, desc: "Coastal Dune Barrier & Delta Drainage" },
  { name: "Kakinada Harbor (Andhra Pradesh)", lat: 16.9891, lon: 82.2475, desc: "Godavari Alluvial Delta & Lowland Estuary" },
];

export default function GEETwinPage() {
  const [selectedLocation, setSelectedLocation] = useState(PRESET_COASTAL_LOCATIONS[0]);
  const [customLat, setCustomLat] = useState<number>(20.2684);
  const [customLon, setCustomLon] = useState<number>(86.6715);
  const [surgeHeight, setSurgeHeight] = useState<number>(4.2);
  const [inundation, setInundation] = useState<InundationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [liveAutoSync, setLiveAutoSync] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"map" | "grid" | "shelters">("map");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const surgeLayerRef = useRef<any>(null);
  const sheltersLayerRef = useRef<any>(null);

  // Load Inundation Data
  useEffect(() => {
    updateSurge(selectedLocation.lat, selectedLocation.lon, surgeHeight);
  }, [selectedLocation, surgeHeight]);

  // Real-time interval sync if live auto-sync is enabled
  useEffect(() => {
    if (!liveAutoSync) return;
    const timer = setInterval(() => {
      updateSurge(selectedLocation.lat, selectedLocation.lon, surgeHeight, false);
    }, 12000);
    return () => clearInterval(timer);
  }, [liveAutoSync, selectedLocation, surgeHeight]);

  const updateSurge = async (lat: number, lon: number, h: number, showSpinner: boolean = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await fetchInundation(lat, lon, h);
      setInundation(data);
      if (data.flooded_zones && data.flooded_zones.length > 0) {
        setSelectedCell(data.flooded_zones[0]);
      }
    } catch (err) {
      console.error("Failed to fetch GEE inundation:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleLocationChange = (loc: typeof PRESET_COASTAL_LOCATIONS[0]) => {
    setSelectedLocation(loc);
    setCustomLat(loc.lat);
    setCustomLon(loc.lon);
  };

  const handleCustomCoordinatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedLocation({
      name: `Custom (${customLat.toFixed(4)}°N, ${customLon.toFixed(4)}°E)`,
      lat: customLat,
      lon: customLon,
      desc: "User Specified Coastal Coordinates"
    });
  };

  // Initialize & Update Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current!, {
          center: [selectedLocation.lat, selectedLocation.lon],
          zoom: 11,
          zoomControl: false,
          attributionControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 18 }
        ).addTo(map);

        surgeLayerRef.current = L.layerGroup().addTo(map);
        sheltersLayerRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lon], 11, {
          animate: true,
        });
      }

      // Render flooded GeoJSON / Rectangles
      if (surgeLayerRef.current && inundation?.flooded_zones) {
        surgeLayerRef.current.clearLayers();

        inundation.flooded_zones.forEach((zone: any) => {
          const delta = 0.010;
          const bounds: [[number, number], [number, number]] = [
            [zone.lat - delta, zone.lon - delta],
            [zone.lat + delta, zone.lon + delta]
          ];

          const color = zone.surge_depth_m > 2.5 ? "#EF4444" : zone.surge_depth_m > 1.0 ? "#00F2FE" : "#3B82F6";

          const rect = L.rectangle(bounds as any, {
            color: color,
            weight: 1,
            fillColor: color,
            fillOpacity: 0.45,
          }).addTo(surgeLayerRef.current);

          rect.bindPopup(`
            <div style="color: #fff; font-family: monospace; font-size: 11px;">
              <b style="color: #00F2FE;">CELL ${zone.cell_id || ""}</b><br/>
              Elev: <b>${zone.elevation_m}m AMSL</b><br/>
              Surge Depth: <b style="color: ${color}">${zone.surge_depth_m}m</b><br/>
              Status: <span style="color: ${color}">${zone.risk_level}</span>
            </div>
          `);

          rect.on("click", () => {
            setSelectedCell(zone);
          });
        });
      }

      // Render Safe Shelter High Ground Pins
      if (sheltersLayerRef.current && inundation?.safe_shelter_zones) {
        sheltersLayerRef.current.clearLayers();

        inundation.safe_shelter_zones.slice(0, 6).forEach((safe: any, i: number) => {
          const shelterIcon = L.divIcon({
            className: "safe-shelter-pin",
            html: `
              <div style="
                width: 28px; height: 28px; border-radius: 50%;
                background: #10B981; border: 2px solid #FFFFFF;
                box-shadow: 0 0 12px #10B981;
                display: flex; align-items: center; justify-content: center;
                font-weight: 900; font-size: 10px; color: #000;
              ">
                S${i+1}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          L.marker([safe.lat, safe.lon], { icon: shelterIcon })
            .addTo(sheltersLayerRef.current)
            .bindPopup(`
              <div style="color: #fff; font-family: monospace; font-size: 11px;">
                <b style="color: #10B981;">SAFE HIGH GROUND ZONE #${i+1}</b><br/>
                Elev: <b style="color: #10B981;">${safe.elevation_m}m AMSL</b><br/>
                Safety Buffer: <b>+${(safe.elevation_m - surgeHeight).toFixed(1)}m above surge</b>
              </div>
            `);
        });
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [selectedLocation, inundation, surgeHeight]);

  const allCells = [
    ...(inundation?.flooded_zones || []),
    ...(inundation?.safe_shelter_zones || [])
  ];

  return (
    <div className="min-h-screen bg-[#080A10] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0B0F1A] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-lg">
        <div className="flex items-center space-x-3">
          <Link
            href="/command-center"
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 transition-colors border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                GOOGLE EARTH ENGINE (GEE) FLOOD TWIN
              </h1>
              <span className="px-2 py-0.2 text-[9px] font-mono bg-white/10 text-cyan-400 border border-white/10 rounded font-medium">
                NASADEM 30m + ERA5
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              48-Hour Pre-Landfall Hydrodynamic Elevation Simulation & Safe High-Ground Corridors
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setLiveAutoSync(!liveAutoSync)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-all ${
              liveAutoSync
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${liveAutoSync ? "animate-pulse" : ""}`} />
            <span className="font-mono text-[11px]">{liveAutoSync ? "STREAM (12S)" : "PAUSED"}</span>
          </button>

          <Link
            href="/command-center"
            className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide hover:bg-cyan-300 transition-all shadow-sm"
          >
            COMMAND PLATFORM
          </Link>
        </div>
      </div>

      {/* Coastal Sector Selector Bar */}
      <div className="bg-[#0B0F1A] p-4 rounded-2xl border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 font-medium uppercase tracking-wider flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>SELECT MONITORED COASTAL SECTOR:</span>
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Active: <strong className="text-white">{selectedLocation.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {PRESET_COASTAL_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation.name === loc.name;
            return (
              <button
                key={loc.name}
                onClick={() => handleLocationChange(loc)}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? "bg-cyan-500/10 border-cyan-400/40 text-white"
                    : "bg-white/5 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-semibold truncate">{loc.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{loc.lat}°N, {loc.lon}°E</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Surge Height Simulator Slider */}
      <div className="bg-[#0B0F1A] p-5 rounded-2xl border border-white/[0.08] space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider block">
              HYDRODYNAMIC TIDAL SURGE CONTROLLER
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-white">Adjust Storm Surge Inundation (Meters above astronomical tide)</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Dynamically models elevation breach across GEE NASADEM 30m grid.</p>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Droplet className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-zinc-400 block font-mono">Predicted Ingress</span>
              <span className="text-lg font-bold font-mono text-cyan-400">{surgeHeight.toFixed(1)}m Surge</span>
            </div>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1.5 pt-1">
          <input
            type="range"
            min="1.0"
            max="8.0"
            step="0.1"
            value={surgeHeight}
            onChange={(e) => setSurgeHeight(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
            <span>1.0m (Tidal Ingress)</span>
            <span>3.0m (Parametric Trigger)</span>
            <span>4.2m (Landfall Target)</span>
            <span>8.0m (Sea Wall Breach)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Key Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0B0F1A] p-4 rounded-xl border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 block font-mono">Inundated Land Area</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono block">
            {inundation?.total_inundated_area_sq_km || 0} km²
          </span>
          <span className="text-[11px] text-zinc-500 block">Computed via GEE NASADEM 30m</span>
        </div>

        <div className="bg-[#0B0F1A] p-4 rounded-xl border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 block font-mono">Submergence Ratio</span>
          <span className="text-2xl font-bold text-amber-400 font-mono block">
            {inundation?.inundation_percentage || 0}%
          </span>
          <span className="text-[11px] text-zinc-500 block">Of target coastal grid cells under water</span>
        </div>

        <div className="bg-[#0B0F1A] p-4 rounded-xl border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 block font-mono">Submerged Inundation Cells</span>
          <span className="text-2xl font-bold text-red-400 font-mono block">
            {inundation?.flooded_zones_count || 0} Cells
          </span>
          <span className="text-[11px] text-zinc-500 block">Elevation &lt; {surgeHeight}m AMSL</span>
        </div>

        <div className="bg-[#0B0F1A] p-4 rounded-xl border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 block font-mono">Safe Shelter Zones</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono block">
            {inundation?.safe_zones_count || 0} Cells
          </span>
          <span className="text-[11px] text-zinc-500 block">Clearance &gt; +1.2m above surge</span>
        </div>
      </div>

      {/* Main Interactive Display: Leaflet GIS Map & Cell Grid Analysis */}
      <div className="bg-black/85 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("map")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "map" ? "bg-cyan-500 text-black shadow-lg" : "text-zinc-400 hover:text-white bg-white/5"
              }`}
            >
              Interactive Inundation GIS Map
            </button>
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "grid" ? "bg-cyan-500 text-black shadow-lg" : "text-zinc-400 hover:text-white bg-white/5"
              }`}
            >
              Cell-by-Cell Elevation Matrix ({inundation?.total_cells_evaluated || 400} Cells)
            </button>
            <button
              onClick={() => setActiveTab("shelters")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "shelters" ? "bg-cyan-500 text-black shadow-lg" : "text-zinc-400 hover:text-white bg-white/5"
              }`}
            >
              Safe Shelter High Grounds ({inundation?.safe_shelter_zones?.length || 0})
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span>&gt;2.5m Surge</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400/80 inline-block" />
              <span>1.0-2.5m Surge</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span>Safe High Ground</span>
            </span>
          </div>
        </div>

        {/* Tab 1: Leaflet Interactive Map */}
        {activeTab === "map" && (
          <div className="space-y-3">
            <div
              ref={mapContainerRef}
              className="w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-[#070A12] shadow-inner"
            />
            {selectedCell && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-cyan-accent uppercase block">SELECTED CELL TELEMETRY</span>
                  <strong className="text-white text-sm">
                    {selectedCell.cell_id} ({selectedCell.lat}°N, {selectedCell.lon}°E)
                  </strong>
                </div>
                <div className="flex items-center space-x-4 font-mono">
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
        )}

        {/* Tab 2: Genuine Cell-by-Cell Grid Matrix */}
        {activeTab === "grid" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-20 gap-1.5 max-h-[460px] overflow-y-auto p-3 rounded-2xl bg-[#070A12] border border-white/10">
              {(inundation?.flooded_zones || []).concat(inundation?.safe_shelter_zones || []).map((cell: any, idx: number) => {
                const isSelected = selectedCell?.cell_id === cell.cell_id;
                const isFlooded = cell.is_flooded;
                const colorBg = isFlooded 
                  ? cell.surge_depth_m > 2.5 ? "bg-red-500/30 border-red-500/50 text-red-300" : "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCell(cell)}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all border ${colorBg} ${
                      isSelected ? "ring-2 ring-white scale-105 z-10" : "hover:scale-105"
                    }`}
                    title={`${cell.cell_id}: Elev ${cell.elevation_m}m | Water ${cell.surge_depth_m}m | ${cell.risk_level}`}
                  >
                    <span>{cell.elevation_m}m</span>
                    <span className="text-[8px] opacity-75">{isFlooded ? `-${cell.surge_depth_m}m` : "SAFE"}</span>
                  </button>
                );
              })}
            </div>

            {selectedCell && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-cyan-accent block">SELECTED CELL DETAILS</span>
                  <strong className="text-white">{selectedCell.cell_id} • Coordinates: {selectedCell.lat}°N, {selectedCell.lon}°E</strong>
                </div>
                <div className="text-right font-mono">
                  <span className="block text-zinc-300">AMSL Ground Elevation: <b>{selectedCell.elevation_m}m</b></span>
                  <span className="block text-cyan-accent font-bold">Surge Water Depth: {selectedCell.surge_depth_m}m</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Safe Shelter High Grounds */}
        {activeTab === "shelters" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(inundation?.safe_shelter_zones || []).map((shelter: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Safe High Ground Ridge #{idx + 1}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                    +{(shelter.elevation_m - surgeHeight).toFixed(1)}m ABOVE SURGE
                  </span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1 font-mono">
                  <p>Coordinates: {shelter.lat}°N, {shelter.lon}°E</p>
                  <p>Ground Elevation: <strong className="text-emerald-400">{shelter.elevation_m}m AMSL</strong></p>
                  <p className="text-[10px] text-zinc-400">Suitable for NDRF Stilt Shelter staging & logistics depot.</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
