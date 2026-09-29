"use client";

import React, { useEffect, useState } from "react";
import {
  fetchCycloneTrack,
  fetchInfrastructureAssets,
  fetchInundation,
  fetchVulnerabilityAll,
  fetchLiquiditySummary,
  CycloneTrack,
  InfrastructureAsset,
  InundationData,
  RiskReport,
  LiquiditySummary,
} from "@/lib/api";
import { CommandMap } from "@/components/CommandMap";
import { GeminiRiskCards } from "@/components/GeminiRiskCards";
import { ParametricBar } from "@/components/ParametricBar";
import { AudioBroadcaster } from "@/components/AudioBroadcaster";
import { SurgeEvacuationRouter } from "@/components/SurgeEvacuationRouter";
import { MultimodalInspector } from "@/components/MultimodalInspector";
import { PublicDataTelemetry } from "@/components/PublicDataTelemetry";
import { LiveWeatherLocator } from "@/components/LiveWeatherLocator";
import { Radio, RefreshCw, Navigation, Camera, Database, Sparkles, Layers, Compass, ShieldCheck } from "lucide-react";

export default function CommandCenterPage() {
  const [track, setTrack] = useState<CycloneTrack | null>(null);
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [inundation, setInundation] = useState<InundationData | null>(null);
  const [riskReports, setRiskReports] = useState<RiskReport[]>([]);
  const [liquiditySummary, setLiquiditySummary] = useState<LiquiditySummary | null>(null);
  
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);
  const [showGEELayer, setShowGEELayer] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"weather" | "gis_risk" | "router" | "vision" | "public_data">("weather");
  const [loading, setLoading] = useState<boolean>(true);
  const [liveAutoSync, setLiveAutoSync] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  // Real-time interval sync every 10 seconds
  useEffect(() => {
    if (!liveAutoSync) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [liveAutoSync]);

  const loadData = async (showSpinner: boolean = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [tData, aData, iData, rData, lData] = await Promise.all([
        fetchCycloneTrack(),
        fetchInfrastructureAssets(),
        fetchInundation(20.2684, 86.6715, 4.2),
        fetchVulnerabilityAll(4.2, 213.0),
        fetchLiquiditySummary(),
      ]);

      setTrack(tData);
      setAssets(aData);
      setInundation(iData);
      setRiskReports(rData);
      setLiquiditySummary(lData);
      if (aData.length > 0 && !selectedAsset) setSelectedAsset(aData[0]);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error loading command center telemetry:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleAuthorizeGrant = (panchayat: string, district: string, pop: number) => {
    if (!liquiditySummary) return;
    const newGrant = {
      grant_id: `PLR-2026-OD-${Math.floor(Math.random() * 90 + 10)}`,
      panchayat,
      district,
      amount_inr_lakhs: 25.0,
      status: "APPROVED & DISBURSED",
      authorized_timestamp: new Date().toISOString(),
      trigger_reason: "Pre-landfall surge > 3.0m threshold verified by GEE twin.",
      direct_benefit_beneficiaries: pop,
    };
    setLiquiditySummary({
      total_grants_authorized: liquiditySummary.total_grants_authorized + 1,
      total_liquidity_released_inr_lakhs: liquiditySummary.total_liquidity_released_inr_lakhs + 25.0,
      total_beneficiaries_covered: liquiditySummary.total_beneficiaries_covered + pop,
      grants: [newGrant, ...liquiditySummary.grants],
    });
  };

  return (
    <div className="min-h-screen bg-[#080A10] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Command Center Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0B0F1A] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">VAYUKAVACH-360 OPERATIONAL COMMAND PLATFORM</h1>
              <span className="px-2 py-0.2 text-[9px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                T-41.5h ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Live Weather & 48h Prediction • GEE NASADEM Twin • Vertex AI Vision • Dynamic Surge Router • National Open Data
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
            <span className="font-mono text-[11px]">{liveAutoSync ? "AUTO-SYNC (10S)" : "MANUAL SYNC"}</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white border border-white/15 flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="font-mono text-[11px]">SYNC</span>
          </button>
        </div>
      </div>

      {/* Parametric Liquidity Authorization Bar (Full Width Top Component) */}
      <ParametricBar summary={liquiditySummary} />

      {/* Multi-Dialect Regional Audio Player (Full Width Component) */}
      <AudioBroadcaster />

      {/* Primary Navigation Tabs for High-Value Features */}
      <div className="flex items-center space-x-1.5 bg-[#0B0F1A] p-1.5 rounded-xl border border-white/[0.08] overflow-x-auto">
        {[
          { id: "weather", label: "Live Location Weather & 48h Prediction", icon: Compass },
          { id: "gis_risk", label: "GIS Telemetry & Gemini Risk Cards", icon: Layers },
          { id: "router", label: "Surge-Aware Safe Evacuation Router", icon: Navigation },
          { id: "vision", label: "Vertex AI Citizen Photo Inspector", icon: Camera },
          { id: "public_data", label: "IMD + ISRO Bhuvan + BigQuery GIS", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyan-400 text-slate-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {activeTab === "weather" && <LiveWeatherLocator />}

      {activeTab === "gis_risk" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 h-full">
            <CommandMap
              assets={assets}
              track={track}
              inundation={inundation}
              selectedAsset={selectedAsset}
              onSelectAsset={(a) => setSelectedAsset(a)}
              showGEELayer={showGEELayer}
              onToggleGEE={() => setShowGEELayer(!showGEELayer)}
            />
          </div>

          <div className="lg:col-span-5 h-full">
            <GeminiRiskCards
              reports={riskReports}
              selectedAsset={selectedAsset}
              onAuthorizeGrant={handleAuthorizeGrant}
            />
          </div>
        </div>
      )}

      {activeTab === "router" && <SurgeEvacuationRouter />}

      {activeTab === "vision" && <MultimodalInspector />}

      {activeTab === "public_data" && <PublicDataTelemetry />}

    </div>
  );
}
