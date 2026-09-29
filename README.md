# VayuKavach-360 — Physics-Informed Cyclone Vulnerability & Pre-Landfall Command Platform

> **Google Cloud "CodeForCommunity" National Hackathon — Theme: Resilience**
> **Problem Statement 05**: Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster

---

## 📌 Vision & Primary Goal
**VayuKavach-360** shifts disaster management from post-landfall reactive recovery to **48-hour pre-landfall predictive intervention**, infrastructure hardening, and automated parametric emergency liquidity release.

Targeted at Municipal Authorities, District Disaster Collectors, NDMA/SDMA Officers, and Coastal Indian Communities in Odisha, West Bengal, and Andhra Pradesh.

---

## 🚀 Key Features

1. **3D Interactive Earth Globe Twin**: Real Three.js WebGL rotating Earth Globe with atmospheric swirl overlays for active Bay of Bengal cyclone paths and pulse indicators over coastal hotspots (Paradeep, Digha, Kakinada).
2. **Google Earth Engine (GEE) Inundation Layer**: Queries NASADEM SRTM 30m Digital Elevation & ERA5 wind vectors to compute hydrodynamic storm surge flooding maps 48h prior to landfall.
3. **Gemini 3.7 Multimodal Risk Cards**: Visual inspection cards evaluating infrastructure assets (Power Substations, Emergency Hospitals, Arterial Bridges, Shelters) with structural failure probabilities and actionable AI civil engineering mitigation advice.
4. **Parametric Liquidity Authorization Bar**: Automated pre-landfall emergency cash liquidity release (e.g. ₹25 Lakhs per Panchayat) direct to local authorities prior to storm landfall when physics-informed surge thresholds are breached.
5. **Multi-Dialect Regional Audio Broadcaster**: Broadcasts live evacuation instructions in **Odia (ଓଡ଼ିଆ)**, **Bengali (বাংলা)**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)**.
6. **Vertex AI Field Photo Vision Inspector**: Multimodal photo reasoning to evaluate submergence depth and air intake clearance.
7. **Surge-Aware Dynamic Evacuation Rerouting**: Real-time road elevation routing that automatically redirects convoys away from submerged bridges.
8. **National Open Data & BigQuery GIS Pipeline**: Integrated IMD bulletins, ISRO Bhuvan Cartosat DEM data, FAO agriculture loss estimates, and BigQuery spatial radius queries.

---

## 🛠️ Tech Stack & Google Cloud Integrations

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Three.js + Lucide Icons
- **Backend Microservices**: Python FastAPI (`uvicorn`)
- **Generative AI Engine**: Official Google GenAI SDK (`gemini-2.5-flash` / `gemini-3.7-flash` with structured Pydantic schema validation)
- **Geospatial Processing**: Google Earth Engine Python API (`ee` library) with NASADEM SRTM 30m & ERA5
- **Spatial GIS Database**: BigQuery Spatial GIS queries (`ST_DWithin`, `ST_Contains`)
- **Voice & Translation**: Google Cloud Text-to-Speech & Translation API / gTTS

---

## 🏃 1-Click Quick Start Instructions

### Option A: 1-Click Launch (Windows)
Double-click `start_all.bat` in the repository root. This starts both the FastAPI backend (port 8000) and Next.js frontend (port 3000) automatically!

---

### Option B: Manual Terminal Launch

#### Step 1: Start Backend (FastAPI Microservice)
```powershell
# From root directory:
python run_backend.py

# Or using uvicorn directly:
uvicorn backend.app.main:app --reload --port 8000
```
- **Backend Root**: `http://localhost:8000/`
- **Interactive Swagger API Docs**: `http://localhost:8000/docs`

#### Step 2: Start Frontend (Next.js Application)
```powershell
cd frontend
npm.cmd run dev
```
- **Web Application**: `http://localhost:3000`

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI REST API entry point
│   │   ├── gemini_reasoner.py          # Gemini 3.7 Multimodal Risk Engine
│   │   ├── gee_inundation_engine.py    # GEE NASADEM & ERA5 surge inundation model
│   │   ├── parametric_liquidity.py     # Automated cash grant release engine
│   │   ├── multi_dialect_tts.py        # Odia, Bengali, Telugu, Hindi audio broadcaster
│   │   ├── vertex_vision.py            # Vertex AI field photo analyzer
│   │   ├── evacuation_router.py        # Dynamic surge-aware evacuation router
│   │   ├── dialogflow_voice.py         # Multilingual Dialogflow voice assistant
│   │   ├── public_data_imd_isro.py     # IMD & ISRO Bhuvan open data engine
│   │   ├── bigquery_gis.py             # BigQuery spatial GIS queries
│   │   └── models.py                   # Pydantic data schemas
│   ├── data/
│   │   ├── coastal_infrastructure.json # Infrastructure dataset (Odisha/AP/WB)
│   │   └── cyclone_tracks.json         # Cyclone track vectors
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Landing Page with 3D Globe & Hero CTAs
│   │   │   ├── command-center/page.tsx # Command Center Dashboard
│   │   │   ├── gee-twin/page.tsx       # Dedicated GEE Flood Twin view
│   │   │   ├── evacuation/page.tsx     # Dedicated Surge Evacuation Router
│   │   │   ├── public-data/page.tsx    # Govt Open Data & BigQuery GIS
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Globe3D.tsx             # 3D Rotating Earth Globe
│   │   │   ├── CommandMap.tsx          # Interactive GIS Telemetry Map
│   │   │   ├── GeminiRiskCards.tsx     # Gemini 3.7 Multimodal Risk Cards
│   │   │   ├── ParametricBar.tsx       # Emergency Liquidity Authorization Bar
│   │   │   ├── AudioBroadcaster.tsx    # Multi-dialect regional voice player
│   │   │   ├── MultimodalInspector.tsx # Vertex AI Citizen Photo Inspector
│   │   │   ├── SurgeEvacuationRouter.tsx# Dynamic Safe Bypass Router
│   │   │   ├── VoiceAssistantModal.tsx # Dialogflow Voice Assistant
│   │   │   ├── PublicDataTelemetry.tsx # IMD + ISRO + FAO + WHO Portal
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── lib/
│   │   │   └── api.ts                  # API client
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── run_backend.py                      # Root backend runner
├── start_all.bat                       # 1-Click full stack launcher
├── start_backend.bat                   # 1-Click backend launcher
├── start_frontend.bat                  # 1-Click frontend launcher
└── README.md
```
