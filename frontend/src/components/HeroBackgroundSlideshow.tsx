"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Eye, Waves, Wind, CloudRain, Satellite } from "lucide-react";

export interface SlideData {
  id: string;
  image: string;
  fallbackImage: string;
  tag: string;
  title: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SLIDES: SlideData[] = [
  {
    id: "cyclone-satellite",
    image: "/images/hero_slides/cyclone_satellite.webp",
    fallbackImage: "/images/hero_slides/cyclone_satellite.jpg",
    tag: "INSAT-3DR / SATELLITE TELEMETRY",
    title: "Severe Cyclonic Circulation & Spiral Banding",
    subtext: "High-resolution IR thermal & atmospheric pressure vortex",
    icon: Satellite,
  },
  {
    id: "storm-sea-surge",
    image: "/images/hero_slides/storm_sea_surge.webp",
    fallbackImage: "/images/hero_slides/storm_sea_surge.jpg",
    tag: "HYDRODYNAMIC TIDAL FORCING",
    title: "Extreme Coastal Surge & Wave Propagation",
    subtext: "Astronomical peak tide coupled with 3.8m barometric surge",
    icon: Waves,
  },
  {
    id: "flood-inundation",
    image: "/images/hero_slides/flood_inundation.webp",
    fallbackImage: "/images/hero_slides/flood_inundation.jpg",
    tag: "NASADEM 30M ELEVATION INUNDATION",
    title: "Lowland Delta Water Inundation & Overflow",
    subtext: "River basin hydrodynamic breakout 48h pre-landfall projection",
    icon: CloudRain,
  },
  {
    id: "coastal-cyclone-clouds",
    image: "/images/hero_slides/coastal_cyclone_clouds.webp",
    fallbackImage: "/images/hero_slides/coastal_cyclone_clouds.jpg",
    tag: "DOPPLER RADAR MESOCYCLONE",
    title: "Pre-Landfall Cyclone Wall Cloud Front",
    subtext: "165 km/h sustained wind velocities approaching Odisha coast",
    icon: Wind,
  },
  {
    id: "radar-cyclone-eye",
    image: "/images/hero_slides/radar_cyclone_eye.webp",
    fallbackImage: "/images/hero_slides/radar_cyclone_eye.jpg",
    tag: "CENTRAL DEPRESSION CORE",
    title: "Atmospheric Eye Vortex & Deep Precipitation",
    subtext: "Supercharged convective eyewall storm dynamics",
    icon: Eye,
  },
  {
    id: "flood-rescue-coastal",
    image: "/images/hero_slides/flood_rescue_coastal.webp",
    fallbackImage: "/images/hero_slides/flood_rescue_coastal.jpg",
    tag: "ESTUARINE BACKWATER SURGE",
    title: "Coastal Ingress & Riverine Flood Boundary",
    subtext: "Real-time synthetic aperture radar (SAR) water demarcation",
    icon: Waves,
  },
  {
    id: "typhoon-dark-sky",
    image: "/images/hero_slides/typhoon_dark_sky.webp",
    fallbackImage: "/images/hero_slides/typhoon_dark_sky.jpg",
    tag: "BAROMETRIC PRESSURE GRADIENT",
    title: "Pre-Landfall Atmospheric Gale Front",
    subtext: "Dense moisture convergence and high-energy squall line",
    icon: Wind,
  },
];

const AUTO_SLIDE_INTERVAL = 6000; // 6s per slide

export default function HeroBackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imgSrcMap, setImgSrcMap] = useState<Record<string, string>>({});

  // Eager preloading for instant zero-lag slide transitions
  useEffect(() => {
    if (typeof window === "undefined") return;
    SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      img.onerror = () => {
        // Preload fallback if webp fails
        const fallback = new Image();
        fallback.src = slide.fallbackImage;
      };
    });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  const currentSlide = SLIDES[currentIndex];
  const IconComponent = currentSlide.icon;
  const currentSrc = imgSrcMap[currentSlide.id] || currentSlide.image;

  const handleImageError = (id: string, fallback: string) => {
    setImgSrcMap((prev) => ({ ...prev, [id]: fallback }));
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
      {/* Background Image Carousel with Optimized Cross-Fade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.8, ease: "easeInOut" },
            scale: { duration: 5.5, ease: "linear" },
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSrc}
            alt={currentSlide.title}
            loading={currentIndex === 0 ? "eager" : "lazy"}
            decoding="async"
            // @ts-ignore
            fetchPriority={currentIndex === 0 ? "high" : "auto"}
            onError={() => handleImageError(currentSlide.id, currentSlide.fallbackImage)}
            className="w-full h-full object-cover object-center brightness-95 contrast-[1.08] saturate-[1.05]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Light, Clean & Realistic Overlays (Enhanced Image Clarity & Transparency) */}
      <div className="absolute inset-0 bg-[#080A10]/25 pointer-events-none" />
      
      {/* Refined Directional Vignette: Subtle top header fade & soft ground blend, keeping full image vivid */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080A10]/80 via-transparent to-[#080A10]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080A10]/50 via-transparent to-[#080A10]/50 pointer-events-none" />

      {/* Clean Minimal Floating HUD Telemetry Badge at Top */}
      <div className="absolute top-6 right-6 hidden md:flex items-center space-x-3 pointer-events-auto z-20">
        <div className="flex items-center space-x-2.5 bg-[#0A0E18]/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-zinc-200 tracking-wider">
            INSAT-3DR FEED
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            {String(currentIndex + 1).padStart(2, "0")}/{String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Minimal HUD Controls Bar at Bottom of Hero */}
      <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto z-20">
        
        {/* Slide Info Pill */}
        <div className="flex items-center space-x-3 bg-[#0A0E18]/85 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-semibold text-cyan-400 tracking-wider uppercase">
              {currentSlide.tag}
            </span>
            <span className="text-xs text-zinc-300 font-medium line-clamp-1">
              {currentSlide.title}
            </span>
          </div>
        </div>

        {/* Minimal Progress Indicators & Next/Prev Controls */}
        <div className="flex items-center space-x-3 bg-[#0A0E18]/85 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center space-x-1.5">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                className="group py-1 focus:outline-none"
                title={slide.title}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 bg-cyan-400"
                      : "w-2 bg-white/20 group-hover:bg-white/40"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="h-3 w-px bg-white/10 mx-1" />

          <div className="flex items-center space-x-1">
            <button
              onClick={prevSlide}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-white/10 transition-colors focus:outline-none"
              title={isPlaying ? "Pause slideshow" : "Resume slideshow"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-cyan-400" />
              ) : (
                <Play className="w-4 h-4 text-zinc-300" />
              )}
            </button>

            <button
              onClick={nextSlide}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
