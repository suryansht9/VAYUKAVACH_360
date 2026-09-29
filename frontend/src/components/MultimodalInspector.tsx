"use client";

import React, { useState } from "react";
import { inspectFieldPhoto, PhotoInspectionResult } from "@/lib/api";
import { 
  Camera, 
  Sparkles, 
  Upload, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Eye, 
  CheckCircle2, 
  Layers,
  FileImage,
  Crosshair
} from "lucide-react";

export function MultimodalInspector() {
  const [selectedPhoto, setSelectedPhoto] = useState<string>("/images/substation.jpg");
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [inspectionResult, setInspectionResult] = useState<PhotoInspectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeContext, setActiveContext] = useState<string>("Coastal 220kV Transformer Bay");

  const samplePhotos = [
    { label: "Substation Transformer Inundation", url: "/images/substation.jpg", context: "Coastal 220kV Transformer Bay" },
    { label: "Emergency Hospital Generator Room", url: "/images/hospital.jpg", context: "Regional Hospital Generator Room" },
    { label: "Highway Bridge Abutment Scour", url: "/images/bridge.jpg", context: "NH-53 Evacuation Bridge Concrete Abutment" },
    { label: "Stilt Cyclone Shelter Approach", url: "/images/shelter.jpg", context: "Mahanadi Delta Cyclone Shelter #14" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Full = reader.result as string;
      setSelectedPhoto(base64Full);
      setPhotoBase64(base64Full);
      setActiveContext(file.name);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await inspectFieldPhoto(photoBase64, activeContext);
      setInspectionResult(result);
    } catch (e) {
      console.error("Photo inspection failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-black/85 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                VERTEX AI VISION & GEMINI CITIZEN PHOTO INSPECTOR
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full font-mono font-bold">
                MULTIMODAL REASONING
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Analyzes Citizen Drone & Field Photos for Water Ingress Depth, Structural Scour & Clearance Directives
            </p>
          </div>
        </div>

        {/* Upload Custom Image Button */}
        <label className="cursor-pointer px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 flex items-center space-x-2 transition-all shadow-md">
          <Upload className="w-4 h-4 text-cyan-accent" />
          <span>UPLOAD FIELD PHOTO</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Grid: Viewfinder vs Analysis Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left (5 cols): Photo Viewfinder & Sample Selector */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="relative h-64 sm:h-72 rounded-3xl overflow-hidden border border-white/10 group shadow-2xl bg-black">
            <img
              src={selectedPhoto}
              alt="Field Photo"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

            {/* Viewfinder Bounding Box Indicator */}
            <div className="absolute inset-6 border border-cyan-400/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between text-[10px] font-mono text-cyan-accent">
                <span>[SCANNER ACTIVE]</span>
                <span>FOV: 84°</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>DATUM: 0.0m AMSL</span>
                <span>SCALE: 1:50</span>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-accent border border-white/10 font-bold">
                VERTEX AI MULTIMODAL
              </span>
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(0,242,254,0.4)] hover:scale-105 transition-transform flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? "INSPECTING..." : "RUN VISION ANALYSIS"}</span>
              </button>
            </div>
          </div>

          {/* Sample Photo Selection Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block px-1">
              SELECT BENCHMARK ASSET PHOTO:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {samplePhotos.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPhoto(sample.url);
                    setPhotoBase64("");
                    setActiveContext(sample.context);
                    setInspectionResult(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-left text-[11px] transition-all line-clamp-1 ${
                    selectedPhoto === sample.url
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-accent font-bold shadow-md"
                      : "bg-black/60 border-white/10 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right (7 cols): Vision Inspection Report */}
        <div className="lg:col-span-7 space-y-4">
          {inspectionResult ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-black/60 border border-cyan-400/30 space-y-4 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-accent font-bold uppercase block">
                    IDENTIFIED ASSET CLASSIFICATION:
                  </span>
                  <h4 className="font-extrabold text-base text-white">{inspectionResult.photo_type}</h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block font-mono">Vertex AI Confidence</span>
                  <span className="text-sm font-mono font-black text-emerald-400">
                    {(inspectionResult.vertex_ai_confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-zinc-400 block font-mono">Visible Surge Depth</span>
                  <span className="text-lg font-black font-mono text-cyan-accent">{inspectionResult.submergence_depth_m}m</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-zinc-400 block font-mono">Failure Probability</span>
                  <span className="text-lg font-black font-mono text-red-400">{inspectionResult.structural_failure_prob_pct}%</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-zinc-400 block font-mono">Air Intake Clearance</span>
                  <span className="text-lg font-black font-mono text-amber-400">{inspectionResult.air_intake_clearance_m}m</span>
                </div>
              </div>

              {/* Hazard Box */}
              <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 text-xs text-red-200 leading-relaxed font-mono">
                ⚠️ <strong>HAZARD DETECTED:</strong> {inspectionResult.detected_hazard}
              </div>

              {/* Engineering Directive */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-400/30 text-xs text-cyan-100 font-medium leading-relaxed">
                🛠️ <strong>AI ENGINEERING DIRECTIVE:</strong> {inspectionResult.recommended_mitigation}
              </div>

              {/* Evacuation Priority Tier */}
              <div className="flex items-center justify-between text-xs pt-1 font-mono">
                <span className="text-zinc-400">Evacuation Priority Tier:</span>
                <span className={`px-3 py-1 rounded-full font-bold border ${
                  inspectionResult.evacuation_priority === "CRITICAL"
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  {inspectionResult.evacuation_priority}
                </span>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] p-8 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
              <Crosshair className="w-8 h-8 text-cyan-accent animate-pulse" />
              <h4 className="font-extrabold text-sm text-white">READY FOR MULTIMODAL FIELD INSPECTION</h4>
              <p className="text-xs text-zinc-400 max-w-sm">
                Select a benchmark photo or upload custom drone imagery to evaluate submergence depth and remaining intake clearance.
              </p>
              <button
                onClick={runAnalysis}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,242,254,0.4)]"
              >
                RUN INITIAL AI SCAN
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
