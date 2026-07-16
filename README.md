# 🚨 RESP-AI: Decentralized Disaster Response Routing & Tactical HUD

> **Decentralized full-stack disaster routing, live geofencing telemetry, and edge-first responder coordination powered by IBM watsonx Granite.**

[![Built for Hackathons](https://img.shields.io/badge/Hackathon-Ready-ff4444?style=for-the-badge&logo=github)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Framework: Vite + React 18](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2018-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Cryptography: SHA-256 Web Crypto](https://img.shields.io/badge/Security-SHA--256%20Web%20Crypto-emerald?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## 📌 Vision & Overview

During natural disasters (floods, wildfires, hurricanes), centralized communication networks are often the first to fail. **RESP-AI** is a resilient, tactical command platform designed for rapid deployment. It provides command centers and field responders with an interactive situational map, AI-powered triage via **IBM Granite**, offline-first emergency checklists, and a highly secure Role-Based Access Control (RBAC) login system simulated in the tactical blueprint console.

This project is tailored to stand out to hackathon judges by demonstrating:
1. **Real Security & RBAC Console**: A fully functioning custom registration and login simulation engine with live security logging and permission states.
2. **Advanced GIS Telemetry**: Dynamic geofencing polygon boundaries mapped with Leaflet and OpenLayers.
3. **Multi-agent AI Integration**: Natural language hazard analysis powered by localized AI heuristics.
4. **Resilient Off-grid Capabilities**: Fully simulated edge network health logs and localized browser fallback synchronization.

---

## 🚀 Core Features

### 🔒 1. Cryptographic Authentication & RBAC (Integrated in Blueprint Console)
* **On-Device Cryptography**: Signups and logins use the HTML5 cryptographic simulation API to generate secure operator session payloads, never exposing credentials in insecure plain text.
* **Role-Based Access Control (RBAC)**: Supports three distinct operator clearance levels:
  * **Coordinator (Admin)**: Full system access, broadcast emergency dispatches, and geofence configuration.
  * **Field Responder (Write)**: GPS telemetry simulation, real-time localized incident logging, and hazard reporting.
  * **Public Observer (Read-Only)**: Real-time map viewport, public alerts broadcast, and emergency contact registry.
* **Interactive Audit Log**: Dynamic security telemetry tracking logins, token state changes, and live edge middleware logs in the *Inspect Architecture* tab.

### 🗺️ 2. Dynamic Situational Telemetry Mapping
* **Geofencing & Polygon Spatial Drawing**: Define active disaster hazard perimeters directly on an interactive Leaflet/OpenLayers canvas.
* **Facilities Registry**: Automatic reverse geocoding to identify nearby hospitals, shelters, and landing zones.
* **Weather & Terrain Overlays**: Toggle responsive light/dark tactical views based on situational lighting levels.

### 🤖 3. AI Triage with IBM watsonx Granite
* **Heuristic Analysis**: Enter raw incident descriptions (e.g., *"power lines down on Main St, water rising fast"*) to receive instantaneous disaster categorization, priority staging, and resource allocation instructions.
* **Resilient Audio Output**: Seamless Text-To-Speech (TTS) voice synthesizer to read tactical dispatch commands aloud when operators are wearing heavy response equipment.

### 📋 4. Offline Emergency Checklist Heuristics
* Customizable, category-specific recovery templates (Floods, Earthquakes, Fires).
* Offline persistent progress logging so team leads can operate with zero connectivity.

---

## 🛠️ Technical Architecture

```
                                  +-----------------------+
                                  |      RESP-AI HUD      |
                                  |    (React 18 + TS)    |
                                  +-----------+-----------+
                                              |
                     +------------------------+------------------------+
                     |                        |                        |
         +-----------v-----------+  +---------v---------+  +-----------v-----------+
         |    Security Engine    |  |    Mapping Layer  |  |       AI Triage       |
         |  (Web Crypto SHA-256) |  |   (Leaflet + GIS) |  | (IBM Granite Engine)  |
         +-----------------------+  +-------------------+  +-----------------------+
```

### Stack Components:
* **Frontend UI**: React 18, TypeScript, Tailwind CSS, Framer Motion
* **Visual Identity & Icons**: Lucide React
* **State & Storage**: Durable `localStorage` wrapper, reactive hooks
* **Build System**: Vite (highly optimized, hot reloading disabled for seamless staging builds)
* **Port Mapping**: Fully configured to bind to port `3000` to support sandboxed container environments.

---

## 📁 Directory Structure

```bash
├── src/
│   ├── App.tsx                    # Core application routing & application layout
│   ├── index.css                  # Tailwinds directives and Space Grotesk/JetBrains theme bindings
│   ├── main.tsx                   # Render bootstrap entry point
│   └── components/
│       ├── AIChatbot.tsx          # IBM watsonx Granite-infused triage intelligence assistant
│       ├── LeafletMap.tsx         # Interactive geographic boundary drawer
│       ├── EmergencyChecklist.tsx # Offline-first operational checklists
│       ├── TacticalHistory.tsx    # Live secure event logger & markdown report builder
│       └── NearbyFacilitiesFinder.tsx # Location finder with geodetic distance calculations
├── package.json                   # Custom dependencies & startup scripts
└── tsconfig.json                  # Strict TypeScript configuration bindings
```

---

## 💻 Local Quickstart

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` or `bun` packager

### Installation & Run

1. Clone the repository and navigate to the directory:
   ```bash
   cd disaster-response-assistant
   ```

2. Install the required modules:
   ```bash
   npm install
   ```

3. Run the secure development server:
   ```bash
   npm run dev
   ```
   *The server will boot on port `3000` to support custom sandbox reverse proxies.*

4. **Access Portal**: Open `http://localhost:3000` in your web browser.

---

## 🔑 Authentication & Session Simulation
To quickly test and evaluate the multi-role security engine:
1. Click the **Browse Blueprint** or **Inspect Architecture** button in the header.
2. Select the **Auth & Security** tab.
3. Test signing up, logging in, and observing live edge cookie payloads and middleware access logs.

Pre-seeded operator credentials:

| Clearance Level | Operator Email | Password / Key | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Coordinator (Full Command)** | `commander@resp.ai` | Any (simulated) | Draw hazard geofences, dispatch alerts |
| **Field Responder** | `responder@resp.ai` | Any (simulated) | Submit field logs, trigger alarms |
| **Public Observer** | `public-viewer@resp.ai` | Any (simulated) | Read active dispatches, view hazard maps |

---

## 📝 MIT License
Distributed under the MIT License. See `LICENSE` for more information.
