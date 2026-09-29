"use client";

import React, { useState } from "react";
import { LiquiditySummary } from "@/lib/api";
import { DollarSign, Landmark, CheckCircle2, Download, ShieldCheck, FileSpreadsheet, ExternalLink } from "lucide-react";

interface ParametricBarProps {
  summary: LiquiditySummary | null;
}

export function ParametricBar({ summary }: ParametricBarProps) {
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);
  const grants = summary?.grants || [];

  const downloadCSV = () => {
    if (!grants.length) return;
    const headers = ["Grant ID", "PFMS Ref", "Panchayat", "District", "Amount (INR Lakhs)", "Status", "Timestamp", "Beneficiaries", "Trigger Reason"];
    const rows = grants.map((g: any) => [
      g.grant_id,
      g.pfms_ref || "N/A",
      `"${g.panchayat}"`,
      `"${g.district}"`,
      g.amount_inr_lakhs,
      g.status,
      g.authorized_timestamp,
      g.direct_benefit_beneficiaries,
      `"${g.trigger_reason?.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VayuKavach_Parametric_Disaster_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-black/85 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-4">
      
      {/* Top Header & Aggregates */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                PARAMETRIC EMERGENCY LIQUIDITY DISBURSEMENT BAR
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-400/30">
                PANCHAYAT DBT PROTOCOL
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Automated Pre-Landfall Emergency Funding Released 48h Prior to Cyclone Strike (PFMS Verified)
            </p>
          </div>
        </div>

        {/* Aggregates & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-4 bg-black/60 px-4 py-2 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Total Disbursed</span>
              <span className="text-base font-black font-mono text-emerald-400">
                ₹{summary?.total_liquidity_released_inr_lakhs || 95.0} Lakhs
              </span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Citizens Covered</span>
              <span className="text-base font-black font-mono text-white">
                {(summary?.total_beneficiaries_covered || 175000).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={downloadCSV}
            className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 flex items-center space-x-2 transition-all shadow-md"
            title="Download full CSV Audit Ledger"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">EXPORT LEDGER (CSV)</span>
          </button>
        </div>

      </div>

      {/* Live Disbursed Grant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {grants.slice(0, 4).map((grant: any) => (
          <div
            key={grant.grant_id}
            className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 flex flex-col justify-between space-y-2 hover:border-emerald-400/60 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{grant.grant_id}</span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" /> DISBURSED
                </span>
              </div>
              <h4 className="font-bold text-xs text-white mt-1.5 line-clamp-1">{grant.panchayat}</h4>
              <p className="text-[11px] text-zinc-400">{grant.district} District</p>
              <p className="text-[10px] text-zinc-300 mt-2 line-clamp-2 bg-white/5 p-2 rounded-xl border border-white/5 font-mono">
                {grant.trigger_reason}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs font-mono">
              <span className="text-zinc-400 text-[10px]">Pop: {grant.direct_benefit_beneficiaries?.toLocaleString()}</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                ₹{grant.amount_inr_lakhs} Lakhs
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
