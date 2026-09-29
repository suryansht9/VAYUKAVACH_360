"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchTTSBroadcast, TTSResponse } from "@/lib/api";
import { 
  Radio, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Download, 
  Globe2, 
  Sparkles,
  Sliders
} from "lucide-react";

export function AudioBroadcaster() {
  const [selectedLang, setSelectedLang] = useState<string>("or");
  const [ttsData, setTtsData] = useState<TTSResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const languages = [
    { code: "or", name: "Odia (ଓଡ଼ିଆ)", region: "Odisha Coastal Belt" },
    { code: "bn", name: "Bengali (বাংলা)", region: "West Bengal & Sunderbans" },
    { code: "te", name: "Telugu (తెలుగు)", region: "Andhra Coastal Corridor" },
    { code: "hi", name: "Hindi (हिन्दी)", region: "National Emergency Network" },
    { code: "en", name: "English", region: "NDMA Command Dispatch" },
  ];

  useEffect(() => {
    loadAudio(selectedLang);
  }, [selectedLang]);

  const loadAudio = async (lang: string) => {
    setLoading(true);
    stopPlayback();
    const data = await fetchTTSBroadcast(lang);
    setTtsData(data);
    setLoading(false);
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (ttsData?.has_audio && ttsData.audio_base64) {
      if (!audioRef.current) {
        audioRef.current = new Audio(`data:audio/mp3;base64,${ttsData.audio_base64}`);
      } else {
        audioRef.current.src = `data:audio/mp3;base64,${ttsData.audio_base64}`;
      }

      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Audio playback error, falling back to speech synthesis:", e);
        fallbackSpeech();
      });

      audioRef.current.onended = () => setIsPlaying(false);
    } else {
      fallbackSpeech();
    }
  };

  const fallbackSpeech = () => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(ttsData?.alert_text || "");
      utterance.rate = playbackRate;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!ttsData?.audio_base64) return;
    const link = document.createElement("a");
    link.href = `data:audio/mp3;base64,${ttsData.audio_base64}`;
    link.download = `VayuKavach_Alert_${selectedLang}_${new Date().toISOString().split("T")[0]}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-black/85 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                MULTI-DIALECT REGIONAL AUDIO BROADCASTER
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-400/30">
                LIVE DISASTER TTS
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Emergency Audio Dispatch in Native Coastal Languages (Odia, Bengali, Telugu, Hindi, English)
            </p>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-2xl border border-white/10 overflow-x-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedLang === lang.code
                  ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Playback Deck */}
      <div className="bg-black/60 p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Play Controls & Waveform */}
        <div className="flex items-center space-x-4 w-full md:w-auto">
          
          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 transition-transform flex-shrink-0"
            title={isPlaying ? "Pause Broadcast" : "Play Voice Broadcast"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-amber-400 font-bold">
                BROADCAST: {ttsData?.language_name}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                ({playbackRate}x speed)
              </span>
            </div>

            {/* Dynamic Waveform Visualizer */}
            <div className="flex items-center space-x-1 mt-1.5 h-6">
              {[35, 65, 25, 90, 50, 100, 75, 40, 85, 30, 95, 60, 45, 80].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full bg-amber-400 transition-all duration-150 ${
                    isPlaying ? "animate-pulse" : "opacity-30"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(6, (h * 0.22))}px` : "6px",
                    animationDelay: `${idx * 0.08}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Spoken Alert Script */}
        <div className="flex-1 bg-white/5 p-3.5 rounded-xl border border-white/5 text-xs text-amber-100 font-medium leading-relaxed">
          {ttsData?.alert_text}
        </div>

        {/* Speed Controls & Download */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setPlaybackRate(playbackRate === 1.0 ? 1.25 : 1.0)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-mono font-bold transition-all"
            title="Toggle playback speed"
          >
            {playbackRate}X
          </button>

          {ttsData?.has_audio && (
            <button
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all"
              title="Download MP3 Broadcast"
            >
              <Download className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
