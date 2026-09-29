"use client";

import React, { useState, useEffect, useRef } from "react";
import { queryVoiceAssistant, VoiceAssistantResponse } from "@/lib/api";
import { 
  Mic, 
  Send, 
  Volume2, 
  Radio, 
  MessageSquare, 
  Sparkles, 
  X, 
  VolumeX, 
  HelpCircle,
  ShieldCheck,
  User,
  Bot,
  RotateCcw,
  Compass,
  PhoneCall
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  lang?: string;
  audioBase64?: string;
  timestamp: string;
}

export function VoiceAssistantModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [queryText, setQueryText] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [loading, setLoading] = useState<boolean>(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const initialWelcomeMessage: ChatMessage = {
    id: "welcome-1",
    sender: "assistant",
    text: "Hello! I am VayuKavach-360's Emergency Voice Assistant. You can speak or type to me in English, Hindi, Odia, Bengali, Telugu, or Gujarati. How can I assist you with cyclone tracking, shelters, safe routes, or relief funds today?",
    lang: "en",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi (हिन्दी)" },
    { code: "or", name: "Odia (ଓଡ଼ିଆ)" },
    { code: "bn", name: "Bengali (বাংলা)" },
    { code: "te", name: "Telugu (తెలుగు)" },
    { code: "gu", name: "Gujarati (ગુજરાતી)" },
  ];

  const quickPrompts = [
    { label: "👋 Say Hi", query: "Hi, how are you?" },
    { label: "🏠 Safe Shelters", query: "Where is the nearest safe shelter with capacity?" },
    { label: "🗺️ Safe Evacuation Route", query: "Is NH-53 bridge safe or what is the safe bypass route?" },
    { label: "🌪️ Cyclone Status", query: "What is the current cyclone location, wind speed and surge forecast?" },
    { label: "💰 Relief Funds", query: "Has Paradeep received parametric grant funds?" },
    { label: "ℹ️ About VayuKavach", query: "Who are you and what does VayuKavach-360 do?" },
    { label: "📞 Helplines", query: "What are the emergency helpline numbers?" }
  ];

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Clean up audio on close
  useEffect(() => {
    if (!isOpen && currentAudio) {
      currentAudio.pause();
      if (typeof window !== "undefined" && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, currentAudio]);

  if (!isOpen) return null;

  const handleQuery = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryText("");
    setLoading(true);

    try {
      const res = await queryVoiceAssistant(trimmed, selectedLang);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: res.response_script,
        lang: res.language_code || selectedLang,
        audioBase64: res.audio_base64,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      // Auto-play audio
      playVoiceAudio(assistantMsg);
    } catch (e) {
      console.error("Voice assistant query error:", e);
      const fallbackMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: "assistant",
        text: "I am here with you. Please ask about safe shelters, weather forecasts, road bypass routes, or emergency funding.",
        lang: selectedLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const playVoiceAudio = (msg: ChatMessage) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (msg.audioBase64) {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${msg.audioBase64}`);
        setCurrentAudio(audio);
        setPlayingMessageId(msg.id);
        audio.play().catch((e) => {
          console.warn("Direct base64 audio failed, using browser speech synthesis:", e);
          fallbackSpeech(msg.text, msg.id, msg.lang);
        });
        audio.onended = () => {
          setPlayingMessageId(null);
          setCurrentAudio(null);
        };
        audio.onerror = () => {
          fallbackSpeech(msg.text, msg.id, msg.lang);
        };
      } catch {
        fallbackSpeech(msg.text, msg.id, msg.lang);
      }
    } else {
      fallbackSpeech(msg.text, msg.id, msg.lang);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingMessageId(null);
  };

  const fallbackSpeech = (script: string, msgId: string, langCode?: string) => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(script);
      const langMap: Record<string, string> = {
        hi: "hi-IN",
        bn: "bn-IN",
        te: "te-IN",
        gu: "gu-IN",
        or: "hi-IN",
        en: "en-IN"
      };
      u.lang = langMap[langCode || selectedLang] || "en-US";
      u.rate = 1.0;
      setPlayingMessageId(msgId);
      u.onend = () => setPlayingMessageId(null);
      u.onerror = () => setPlayingMessageId(null);
      window.speechSynthesis.speak(u);
    }
  };

  const handleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your query in the input box.");
      return;
    }

    const recognition = new SpeechRecognition();
    const langMap: Record<string, string> = {
      hi: "hi-IN",
      bn: "bn-IN",
      te: "te-IN",
      gu: "gu-IN",
      or: "hi-IN",
      en: "en-IN"
    };
    recognition.lang = langMap[selectedLang] || "en-IN";
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQueryText(transcript);
      setIsListening(false);
      handleQuery(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleResetChat = () => {
    stopAudio();
    setMessages([initialWelcomeMessage]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0A0E18]/95 rounded-3xl border border-white/15 p-4 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col h-[90vh] max-h-[700px]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00F2FE] border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)]">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  VAYUKAVACH VOICE COPILOT
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-400/30">
                  HUMAN INTERACTIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Conversational 48h Cyclone & Pre-Landfall Resilience Agent</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dialect Selector Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 flex-shrink-0 border-b border-white/5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase mr-1">Language:</span>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setSelectedLang(l.code)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLang === l.code
                  ? "bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.4)]"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>

        {/* Chat Messages History Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isPlaying = playingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? "bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-md"
                      : "bg-[#0E1424] text-zinc-200 border border-white/10 rounded-tl-none shadow-inner"
                  }`}
                >
                  <p className={isUser ? "font-semibold" : "text-zinc-200 font-normal"}>{msg.text}</p>

                  <div className="flex items-center justify-between text-[10px] pt-1 opacity-70">
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <button
                        onClick={() => (isPlaying ? stopAudio() : playVoiceAudio(msg))}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-md font-mono text-[10px] transition-all ${
                          isPlaying
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-white/10 text-cyan-400 hover:bg-white/20"
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>STOP</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>PLAY VOICE</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#0E1424] rounded-2xl rounded-tl-none p-3.5 border border-white/10 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-zinc-400 font-mono pl-1">VayuKavach is speaking...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 pb-1 flex-shrink-0">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQueryText(p.query);
                  handleQuery(p.query);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] text-zinc-300 hover:border-cyan-400/40 hover:text-white hover:bg-white/10 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Voice & Text Input Bar */}
        <div className="flex items-center space-x-2 pt-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleSpeechRecognition}
            className={`p-3 rounded-2xl border transition-all ${
              isListening
                ? "bg-red-500 text-white border-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                : "bg-white/10 text-zinc-300 hover:text-white border-white/15 hover:border-cyan-400/40"
            }`}
            title="Click to speak (Microphone)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={
              selectedLang === "hi"
                ? "नमस्ते बोलें या प्रश्न टाइप करें..."
                : selectedLang === "or"
                ? "ନମସ୍କାର କୁହନ୍ତୁ କିମ୍ବା ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ..."
                : selectedLang === "bn"
                ? "হ্যালো বলুন বা প্রশ্ন টাইপ করুন..."
                : selectedLang === "te"
                ? "నమస్కారం చెప్పండి లేదా టైప్ చేయండి..."
                : "Say Hi, ask about shelters, routes, cyclone updates..."
            }
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery(queryText)}
            className="flex-1 bg-black/60 text-white text-xs px-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:border-cyan-400 placeholder:text-zinc-500"
          />

          <button
            onClick={() => handleQuery(queryText)}
            disabled={loading || !queryText.trim()}
            className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-transform hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
