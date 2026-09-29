"use client";

import React from "react";
import { LiveWeatherLocator } from "@/components/LiveWeatherLocator";
import { Compass, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WeatherReportPage() {
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
                LOCATION WEATHER & 48H CLIMATE PREDICTOR
              </h1>
              <span className="px-2 py-0.2 text-[9px] font-mono bg-white/10 text-cyan-400 border border-white/10 rounded font-medium">
                ECMWF ERA5 + GEE NASADEM
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Query any Indian coastal municipality or GPS coordinates for real-time telemetry and 48-hour pre-landfall surge dynamics.
            </p>
          </div>
        </div>

        <Link
          href="/command-center"
          className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide hover:bg-cyan-300 transition-all shadow-sm"
        >
          COMMAND DASHBOARD
        </Link>
      </div>

      {/* Live Weather Locator Component */}
      <LiveWeatherLocator />

    </div>
  );
}
