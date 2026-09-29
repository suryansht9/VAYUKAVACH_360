"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import HeroBackgroundSlideshow from "@/components/HeroBackgroundSlideshow";
import { 
  Shield, 
  ArrowRight, 
  Layers, 
  Compass, 
  Navigation,
  Database,
  Camera,
  Activity,
  CheckCircle2,
  Cpu,
  Clock,
  ExternalLink
} from "lucide-react";

// Dynamically import 3D Earth Globe with SSR disabled for clean WebGL rendering
const Globe3D = dynamic(() => import("@/components/Globe3D").then((mod) => mod.Globe3D), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] md:h-[620px] rounded-2xl bg-[#0A0E18]/80 border border-white/10 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-zinc-400 font-medium tracking-wider">INITIALIZING 3D EARTH TWIN...</span>
    </div>
  ),
});

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#080A10] overflow-x-hidden text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Full-Width Hero Section with Cyclone & Flood Slideshow Background */}
      <section className="relative w-full min-h-[92vh] overflow-hidden border-b border-white/[0.08]">
        
        {/* Full Edge-to-Edge Real Cyclone & Flood Minimalist Slideshow */}
        <HeroBackgroundSlideshow />

        {/* Hero Content Container (elevated above slideshow background) */}
        <div className="relative z-10 pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          
          {/* Top Status Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#0A0E18]/85 border border-white/10 text-zinc-300 text-xs font-mono backdrop-blur-xl shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="tracking-wider text-[11px] font-medium uppercase text-zinc-200">
                NATIONAL PRE-LANDFALL CYCLONE RESILIENCE TWIN
              </span>
            </div>
          </div>

          {/* Hero Title & Subtitle */}
          <div className="text-center max-w-4xl mx-auto space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              Anticipatory Cyclone Intelligence & <br />
              <span className="text-cyan-400 font-semibold">
                Infrastructure Resilience Twin
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Transitioning coastal disaster management from reactive post-landfall relief to <strong className="text-white font-semibold">48-hour pre-landfall predictive intervention</strong>, physics-informed asset hardening, and automated parametric emergency liquidity release.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/command-center"
                prefetch={true}
                className="px-6 py-3.5 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide hover:bg-cyan-300 transition-all shadow-md flex items-center space-x-2 group"
              >
                <Shield className="w-4 h-4 text-slate-950" />
                <span>Launch Command Center</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/weather-report"
                prefetch={true}
                className="px-6 py-3.5 rounded-xl bg-[#0E1320]/80 backdrop-blur-xl text-zinc-200 font-medium text-xs tracking-wide border border-white/10 hover:border-white/20 hover:text-white transition-all flex items-center space-x-2 shadow-md"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Search Location Weather & 48h Risk</span>
              </Link>
            </div>
          </div>

          {/* 3D Rotating Earth Globe */}
          <div className="relative max-w-5xl mx-auto">
            <Globe3D />
          </div>

          {/* Key Numerical Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-5xl mx-auto">
            <div className="bg-[#0A0E18]/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.08] text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono block">48h</span>
              <span className="text-xs text-zinc-400 block font-normal">Predictive Lead Time</span>
            </div>

            <div className="bg-[#0A0E18]/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.08] text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono block">30m</span>
              <span className="text-xs text-zinc-400 block font-normal">NASADEM SRTM Elevation</span>
            </div>

            <div className="bg-[#0A0E18]/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.08] text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono block">₹25L</span>
              <span className="text-xs text-zinc-400 block font-normal">Parametric Grant / Panchayat</span>
            </div>

            <div className="bg-[#0A0E18]/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.08] text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-zinc-200 font-mono block">5+</span>
              <span className="text-xs text-zinc-400 block font-normal">Regional Dialect Broadcasters</span>
            </div>
          </div>

        </div>

      </section>

      {/* Core Operational Modules Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 tracking-wider uppercase">
            <Activity className="w-3.5 h-3.5" />
            <span>OPERATIONAL ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Integrated Pre-Landfall Modules
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Multi-modal intelligence combining hydrodynamic physical modeling, high-resolution elevation data, and real-time civil administration tooling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Module 1: Live Weather & 48h Predictor */}
          <Link
            href="/weather-report"
            prefetch={true}
            className="bg-[#0B0F1A] p-6 rounded-2xl border border-white/[0.08] space-y-4 hover:border-cyan-400/30 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 text-cyan-400 flex items-center justify-center border border-white/10">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white group-hover:text-cyan-400 transition-colors">
                Live Location Weather & 48h Predictor
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Real-time ECMWF ERA5 telemetry and distance-to-coast calculation providing authentic weather data and 48-hour surge assessments for any location across India.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-cyan-400 pt-2 border-t border-white/5">
              <span>Inspect Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2: GEE Hydrodynamic Flood Twin */}
          <Link
            href="/gee-twin"
            prefetch={true}
            className="bg-[#0B0F1A] p-6 rounded-2xl border border-white/[0.08] space-y-4 hover:border-blue-400/30 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 text-blue-400 flex items-center justify-center border border-white/10">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white group-hover:text-blue-300 transition-colors">
                Google Earth Engine Inundation Twin
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Queries NASADEM SRTM 30m Digital Elevation and tidal vectors to simulate coastal water ingress boundaries and cell vulnerability 48 hours prior to landfall.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-blue-400 pt-2 border-t border-white/5">
              <span>View GEE Simulation</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3: Surge-Aware Evacuation Router */}
          <Link
            href="/evacuation"
            prefetch={true}
            className="bg-[#0B0F1A] p-6 rounded-2xl border border-white/[0.08] space-y-4 hover:border-emerald-400/30 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 text-emerald-400 flex items-center justify-center border border-white/10">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white group-hover:text-emerald-300 transition-colors">
                Surge-Aware Safe Evacuation Router
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Elevation-aware routing that actively identifies submerged road bridges and reroutes evacuation convoys through elevated high-ground corridors.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-400 pt-2 border-t border-white/5">
              <span>Inspect Safe Corridors</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* Pre-Landfall Timeline Protocol (T-48h to T-0h) */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08] space-y-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 tracking-wider uppercase">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>OPERATIONAL TIMELINE PROTOCOL</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            The 48-Hour Pre-Landfall Window
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            How automated telemetry transforms civil response during the critical window before cyclone arrival.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="bg-[#0B0F1A] p-5 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20">
                T-48 HOURS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">PHASE 1</span>
            </div>
            <h4 className="font-semibold text-sm text-white">Hydrodynamic GEE Modeling</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Google Earth Engine NASADEM computes sea surge boundaries and pinpoints inundated bridges.
            </p>
          </div>

          <div className="bg-[#0B0F1A] p-5 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-400/20">
                T-36 HOURS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">PHASE 2</span>
            </div>
            <h4 className="font-semibold text-sm text-white">Parametric Liquidity Release</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automated ₹25 Lakhs per high-risk Panchayat grants authorized via PFMS-linked smart ledger.
            </p>
          </div>

          <div className="bg-[#0B0F1A] p-5 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                T-24 HOURS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">PHASE 3</span>
            </div>
            <h4 className="font-semibold text-sm text-white">Elevation Evacuation & Hardening</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Convoys routed via flood-safe elevated roads; hospital fuel and power substations hardened.
            </p>
          </div>

          <div className="bg-[#0B0F1A] p-5 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-400/20">
                T-0 HOURS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">PHASE 4</span>
            </div>
            <h4 className="font-semibold text-sm text-white">Landfall & Citizen Audio Feeds</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Multilingual regional dialect audio broadcasts and emergency shelter dispatch operational.
            </p>
          </div>

        </div>
      </section>

      {/* Public Data & Open Architecture Grid */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08] space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 tracking-wider uppercase">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>DATA GOVERNANCE & OPEN ECOSYSTEM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              National Ingestion & Telemetry Standards
            </h2>
          </div>

          <Link
            href="/public-data"
            prefetch={true}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center space-x-1.5"
          >
            <span>View Open Data Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0A0E18] p-4 rounded-xl border border-white/[0.06] space-y-2">
            <span className="text-[11px] font-mono text-cyan-400 block font-medium">IMD MOSDAC RADAR</span>
            <span className="text-xs font-semibold text-white block">Doppler Mesocyclone Ingest</span>
            <p className="text-[11px] text-zinc-400">10-minute Bay of Bengal radar sweep telemetry.</p>
          </div>

          <div className="bg-[#0A0E18] p-4 rounded-xl border border-white/[0.06] space-y-2">
            <span className="text-[11px] font-mono text-blue-400 block font-medium">ISRO BHUVAN 2.5M</span>
            <span className="text-xs font-semibold text-white block">Cartosat Coastal Elevation</span>
            <p className="text-[11px] text-zinc-400">High-precision tidal barrier and embankment maps.</p>
          </div>

          <div className="bg-[#0A0E18] p-4 rounded-xl border border-white/[0.06] space-y-2">
            <span className="text-[11px] font-mono text-emerald-400 block font-medium">DATA.GOV.IN OGD</span>
            <span className="text-xs font-semibold text-white block">Panchayat & Shelter Census</span>
            <p className="text-[11px] text-zinc-400">75+ designated cyclone shelters and direct beneficiary stats.</p>
          </div>

          <div className="bg-[#0A0E18] p-4 rounded-xl border border-white/[0.06] space-y-2">
            <span className="text-[11px] font-mono text-amber-400 block font-medium">ECMWF ERA5 REANALYSIS</span>
            <span className="text-xs font-semibold text-white block">Global Reanalysis Telemetry</span>
            <p className="text-[11px] text-zinc-400">Barometric pressure and multi-level tropospheric wind.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
