"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { fetchInundation, InundationData } from "@/lib/api";
import { 
  Layers, 
  Activity, 
  Droplet, 
  Shield, 
  ArrowLeft, 
  Sliders, 
  MapPin, 
  CheckCircle2,
  Radio,
  Map as MapIcon
} from "lucide-react";
import Link from "next/link";

// Dynamically import GEEInundationMap with SSR disabled
const GEEInundationMap = dynamic(
  () => import("@/components/GEEInundationMap").then((mod) => mod.GEEInundationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] rounded-2xl bg-[#070A12] border border-white/10 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-zinc-400 font-medium tracking-wider">
          LOADING GEE INUNDATION GIS ENGINE...
        </span>
      </div>
    ),
  }
);

const PRESET_COASTAL_LOCATIONS = [
  { name: "Paradeep Port (Odisha)", lat: 20.2684, lon: 86.6715, desc: "Mahanadi River Estuary & Major Deepwater Port" },
  { name: "Digha & Sagar Island (West Bengal)", lat: 21.6265, lon: 87.5097, desc: "Lowland Coastal Plain & Tidal Sea Wall" },
  { name: "Balasore Coast (Odisha)", lat: 21.4934, lon: 86.9135, desc: "Subarnarekha River Basin & Estuarine Mudflats" },
  { name: "Puri Sea Beach (Odisha)", lat: 19.8135, lon: 85.8312, desc: "Coastal Dune Barrier & Delta Drainage" },
  { name: "Kakinada Harbor (Andhra Pradesh)", lat: 16.9891, lon: 82.2475, desc: "Godavari Alluvial Delta & Lowland Estuary" },
  { name: "Machilipatnam (Andhra Pradesh)", lat: 16.1875, lon: 81.1389, desc: "Krishna River Delta & Low-Lying Coastal Corridor" },
  { name: "Chennai Port (Tamil Nadu)", lat: 13.0827, lon: 80.2707, desc: "Coromandel Coast Maritime Infrastructure" },
];

export default function GEETwinPage() {
  const [selectedLocation, setSelectedLocation] = useState(PRESET_COASTAL_LOCATIONS[0]);
  const [surgeHeight, setSurgeHeight] = useState<number>(4.2);
  const [inundation, setInundation] = useState<InundationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [liveAutoSync, setLiveAutoSync] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"map" | "grid" | "shelters">("map");

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
        setSelectedCell((prev: any) => prev || data.flooded_zones[0]);
      } else if (data.safe_shelter_zones && data.safe_shelter_zones.length > 0) {
        setSelectedCell((prev: any) => prev || data.safe_shelter_zones[0]);
      }
    } catch (err) {
      console.error("Failed to fetch GEE inundation:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleLocationChange = (loc: typeof PRESET_COASTAL_LOCATIONS[0]) => {
    setSelectedLocation(loc);
  };

  const allCells = [
    ...(inundation?.flooded_zones || []),
    ...(inundation?.safe_shelter_zones || [])
  ];

  return (
    <div className="min-h-screen bg-[#080A10] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header */}
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
              <span className="px-2 py-0.5 text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 rounded font-semibold">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-mono text-zinc-400 font-medium uppercase tracking-wider flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>SELECT MONITORED COASTAL SECTOR:</span>
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Active: <strong className="text-white">{selectedLocation.name}</strong> ({selectedLocation.lat}°N, {selectedLocation.lon}°E)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {PRESET_COASTAL_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation.name === loc.name;
            return (
              <button
                key={loc.name}
                onClick={() => handleLocationChange(loc)}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? "bg-cyan-500/10 border-cyan-400/40 text-white shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                    : "bg-white/5 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-semibold truncate">{loc.name.split(" (")[0]}</div>
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
          <span className="text-[11px] text-zinc-500 block">Elevation &lt; {surgeHeight.toFixed(1)}m AMSL</span>
        </div>

        <div className="bg-[#0B0F1A] p-4 rounded-xl border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 block font-mono">Safe Shelter Zones</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono block">
            {inundation?.safe_zones_count || inundation?.safe_shelter_zones?.length || 0} Ridges
          </span>
          <span className="text-[11px] text-zinc-500 block">Clearance &gt; +1.0m above surge</span>
        </div>
      </div>

      {/* Main Display: Leaflet GIS Map & Cell Grid Analysis */}
      <div className="bg-black/85 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("map")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "map" ? "bg-cyan-500 text-black shadow-lg" : "text-zinc-400 hover:text-white bg-white/5"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Inundation GIS Map</span>
            </button>
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "grid" ? "bg-cyan-500 text-black shadow-lg" : "text-zinc-400 hover:text-white bg-white/5"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cell-by-Cell Elevation Matrix ({inundation?.total_cells_evaluated || 400} Cells)</span>
            </button>
            <button
              onClick={() => setActiveTab("shelters")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "shelters" ? "bg-cyan-500 text-black shadow-lg" : "text-zinc-400 hover:text-white bg-white/5"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Safe Shelter High Grounds ({inundation?.safe_shelter_zones?.length || 0})</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>&gt;2.5m Surge</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              <span>1.0-2.5m Surge</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Safe High Ground</span>
            </span>
          </div>
        </div>

        {/* Tab 1: Leaflet Interactive GIS Map */}
        {activeTab === "map" && (
          <GEEInundationMap
            location={selectedLocation}
            surgeHeight={surgeHeight}
            inundation={inundation}
            selectedCell={selectedCell}
            onSelectCell={(cell) => setSelectedCell(cell)}
          />
        )}

        {/* Tab 2: Cell-by-Cell Grid Matrix */}
        {activeTab === "grid" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-20 gap-1.5 max-h-[480px] overflow-y-auto p-3.5 rounded-2xl bg-[#070A12] border border-white/10">
              {allCells.map((cell: any, idx: number) => {
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
              <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">SELECTED CELL DETAILS</span>
                  <strong className="text-white text-sm">{selectedCell.cell_id} • Coordinates: {selectedCell.lat}°N, {selectedCell.lon}°E</strong>
                </div>
                <div className="text-right font-mono space-y-0.5">
                  <span className="block text-zinc-300">AMSL Ground Elevation: <b className="text-white">{selectedCell.elevation_m}m</b></span>
                  <span className="block text-cyan-400 font-bold">Surge Water Depth: {selectedCell.surge_depth_m}m ({selectedCell.risk_level})</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Safe Shelter High Grounds */}
        {activeTab === "shelters" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(inundation?.safe_shelter_zones || []).map((shelter: any, idx: number) => {
              const clearance = (shelter.elevation_m - surgeHeight).toFixed(1);
              return (
                <div key={idx} className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5 hover:border-emerald-400/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Safe High Ground Ridge #{idx + 1}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                      +{clearance}m ABOVE SURGE
                    </span>
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1 font-mono">
                    <p>Coordinates: <strong className="text-white">{shelter.lat}°N, {shelter.lon}°E</strong></p>
                    <p>Ground Elevation: <strong className="text-emerald-400">{shelter.elevation_m}m AMSL</strong></p>
                    <p className="text-[10px] text-zinc-400 pt-1 border-t border-white/5">
                      Designated staging zone for NDRF inflatable boats & food logistics depot.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
