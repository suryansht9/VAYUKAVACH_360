"use client";

import React, { useState, useEffect } from "react";
import {
  fetchLocationWeather,
  LocationWeatherReport,
  HourlyForecastItem
} from "@/lib/api";
import {
  Search,
  MapPin,
  Compass,
  Wind,
  Droplets,
  Gauge,
  CloudRain,
  Sun,
  CloudLightning,
  Cloud,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Sliders,
  RefreshCw,
  Navigation,
  Crosshair,
  Waves,
  ShieldCheck,
  Building
} from "lucide-react";

export function LiveWeatherLocator() {
  const [query, setQuery] = useState<string>("Prayagraj");
  const [customLat, setCustomLat] = useState<string>("");
  const [customLon, setCustomLon] = useState<string>("");
  const [useCoords, setUseCoords] = useState<boolean>(false);
  const [surgeHeight, setSurgeHeight] = useState<number>(4.2);
  const [weatherReport, setWeatherReport] = useState<LocationWeatherReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<number>(1);

  const quickCities = [
    { name: "Prayagraj", type: "Inland Safe", state: "Uttar Pradesh" },
    { name: "Paradeep Port", type: "Coastal Hotspot", state: "Odisha" },
    { name: "Puri Coast", type: "Coastal Hotspot", state: "Odisha" },
    { name: "Digha Sea Beach", type: "Coastal Hotspot", state: "West Bengal" },
    { name: "New Delhi", type: "Inland Safe", state: "Delhi" },
    { name: "Lucknow", type: "Inland Safe", state: "Uttar Pradesh" },
    { name: "Bhubaneswar", type: "Inland Ridge", state: "Odisha" },
    { name: "Balasore", type: "Coastal Sector", state: "Odisha" },
    { name: "Kolkata", type: "Delta Urban", state: "West Bengal" },
    { name: "Visakhapatnam", type: "Coastal Port", state: "Andhra Pradesh" }
  ];

  useEffect(() => {
    loadReport("Prayagraj");
  }, []);

  const loadReport = async (searchStr?: string, lat?: number, lon?: number) => {
    setLoading(true);
    try {
      const data = await fetchLocationWeather({
        location_query: searchStr || (useCoords ? undefined : query),
        latitude: lat !== undefined ? lat : (useCoords && customLat ? parseFloat(customLat) : undefined),
        longitude: lon !== undefined ? lon : (useCoords && customLon ? parseFloat(customLon) : undefined),
        surge_height_m: surgeHeight
      });
      setWeatherReport(data);
      setSelectedHour(1);
    } catch (err) {
      console.error("Error loading location weather:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (useCoords) {
      if (customLat && customLon) {
        loadReport(undefined, parseFloat(customLat), parseFloat(customLon));
      }
    } else if (query.trim()) {
      loadReport(query.trim());
    }
  };

  const handleUseGPS = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCustomLat(lat.toFixed(4));
          setCustomLon(lon.toFixed(4));
          setUseCoords(true);
          loadReport(undefined, lat, lon);
        },
        (err) => {
          console.warn("GPS Geolocation notice:", err.message);
          setLoading(false);
          alert("Location access denied or unavailable. Please search manually by city name.");
        }
      );
    }
  };

  const current = weatherReport?.current_weather;
  const assess = weatherReport?.pre_landfall_48h_assessment;
  const geo = weatherReport?.geographic_context;
  const timeline = weatherReport?.hourly_48h_timeline || [];
  const currentHourData = timeline[selectedHour - 1] || timeline[0];

  // Color mapping based on authentic risk level
  const riskColor = assess?.risk_color || "GREEN";
  const isGreen = riskColor === "GREEN";
  const isYellow = riskColor === "YELLOW";
  const isOrange = riskColor === "ORANGE";
  const isRed = riskColor === "RED";

  return (
    <div className="w-full bg-black/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(0,242,254,0.4)]">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: "16s" }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-wide">
                PHYSICS-INFORMED LOCATION WEATHER & 48H RISK ENGINE
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] bg-cyan-500/20 text-[#00F2FE] border border-cyan-400/40 rounded-full font-mono font-bold">
                ECMWF ERA5 + GEE NASADEM
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Authentic Real-Time Meteorological Telemetry • Coastline Distance & Topographic Elevation Classification
            </p>
          </div>
        </div>

        {/* Global GPS Button */}
        <button
          onClick={handleUseGPS}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center space-x-2 shadow-lg hover:border-cyan-400 transition-all"
        >
          <Crosshair className="w-4 h-4 text-[#00F2FE] animate-pulse" />
          <span>USE MY GPS LOCATION</span>
        </button>
      </div>

      {/* Location Search Bar & Coordinates Toggle */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          
          {!useCoords ? (
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search any Indian city, district or village (e.g. Prayagraj, Paradeep, Delhi, Puri, Digha)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-black/60 text-white text-sm pl-12 pr-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
              />
            </div>
          ) : (
            <div className="flex-1 w-full grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude (e.g. 25.4448)"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="w-full bg-black/60 text-white text-xs px-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude (e.g. 81.8432)"
                value={customLon}
                onChange={(e) => setCustomLon(e.target.value)}
                className="w-full bg-black/60 text-white text-xs px-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,242,254,0.5)] hover:scale-105 transition-transform flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "FETCHING TELEMETRY..." : "ANALYZE LOCATION"}</span>
            </button>

            <button
              type="button"
              onClick={() => setUseCoords(!useCoords)}
              className="px-3.5 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono font-bold hover:bg-white/10 hover:text-white transition-colors"
              title="Toggle Latitude / Longitude manual coordinates input"
            >
              {useCoords ? "CITY NAME" : "LAT/LON"}
            </button>
          </div>
        </form>

        {/* Quick Location Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest whitespace-nowrap">
            PRESET SAMPLE CITIES:
          </span>
          {quickCities.map((city) => (
            <button
              key={city.name}
              onClick={() => {
                setQuery(city.name);
                setUseCoords(false);
                loadReport(city.name);
              }}
              className={`px-3 py-1 rounded-xl border text-[11px] font-mono whitespace-nowrap transition-all ${
                query === city.name
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-accent font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)]"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
              }`}
            >
              <span>{city.name}</span>
              <span className="ml-1 text-[9px] text-zinc-500">({city.type})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Report Display Area */}
      {weatherReport && (
        <div className="space-y-6">
          
          {/* Top Classification Banner */}
          <div className="bg-gradient-to-r from-black/90 via-zinc-900/90 to-black/90 p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                isRed
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : isOrange
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                  : isYellow
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}>
                {isRed ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : isGreen ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-white">{weatherReport.query_location}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-zinc-300 border border-white/10">
                    {geo?.zone_type || "Geographic Zone"}
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400 block mt-0.5">
                  GPS: {weatherReport.coordinates.latitude}° N, {weatherReport.coordinates.longitude}° E • Distance to Coast: <strong className="text-white">{geo?.distance_to_coast_km} km</strong> • Distance to Cyclone Eye: <strong className="text-amber-300">{geo?.distance_to_cyclone_eye_km} km</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase block font-mono">NASADEM Terrain Elev</span>
                <span className="text-lg font-black font-mono text-cyan-accent">
                  {geo?.gee_terrain_elevation_m}m <span className="text-xs font-normal text-zinc-400">AMSL</span>
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase block font-mono">Holistic Risk Verdict</span>
                <span className={`text-xs font-mono font-black px-3 py-1 rounded-full border ${
                  isRed
                    ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                    : isOrange
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : isYellow
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}>
                  {assess?.risk_tier}
                </span>
              </div>
            </div>
          </div>

          {/* Genuine 3-Pillar Threat Breakdown Cards (Surge vs Wind vs Flood) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Coastal Storm Surge Card */}
            <div className={`p-4 rounded-3xl border flex flex-col justify-between ${
              assess?.is_surge_inundated
                ? "bg-red-950/20 border-red-500/40"
                : "bg-black/60 border-white/10"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-accent flex items-center gap-1.5">
                    <Waves className="w-4 h-4" />
                    1. Coastal Storm Surge Threat
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    assess?.is_surge_inundated ? "bg-red-500/30 text-red-300" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {assess?.is_surge_inundated ? "SUBMERGENCE HAZARD" : "ZERO SURGE RISK"}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed font-medium">
                  {assess?.storm_surge_status}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Elevation: {geo?.gee_terrain_elevation_m}m</span>
                <span className="text-cyan-accent">Predicted Surge: 4.2m</span>
              </div>
            </div>

            {/* 2. Cyclone Wind & Gale Force Card */}
            <div className={`p-4 rounded-3xl border flex flex-col justify-between ${
              assess?.wind_alert_level === "RED"
                ? "bg-red-950/20 border-red-500/40"
                : assess?.wind_alert_level === "ORANGE"
                ? "bg-orange-950/20 border-orange-500/40"
                : "bg-black/60 border-white/10"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Wind className="w-4 h-4" />
                    2. 48h Wind & Cyclone Gale Alert
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    assess?.wind_alert_level === "RED"
                      ? "bg-red-500/30 text-red-300"
                      : assess?.wind_alert_level === "ORANGE"
                      ? "bg-orange-500/30 text-orange-300"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {assess?.wind_alert_level}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed font-medium">
                  {assess?.wind_alert}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Current: {current?.wind_speed_kmh} km/h</span>
                <span className="text-amber-400">Peak 48h: {assess?.peak_forecast_wind_kmh} km/h</span>
              </div>
            </div>

            {/* 3. Rain Deluge & Flash Flood Card */}
            <div className={`p-4 rounded-3xl border flex flex-col justify-between ${
              assess?.flood_alert_level === "RED"
                ? "bg-red-950/20 border-red-500/40"
                : assess?.flood_alert_level === "ORANGE"
                ? "bg-orange-950/20 border-orange-500/40"
                : "bg-black/60 border-white/10"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4" />
                    3. 48h Rain & Inundation Flood Threat
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    assess?.flood_alert_level === "RED"
                      ? "bg-red-500/30 text-red-300"
                      : assess?.flood_alert_level === "ORANGE"
                      ? "bg-orange-500/30 text-orange-300"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {assess?.flood_alert_level}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed font-medium">
                  {assess?.flood_alert}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Current Rain: {current?.precipitation_mm} mm</span>
                <span className="text-emerald-400">48h Accum: {assess?.accumulated_48h_rainfall_mm} mm</span>
              </div>
            </div>

          </div>

          {/* Genuine Advisory Directive Box */}
          <div className={`p-4 rounded-2xl border ${
            isRed
              ? "bg-red-950/30 border-red-500/40 text-red-200"
              : isGreen
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
              : "bg-amber-950/30 border-amber-500/40 text-amber-200"
          }`}>
            <p className="text-xs leading-relaxed font-medium">
              {assess?.advisory_directive}
            </p>
          </div>

          {/* Current Live Weather 6-Grid Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* 1. Temp */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Temperature</span>
              <span className="text-2xl font-black font-mono text-white">
                {current?.temperature_c}°C
              </span>
              <span className="text-[10px] text-zinc-400 block">RealFeel: {current?.apparent_temperature_c}°C</span>
            </div>

            {/* 2. Wind & Gusts */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Current Wind</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {current?.wind_speed_kmh} <span className="text-xs">km/h</span>
              </span>
              <span className="text-[10px] text-amber-300/80 block">Gusts: {current?.wind_gusts_kmh} km/h</span>
            </div>

            {/* 3. Cardinal Direction */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Wind Direction</span>
              <span className="text-2xl font-black font-mono text-[#00F2FE]">
                {current?.wind_cardinal} <span className="text-xs font-normal">({current?.wind_direction_deg}°)</span>
              </span>
              <span className="text-[10px] text-zinc-400 block">Atmospheric Vector</span>
            </div>

            {/* 4. Barometric Pressure */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Barometric Pressure</span>
              <span className="text-2xl font-black font-mono text-white">
                {current?.surface_pressure_hpa} <span className="text-xs">hPa</span>
              </span>
              <span className="text-[10px] text-zinc-400 block">Surface Barometer</span>
            </div>

            {/* 5. Humidity */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Relative Humidity</span>
              <span className="text-2xl font-black font-mono text-cyan-300">
                {current?.relative_humidity_pct}%
              </span>
              <span className="text-[10px] text-zinc-400 block">Moisture Index</span>
            </div>

            {/* 6. Precipitation */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Condition</span>
              <span className="text-base font-bold text-white line-clamp-1 mt-1 block">
                {current?.weather_condition}
              </span>
              <span className="text-[10px] text-emerald-400 block">Rain: {current?.precipitation_mm} mm</span>
            </div>

          </div>

          {/* Interactive 48-Hour Pre-Landfall Prediction Matrix & Scrubber */}
          <div className="bg-black/60 p-5 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-accent" />
                  <span>48-HOUR HOURLY PRE-LANDFALL PREDICTION TIMELINE</span>
                </h4>
                <p className="text-[11px] text-zinc-400">Scrub across 48 hours to inspect temperature, real wind progression, rainfall and threat index</p>
              </div>

              {/* Scrubber Label */}
              <div className="bg-white/5 px-4 py-1.5 rounded-2xl border border-white/10 flex items-center space-x-2">
                <span className="text-xs font-mono text-cyan-accent font-bold">
                  INSPECTING: T+{selectedHour} HOURS
                </span>
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max={timeline.length || 48}
                value={selectedHour}
                onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                className="w-full h-2.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00F2FE]"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>T+1h (Current)</span>
                <span>T+12h</span>
                <span>T+24h</span>
                <span>T+36h</span>
                <span>T+48h</span>
              </div>
            </div>

            {/* Selected Hour Detailed Snapshot */}
            {currentHourData && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-black/90 via-zinc-900/80 to-black/90 border border-cyan-400/40 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Forecast Time</span>
                  <strong className="text-xs text-white font-mono">{currentHourData.timestamp}</strong>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">{currentHourData.condition}</span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Forecast Wind & Gusts</span>
                  <strong className="text-sm text-amber-400 font-mono">
                    {currentHourData.wind_speed_kmh} <span className="text-[10px]">km/h</span>
                  </strong>
                  <span className="text-[10px] text-red-400 font-mono block">Gust: {currentHourData.wind_gusts_kmh} km/h</span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Rainfall & Probability</span>
                  <strong className="text-sm text-emerald-400 font-mono">
                    {currentHourData.precipitation_mm} <span className="text-[10px]">mm</span>
                  </strong>
                  <span className="text-[10px] text-zinc-300 font-mono block">Prob: {currentHourData.rain_prob_pct}%</span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Surface Pressure</span>
                  <strong className="text-sm text-[#00F2FE] font-mono">
                    {currentHourData.surface_pressure_hpa} <span className="text-[10px]">hPa</span>
                  </strong>
                  <span className="text-[10px] text-zinc-400 font-mono block">Temp: {currentHourData.temperature_c}°C</span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-400 font-mono block">Cyclone Threat Index</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          currentHourData.cyclone_threat_index_pct > 50
                            ? "bg-gradient-to-r from-amber-400 to-red-500"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.max(5, currentHourData.cyclone_threat_index_pct)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-black font-mono ${
                      currentHourData.cyclone_threat_index_pct > 50 ? "text-red-400" : "text-emerald-400"
                    }`}>
                      {currentHourData.cyclone_threat_index_pct}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Horizontal 48h Hourly Mini-Chart Cards */}
            <div className="flex items-center space-x-2 overflow-x-auto py-2">
              {timeline.map((item) => {
                const isSelected = item.hour_step === selectedHour;
                return (
                  <div
                    key={item.hour_step}
                    onClick={() => setSelectedHour(item.hour_step)}
                    className={`cursor-pointer flex-shrink-0 p-3 rounded-2xl border text-center transition-all min-w-[90px] ${
                      isSelected
                        ? "bg-cyan-500/20 border-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.4)] scale-105"
                        : "bg-white/5 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-zinc-400 block font-bold">
                      T+{item.hour_step}h
                    </span>
                    <span className="text-xs font-bold font-mono text-white block my-1">
                      {item.wind_speed_kmh} <span className="text-[9px] text-zinc-400">km/h</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-accent block">
                      {item.temperature_c}°C
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 block mt-0.5">
                      {item.precipitation_mm}mm
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
