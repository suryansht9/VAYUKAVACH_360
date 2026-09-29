import { Shield, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#080A10] text-zinc-400 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white text-xs tracking-wide">VAYUKAVACH-360</span>
            <span className="text-[11px] text-zinc-500 block">Anticipatory Cyclone Resilience Intelligence Twin</span>
          </div>
        </div>

        <div className="flex items-center space-x-5 text-xs">
          <span className="text-zinc-400">
            Powered by Google GenAI (Gemini 3.7) & Earth Engine
          </span>
          <span className="text-zinc-700">|</span>
          <a
            href="https://earthengine.google.com/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 text-zinc-400 transition-colors flex items-center space-x-1"
          >
            <span>Google Earth Engine</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
