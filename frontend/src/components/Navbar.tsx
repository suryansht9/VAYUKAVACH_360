"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Activity, Globe, Radio, Navigation, Database, Mic, Compass, Cpu } from "lucide-react";
import { VoiceAssistantModal } from "@/components/VoiceAssistantModal";
import { TechStackAuditModal } from "@/components/TechStackAuditModal";

export function Navbar() {
  const pathname = usePathname();
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isTechAuditOpen, setIsTechAuditOpen] = useState<boolean>(false);

  const links = [
    { href: "/", label: "Landing", icon: Globe },
    { href: "/command-center", label: "Command Center", icon: Shield },
    { href: "/weather-report", label: "Weather & 48h Predictor", icon: Compass },
    { href: "/gee-twin", label: "GEE Flood Twin", icon: Activity },
    { href: "/evacuation", label: "Surge Router", icon: Navigation },
    { href: "/public-data", label: "Govt Open Data", icon: Database },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#080A10]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/40 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-white">VAYUKAVACH</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white/10 text-cyan-400 border border-white/10 rounded">360</span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-tight font-normal">Anticipatory Cyclone Intelligence</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#0D111C] p-1 rounded-xl border border-white/[0.08]">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-zinc-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Badges & Launchers */}
          <div className="flex items-center space-x-2">
            
            {/* Google Tech Stack Audit */}
            <button
              onClick={() => setIsTechAuditOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 text-zinc-300 border border-white/10 text-xs font-medium hover:bg-white/10 hover:text-white transition-all flex items-center space-x-1.5"
              title="Inspect 7 Google AI & Open Data Pillars"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Tech Stack (30%)</span>
              <span className="xl:hidden">Tech</span>
            </button>

            {/* Multilingual Dialogflow Voice AI Launcher */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium hover:bg-amber-500/20 transition-all flex items-center space-x-1.5"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Voice AI</span>
            </button>

            <Link
              href="/command-center"
              prefetch={true}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>COMMAND</span>
            </Link>

          </div>
        </div>
      </header>

      {/* Multilingual Voice AI Dialogflow Modal */}
      <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* Google Cloud Tech Stack & Evaluation Matrix Modal */}
      <TechStackAuditModal isOpen={isTechAuditOpen} onClose={() => setIsTechAuditOpen(false)} />
    </>
  );
}
