"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Satellite, Compass, Activity, ShieldAlert, Sparkles, Eye, Radio, RefreshCw } from "lucide-react";

export function Globe3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<string>("Odisha (Paradeep Sector)");
  const [orbiting, setOrbiting] = useState<boolean>(true);

  // Sync orbiting state to OrbitControls without re-running scene setup
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = orbiting;
    }
  }, [orbiting]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 2.6);

    // 3. High-Performance Renderer Setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance",
      precision: "mediump"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.enableZoom = true;
    controls.minDistance = 1.8;
    controls.maxDistance = 5.0;
    controls.autoRotate = orbiting;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // Main Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Center Bay of Bengal / India towards camera initially
    globeGroup.rotation.x = 0.38;
    globeGroup.rotation.y = -1.45;

    // 5. Fast Local Texture Loading with instant procedural fallback
    const textureLoader = new THREE.TextureLoader();

    // Fast instant canvas procedural texture
    const createFallbackEarthTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0A1128";
        ctx.fillRect(0, 0, 1024, 512);

        // Tech grid lines
        ctx.strokeStyle = "rgba(0, 242, 254, 0.09)";
        ctx.lineWidth = 1;
        for (let x = 0; x < 1024; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 512);
          ctx.stroke();
        }
        for (let y = 0; y < 512; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1024, y);
          ctx.stroke();
        }

        // India Subcontinent Shape
        ctx.fillStyle = "#111C38";
        ctx.strokeStyle = "#00F2FE";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(725, 155);
        ctx.lineTo(695, 220);
        ctx.lineTo(730, 290);
        ctx.lineTo(760, 310);
        ctx.lineTo(775, 240);
        ctx.lineTo(790, 200); // Odisha
        ctx.lineTo(805, 185); // WB
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      return new THREE.CanvasTexture(canvas);
    };

    // Load local optimized texture
    const earthTexture = textureLoader.load(
      "/images/textures/earth-blue-marble.webp",
      undefined,
      undefined,
      () => {
        // Try JPG if WebP fails
        textureLoader.load(
          "/images/textures/earth-blue-marble.jpg",
          undefined,
          undefined,
          () => createFallbackEarthTexture()
        );
      }
    );

    const cloudTexture = textureLoader.load("/images/textures/earth-clouds.png");

    // 6. Earth Mesh (Primary Sphere)
    const earthGeo = new THREE.SphereGeometry(1, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 7. Atmospheric Clouds Shell Overlay
    const cloudGeo = new THREE.SphereGeometry(1.02, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    // 8. Atmospheric Fresnel Glow Shader
    const atmosphereGeo = new THREE.SphereGeometry(1.12, 36, 36);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.0, 0.95, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 9. Bay of Bengal Active Cyclone Vortex Swirl
    const vortexParticles = 280;
    const vortexGeo = new THREE.BufferGeometry();
    const vortexPositions = new Float32Array(vortexParticles * 3);
    const vortexColors = new Float32Array(vortexParticles * 3);

    for (let i = 0; i < vortexParticles; i++) {
      const t = i / vortexParticles;
      const angle = t * Math.PI * 12;
      const radius = 0.02 + t * 0.32;

      // Center over Bay of Bengal (approx lat 18.5 N, lon 88.0 E)
      const baseLat = 18.5 * (Math.PI / 180);
      const baseLon = 88.0 * (Math.PI / 180);

      const lat = baseLat + Math.sin(angle) * radius * 0.45;
      const lon = baseLon + Math.cos(angle) * radius * 0.45;

      const r = 1.035; // Cloud height elevation
      const x = r * Math.cos(lat) * Math.sin(lon);
      const y = r * Math.sin(lat);
      const z = r * Math.cos(lat) * Math.cos(lon);

      vortexPositions[i * 3] = x;
      vortexPositions[i * 3 + 1] = y;
      vortexPositions[i * 3 + 2] = z;

      // Crimson core to Cyan outer spiral
      vortexColors[i * 3] = t < 0.3 ? 1.0 : 0.0;
      vortexColors[i * 3 + 1] = t < 0.3 ? 0.23 : 0.95;
      vortexColors[i * 3 + 2] = 1.0;
    }

    vortexGeo.setAttribute("position", new THREE.BufferAttribute(vortexPositions, 3));
    vortexGeo.setAttribute("color", new THREE.BufferAttribute(vortexColors, 3));

    const vortexMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const vortexPoints = new THREE.Points(vortexGeo, vortexMat);
    globeGroup.add(vortexPoints);

    // 10. Hotspot Markers & Radar Pulse Rings
    const hotspots = [
      { id: "OD", name: "Odisha (Paradeep)", lat: 20.26, lon: 86.67, color: 0xff3b30 },
      { id: "WB", name: "West Bengal (Digha)", lat: 21.62, lon: 87.50, color: 0xffb300 },
      { id: "AP", name: "Andhra Pradesh (Kakinada)", lat: 16.98, lon: 82.28, color: 0x00f2fe },
    ];

    const pulseRings: THREE.Mesh[] = [];

    hotspots.forEach((spot) => {
      const phi = (90 - spot.lat) * (Math.PI / 180);
      const theta = (spot.lon + 180) * (Math.PI / 180);

      const r = 1.018;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      // Sphere Pin
      const pinGeo = new THREE.SphereGeometry(0.024, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: spot.color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(x, y, z);
      globeGroup.add(pinMesh);

      // Radar Ring
      const ringGeo = new THREE.RingGeometry(0.02, 0.05, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: spot.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x * 1.01, y * 1.01, z * 1.01);
      ringMesh.lookAt(0, 0, 0);
      globeGroup.add(ringMesh);
      pulseRings.push(ringMesh);
    });

    // 11. Lighting setup (Sun key light + Cyan rim ambient)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f2fe, 1.8);
    cyanRimLight.position.set(-5, -2, -5);
    scene.add(cyanRimLight);

    // 12. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Cloud movement
      cloudMesh.rotation.y += 0.0008;

      // Cyclone swirl rotation
      vortexPoints.rotation.z += 0.012;

      // Pulse rings expansion
      for (let i = 0; i < pulseRings.length; i++) {
        const s = 1 + Math.sin(elapsed * 4 + i) * 0.4;
        pulseRings[i].scale.set(s, s, s);
      }

      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden bg-[#0A0E18]/80 border border-white/[0.08] shadow-2xl flex items-center justify-center">
      
      {/* Background vignette & cosmic glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080A10]/70 via-transparent to-[#080A10]/90 pointer-events-none z-10" />

      {/* Top NASA HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2.5 bg-[#0A0E18]/85 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-white/10 text-xs pointer-events-auto shadow-md">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-zinc-200 font-medium tracking-wide text-[11px]">NASA BLUE MARBLE • BAY OF BENGAL</span>
          <span className="text-zinc-600 font-mono">|</span>
          <span className="text-cyan-400 font-mono text-[11px]">20.26° N, 86.67° E</span>
        </div>

        <button
          onClick={() => setOrbiting((prev) => !prev)}
          className="pointer-events-auto px-3 py-1.5 rounded-xl bg-[#0A0E18]/85 backdrop-blur-xl border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1.5 shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${orbiting ? "animate-spin" : ""}`} />
          <span className="text-[11px] font-mono">ROTATION: {orbiting ? "ON" : "PAUSED"}</span>
        </button>
      </div>

      {/* WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Telemetry Card Overlay */}
      <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A0E18]/85 backdrop-blur-xl p-3.5 rounded-xl border border-white/10 pointer-events-auto shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs text-white">ACTIVE CYCLONE TRACKING VECTORS</span>
              <span className="px-2 py-0.2 text-[9px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                CATEGORY 4 EQUIVALENT
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Super Cyclone VAYU-KAVACH • Wind: <strong className="text-white font-mono font-medium">213 km/h</strong> • Surge: <strong className="text-cyan-400 font-mono font-medium">4.2m</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {["Odisha (Paradeep)", "West Bengal (Digha)", "Andhra (Kakinada)"].map((label) => (
            <span
              key={label}
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 font-medium hover:text-zinc-200 transition-colors"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
