"use client";

import React, { useState } from "react";
import { RiskReport, InfrastructureAsset } from "@/lib/api";
import { 
  ShieldAlert, 
  Cpu, 
  DollarSign, 
  Activity, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  Zap,
  Building
} from "lucide-react";

interface GeminiRiskCardsProps {
  reports: RiskReport[];
  selectedAsset: InfrastructureAsset | null;
  onAuthorizeGrant: (panchayat: string, district: string, pop: number) => void;
}

export function GeminiRiskCards({ reports, selectedAsset, onAuthorizeGrant }: GeminiRiskCardsProps) {
  const [filterType, setFilterType] = useState<string>("ALL");

  const activeReport = selectedAsset
    ? reports.find((r) => r.asset_id === selectedAsset.id) || reports[0]
    : reports[0];

  const assetPhoto = activeReport?.asset_details?.image_url || 
    (activeReport?.asset_name?.includes("Substation") ? "/images/substation.jpg" :
     activeReport?.asset_name?.includes("Hospital") ? "/images/hospital.jpg" :
     activeReport?.asset_name?.includes("Bridge") ? "/images/bridge.jpg" : "/images/shelter.jpg");

  const filteredReports = reports.filter((r) => {
    if (filterType === "ALL") return true;
    if (filterType === "CRITICAL") return r.failure_probability_pct > 70;
    if (filterType === "SUBSTATION") return r.asset_name.includes("Substation");
    if (filterType === "HOSPITAL") return r.asset_name.includes("Hospital");
    if (filterType === "BRIDGE") return r.asset_name.includes("Bridge");
    return true;
  });

  return (
    <div className="w-full space-y-4">
      
      {/* Section Header */}
      <div className="bg-black/80 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-[#00F2FE]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm text-white tracking-wide">
                GEMINI 3.7 MULTIMODAL INFRASTRUCTURE RISK ENGINE
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-accent rounded-full border border-cyan-400/30 font-mono font-bold">
                STRUCTURED SCHEMAS
              </span>
            </div>
            <p className="text-xs text-zinc-400">Physics-Informed Structural Vulnerability & Pre-Landfall Directives</p>
          </div>
        </div>
      </div>

      {/* Primary Highlighted Asset Card */}
      {activeReport && (
        <div className="bg-black/85 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative group">
          
          {/* Photographic Header Backdrop */}
          <div className="relative h-60 sm:h-64 w-full overflow-hidden">
            <img
              src={assetPhoto}
              alt={activeReport.asset_name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-90"
            />
            
            {/* Gradient Overlays for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-xl border border-white/20 text-[11px] font-mono text-cyan-accent font-bold">
                ASSET ID: {activeReport.asset_id}
              </span>

              <div className={`px-3.5 py-1.5 rounded-full backdrop-blur-xl border font-mono font-black text-xs flex items-center space-x-2 ${
                activeReport.failure_probability_pct > 70
                  ? "bg-red-600/40 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : activeReport.failure_probability_pct > 40
                  ? "bg-amber-600/40 border-amber-500 text-amber-300"
                  : "bg-emerald-600/40 border-emerald-500 text-emerald-300"
              }`}>
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                <span>FAILURE RISK: {activeReport.failure_probability_pct}%</span>
              </div>
            </div>

            {/* Title Overlay at Bottom of Image */}
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest block font-bold">
                {activeReport.asset_details?.type || "CRITICAL INFRASTRUCTURE"} • {activeReport.asset_details?.district} DISTRICT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                {activeReport.asset_name}
              </h2>
            </div>
          </div>

          {/* Card Body Content */}
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* 2-Column Physics & Social Impact Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Physics Failure Mechanism
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {activeReport.failure_mechanism}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-xs font-bold text-cyan-accent flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Cascading Societal Impact
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {activeReport.cascading_impact}
                </p>
              </div>

            </div>

            {/* Actionable Civil Engineering Directive */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-400/30 space-y-1">
              <span className="text-xs font-bold text-cyan-accent flex items-center gap-2">
                <Zap className="w-4 h-4" />
                T-48h AI Pre-Landfall Engineering Directive
              </span>
              <p className="text-xs text-cyan-100 font-medium leading-relaxed">
                {activeReport.pre_landfall_action}
              </p>
            </div>

            {/* Parametric Grant Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-mono">Parametric Emergency Grant</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    ₹{activeReport.recommended_payout_inr_lakhs} Lakhs Authorized
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  onAuthorizeGrant(
                    activeReport.asset_details?.panchayat || "Coastal Panchayat",
                    activeReport.asset_details?.district || "Coastal District",
                    activeReport.asset_details?.serves_population || 45000
                  )
                }
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>RELEASE EMERGENCY LIQUIDITY</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Horizontal Asset Gallery */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
            MONITORED COASTAL ASSET INVENTORY ({filteredReports.length})
          </h4>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 text-[10px] font-mono">
            {["ALL", "CRITICAL", "SUBSTATION", "HOSPITAL", "BRIDGE"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-0.5 rounded-full border transition-all ${
                  filterType === f
                    ? "bg-cyan-500/20 text-cyan-accent border-cyan-400 font-bold"
                    : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredReports.map((rep) => {
            const photo = rep.asset_details?.image_url ||
              (rep.asset_name.includes("Substation") ? "/images/substation.jpg" :
               rep.asset_name.includes("Hospital") ? "/images/hospital.jpg" :
               rep.asset_name.includes("Bridge") ? "/images/bridge.jpg" : "/images/shelter.jpg");

            return (
              <div
                key={rep.asset_id}
                className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-400/50 transition-all group flex flex-col justify-between"
              >
                <div className="relative h-28 w-full overflow-hidden">
                  <img
                    src={photo}
                    alt={rep.asset_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold backdrop-blur-md border ${
                    rep.failure_probability_pct > 70
                      ? "bg-red-500/40 border-red-400 text-red-300"
                      : rep.failure_probability_pct > 40
                      ? "bg-amber-500/40 border-amber-400 text-amber-300"
                      : "bg-emerald-500/40 border-emerald-400 text-emerald-300"
                  }`}>
                    {rep.failure_probability_pct}% Risk
                  </span>
                </div>

                <div className="p-3 space-y-1">
                  <h5 className="font-bold text-xs text-white line-clamp-1">{rep.asset_name}</h5>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{rep.pre_landfall_action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
