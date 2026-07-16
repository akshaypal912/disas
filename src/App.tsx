import { useState, useEffect } from "react";
import { 
  FolderTree, 
  Map, 
  Database, 
  Terminal, 
  Cpu, 
  BookOpen, 
  ChevronRight, 
  FileText, 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Sliders, 
  Info,
  ExternalLink,
  Lock,
  Compass,
  Zap,
  Radio,
  Workflow,
  Sparkles,
  Server,
  Globe,
  ArrowRight,
  Menu,
  X,
  MapPin,
  Clock,
  HeartPulse,
  UserCheck,
  History,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LeafletMap, { Facility } from "./components/LeafletMap";
import EmergencyChecklist from "./components/EmergencyChecklist";
import NearbyFacilitiesFinder from "./components/NearbyFacilitiesFinder";
import TextToSpeechController from "./components/TextToSpeechController";
import AIChatbot from "./components/AIChatbot";
import TacticalHistory, { HistoryReport } from "./components/TacticalHistory";
import FeedbackModule from "./components/FeedbackModule";

// Code snapshots of the created files for the interactive Directory tree viewer
const filesData: Record<string, { path: string; language: string; content: string }> = {
  "frontend-package": {
    path: "/frontend/package.json",
    language: "json",
    content: `{
  "name": "disaster-response-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.450.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0-beta.0",
    "@supabase/supabase-js": "^2.45.4",
    "@supabase/ssr": "^0.5.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "motion": "^12.0.0"
  }
}`
  },
  "next-layout": {
    path: "/frontend/app/layout.tsx",
    language: "typescript",
    content: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Disaster Response Assistant",
  description: "Next-generation crisis mapping, resource dispatch, and AI intelligence system.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={\`\${inter.variable} font-sans antialiased bg-slate-950 text-slate-100\`}>
        <div id="app-root" className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}`
  },
  "next-page": {
    path: "/frontend/app/page.tsx",
    language: "typescript",
    content: `import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col justify-center items-center p-8 max-w-4xl mx-auto text-center">
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          SYSTEM ACTIVE • STAGE 1 READY
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          AI Disaster <span className="text-red-500">Response</span> Assistant
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Tactical crisis coordination platform featuring real-time OpenStreetMap situational analysis...
        </p>
      </div>
    </main>
  );
}`
  },
  "next-map": {
    path: "/frontend/app/map/page.tsx",
    language: "typescript",
    content: `"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function MapPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      {/* Map component dynamically instantiated for Leaflet + OpenStreetMap */}
    </div>
  );
}`
  },
  "backend-main": {
    path: "/backend/app/main.py",
    language: "python",
    content: `import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Emergency Disaster Response routing core, backed by IBM Granite models.",
    version="1.0.0"
)

# Set up CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
`
  },
  "backend-watsonx": {
    path: "/backend/app/services/watsonx.py",
    language: "python",
    content: `import httpx
from typing import List, Dict, Any
from app.core.config import settings

class WatsonxService:
    def __init__(self):
        self.endpoint_url = settings.WATSONX_ENDPOINT_URL
        self.api_key = settings.WATSONX_API_KEY
        self.project_id = settings.WATSONX_PROJECT_ID
        self.model_id = settings.WATSONX_GRANITE_MODEL_ID

    async def generate_tactical_plan(
        self, incident_details: str, coordinates: str, resources: List[str]
    ) -> Dict[str, Any]:
        """
        Instructs IBM Granite model on IBM watsonx.ai to generate 
        tactical emergency guidelines based on active incident telemetry.
        """
        # Formulate rich prompt with spatial coordinates and resource availability
        ...
`
  },
  "supabase-migration": {
    path: "/supabase/migrations/20260714000000_init.sql",
    language: "sql",
    content: `-- Enable PostGIS extension for geo-spatial coordinates queries
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE public.disasters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'EXTREME')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geog GEOGRAPHY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger to automatically synchronize PostGIS points
CREATE TRIGGER trigger_sync_disasters_geog BEFORE INSERT OR UPDATE ON public.disasters
FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();
`
  },
  "supabase-client": {
    path: "/frontend/lib/supabase.ts",
    language: "typescript",
    content: `import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}`
  },
  "auth-login": {
    path: "/frontend/components/auth/LoginForm.tsx",
    language: "tsx",
    content: `"use client";

import React, { useState } from "react";
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPasswordClick?: () => void;
  onSignupClick?: () => void;
}

export function LoginForm({ onSuccess, onForgotPasswordClick, onSignupClick }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (email.includes("fail")) {
        throw new Error("Invalid login credentials. Please check your email or password.");
      }
      setSuccess("Successfully logged in! Redirecting to secure operational dashboard...");
      if (onSuccess) { setTimeout(onSuccess, 1000); }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900/50 border border-slate-900 rounded-2xl shadow-xl backdrop-blur-md">
      <div className="space-y-2 text-center mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">Access Tactical HUD</h3>
        <p className="text-xs text-slate-400">Enter your certified emergency credentials to access maps.</p>
      </div>
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex gap-2"><ShieldAlert className="h-4 w-4" />{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex gap-2"><CheckCircle2 className="h-4 w-4" />{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Email Address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 transition" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between"><label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Password</label><button type="button" onClick={onForgotPasswordClick} className="text-[10px] text-red-400 hover:underline">Forgot?</button></div>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 transition" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-3 bg-red-600 rounded-xl text-xs font-bold text-white transition hover:bg-red-500 flex justify-center items-center gap-2">{isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "ESTABLISH SECURE SESSION"}</button>
      </form>
    </div>
  );
}`
  },
  "auth-signup": {
    path: "/frontend/components/auth/SignupForm.tsx",
    language: "tsx",
    content: `"use client";

import React, { useState } from "react";
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

interface SignupFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function SignupForm({ onSuccess, onLoginClick }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsLoading(true); setError(null); setSuccess(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess("Account request generated! Verify email to activate.");
      if (onSuccess) { setTimeout(onSuccess, 1500); }
    } catch (err: any) {
      setError(err.message || "An account creation error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900/50 border border-slate-900 rounded-2xl shadow-xl backdrop-blur-md">
      <div className="space-y-2 text-center mb-6"><h3 className="text-xl font-bold text-white tracking-tight">Request Clearance</h3></div>
      {error && <div className="mb-4 p-3 bg-red-500/10 border text-xs text-red-400">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-500/10 border text-xs text-emerald-400">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200" />
        <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200" />
        <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200" />
        <button type="submit" disabled={isLoading} className="w-full py-3 bg-red-600 text-white rounded-xl text-xs font-bold">{isLoading ? "Registering..." : "SUBMIT REQUEST"}</button>
      </form>
    </div>
  );
}`
  },
  "auth-forgot-password": {
    path: "/frontend/components/auth/ForgotPasswordForm.tsx",
    language: "tsx",
    content: `"use client";

import React, { useState } from "react";
import { Mail, Loader2, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function ForgotPasswordForm({ onSuccess, onLoginClick }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null); setSuccess(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess("If account is registered, recovery secure link has been sent.");
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900/50 border border-slate-900 rounded-2xl">
      <h3 className="text-xl font-bold text-white text-center mb-6">Recovery Dispatch</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 rounded-lg" />
        <button type="submit" className="w-full py-3 bg-red-600 text-xs text-white rounded-lg">DISPATCH RECOVERY SECURE LINK</button>
      </form>
    </div>
  );
}`
  },
  "frontend-middleware": {
    path: "/frontend/middleware.ts",
    language: "typescript",
    content: `import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/map")
  )) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  return response;
}`
  },
  "backend-security": {
    path: "/backend/app/core/security.py",
    language: "python",
    content: `import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")`
  }
};

const disasterTypes = [
  {
    id: "floods",
    name: "Flood",
    icon: "🌊",
    desc: "Coordinate immediate high-ground routing, track rising water metrics, and deploy dynamic evacuation zones mapped on Leaflet.",
    features: ["Dynamic flood elevation overlays", "OSRM pathfinding algorithm integrations", "Rapid alert trigger systems"]
  },
  {
    id: "earthquakes",
    name: "Earthquake",
    icon: "🌋",
    desc: "Pinpoint collapsed structures, compute seismic intensity variables, and coordinate heavy rescue apparatus.",
    features: ["Structural telemetry collection", "GIS blockage index tracking", "Paramedic dispatch automation"]
  },
  {
    id: "cyclones",
    name: "Cyclone",
    icon: "🌀",
    desc: "Track high-velocity cyclonic storms, plan massive hurricane evacuations, and manage power grid load balances.",
    features: ["Barometric pressure tracking", "Storm surge inundation prediction", "Automatic power grid protection"]
  },
  {
    id: "fires",
    name: "Fire",
    icon: "🔥",
    desc: "Predict flame expansion vectors using real-time atmospheric wind speed, direction, and thermal sensors.",
    features: ["Flame velocity vector modeling", "Air quality warning dispatches", "Retardant drop coordination"]
  },
  {
    id: "landslides",
    name: "Landslide",
    icon: "⛰️",
    desc: "Identify terrain failure zones, track rainfall threshold metrics, and reroute evacuation traffic from mudflows.",
    features: ["Slope inclinometer telemetry", "Debris volume estimation", "Dynamic road barrier triggers"]
  },
  {
    id: "heatwaves",
    name: "Heatwave",
    icon: "☀️",
    desc: "Coordinate cooling station allocations, manage critical hydration supply hubs, and monitor urban heat island indices.",
    features: ["Wet-bulb temperature indexes", "Power grid stress alleviation", "Hydration shelter distribution"]
  }
];

const BROADCASTS: Record<string, Record<string, string>> = {
  floods: {
    EN: "ALERT: Severe flash flooding detected. Immediate high-ground routing recommended. Retreat to Base Camp Alpha.",
    ES: "ALERTA: Inundaciones repentinas graves detectadas. Ruta inmediata a zonas altas. Retírese al Campamento Alfa.",
    FR: "ALERTE: Crues soudaines majeures détectées. Évacuation immédiate vers les hauteurs conseillée. Repli sur Base Alpha.",
    JA: "警告：重大な鉄砲水が観測されました。直ちに高台への避難を推奨します。ベースキャンプアルファへ退避してください。",
    HI: "चेतावनी: अत्यधिक बाढ़ का खतरा। तत्काल ऊंचे क्षेत्रों की ओर बढ़ने की सलाह दी जाती है। बेस कैंप अल्फा की ओर लौटें।"
  },
  earthquakes: {
    EN: "IMMEDIATE: Magnitude 7.2 seismic tremor registered in operational sector. Deploying heavy rescue apparatus and K9s.",
    ES: "INMEDIATO: Sismo de magnitud 7.2 registrado. Desplegando equipos de rescate pesado y unidades caninas K9.",
    FR: "IMMÉDIAT: Tremblement de terre de magnitude 7,2 enregistré. Déploiement du matériel de sauvetage lourd et chiens K9.",
    JA: "緊急：震度7.2の地震を観測。大型救助用機材および災害救助犬を被災地に派遣しています。",
    HI: "तत्काल: रिक्टर स्केल पर 7.2 तीव्रता का भूकंप दर्ज। भारी जीवन रक्षक उपकरण और खोजी कुत्ते तैनात किए जा रहे हैं।"
  },
  cyclones: {
    EN: "CRITICAL: Cyclonic landfall imminent. Regional power grid de-energized to prevent storm surge storm sparks.",
    ES: "CRÍTICO: Huracán y ciclón inminente. Red de energía regional desactivada para prevenir incendios por tormentas.",
    FR: "CRITIQUE: Atterrissage cyclonique imminent. Réseau électrique régional désactivé pour éviter les arcs électriques.",
    JA: "警告：大型のサイクロンが接近中。高潮やスパーク事故を防ぐため広域送電網を緊急停止しました。",
    HI: "अत्यधिक गंभीर: चक्रवात का आगमन। बिजली ग्रिड को बंद कर दिया गया है ताकि नुकसान को टाला जा सके।"
  },
  fires: {
    EN: "WARNING: High velocity wind vectors driving flames Eastward. Establish immediate buffer corridor zones.",
    ES: "ADVERTENCIA: Fuertes ráfagas de viento propagan las llamas hacia el este. Establezca zonas de amortiguamiento inmediatas.",
    FR: "AVERTISSEMENT: Vents violents propageant les flammes vers l'est. Établissez immédiatement des couloirs de protection.",
    JA: "警告：強風により火の粉が東へ運ばれています。直ちに防火帯を構築してください。",
    HI: "चेतावनी: तेज हवाएं आग की लपटों को पूर्व की ओर ले जा रही हैं। तुरंत बफर कॉरिडोर जोन स्थापित करें।"
  },
  landslides: {
    EN: "ALERT: Severe slope saturation detected. High risk of debris flow on Windward canyon road. Dynamic blockades active.",
    ES: "ALERTA: Saturación severa de taludes detectada. Alto riesgo de flujos de lodo. Bloqueos de tránsito activos.",
    FR: "ALERTE: Saturation extrême des sols mesurée. Risque élevé d'éboulement de terrain. Barrières de sécurité activées.",
    JA: "警告：地盤の緩みが検知されました。渓谷道路で土砂崩れが発生する危険性が極めて高いです。道路封鎖を開始します。",
    HI: "चेतावनी: तीव्र भूस्खलन की आशंका। घाटियों में आवागमन तत्काल बंद कर दिया गया है।"
  },
  heatwaves: {
    EN: "WARNING: Extreme wet-bulb temperature peak of 38C registered. Distributing emergency hydration and power caps.",
    ES: "ADVERTENCIA: Temperatura extrema de bulbo húmedo de 38C registrada. Distribuyendo hidratación de emergencia.",
    FR: "ALERTE: Pic de température extrême (bulbe humide 38°C) mesuré. Distribution d'eau potable d'urgence activée.",
    JA: "警告：湿球温度38度の猛烈な酷暑を観測。緊急水分補給ステーションを開設、送電網の負荷を調整しています。",
    HI: "चेतावनी: खतरनाक लू (तापमान 38C) का प्रकोप। तत्काल पेयजल आपूर्ति और राहत शिविर चालू हैं।"
  }
};

export default function App() {
  // Theme state: "dark" or "light"
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("resp_ai_theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("resp_ai_theme", nextTheme);
  };

  // Mode switcher: "landing" for the SaaS page, "console" for the tech blueprint, "dashboard" for the main operational HUD, "history" for the report log archive
  const [mode, setMode] = useState<"landing" | "console" | "dashboard" | "history">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDisasterId, setSelectedDisasterId] = useState("floods");

  // Main Operations Dashboard State
  const [dashDisasterId, setDashDisasterId] = useState("floods");
  const [dashLat, setDashLat] = useState("34.0522");
  const [dashLng, setDashLng] = useState("-118.2437");
  const [dashLocationName, setDashLocationName] = useState("Emergency Sector 4-B");
  const [dashLocationStatus, setDashLocationStatus] = useState("Satellite sync optimal. Location locked.");
  const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<string | null>("Los Angeles, California");
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [dashLanguage, setDashLanguage] = useState("EN");
  const [dashSeverity, setDashSeverity] = useState<"EXTREME" | "SEVERE" | "MODERATE" | "CLEAR">("EXTREME");
  const [dashResponders, setDashResponders] = useState(42);
  const [dashEvacuated, setDashEvacuated] = useState(1250);
  const [dashGridStatus, setDashGridStatus] = useState<"ACTIVE" | "DEACTIVATED">("DEACTIVATED");
  const [isDetectingGeo, setIsDetectingGeo] = useState(false);
  const [userLat, setUserLat] = useState<string | null>("34.0650");
  const [userLng, setUserLng] = useState<string | null>("-118.2550");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [droneState, setDroneState] = useState<{ status: "idle" | "launching" | "scanning" | "completed"; progress: number; summary: string }>({
    status: "idle",
    progress: 0,
    summary: ""
  });
  const activeDisasterName = disasterTypes.find(d => d.id === dashDisasterId)?.name || "Flood";
  const [dashLogs, setDashLogs] = useState<string[]>([
    "Operations HUD initiated.",
    "Connected to PostGIS regional telemetry buffer.",
    "Radio Dispatcher: awaiting sector commands."
  ]);
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  const [triagePlan, setTriagePlan] = useState<string | null>(null);
  
  // Console blueprint state
  const [activeTab, setActiveTab] = useState<"explorer" | "router" | "swagger" | "database" | "watsonx" | "setup" | "auth">("explorer");
  const [selectedFileKey, setSelectedFileKey] = useState<string>("frontend-package");
  const [swaggerResponse, setSwaggerResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);

  // Simulated Supabase Auth State
  const [simulatedUserSession, setSimulatedUserSession] = useState<{ email: string; role: string; token: string } | null>(null);
  const [authFormView, setAuthFormView] = useState<"login" | "signup" | "forgot">("login");
  const [authEmailInput, setAuthEmailInput] = useState("commander@resp.ai");
  const [authPasswordInput, setAuthPasswordInput] = useState("••••••••");
  const [authConfirmPasswordInput, setAuthConfirmPasswordInput] = useState("••••••••");
  const [authRoleInput, setAuthRoleInput] = useState("coordinator");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [middlewareAccessLog, setMiddlewareAccessLog] = useState<string[]>([
    "Middleware listening on edge request router...",
    "All requests to /dashboard, /map, /alerts, and /resources require active session."
  ]);

  // Simulated console trigger
  const triggerMockApiCall = (endpoint: string) => {
    setIsLoadingApi(true);
    setActiveEndpoint(endpoint);
    setTimeout(() => {
      setIsLoadingApi(false);
      if (endpoint === "health") {
        setSwaggerResponse(JSON.stringify({
          "status": "healthy",
          "service": "AI Disaster Response Assistant",
          "database_connected": true,
          "llm_connected": true,
          "latency_ms": 14
        }, null, 2));
      } else if (endpoint === "watsonx") {
        setSwaggerResponse(JSON.stringify({
          "analysis_summary": "Active flood zone telemetry parsed successfully by IBM Granite (ibm/granite-13b-instruct-v2). Coordinates 34.0522, -118.2437 confirm heavy threat vector.",
          "threat_assessment": "EXTREME - IMMEDIATE WATER LEVEL DISPLACEMENT EXPECTED",
          "tactical_recommendations": [
            "Establish unified emergency operations structure outside red containment polygon.",
            "Evacuate downstream camp coordinates along verified GIS transport segments.",
            "Coordinate with nearby shelter nodes (Base Camp Alpha) for capacity buffering."
          ],
          "confidence_rating": 0.94
        }, null, 2));
      } else if (endpoint === "disasters_post") {
        setSwaggerResponse(JSON.stringify({
          "title": "Severe Flash Flood",
          "description": "Sector 4-B river basin overflowing. Rising rate at 1.2m per hour.",
          "severity": "EXTREME",
          "latitude": 34.0522,
          "longitude": -118.2437,
          "id": "dis-8f432-8dfb",
          "created_at": "2026-07-14T08:41:18Z",
          "status": "reported"
        }, null, 2));
      } else if (endpoint === "alerts_get") {
        setSwaggerResponse(JSON.stringify([
          {
            "id": "alert-1",
            "title": "Severe Flood Evacuation Order",
            "message": "Immediate flooding hazard. Retreat to high grounds.",
            "severity": "EXTREME",
            "target_area": "Los Angeles Sector 4-B",
            "active": true,
            "published_at": "2026-07-14T08:35:00Z"
          }
        ], null, 2));
      }
    }, 600);
  };

  // Simulated Tactical Simulator state on Landing Page
  const [simulatedIncident, setSimulatedIncident] = useState({
    title: "Flash Flood",
    latitude: "34.0522",
    longitude: "-118.2437",
    severity: "HIGH",
    desc: "Rising water levels threatening nearby campsites. Evacuation channels needed."
  });
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    "System initiated. Leaflet mapping hooks compiled.",
    "OpenStreetMap layer initialized for rendering grid.",
    "FastAPI connection: awaiting command trigger."
  ]);
  const [simulationResponse, setSimulationResponse] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const runSimulation = () => {
    setSimulating(true);
    setSimulationLogs(prev => [
      ...prev,
      `Triggering dispatch endpoint /api/v1/disasters with [${simulatedIncident.title}]`,
      "Pushing spatial coordinates data to Supabase (PostGIS enabled)...",
    ]);

    setTimeout(() => {
      setSimulationLogs(prev => [
        ...prev,
        "Incident logged inside Postgres database with service-role token authorization.",
        "Connecting to IBM watsonx.ai service...",
        "Executing tactical plan optimization on IBM Granite 13B model...",
      ]);

      setTimeout(() => {
        setSimulationLogs(prev => [
          ...prev,
          "Plan generation completed. Tactical evacuation points derived.",
          "Broadcasting local coordinates to active SMS alert warning list."
        ]);
        setSimulationResponse("SUCCESS: Granite output loaded. Active responders dispatched to Camp Alpha.");
        setSimulating(false);
      }, 1000);
    }, 1000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("saved_disaster_type");
      if (saved && ["floods", "earthquakes", "cyclones", "fires", "landslides", "heatwaves"].includes(saved)) {
        setDashDisasterId(saved);
        setSelectedDisasterId(saved);
        const initialFallbacks: Record<string, {lat: string, lng: string, name: string, severity: "EXTREME" | "SEVERE" | "MODERATE", responders: number, evacuated: number, powerGrid: "ACTIVE" | "DEACTIVATED"}> = {
          floods: { lat: "34.0522", lng: "-118.2437", name: "Emergency Sector 4-B", severity: "EXTREME", responders: 42, evacuated: 1250, powerGrid: "DEACTIVATED" },
          earthquakes: { lat: "35.6762", lng: "139.6503", name: "Kanto Fault Line Zone", severity: "SEVERE", responders: 90, evacuated: 9500, powerGrid: "ACTIVE" },
          cyclones: { lat: "21.7850", lng: "88.5420", name: "Bay of Bengal Delta", severity: "EXTREME", responders: 120, evacuated: 32000, powerGrid: "DEACTIVATED" },
          fires: { lat: "37.7749", lng: "-122.4194", name: "Ridge Line Firefront", severity: "SEVERE", responders: 65, evacuated: 4800, powerGrid: "ACTIVE" },
          landslides: { lat: "30.7333", lng: "79.0667", name: "Himalayan Valley Sector", severity: "SEVERE", responders: 35, evacuated: 850, powerGrid: "ACTIVE" },
          heatwaves: { lat: "25.2048", lng: "55.2708", name: "Desert Urban Zone", severity: "MODERATE", responders: 50, evacuated: 3100, powerGrid: "ACTIVE" }
        };
        const details = initialFallbacks[saved];
        if (details) {
          setDashLat(details.lat);
          setDashLng(details.lng);
          setDashLocationName(details.name);
          setDashSeverity(details.severity);
          setDashResponders(details.responders);
          setDashEvacuated(details.evacuated);
          setDashGridStatus(details.powerGrid);
          setDashLogs(prev => [
            `[${new Date().toLocaleTimeString()}] 💾 DATABASE LOAD: Restored saved disaster context [${saved.toUpperCase()}] from secure local store.`,
            ...prev
          ]);
        }
      }
    }
  }, []);

  // Dashboard Action Handlers
  const handleDashDisasterSelect = (id: string) => {
    setDashDisasterId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("saved_disaster_type", id);
    }
    const fallbacks: Record<string, {lat: string, lng: string, name: string, severity: "EXTREME" | "SEVERE" | "MODERATE", responders: number, evacuated: number, powerGrid: "ACTIVE" | "DEACTIVATED"}> = {
      floods: { lat: "34.0522", lng: "-118.2437", name: "Emergency Sector 4-B", severity: "EXTREME", responders: 42, evacuated: 1250, powerGrid: "DEACTIVATED" },
      earthquakes: { lat: "35.6762", lng: "139.6503", name: "Kanto Fault Line Zone", severity: "SEVERE", responders: 90, evacuated: 9500, powerGrid: "ACTIVE" },
      cyclones: { lat: "21.7850", lng: "88.5420", name: "Bay of Bengal Delta", severity: "EXTREME", responders: 120, evacuated: 32000, powerGrid: "DEACTIVATED" },
      fires: { lat: "37.7749", lng: "-122.4194", name: "Ridge Line Firefront", severity: "SEVERE", responders: 65, evacuated: 4800, powerGrid: "ACTIVE" },
      landslides: { lat: "30.7333", lng: "79.0667", name: "Himalayan Valley Sector", severity: "SEVERE", responders: 35, evacuated: 850, powerGrid: "ACTIVE" },
      heatwaves: { lat: "25.2048", lng: "55.2708", name: "Desert Urban Zone", severity: "MODERATE", responders: 50, evacuated: 3100, powerGrid: "ACTIVE" }
    };
    const details = fallbacks[id] || fallbacks.floods;
    setDashLat(details.lat);
    setDashLng(details.lng);
    setDashLocationName(details.name);
    setDashSeverity(details.severity);
    setDashResponders(details.responders);
    setDashEvacuated(details.evacuated);
    setDashGridStatus(details.powerGrid);
    setTriagePlan(null);
    setDashLogs(prev => [
      `[${new Date().toLocaleTimeString()}] 💾 SAVED & SYNCED: Selected [${id.toUpperCase()}] disaster type saved to local database (localStorage) and active telemetry.`,
      `[${new Date().toLocaleTimeString()}] 🔄 CRISIS SWITCH: Dashboard synced to ${id.toUpperCase()} telemetry environment.`,
      ...prev
    ]);
  };

  const performReverseGeocode = async (lat: string, lng: string) => {
    setIsReverseGeocoding(true);
    setReverseGeocodedAddress("Contacting OpenStreetMap Nominatim reverse geocode server...");
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Reverse geocode status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.municipality || "";
        const state = data.address.state || data.address.region || "";
        const country = data.address.country || "";
        
        let formatted = "";
        if (city && state) {
          formatted = `${city}, ${state}`;
        } else if (city) {
          formatted = `${city}, ${country}`;
        } else if (state) {
          formatted = `${state}, ${country}`;
        } else {
          formatted = data.display_name || country || "Sector Area";
        }
        
        formatted = formatted.trim().replace(/^,|,$/g, '').trim();
        // Limit string length for aesthetics
        if (formatted.length > 40) {
          formatted = formatted.substring(0, 37) + "...";
        }
        
        setReverseGeocodedAddress(formatted);
        setDashLocationName(formatted);
        setDashLogs(prev => [
          `[${new Date().toLocaleTimeString()}] 🗺️ REVERSE GEOCODE: Coordinates successfully translated to [${formatted}]`,
          ...prev
        ]);
      } else {
        const simpleFallback = `Sector [Lat ${parseFloat(lat).toFixed(2)}, Lng ${parseFloat(lng).toFixed(2)}]`;
        setReverseGeocodedAddress(simpleFallback);
        setDashLocationName(simpleFallback);
        setDashLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ⚠️ GEOCODE EMPTY: OSM returned generic sector structure.`,
          ...prev
        ]);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      const simpleFallback = `Sector [Lat ${parseFloat(lat).toFixed(2)}, Lng ${parseFloat(lng).toFixed(2)}]`;
      setReverseGeocodedAddress("Geocode Server offline or rate-limited");
      setDashLocationName(simpleFallback);
      setDashLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ⚠️ GEOCODE OFFLINE: Reverse geocode server timed out. Using coordinates directly.`,
        ...prev
      ]);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const detectLocation = () => {
    setIsDetectingGeo(true);
    setIsManualOverride(false);
    setDashLocationStatus("Interrogating browser satellite location channels...");
    setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🛰️ LOCATION DETECT: Requesting device coordinates...`, ...prev]);

    if (!navigator.geolocation) {
      setTimeout(() => {
        setIsDetectingGeo(false);
        setDashLocationStatus("Geolocation not supported. Loaded fallback coordinates.");
        setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🚨 LOCATION ERROR: Geolocation unsupported in current frame context.`, ...prev]);
      }, 1000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingGeo(false);
        const latVal = position.coords.latitude.toFixed(4);
        const lngVal = position.coords.longitude.toFixed(4);
        setDashLat(latVal);
        setDashLng(lngVal);
        setUserLat(latVal);
        setUserLng(lngVal);
        setDashLocationStatus("Device GPS telemetry established! Reverse geocoding...");
        setDashLogs(prev => [
          `[${new Date().toLocaleTimeString()}] 🛰️ GPS SYNC SUCCESS: Coordinates locked to Lat ${latVal}, Lng ${lngVal}`,
          ...prev
        ]);
        performReverseGeocode(latVal, lngVal);
      },
      (error) => {
        setIsDetectingGeo(false);
        let errorMsg = "GPS access denied.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "GPS access blocked by user/browser. Please unblock or override manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "GPS positioning unavailable. Please override coordinates manually.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "GPS tracking timed out. Reverting to tactical fallbacks.";
        }
        
        const fallbacks: Record<string, {lat: string, lng: string, name: string}> = {
          floods: { lat: "34.0522", lng: "-118.2437", name: "Sector 4-B River Basin" },
          earthquakes: { lat: "35.6762", lng: "139.6503", name: "Kanto Fault Line Zone" },
          cyclones: { lat: "21.7850", lng: "88.5420", name: "Bay of Bengal Delta" },
          fires: { lat: "37.7749", lng: "-122.4194", name: "Ridge Line Firefront" },
          landslides: { lat: "30.7333", lng: "79.0667", name: "Himalayan Valley Sector" },
          heatwaves: { lat: "25.2048", lng: "55.2708", name: "Desert Urban Zone" }
        };
        const activeFallback = fallbacks[dashDisasterId] || fallbacks.floods;
        setDashLat(activeFallback.lat);
        setDashLng(activeFallback.lng);
        setDashLocationStatus(errorMsg);
        setReverseGeocodedAddress(activeFallback.name);
        setDashLocationName(activeFallback.name);
        setDashLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ⚠️ GPS PERMISSION REFUSED: Code ${error.code} - ${error.message}. Reverting to active crisis fallback.`,
          ...prev
        ]);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const launchReconDrone = () => {
    if (droneState.status !== "idle" && droneState.status !== "completed") return;
    
    setDroneState({ status: "launching", progress: 10, summary: "Igniting drone engine array..." });
    setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🛸 DRONE DISPATCH: Drone Alpha vertical takeoff initiated.`, ...prev]);

    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 30;
      if (currentProgress >= 100) {
        clearInterval(interval);
        const hotspots = Math.floor(Math.random() * 5) + 1;
        setDroneState({
          status: "completed",
          progress: 100,
          summary: `Scan completed. Pinned ${hotspots} structural distress hotspots in Sector.`
        });
        setDashLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ✅ DRONE COMPLETE: Survey accomplished. ${hotspots} hotspots transmitted to PostGIS buffer database.`,
          ...prev
        ]);
      } else if (currentProgress >= 70) {
        setDroneState({ status: "scanning", progress: currentProgress, summary: "Running thermal infrared polygon scans..." });
        setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🛸 DRONE SCANNING: Computing obstacle vectors at height 120m.`, ...prev]);
      } else {
        setDroneState({ status: "launching", progress: currentProgress, summary: "Climbing to telemetry altitude..." });
      }
    }, 800);
  };

  const broadcastWarning = () => {
    const activeText = BROADCASTS[dashDisasterId]?.[dashLanguage] || "ALERT: Immediate coordination needed.";
    setDashLogs(prev => [
      `[${new Date().toLocaleTimeString()}] 📡 BROADCAST SENT: [Lang: ${dashLanguage}] "${activeText}"`,
      `[${new Date().toLocaleTimeString()}] 🌐 BROADCAST SUCCESS: Satellite and cellular emergency networks notified.`,
      ...prev
    ]);
  };

  const deployShelter = () => {
    const randomSector = String.fromCharCode(65 + Math.floor(Math.random() * 6)) + "-" + (Math.floor(Math.random() * 9) + 1);
    setDashEvacuated(prev => prev + 350);
    setDashLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ⛺ SHELTER CREATED: Base Camp ${randomSector} deployed at Lat: ${dashLat}, Lng: ${dashLng}. Capacity +350.`,
      ...prev
    ]);
  };

  const triggerGraniteTriage = () => {
    setIsTriageLoading(true);
    setTriagePlan(null);
    setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🧠 GRANITE AI TRIAGE: Synthesizing relief route polygons using watsonx Granite LLM...`, ...prev]);

    setTimeout(() => {
      setIsTriageLoading(false);
      const plans: Record<string, string> = {
        floods: "CRISIS DISPATCH PLAN: Establish sandbag buffer vectors at coordinates. Establish dynamic escape vectors along secondary roadways. Target Shelter Alpha.",
        earthquakes: "CRISIS DISPATCH PLAN: High structure collapse potential. K9 scouts dispatch coordinates: Sector fault intersection. Mobilize heavy rescue excavators.",
        cyclones: "CRISIS DISPATCH PLAN: Power grid disabled dynamically. High speed surge barriers activated. Sheltered occupants to be tracked on sector telemetry grid.",
        fires: "CRISIS DISPATCH PLAN: Wind vectors pushing flames at 12 knots Eastward. Create 40-meter wide firebreak polygon. Route responder fire engines along Windward pass.",
        landslides: "CRISIS DISPATCH PLAN: Soil saturation threshold crossed. Trigger automated road blockades on Sector 4 Highway. Dispatch mud removal bulldozers.",
        heatwaves: "CRISIS DISPATCH PLAN: Urban wet-bulb temperature is critical. Direct elderlies to cooling stations. Expand power limits for secondary backup AC generators."
      };
      const activePlan = plans[dashDisasterId] || plans.floods;
      setTriagePlan(activePlan);

      // Save to localStorage Tactical History
      const newReport: HistoryReport = {
        id: "report_" + Date.now(),
        disasterId: dashDisasterId,
        disasterName: dashDisasterId.charAt(0).toUpperCase() + dashDisasterId.slice(1),
        locationName: dashLocationName,
        lat: dashLat,
        lng: dashLng,
        date: new Date().toLocaleString(),
        aiResponse: activePlan
      };
      try {
        const saved = localStorage.getItem("resp_ai_report_history");
        let reportsList: HistoryReport[] = [];
        if (saved) {
          reportsList = JSON.parse(saved);
        }
        reportsList.unshift(newReport);
        localStorage.setItem("resp_ai_report_history", JSON.stringify(reportsList));
      } catch (e) {
        console.error("Failed to save report to history", e);
      }

      setDashLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 🧠 GRANITE AI DECISION: Optimized coordination routes mapped with confidence score 94.6%. Saved to Tactical History archive.`,
        ...prev
      ]);
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 relative overflow-x-hidden ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"}`}>
      
      {/* Dynamic Grid Overlay */}
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none ${theme === "light" ? "opacity-15" : "opacity-100"}`} />

      {/* Global Navbar */}
      <header className={`border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${theme === "light" ? "border-slate-200 bg-white/85 text-slate-900 backdrop-blur-md shadow-sm" : "border-slate-900 bg-slate-950/80 text-white backdrop-blur-md"}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-red-600 flex items-center justify-center font-black tracking-tighter text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            RA
          </div>
          <div className="flex flex-col">
            <span className={`font-bold tracking-wider text-sm ${theme === "light" ? "text-slate-900" : "text-white"}`}>RESP-AI</span>
            <span className={`text-[10px] font-mono tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>TACTICAL LLM</span>
          </div>
        </div>

        {/* Desktop Navbar Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          <button 
            onClick={() => setMode("landing")} 
            className={`transition px-3 py-1.5 rounded-lg cursor-pointer ${mode === "landing" ? (theme === "light" ? "bg-slate-200 text-red-600 font-bold" : "bg-slate-900 border border-slate-800 text-red-400 font-bold") : (theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white")}`}
          >
            Landing Hub
          </button>
          <button 
            onClick={() => setMode("dashboard")} 
            className={`transition px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${mode === "dashboard" ? (theme === "light" ? "bg-red-500/10 text-red-600 font-bold" : "bg-red-500/10 border border-red-500/25 text-red-500 font-bold animate-pulse") : (theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white")}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operations Dashboard</span>
          </button>
          <button 
            onClick={() => setMode("history")} 
            className={`transition px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${mode === "history" ? (theme === "light" ? "bg-red-500/10 text-red-600 font-bold" : "bg-red-500/10 border border-red-500/25 text-red-500 font-bold") : (theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white")}`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Tactical History</span>
          </button>
          <button 
            onClick={() => setMode("console")} 
            className={`transition px-3 py-1.5 rounded-lg cursor-pointer ${mode === "console" ? (theme === "light" ? "bg-slate-200 text-red-600 font-bold" : "bg-slate-900 border border-slate-800 text-red-400 font-bold") : (theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white")}`}
          >
            Inspect Architecture
          </button>
        </nav>

        {/* Global CTA Trigger & Theme Toggle */}
        <div className="flex items-center gap-3">
          {simulatedUserSession && (
            <div className={`hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border font-mono text-[10px] ${
              theme === "light" 
                ? "bg-slate-100 border-slate-200 text-slate-700" 
                : "bg-slate-900/60 border-slate-800 text-slate-300"
            }`}>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold max-w-[120px] truncate">{simulatedUserSession.email}</span>
              <span className="text-[8.5px] px-1 py-0.5 bg-red-600 text-white rounded font-extrabold uppercase tracking-tighter">{simulatedUserSession.role}</span>
              <button 
                onClick={() => {
                  setSimulatedUserSession(null);
                }}
                className="ml-2 pl-2 border-l border-slate-300 dark:border-slate-800 text-red-500 hover:text-red-400 font-black tracking-tight transition cursor-pointer"
                title="Sign Out Operator"
              >
                SIGN OUT
              </button>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${theme === "light" ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"}`}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </button>

          {mode !== "dashboard" ? (
            <button 
              onClick={() => setMode("dashboard")}
              className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-lg shadow-red-600/20 transition items-center gap-1.5 cursor-pointer"
            >
              <span>Operations HUD</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <button 
              onClick={() => setMode("console")}
              className={`hidden sm:inline-flex px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${theme === "light" ? "bg-slate-900 hover:bg-slate-800 text-white shadow" : "bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200"}`}
            >
              Browse Blueprint
            </button>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-1.5 rounded-lg border transition cursor-pointer ${theme === "light" ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"}`}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-[73px] inset-x-0 bg-slate-950 border-b border-slate-900 p-6 space-y-4 z-40 shadow-2xl"
          >
            <div className="flex flex-col gap-3 text-sm font-medium">
              <button 
                onClick={() => { setMode("landing"); setMobileMenuOpen(false); }} 
                className={`w-full text-left py-1.5 transition ${mode === "landing" ? "text-red-400 font-bold" : "text-slate-300 hover:text-white"}`}
              >
                Landing Hub
              </button>
              <button 
                onClick={() => { setMode("dashboard"); setMobileMenuOpen(false); }} 
                className={`w-full text-left py-1.5 transition flex items-center gap-2 ${mode === "dashboard" ? "text-red-400 font-bold" : "text-slate-300 hover:text-white"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Operations Dashboard</span>
              </button>
              <button 
                onClick={() => { setMode("history"); setMobileMenuOpen(false); }} 
                className={`w-full text-left py-1.5 transition flex items-center gap-2 ${mode === "history" ? "text-red-400 font-bold" : "text-slate-300 hover:text-white"}`}
              >
                <History className="h-4 w-4" />
                <span>Tactical History</span>
              </button>
              <button 
                onClick={() => { setMode("console"); setMobileMenuOpen(false); }} 
                className={`w-full text-left py-1.5 transition ${mode === "console" ? "text-red-400 font-bold" : "text-slate-300 hover:text-white"}`}
              >
                Inspect Architecture
              </button>
            </div>
            <div className="pt-4 border-t border-slate-900 flex flex-col gap-2">
              <button 
                onClick={() => { setMode(mode === "landing" ? "console" : "landing"); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-center text-slate-200"
              >
                {mode === "landing" ? "Toggle Technical View" : "Toggle Landing Page"}
              </button>
              <a 
                href="#simulator" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-lg bg-red-600 text-xs font-semibold text-center text-white block"
              >
                Run Operations HUD
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Routing Container */}
      <div className="flex-1 flex flex-col">
        
        {/* ==================== 0. OPERATIONS DASHBOARD MODE ==================== */}
        {mode === "dashboard" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 w-full text-left relative z-10"
            id="panel-operations-dashboard"
          >
            
            {/* Row 1: Welcome Banner & Language Selector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 h-48 w-48 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-12 h-24 w-24 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>TACTICAL OPERATIONS HUD ACTIVE</span>
                </div>
                
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome back, <span className="text-red-400">{simulatedUserSession ? simulatedUserSession.email : "palakshay071@gmail.com"}</span>
                </h1>
                
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Coordinating from regional satellite buffer station. Connected with PostGIS geofence layers and IBM watsonx Granite dispatch heuristics. 
                  {simulatedUserSession && (
                    <span className="text-emerald-400 font-semibold ml-1">
                      (Authorized clearance level: [{simulatedUserSession.role.toUpperCase()}])
                    </span>
                  )}
                </p>
              </div>

              {/* Language Selector + Live Clock Card */}
              <div className="lg:col-span-4 bg-slate-950/80 border border-slate-900 rounded-xl p-4 space-y-3 shrink-0">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-red-500" />
                    <span>Station Time (UTC-7)</span>
                  </span>
                  <span className="text-slate-400 font-bold">LIVE METRICS</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-mono font-medium">July 15, 2026</span>
                  <span className="text-xs text-white font-mono font-black tracking-widest bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    19:07:05
                  </span>
                </div>

                {/* Language Selector Selector Row */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Broadcast Translation Language</label>
                  <div className="grid grid-cols-5 gap-1">
                    {["EN", "ES", "FR", "JA", "HI"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setDashLanguage(lang);
                          setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🌐 LANGUAGE SELECT: Broadcast set to [${lang}]`, ...prev]);
                        }}
                        className={`py-1 rounded text-[10px] font-bold transition ${dashLanguage === lang ? "bg-red-600 text-white shadow-md shadow-red-600/10 border border-red-500" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: Select Disaster Type & Coordinate Location Sync */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* 1. SELECT DISASTER TYPE CARD */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
                      <span>Select Disaster Context</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">
                      TELEMETRY ENV
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Select an active disaster classification vector to align the map coordinates and sensor feeds automatically:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {disasterTypes.map((dis) => {
                      const isActive = dashDisasterId === dis.id;
                      return (
                        <div
                          key={dis.id}
                          className={`p-4 rounded-xl text-left transition relative border flex flex-col justify-between h-48 bg-slate-950/65 ${isActive ? "bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/5" : "border-slate-900 hover:border-slate-800 hover:bg-slate-900/30"}`}
                        >
                          {isActive && (
                            <span className="absolute top-3 right-3 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xl shrink-0" role="img" aria-label={dis.name}>{dis.icon}</span>
                              <span className="font-extrabold text-xs text-white tracking-wide">{dis.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
                              {dis.desc}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-900/40 mt-1.5">
                            <button
                              type="button"
                              onClick={() => handleDashDisasterSelect(dis.id)}
                              className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 ${isActive ? "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20" : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white"}`}
                            >
                              <span>{isActive ? "✓ Selected & Saved" : "Select & Save"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. DETECT LOCATION & MANUAL LOCATION INPUTS */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4.5 w-4.5 text-emerald-400" />
                      <span>GPS & Spatial Target Sync</span>
                    </h3>
                    
                    {/* Detect Geolocation Trigger Button */}
                    <button
                      onClick={detectLocation}
                      disabled={isDetectingGeo}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 transition ${isDetectingGeo ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-not-allowed" : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200"}`}
                    >
                      {isDetectingGeo ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>SYNCING GPS...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="h-3 w-3 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                          <span>DETECT DEVICE GPS</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Provide certified sector coordinates. You can auto-detect current device location, select tactical preset locations to test reverse geocoding instantly, or key coordinates into the inputs manually:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-8 space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Operational Location Name</label>
                        {isManualOverride && (
                          <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 rounded uppercase tracking-widest animate-pulse">
                            Manual Override Active
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={dashLocationName}
                        onChange={e => {
                          setDashLocationName(e.target.value);
                          setIsManualOverride(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-red-500 transition font-mono"
                        placeholder="Sector / Area ID"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Latitude</label>
                      <input
                        type="text"
                        value={dashLat}
                        onChange={e => {
                          setDashLat(e.target.value);
                          setIsManualOverride(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-red-500 transition font-mono"
                        placeholder="34.0522"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Longitude</label>
                      <input
                        type="text"
                        value={dashLng}
                        onChange={e => {
                          setDashLng(e.target.value);
                          setIsManualOverride(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-red-500 transition font-mono"
                        placeholder="-118.2437"
                      />
                    </div>
                  </div>

                  {/* Manual Location Override Action Button and Presets */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500">TEST PRESETS:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: "New York", lat: "40.7128", lng: "-74.0060" },
                            { name: "Tokyo", lat: "35.6762", lng: "139.6503" },
                            { name: "Paris", lat: "48.8566", lng: "2.3522" },
                            { name: "Sydney", lat: "-33.8688", lng: "151.2093" },
                            { name: "Cairo", lat: "30.0444", lng: "31.2357" }
                          ].map(preset => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                setDashLat(preset.lat);
                                setDashLng(preset.lng);
                                const simulatedUserLat = (parseFloat(preset.lat) + 0.012).toFixed(4);
                                const simulatedUserLng = (parseFloat(preset.lng) - 0.012).toFixed(4);
                                setUserLat(simulatedUserLat);
                                setUserLng(simulatedUserLng);
                                setIsManualOverride(true);
                                setDashLocationStatus(`Presets locked: ${preset.name}. Reverse geocoding...`);
                                setDashLogs(prev => [
                                  `[${new Date().toLocaleTimeString()}] 📍 PRESET LOADED: Coordinates synchronized to ${preset.name} (${preset.lat}, ${preset.lng}). Simulated device proximity GPS established at (${simulatedUserLat}, ${simulatedUserLng}).`,
                                  ...prev
                                ]);
                                performReverseGeocode(preset.lat, preset.lng);
                              }}
                              className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80 transition"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsManualOverride(true);
                          setDashLocationStatus("Manual coordinate override locked. Requesting reverse geocode...");
                          setDashLogs(prev => [
                            `[${new Date().toLocaleTimeString()}] 🛠️ OVERRIDE ACTIVE: Custom spatial coordinate locking engaged [Lat: ${dashLat}, Lng: ${dashLng}]`,
                            ...prev
                          ]);
                          performReverseGeocode(dashLat, dashLng);
                        }}
                        className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition flex items-center gap-1"
                      >
                        <span>Apply Override & Geocode</span>
                      </button>
                    </div>

                    {/* Reverse Geocoding Address display info card */}
                    <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-900/80 flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                        <Compass className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Reverse Geocoded Location</span>
                        <div className="flex items-center gap-2">
                          {isReverseGeocoding ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                              <span className="text-[10px] font-mono text-emerald-400 animate-pulse">{reverseGeocodedAddress}</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-200 truncate block">
                              {reverseGeocodedAddress || "No location geocoded yet. Press Detect Device GPS or custom presets."}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Geolocation Lock Status */}
                  <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-900 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isManualOverride ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                      <span className="text-slate-400">{dashLocationStatus}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setDashLat("34.0522");
                        setDashLng("-118.2437");
                        setUserLat("34.0650");
                        setUserLng("-118.2550");
                        setDashLocationName("Emergency Sector 4-B");
                        setReverseGeocodedAddress("Los Angeles, California");
                        setIsManualOverride(false);
                        setDashLocationStatus("Coordinates restored to default satellite beacon.");
                        setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🛰️ GPS RESET: Target reverted to HQ Default beacon and simulated user position.`, ...prev]);
                      }}
                      className="text-red-400 hover:underline hover:text-red-300 transition"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side: Emergency Status Card & Live Displays */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* 4. LIVE INTERACTIVE SPATIAL MAP */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Map className="h-4.5 w-4.5 text-red-500" />
                      <span>Live Crisis Spatial Map</span>
                    </h3>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>OPENSTREETMAP LIVE</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Interactive tactical mapping of user device GPS and disaster epicenters. Click anywhere on the map to manually set the disaster's exact coordinates.
                  </p>

                  <div className="w-full h-[320px] md:h-[380px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-900">
                    <LeafletMap 
                      dashLat={dashLat}
                      dashLng={dashLng}
                      userLat={userLat}
                      userLng={userLng}
                      facilities={facilities}
                      selectedFacilityId={selectedFacilityId}
                      onMapClick={(lat, lng) => {
                        setDashLat(lat);
                        setDashLng(lng);
                        setIsManualOverride(true);
                        setDashLocationStatus("Map click manual target acquired! Reverse geocoding...");
                        setDashLogs(prev => [
                          `[${new Date().toLocaleTimeString()}] 📍 MAP CLICK DETECTED: Incident target shifted to Lat ${lat}, Lng ${lng}`,
                          ...prev
                        ]);
                        performReverseGeocode(lat, lng);
                      }}
                    />
                  </div>

                  {/* Map legends */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-900/60">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span>Disaster Epicenter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>User Station</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const simulatedUserLat = (parseFloat(dashLat) + 0.015).toFixed(4);
                        const simulatedUserLng = (parseFloat(dashLng) - 0.015).toFixed(4);
                        setUserLat(simulatedUserLat);
                        setUserLng(simulatedUserLng);
                        setDashLogs(prev => [
                          `[${new Date().toLocaleTimeString()}] 📡 TELEMETRY RE-ORIENT: Re-centered view of disaster zone and dispatch squads.`,
                          ...prev
                        ]);
                      }}
                      className="px-2 py-0.5 rounded text-[9px] font-semibold text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition cursor-pointer"
                    >
                      Sync Proximity
                    </button>
                  </div>
                </div>

                {/* 3. EMERGENCY STATUS CARD */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-5 relative">
                  <div className="absolute top-0 right-0 h-2 bg-gradient-to-l from-red-600 via-orange-500 to-amber-500 rounded-t-2xl w-full" />
                  
                  <div className="flex justify-between items-center pt-1.5">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4.5 w-4.5 text-red-500" />
                      <span>Grid Sector Emergency HUD</span>
                    </h3>
                    
                    {/* Interactive Severity Selection Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">SEVERITY LEVEL:</span>
                      <select
                        value={dashSeverity}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setDashSeverity(val);
                          setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🚨 THREAT LEVEL ALTERED: Target sector severity level escalated to [${val}]`, ...prev]);
                        }}
                        className={`text-[10px] font-bold rounded-lg border p-1 outline-none font-mono transition ${dashSeverity === "EXTREME" ? "bg-red-500/10 border-red-500/25 text-red-400" : dashSeverity === "SEVERE" ? "bg-orange-500/10 border-orange-500/25 text-orange-400" : dashSeverity === "MODERATE" ? "bg-amber-500/10 border-amber-500/25 text-amber-400" : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"}`}
                      >
                        <option value="EXTREME" className="bg-slate-950 text-red-400 font-bold">EXTREME</option>
                        <option value="SEVERE" className="bg-slate-950 text-orange-400 font-bold">SEVERE</option>
                        <option value="MODERATE" className="bg-slate-950 text-amber-400 font-bold">MODERATE</option>
                        <option value="CLEAR" className="bg-slate-950 text-emerald-400 font-bold">CLEAR</option>
                      </select>
                    </div>
                  </div>

                  {/* Interactive Dashboard Counters & Safety Switches */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Active Responders Counter Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1 text-center">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Active Responders</span>
                      <div className="flex items-center justify-between px-2 pt-1">
                        <button
                          onClick={() => {
                            if (dashResponders > 0) {
                              setDashResponders(prev => prev - 5);
                              setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🚒 DISPATCH RECALL: 5 field responder teams retired. Active count: ${dashResponders - 5}`, ...prev]);
                            }
                          }}
                          className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="text-sm font-black text-white font-mono">{dashResponders} Teams</span>
                        <button
                          onClick={() => {
                            setDashResponders(prev => prev + 5);
                            setDashLogs(prev => [`[${new Date().toLocaleTimeString()}] 🚒 DISPATCH ESCALATE: 5 responder teams deployed. Active count: ${dashResponders + 5}`, ...prev]);
                          }}
                          className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Evacuated Population Slider Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1 text-center">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Evacuated Residents</span>
                      <div className="px-1 pt-1.5 space-y-1">
                        <input
                          type="range"
                          min="0"
                          max="100000"
                          step="50"
                          value={dashEvacuated}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setDashEvacuated(val);
                          }}
                          className="w-full accent-red-500 cursor-pointer h-1 rounded-lg bg-slate-900"
                        />
                        <div className="text-xs font-mono font-bold text-white text-center">
                          {dashEvacuated.toLocaleString()} / 100k
                        </div>
                      </div>
                    </div>

                    {/* Power Grid Safety Toggle Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1.5 text-center">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Power Grid Controller</span>
                      <div className="pt-0.5">
                        <button
                          onClick={() => {
                            const nextState = dashGridStatus === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
                            setDashGridStatus(nextState);
                            setDashLogs(prev => [
                              `[${new Date().toLocaleTimeString()}] ⚡ POWER GRID EVENT: Local power distribution sector turned [${nextState}].`,
                              ...prev
                            ]);
                          }}
                          className={`w-full py-1 rounded text-[10px] font-bold border transition ${dashGridStatus === "ACTIVE" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20" : "bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20"}`}
                        >
                          {dashGridStatus === "ACTIVE" ? "🟢 ACTIVE GRID" : "🔴 DEACTIVATED"}
                        </button>
                      </div>
                      {(dashDisasterId === "floods" || dashDisasterId === "cyclones") && dashGridStatus === "ACTIVE" && (
                        <span className="text-[8px] font-sans text-red-400 animate-pulse block">
                          ⚠️ WARNING: Danger of water electrification and high wind storm sparks!
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Satellite Broadcast Output Box */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4.5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Radio className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Transmitted Satellite Audio Broadcast Payload</span>
                      </span>
                      <span className="text-red-400 font-bold animate-pulse">TRANSMITTING</span>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60 flex flex-col gap-2 relative">
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[8px] text-slate-500 font-mono">TX STRENGTH: 99%</span>
                      </div>
                      
                      <div className="text-xs text-white font-mono leading-relaxed select-text italic">
                        "{BROADCASTS[dashDisasterId]?.[dashLanguage] || "ALERT: Immediate operational safety measures required."}"
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-900/40">
                        <span>Frequency: 142.85 MHz UHF</span>
                        <span>Translation: [{dashLanguage}] Active</span>
                      </div>
                    </div>

                    {/* Integrated Text-to-Speech Broadcaster */}
                    <TextToSpeechController
                      textToRead={BROADCASTS[dashDisasterId]?.[dashLanguage] || "ALERT: Immediate operational safety measures required."}
                      languageCode={dashLanguage}
                      title="AI Satellite Audio Broadcast"
                    />
                  </div>

                </div>

                 {/* 5. DYNAMIC EMERGENCY CHECKLIST */}
                <EmergencyChecklist 
                  disasterId={dashDisasterId}
                  disasterName={activeDisasterName}
                  languageCode={dashLanguage}
                />

                {/* 6. OSM NEARBY FACILITIES FINDER */}
                <NearbyFacilitiesFinder 
                  dashLat={dashLat}
                  dashLng={dashLng}
                  onFacilitiesFound={setFacilities}
                  onSelectFacility={setSelectedFacilityId}
                  selectedFacilityId={selectedFacilityId}
                />

              </div>

            </div>

            {/* Row 3: Quick Emergency Dispatch Action Hub & System Logger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (Quick Emergency Buttons) */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* QUICK EMERGENCY BUTTONS GROUP */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4.5 w-4.5 text-amber-400 animate-bounce" />
                    <span>Quick Emergency Actions Hub</span>
                  </h3>
                  
                  <p className="text-xs text-slate-400">
                    Instantly deploy local tactical countermeasures. Triggers satellite alerts, drone pathfinding arrays, or recruits watsonx AI routing assistance:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* BUTTON A: Satellite Broadcast Warning */}
                    <button
                      onClick={broadcastWarning}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-900 hover:border-red-500/40 hover:bg-red-500/5 transition text-left group flex flex-col justify-between h-28"
                    >
                      <div className="flex justify-between w-full">
                        <Radio className="h-5 w-5 text-red-500 group-hover:scale-110 transition" />
                        <span className="text-[9px] font-mono text-slate-500">CELL/UHF</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-red-400 transition">Broadcast Warning</div>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">Emit translated alert package to local residents immediately.</p>
                      </div>
                    </button>

                    {/* BUTTON B: Dispatch Air Drone */}
                    <button
                      onClick={launchReconDrone}
                      disabled={droneState.status === "launching" || droneState.status === "scanning"}
                      className={`p-4 rounded-xl bg-slate-950 border border-slate-900 transition text-left group flex flex-col justify-between h-28 relative overflow-hidden ${(droneState.status === "launching" || droneState.status === "scanning") ? "opacity-90 cursor-not-allowed border-emerald-500/20" : "hover:border-emerald-500/40 hover:bg-emerald-500/5"}`}
                    >
                      <div className="flex justify-between w-full">
                        <Compass className={`h-5 w-5 text-emerald-400 ${droneState.status !== "idle" ? "animate-spin" : "group-hover:scale-110 transition"}`} />
                        <span className="text-[9px] font-mono text-slate-500">UAV ACTIVE</span>
                      </div>
                      
                      {/* Interactive Drone Scan Progress Bar */}
                      {droneState.status !== "idle" && (
                        <div className="absolute inset-x-4 bottom-2.5 space-y-1">
                          <div className="flex justify-between text-[8px] font-mono text-emerald-400">
                            <span className="truncate">{droneState.summary}</span>
                            <span>{droneState.progress}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${droneState.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {droneState.status === "idle" && (
                        <div>
                          <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition">Dispatch Recon Drone</div>
                          <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">Launch Infrared Drone Alpha to compute structural blockage coordinates.</p>
                        </div>
                      )}

                      {droneState.status === "completed" && (
                        <div className="pb-1">
                          <div className="font-bold text-xs text-emerald-400">Drone Task Completed</div>
                          <p className="text-[8px] text-slate-300 line-clamp-2 mt-0.5">{droneState.summary}</p>
                        </div>
                      )}
                    </button>

                    {/* BUTTON C: Deploy Base Camp */}
                    <button
                      onClick={deployShelter}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-900 hover:border-amber-500/40 hover:bg-amber-500/5 transition text-left group flex flex-col justify-between h-28"
                    >
                      <div className="flex justify-between w-full">
                        <MapPin className="h-5 w-5 text-amber-500 group-hover:scale-110 transition" />
                        <span className="text-[9px] font-mono text-slate-500">SHELTER BUILD</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-amber-400 transition">Deploy Emergency Shelter</div>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">Map and erect dynamic Base Camps at active GPS coordinates.</p>
                      </div>
                    </button>

                    {/* BUTTON D: Granite AI Triage Heuristics */}
                    <button
                      onClick={triggerGraniteTriage}
                      disabled={isTriageLoading}
                      className={`p-4 rounded-xl bg-slate-950 border border-slate-900 transition text-left group flex flex-col justify-between h-28 relative overflow-hidden ${isTriageLoading ? "opacity-90 cursor-not-allowed border-purple-500/20" : "hover:border-purple-500/40 hover:bg-purple-500/5"}`}
                    >
                      <div className="flex justify-between w-full">
                        <Sparkles className={`h-5 w-5 text-purple-400 ${isTriageLoading ? "animate-pulse" : "group-hover:scale-110 transition"}`} />
                        <span className="text-[9px] font-mono text-slate-500">watsonx.ai</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-purple-400 transition">
                          {isTriageLoading ? "SYNTHESIZING..." : "Granite AI Routing Heuristics"}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">Engage IBM Granite 13B model to analyze fault patterns and map emergency channels.</p>
                      </div>
                    </button>

                  </div>
                </div>

                {/* AI DECISION RESULT BOX (Only visible when generated) */}
                {triagePlan && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-900/60 rounded-2xl space-y-4 text-left"
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono text-purple-400 uppercase tracking-widest border-b border-purple-900/40 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>IBM Granite 13B Tactical Advice Vector</span>
                      </span>
                      <span>CONFIDENCE: 94.6%</span>
                    </div>
                    <p className="text-xs font-mono text-slate-200 leading-relaxed">
                      {triagePlan}
                    </p>

                    {/* Speech Assistant for Granite advice */}
                    <TextToSpeechController
                      textToRead={triagePlan}
                      languageCode={dashLanguage}
                      title="AI Tactical Advice Voice Assistant"
                    />

                    <div className="text-[9px] text-slate-500 font-mono text-right pt-1.5">
                      Prompt Tokens: 840 | Completion Tokens: 125 | Inference: 142ms
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Right Column (Dynamic System Logs Console) */}
              <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
                
                {/* SYSTEM LOGGER HUD */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col flex-1 min-h-[340px] justify-between">
                  
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 shrink-0">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="h-4.5 w-4.5 text-emerald-400" />
                      <span>Radio Broadcast & Dispatch Log</span>
                    </h3>
                    
                    <button
                      onClick={() => setDashLogs([`[${new Date().toLocaleTimeString()}] 🧹 Log buffer cleared.`])}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-900 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white rounded text-[10px] font-mono transition"
                    >
                      Clear Logs
                    </button>
                  </div>

                  {/* Terminal Log Output Window */}
                  <div className="bg-slate-950 border border-slate-900/80 rounded-xl p-4 flex-1 h-64 overflow-y-auto space-y-2 select-text font-mono text-[10.5px]">
                    {dashLogs.map((log, index) => {
                      let colorClass = "text-slate-400";
                      if (log.includes("🚨") || log.includes("⚠️") || log.includes("POWER GRID")) {
                        colorClass = "text-red-400 font-semibold";
                      } else if (log.includes("🟢") || log.includes("✅") || log.includes("SUCCESS")) {
                        colorClass = "text-emerald-400 font-bold";
                      } else if (log.includes("📡") || log.includes("🌐") || log.includes("Lang:")) {
                        colorClass = "text-cyan-400";
                      } else if (log.includes("🧠") || log.includes("GRANITE")) {
                        colorClass = "text-purple-400 font-medium";
                      } else if (log.includes("🔄") || log.includes("CRISIS SWITCH")) {
                        colorClass = "text-amber-400";
                      }
                      return (
                        <div key={index} className={`leading-relaxed ${colorClass}`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>

                  {/* Station Specs Details Footer */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-900/60 shrink-0">
                    <div>
                      <span className="block text-slate-400 font-bold">GIS STACK</span>
                      <span>PostGIS / OpenLayers</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold">SENSORS</span>
                      <span>98.4% Active UHF</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold">LATENCY</span>
                      <span>12ms telemetry grid</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </motion.div>
        )}
        
        {/* ==================== 1. LANDING PAGE MODE ==================== */}
        {mode === "landing" && (
          <div className="space-y-24 pb-24">
            
            {/* HERO SECTION */}
            <section className="relative px-6 pt-16 md:pt-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Left: Title and CTA */}
              <div className="lg:col-span-7 space-y-8 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Next-Generation Tactical Operations</span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                    Disaster Response <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400">
                      Orchestrated by AI
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                    Coordinate crisis containment instantly. Combines Leaflet spatial mapping, 
                    Supabase PostGIS databases, and tactical intelligence from **IBM watsonx.ai Granite Models** 
                    to compute dynamic evacuations, logistics routing, and sirens.
                  </p>
                </div>

                {/* Micro tech metrics */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-900/60 font-mono text-xs text-slate-500">
                  <div className="space-y-1">
                    <span className="text-white font-bold text-lg">FASTAPI</span>
                    <div>Routing Core</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white font-bold text-lg">POSTGIS</span>
                    <div>Spatial Index</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white font-bold text-lg">GRANITE</span>
                    <div>13B LLM Engine</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a 
                    href="#simulator" 
                    className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-sm text-center text-white shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition flex items-center justify-center gap-2"
                  >
                    <span>Launch Tactical Simulator</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <button 
                    onClick={() => setMode("console")}
                    className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 font-semibold text-sm text-center text-slate-200 transition flex items-center justify-center gap-2"
                  >
                    <FolderTree className="h-4 w-4 text-slate-400" />
                    <span>Explore Project Files</span>
                  </button>
                </div>
              </div>

              {/* Hero Right: Interactive Tactical Simulator HUD */}
              <div id="simulator" className="lg:col-span-5 relative">
                {/* Decorative glowing boundary lights */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl blur opacity-25" />

                <div className="relative bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
                  
                  {/* HUD Header */}
                  <div className="bg-slate-900/50 border-b border-slate-900 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold text-white tracking-wide text-[11px]">TACTICAL CRUSH-SIMULATOR HUD</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">STAGE-1-ACTIVE</span>
                  </div>

                  {/* Simulator Controls & Parameters */}
                  <div className="p-4 space-y-4 border-b border-slate-900">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configure Telemetry</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Incident Category</label>
                          <select 
                            value={simulatedIncident.title}
                            onChange={(e) => setSimulatedIncident(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-300 focus:outline-none focus:border-red-500 text-[11px]"
                          >
                            <option value="Flash Flood">Flash Flood</option>
                            <option value="Wildfire Perimeter">Wildfire Perimeter</option>
                            <option value="Hurricane Surge">Hurricane Surge</option>
                            <option value="Earthquake Blockage">Earthquake Blockage</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Geo Severity</label>
                          <select 
                            value={simulatedIncident.severity}
                            onChange={(e) => setSimulatedIncident(prev => ({ ...prev, severity: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-300 focus:outline-none focus:border-red-500 text-[11px]"
                          >
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="EXTREME">EXTREME</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Latitude</label>
                        <input 
                          type="text" 
                          value={simulatedIncident.latitude}
                          onChange={(e) => setSimulatedIncident(prev => ({ ...prev, latitude: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-300 focus:outline-none focus:border-red-500 text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Longitude</label>
                        <input 
                          type="text" 
                          value={simulatedIncident.longitude}
                          onChange={(e) => setSimulatedIncident(prev => ({ ...prev, longitude: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-300 focus:outline-none focus:border-red-500 text-[11px]"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={runSimulation}
                      disabled={simulating}
                      className="w-full py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white transition rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{simulating ? "PROCESSING PLAN..." : "SUBMIT SIMULATION REPORT"}</span>
                    </button>
                  </div>

                  {/* Realtime Terminal Stream Output */}
                  <div className="bg-slate-950 p-4 font-mono text-[10px] text-slate-400 min-h-[160px] max-h-[160px] overflow-y-auto space-y-1">
                    <div className="text-slate-600 border-b border-slate-900 pb-1 mb-2">RUNNING REAL-TIME DATA STREAM</div>
                    {simulationLogs.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-red-500/60">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    {simulationResponse && (
                      <div className="p-2 mt-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-sans">
                        <strong>IBM Granite Advice:</strong> {simulationResponse}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="px-6 max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">TACTICAL ADVANTAGE</h3>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Equipped with Crisis Intelligence</h2>
                <p className="text-sm text-slate-400 max-w-xl mx-auto">
                  A comprehensive design coupling spatial rendering with robust AI synthesis to support responders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1: OSM & Leaflet */}
                <div className="p-6 bg-slate-900/25 border border-slate-900 rounded-xl space-y-4 hover:border-slate-800 transition">
                  <div className="h-10 w-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
                    <Map className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Spatial GIS Interfaces</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Uses Leaflet maps coupled with OpenStreetMap geometries to display disaster bounds, shelter status pins, and active response squads.
                  </p>
                </div>

                {/* Feature 2: FastAPI Backbone */}
                <div className="p-6 bg-slate-900/25 border border-slate-900 rounded-xl space-y-4 hover:border-slate-800 transition">
                  <div className="h-10 w-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">FastAPI Async Router</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Python FastAPI core delivers lightning-fast endpoints to register new incidents, load assets, and stream real-time sensor updates.
                  </p>
                </div>

                {/* Feature 3: IBM watsonx Granite */}
                <div className="p-6 bg-slate-900/25 border border-slate-900 rounded-xl space-y-4 hover:border-slate-800 transition">
                  <div className="h-10 w-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">IBM Granite Models</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Leverages IBM watsonx Granite-13b models to analyze location coordinate proximities, available vehicles, and draft instant tactical guidelines.
                  </p>
                </div>

                {/* Feature 4: Supabase PostGIS */}
                <div className="p-6 bg-slate-900/25 border border-slate-900 rounded-xl space-y-4 hover:border-slate-800 transition">
                  <div className="h-10 w-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Spatial SQL Database</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Supabase PostgreSQL backed by PostGIS spatial extensions. Run complex SQL proximity checks to locate nearest medical caches within red alert polygons.
                  </p>
                </div>

                {/* Feature 5: Emergency Broadcasts */}
                <div className="p-6 bg-slate-900/25 border border-slate-900 rounded-xl space-y-4 hover:border-slate-800 transition">
                  <div className="h-10 w-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
                    <Radio className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Dynamic Broadcast Relays</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Broadcasting capabilities allow coordinators to trigger immediate regional notification systems and coordinate rescue assets.
                  </p>
                </div>

                {/* Feature 6: Supabase Auth */}
                <div className="p-6 bg-slate-900/25 border border-slate-900 rounded-xl space-y-4 hover:border-slate-800 transition">
                  <div className="h-10 w-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Supabase Auth SSR</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rigorous user access rules protect resources and bulletins. Restricts write operations to authorized coordinators using Row Level Security (RLS).
                  </p>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" className="px-6 max-w-7xl mx-auto space-y-16">
              <div className="text-center space-y-3">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">TACTICAL WORKFLOW</h3>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">How RESP-AI Coordinates Relief</h2>
                <p className="text-sm text-slate-400 max-w-xl mx-auto">
                  A seamless cycle from telemetry tracking to IBM watsonx synthesis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Step 1 */}
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-900 relative">
                  <div className="absolute top-4 right-4 text-3xl font-black text-red-500/10 font-mono">01</div>
                  <div className="space-y-3">
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono font-bold">STAGE 1</span>
                    <h4 className="text-md font-semibold text-white">Incident Logging</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Responders use NextJS to file a report containing coordinates. These details synchronize instantly with Supabase PostgreSQL.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-900 relative">
                  <div className="absolute top-4 right-4 text-3xl font-black text-red-500/10 font-mono">02</div>
                  <div className="space-y-3">
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono font-bold">STAGE 2</span>
                    <h4 className="text-md font-semibold text-white">watsonx Analysis</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      FastAPI compiles regional resource availability schemas and submits them to the IBM Granite LLM for immediate tactical guidelines.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-900 relative">
                  <div className="absolute top-4 right-4 text-3xl font-black text-red-500/10 font-mono">03</div>
                  <div className="space-y-3">
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono font-bold">STAGE 3</span>
                    <h4 className="text-md font-semibold text-white">Logistical Dispatch</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Optimal routes and guidelines display as interactive Leaflet layers. Broadcast bulletins are sent to alert active personnel.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SUPPORTED DISASTERS */}
            <section id="disasters" className="px-6 max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">CRISIS COVERAGE</h3>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Architected For Any Scenario</h2>
                <p className="text-sm text-slate-400 max-w-xl mx-auto">
                  Select a disaster profile below to explore the custom tactical pipelines and spatial analytics mapped for each.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Disaster Selectors Left */}
                <div className="lg:col-span-5 space-y-2">
                  {disasterTypes.map((disaster) => (
                    <button
                      key={disaster.id}
                      onClick={() => setSelectedDisasterId(disaster.id)}
                      className={`w-full p-4 rounded-xl text-left border transition flex items-center justify-between ${selectedDisasterId === disaster.id ? "bg-red-500/10 border-red-500/20 text-white shadow-lg" : "bg-slate-900/30 border-slate-900/80 text-slate-400 hover:text-white"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{disaster.icon}</span>
                        <span className="text-sm font-semibold">{disaster.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                {/* Display Area Right */}
                <div className="lg:col-span-7 bg-slate-900/30 border border-slate-900 p-8 rounded-2xl min-h-[280px] flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    {disasterTypes.map((disaster) => disaster.id === selectedDisasterId && (
                      <motion.div
                        key={disaster.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{disaster.icon}</span>
                          <h4 className="text-xl font-bold text-white">{disaster.name} Profile</h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{disaster.desc}</p>
                        
                        <div className="space-y-2">
                          <span className="text-xs font-mono text-red-400 block font-bold">TACTICAL FLOW CONTROLS</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {disaster.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 border border-slate-900 p-2.5 rounded-lg">
                                <CheckCircle2 className="h-3.5 w-3.5 text-red-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="px-6 max-w-5xl mx-auto relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl blur-xl opacity-20 pointer-events-none" />
              
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-6">
                <h3 className="text-xl sm:text-3xl font-extrabold text-white">
                  Ready to deploy tactical response infrastructure?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  FastAPI routing wrappers, Next.js page maps, Supabase PostGIS schemas, and IBM watsonx API integrations are completely bootstrapped.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => setMode("console")}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-xs text-white transition flex items-center justify-center gap-2"
                  >
                    <Terminal className="h-4 w-4" />
                    <span>Launch Technical Blueprint Panel</span>
                  </button>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-6 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-900 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Export Project Directory</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  </a>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ==================== 2. TECHNICAL CONSOLE/BLUEPRINT MODE ==================== */}
        {mode === "console" && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative z-10">
            
            {/* Console Navigation Sidebar */}
            <aside className="w-full lg:w-80 border-r border-slate-900 bg-slate-950/40 p-4 space-y-2 flex-shrink-0">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Blueprint Components</div>
              
              <button 
                onClick={() => setActiveTab("explorer")}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition text-xs ${activeTab === "explorer" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-300 hover:bg-slate-900/50 hover:text-white"}`}
                id="tab-explorer"
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="h-4 w-4" />
                  <span>Project Folder Tree</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>

              <button 
                onClick={() => setActiveTab("router")}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition text-xs ${activeTab === "router" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-300 hover:bg-slate-900/50 hover:text-white"}`}
                id="tab-router"
              >
                <div className="flex items-center gap-2.5">
                  <Map className="h-4 w-4" />
                  <span>Next.js App Router Map</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>

              <button 
                onClick={() => setActiveTab("swagger")}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition text-xs ${activeTab === "swagger" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-300 hover:bg-slate-900/50 hover:text-white"}`}
                id="tab-swagger"
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="h-4 w-4" />
                  <span>FastAPI Endpoint Explorer</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>

              <button 
                onClick={() => setActiveTab("database")}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition text-xs ${activeTab === "database" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-300 hover:bg-slate-900/50 hover:text-white"}`}
                id="tab-database"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4" />
                  <span>Supabase Schema & RLS</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>

              <button 
                onClick={() => setActiveTab("auth")}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition text-xs ${activeTab === "auth" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-300 hover:bg-slate-900/50 hover:text-white"}`}
                id="tab-auth"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">Supabase Auth Simulator</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>

              <button 
                onClick={() => setActiveTab("watsonx")}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition text-xs ${activeTab === "watsonx" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-300 hover:bg-slate-900/50 hover:text-white"}`}
                id="tab-watsonx"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-4 w-4" />
                  <span>IBM watsonx AI Flow</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>

              <button 
                onClick={() => setActiveTab("setup")}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition text-xs ${activeTab === "setup" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-300 hover:bg-slate-900/50 hover:text-white"}`}
                id="tab-setup"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4" />
                  <span>Deployment & Run Guide</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>

              <div className="mt-8 p-4 rounded-xl bg-slate-900/40 border border-slate-900/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Info className="h-4 w-4 text-slate-500" />
                  <span>Operator Blueprint Mode</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspect and toggle the real, bootstrapped codebase layouts for front-and-backend services.
                </p>
                <button 
                  onClick={() => setMode("landing")}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded transition"
                >
                  Return to Landing Page
                </button>
              </div>
            </aside>

            {/* Center Panel Container */}
            <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
              <AnimatePresence mode="wait">
                
                {/* TAB: PROJECT EXPLORER */}
                {activeTab === "explorer" && (
                  <motion.div 
                    key="explorer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                    id="panel-explorer"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-white">Full-Stack Folder Tree Specification</h2>
                      <p className="text-sm text-slate-400">Select any bootstrapped file below to inspect its architecture setup, dependencies, and imports.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[550px]">
                      {/* File Tree Left Section */}
                      <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 overflow-y-auto space-y-4">
                                    {/* Frontend Files Group */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                            <span className="w-2 h-2 rounded-full bg-red-500/80" />
                            <span>Frontend Node (Next.js 15)</span>
                          </div>
                          <div className="pl-3 space-y-1">
                            <button 
                              onClick={() => setSelectedFileKey("frontend-package")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "frontend-package" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>package.json</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("next-layout")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "next-layout" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>app/layout.tsx</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("next-page")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "next-page" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>app/page.tsx</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("next-map")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "next-map" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>app/map/page.tsx</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("frontend-middleware")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "frontend-middleware" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                              <span>middleware.ts</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("supabase-client")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "supabase-client" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <Database className="h-3.5 w-3.5 text-emerald-400" />
                              <span>lib/supabase.ts</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("auth-login")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "auth-login" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <Lock className="h-3.5 w-3.5 text-blue-400" />
                              <span>components/auth/LoginForm.tsx</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("auth-signup")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "auth-signup" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <Lock className="h-3.5 w-3.5 text-blue-400" />
                              <span>components/auth/SignupForm.tsx</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("auth-forgot-password")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "auth-forgot-password" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <Lock className="h-3.5 w-3.5 text-blue-400" />
                              <span>components/auth/ForgotPasswordForm.tsx</span>
                            </button>
                          </div>
                        </div>

                        {/* Backend Files Group */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            <span>Backend Node (FastAPI)</span>
                          </div>
                          <div className="pl-3 space-y-1">
                            <button 
                              onClick={() => setSelectedFileKey("backend-main")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "backend-main" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>app/main.py</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("backend-watsonx")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "backend-watsonx" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>app/services/watsonx.py</span>
                            </button>
                            <button 
                              onClick={() => setSelectedFileKey("backend-security")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "backend-security" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <ShieldAlert className="h-3.5 w-3.5 text-orange-400" />
                              <span>app/core/security.py</span>
                            </button>
                          </div>
                        </div>

                        {/* Database Group */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Database Migrations</span>
                          </div>
                          <div className="pl-3 space-y-1">
                            <button 
                              onClick={() => setSelectedFileKey("supabase-migration")}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${selectedFileKey === "supabase-migration" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>20260714000000_init.sql</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Code Viewer Right Section */}
                      <div className="md:col-span-2 bg-slate-900/80 border border-slate-900 rounded-xl overflow-hidden flex flex-col h-full font-mono">
                        <div className="bg-slate-950 px-4 py-2 text-xs text-slate-500 border-b border-slate-900 flex justify-between items-center">
                          <span>{filesData[selectedFileKey].path}</span>
                          <span className="text-red-500 uppercase font-semibold text-[10px]">{filesData[selectedFileKey].language}</span>
                        </div>
                        <pre className="flex-1 p-4 overflow-auto text-xs text-slate-300 leading-relaxed whitespace-pre select-all">
                          <code>{filesData[selectedFileKey].content}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: NEXT.JS APP ROUTER */}
                {activeTab === "router" && (
                  <motion.div 
                    key="router"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                    id="panel-router"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-white">Next.js 15 App Router Structure</h2>
                      <p className="text-sm text-slate-400">Overview of the pages, layout boundaries, and dynamic routing architectures established in `/frontend`.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Visually rendered Route hierarchy */}
                      <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-6">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Layers className="h-4 w-4 text-red-500" />
                          <span>Next.js App Segments</span>
                        </h3>

                        <div className="space-y-3 font-mono text-xs text-slate-400">
                          <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <div>
                              <div className="text-red-400 font-semibold">layout.tsx</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">Root layout initializing Inter fonts and viewport configs.</div>
                            </div>

                            <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                              <div>
                                <div className="text-white font-semibold">page.tsx</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Interactive home landing routing panel.</div>
                              </div>

                              <div>
                                <div className="text-white font-semibold">/dashboard</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Command center with telemetry cards and action controls.</div>
                              </div>

                              <div>
                                <div className="text-white font-semibold">/map</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Leaflet rendering center. Built as a Client Component.</div>
                              </div>

                              <div>
                                <div className="text-white font-semibold">/alerts</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Broadcast panel with alert severity pickers.</div>
                              </div>

                              <div>
                                <div className="text-white font-semibold">/resources</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Supply request registry and dispatch router.</div>
                              </div>

                              <div>
                                <div className="text-red-400 font-semibold">/api/disaster/route.ts</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Next.js API segment routing proxy to FastAPI instance.</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Sliders className="h-4 w-4 text-red-500" />
                            <span>Rendering Strategy Specifications</span>
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            To maintain pristine UX and support OpenStreetMap/Leaflet components, page routing leverages mixed rendering:
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 text-xs">
                            <div className="font-semibold text-white mb-1">Static Rendering & Prefetching</div>
                            <p className="text-slate-400">
                              `/dashboard`, `/alerts`, and `/resources` are rendered statically at build time to secure rapid performance, while fetching live incidents client-side.
                            </p>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 text-xs">
                            <div className="font-semibold text-white mb-1">Client-Side Hydration (&apos;use client&apos;)</div>
                            <p className="text-slate-400">
                              `/map` leverages NextJS dynamic imports with &quot;ssr: false&quot; to circumvent Leaflet reference errors concerning missing `window` objects on Node environments.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: FASTAPI ENDPOINT EXPLORER */}
                {activeTab === "swagger" && (
                  <motion.div 
                    key="swagger"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                    id="panel-swagger"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-white">FastAPI Endpoints Playground</h2>
                      <p className="text-sm text-slate-400">Test the API routing structure and observe sample JSON payloads of both input schemas and return contracts.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Endpoints listing */}
                      <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4">
                        <h3 className="text-sm font-semibold text-white">API Router Directory</h3>
                        
                        <div className="space-y-3">
                          {/* Health */}
                          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex justify-between items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">GET</span>
                                <span className="text-xs font-mono text-white">/</span>
                              </div>
                              <p className="text-[11px] text-slate-500">Service health monitoring and database status checks.</p>
                            </div>
                            <button 
                              onClick={() => triggerMockApiCall("health")}
                              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-xs hover:border-slate-700 transition flex items-center gap-1 font-semibold"
                            >
                              <Play className="h-3 w-3 text-red-500 fill-red-500" />
                              <span>Test</span>
                            </button>
                          </div>

                          {/* Post Disaster */}
                          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex justify-between items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">POST</span>
                                <span className="text-xs font-mono text-white">/api/v1/disasters</span>
                              </div>
                              <p className="text-[11px] text-slate-500">Log a new active emergency incident.</p>
                            </div>
                            <button 
                              onClick={() => triggerMockApiCall("disasters_post")}
                              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-xs hover:border-slate-700 transition flex items-center gap-1 font-semibold"
                            >
                              <Play className="h-3 w-3 text-red-500 fill-red-500" />
                              <span>Test</span>
                            </button>
                          </div>

                          {/* AI Advice */}
                          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex justify-between items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">POST</span>
                                <span className="text-xs font-mono text-white">/api/v1/disasters/ai-advice</span>
                              </div>
                              <p className="text-[11px] text-slate-500">Query IBM Granite on watsonx.ai for tactical instructions.</p>
                            </div>
                            <button 
                              onClick={() => triggerMockApiCall("watsonx")}
                              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-xs hover:border-slate-700 transition flex items-center gap-1 font-semibold"
                            >
                              <Play className="h-3 w-3 text-red-500 fill-red-500" />
                              <span>Test</span>
                            </button>
                          </div>

                          {/* Get Alerts */}
                          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex justify-between items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">GET</span>
                                <span className="text-xs font-mono text-white">/api/v1/alerts</span>
                              </div>
                              <p className="text-[11px] text-slate-500">Query all emergency alerts dispatched to networks.</p>
                            </div>
                            <button 
                              onClick={() => triggerMockApiCall("alerts_get")}
                              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-xs hover:border-slate-700 transition flex items-center gap-1 font-semibold"
                            >
                              <Play className="h-3 w-3 text-red-500 fill-red-500" />
                              <span>Test</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* API response simulation console */}
                      <div className="p-6 bg-slate-900/80 border border-slate-900 rounded-xl flex flex-col font-mono text-xs">
                        <div className="bg-slate-950 px-4 py-2 text-[10px] text-slate-500 border-b border-slate-900 flex justify-between items-center">
                          <span>CONSOLE OUTPUT</span>
                          {activeEndpoint && <span className="text-red-500">Active Query: {activeEndpoint}</span>}
                        </div>
                        
                        <div className="flex-1 p-4 overflow-auto min-h-[300px] flex flex-col justify-center">
                          {isLoadingApi ? (
                            <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                              <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-red-500 animate-spin" />
                              <span>Awaiting response payload...</span>
                            </div>
                          ) : swaggerResponse ? (
                            <pre className="text-slate-300 leading-relaxed text-left">
                              <code>{swaggerResponse}</code>
                            </pre>
                          ) : (
                            <div className="text-center text-slate-500">
                              <p>Select an endpoint on the left and click &apos;Test&apos; to inspect structural payloads.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: DATABASE SCHEMA */}
                {activeTab === "database" && (
                  <motion.div 
                    key="database"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                    id="panel-database"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-white">Supabase Schema & Relational Models</h2>
                      <p className="text-sm text-slate-400">Inspecting database specifications, geometric PostGIS triggers, and secure Row Level Security (RLS) definitions.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Database tables overview */}
                      <div className="lg:col-span-2 p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-6">
                        <h3 className="text-sm font-semibold text-white">Structural DB Schema</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                          {/* Table: Profiles */}
                          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-900 space-y-2">
                            <div className="text-slate-200 font-bold border-b border-slate-900 pb-1 flex justify-between items-center">
                              <span>profiles</span>
                              <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">Table</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-400">
                              <div>id: UUID <span className="text-slate-600">(P. Key, auth.users)</span></div>
                              <div>full_name: TEXT</div>
                              <div>role: TEXT <span className="text-slate-600">(responder, coordinator, viewer)</span></div>
                              <div>department: TEXT</div>
                            </div>
                          </div>

                          {/* Table: Disasters */}
                          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-900 space-y-2">
                            <div className="text-slate-200 font-bold border-b border-slate-900 pb-1 flex justify-between items-center">
                              <span>disasters</span>
                              <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">Table</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-400">
                              <div>id: UUID <span className="text-slate-600">(P. Key, gen_uuid)</span></div>
                              <div>title: TEXT</div>
                              <div>severity: TEXT <span className="text-slate-600">(LOW, MEDIUM, HIGH, EXTREME)</span></div>
                              <div>latitude/longitude: FLOAT</div>
                              <div>geog: GEOGRAPHY <span className="text-red-500 font-bold">(PostGIS Point)</span></div>
                            </div>
                          </div>

                          {/* Table: Resources */}
                          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-900 space-y-2">
                            <div className="text-slate-200 font-bold border-b border-slate-900 pb-1 flex justify-between items-center">
                              <span>resources</span>
                              <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">Table</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-400">
                              <div>id: UUID</div>
                              <div>category: TEXT</div>
                              <div>quantity: INTEGER</div>
                              <div>latitude/longitude: FLOAT</div>
                              <div>geog: GEOGRAPHY <span className="text-red-500 font-bold">(PostGIS Point)</span></div>
                            </div>
                          </div>

                          {/* Table: Alerts */}
                          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-900 space-y-2">
                            <div className="text-slate-200 font-bold border-b border-slate-900 pb-1 flex justify-between items-center">
                              <span>alerts</span>
                              <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">Table</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-400">
                              <div>id: UUID</div>
                              <div>title: TEXT</div>
                              <div>message: TEXT</div>
                              <div>severity: TEXT <span className="text-slate-600">(SEVERE, EXTREME)</span></div>
                              <div>target_area: TEXT</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Security Panel */}
                      <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          <span>Row Level Security (RLS)</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          All tables are protected by real SQL policies that enforce secure coordination boundaries:
                        </p>

                        <div className="space-y-3 text-xs font-mono">
                          <div className="p-3 rounded bg-slate-950 border border-slate-900 space-y-1">
                            <div className="text-white font-bold text-[11px]">Anonymous View Policy</div>
                            <p className="text-[10px] text-slate-500">Allows general citizens and search grids to query incidents or resource markers without signing in.</p>
                          </div>

                          <div className="p-3 rounded bg-slate-950 border border-slate-900 space-y-1">
                            <div className="text-white font-bold text-[11px]">Commander Check Policy</div>
                            <p className="text-[10px] text-slate-500">Restricts logistics alterations and alert broadcasts to verified accounts carrying the &apos;coordinator&apos; role.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: SUPABASE AUTHENTICATION SIMULATOR */}
                {activeTab === "auth" && (
                  <motion.div 
                    key="auth"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                    id="panel-auth"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Lock className="h-5 w-5 text-emerald-400" />
                        <span>Supabase Auth & Session Controller</span>
                      </h2>
                      <p className="text-sm text-slate-400">
                        Test login validation, request account signups, trigger recovery flows, and observe real-time Next.js middleware and FastAPI token interception.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Rendered Reusable Auth Components */}
                      <div className="lg:col-span-5 bg-slate-900/35 border border-slate-900 rounded-xl p-6 flex flex-col items-center justify-center min-h-[460px] relative">
                        <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>LIVE COMPONENT HUD VIEW</span>
                        </div>

                        {authFormView === "login" && (
                          <div className="w-full max-w-sm space-y-5">
                            <div className="space-y-2 text-center">
                              <h3 className="text-md font-bold text-white flex items-center justify-center gap-1.5">
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                                <span>Access Tactical Console</span>
                              </h3>
                              <p className="text-xs text-slate-400">Provide certified emergency credentials to decode spatial telemetry.</p>
                            </div>

                            {authMessage && (
                              <div className={`p-3 rounded-lg text-xs flex gap-2 ${authMessage.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                                <Info className="h-4 w-4 shrink-0" />
                                <span>{authMessage.text}</span>
                              </div>
                            )}

                            <form onSubmit={(e) => {
                              e.preventDefault();
                              setAuthLoading(true);
                              setAuthMessage(null);
                              setTimeout(() => {
                                setAuthLoading(false);
                                if (!authEmailInput.includes("@")) {
                                  setAuthMessage({ type: "error", text: "Invalid user email format pattern." });
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] ❌ AUTHENTICATION FAILURE: Attempt to login with ${authEmailInput} failed.`,
                                    ...prev
                                  ]);
                                } else {
                                  const generatedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ email: authEmailInput, role: authRoleInput, aud: "authenticated" })) + ".signature";
                                  setSimulatedUserSession({
                                    email: authEmailInput,
                                    role: authRoleInput,
                                    token: generatedToken
                                  });
                                  setAuthMessage({ type: "success", text: "Secure operational token stored in client cookie context successfully!" });
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] 🔑 SESSION ESTABLISHED: ${authEmailInput} logged in as [${authRoleInput}].`,
                                    `[${new Date().toLocaleTimeString()}] 🛡️ COOKIE INJECTED: sb-access-token initialized.`,
                                    ...prev
                                  ]);
                                }
                              }, 1000);
                            }} className="space-y-4">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Operator Email</label>
                                <input 
                                  type="email" 
                                  value={authEmailInput} 
                                  onChange={e => setAuthEmailInput(e.target.value)} 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 transition font-mono" 
                                  required 
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Access Key</label>
                                  <button type="button" onClick={() => { setAuthFormView("forgot"); setAuthMessage(null); }} className="text-[10px] text-red-400 hover:underline">Forgot Key?</button>
                                </div>
                                <input 
                                  type="password" 
                                  value={authPasswordInput} 
                                  onChange={e => setAuthPasswordInput(e.target.value)} 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 transition" 
                                  required 
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Select Operational Role</label>
                                <select 
                                  value={authRoleInput}
                                  onChange={e => setAuthRoleInput(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 outline-none focus:border-red-500 transition font-mono"
                                >
                                  <option value="coordinator">Coordinator (Full database write, broadcasts allowed)</option>
                                  <option value="responder">Field Responder (Submit disaster incidents only)</option>
                                  <option value="viewer">Public Viewer (Read-only GIS capabilities)</option>
                                </select>
                              </div>

                              <button type="submit" disabled={authLoading} className="w-full py-2.5 bg-red-600 hover:bg-red-500 font-bold text-xs text-white rounded-lg transition tracking-wide flex justify-center items-center gap-2 shadow-lg shadow-red-600/10">
                                {authLoading ? "DECRYPTING KEY..." : "VERIFY SECURE LOGIN"}
                              </button>
                            </form>

                            <div className="text-center pt-2">
                              <span className="text-[11px] text-slate-500">Need emergency clearance credentials? </span>
                              <button onClick={() => { setAuthFormView("signup"); setAuthMessage(null); }} className="text-[11px] text-red-400 font-semibold hover:underline">Request Account</button>
                            </div>
                          </div>
                        )}

                        {authFormView === "signup" && (
                          <div className="w-full max-w-sm space-y-5">
                            <div className="space-y-2 text-center">
                              <h3 className="text-md font-bold text-white flex items-center justify-center gap-1.5">
                                <UserCheck className="h-4 w-4 text-red-500" />
                                <span>Request Operator Account</span>
                              </h3>
                              <p className="text-xs text-slate-400">Submit an application requesting database access credentials.</p>
                            </div>

                            {authMessage && (
                              <div className={`p-3 rounded-lg text-xs flex gap-2 ${authMessage.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                                <Info className="h-4 w-4 shrink-0" />
                                <span>{authMessage.text}</span>
                              </div>
                            )}

                            <form onSubmit={(e) => {
                              e.preventDefault();
                              if (authPasswordInput !== authConfirmPasswordInput) {
                                setAuthMessage({ type: "error", text: "Confirmation key does not match password." });
                                return;
                              }
                              setAuthLoading(true);
                              setAuthMessage(null);
                              setTimeout(() => {
                                setAuthLoading(false);
                                setAuthMessage({ type: "success", text: "Signup completed! Verification dispatch routed to operator mailbox." });
                                setMiddlewareAccessLog(prev => [
                                  `[${new Date().toLocaleTimeString()}] 📨 USER REGISTERED: ${authEmailInput} created account under verification queue.`,
                                  ...prev
                                ]);
                              }, 1200);
                            }} className="space-y-4">
                              <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={authEmailInput} 
                                onChange={e => setAuthEmailInput(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200" 
                                required 
                              />
                              <input 
                                type="password" 
                                placeholder="Create Password" 
                                value={authPasswordInput} 
                                onChange={e => setAuthPasswordInput(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200" 
                                required 
                              />
                              <input 
                                type="password" 
                                placeholder="Confirm Password" 
                                value={authConfirmPasswordInput} 
                                onChange={e => setAuthConfirmPasswordInput(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200" 
                                required 
                              />
                              <button type="submit" disabled={authLoading} className="w-full py-2.5 bg-red-600 hover:bg-red-500 font-bold text-xs text-white rounded-lg transition">
                                {authLoading ? "INITIALIZING SECURE ACCOUNT..." : "SUBMIT ACCESS REQUEST"}
                              </button>
                            </form>

                            <div className="text-center pt-2">
                              <span className="text-[11px] text-slate-500">Already possess clearance? </span>
                              <button onClick={() => { setAuthFormView("login"); setAuthMessage(null); }} className="text-[11px] text-red-400 font-semibold hover:underline font-mono">Return to Sign In</button>
                            </div>
                          </div>
                        )}

                        {authFormView === "forgot" && (
                          <div className="w-full max-w-sm space-y-5">
                            <div className="space-y-2 text-center">
                              <h3 className="text-md font-bold text-white flex items-center justify-center gap-1.5">
                                <BookOpen className="h-4 w-4 text-red-400" />
                                <span>Clearance Recovery Dispatch</span>
                              </h3>
                              <p className="text-xs text-slate-400">Generate secure reset vectors to unlock your local commander profile.</p>
                            </div>

                            {authMessage && (
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
                                {authMessage.text}
                              </div>
                            )}

                            <form onSubmit={(e) => {
                              e.preventDefault();
                              setAuthLoading(true);
                              setTimeout(() => {
                                setAuthLoading(false);
                                setAuthMessage({ type: "success", text: "Secure reset coordinate link dispatched successfully to " + authEmailInput });
                                setMiddlewareAccessLog(prev => [
                                  `[${new Date().toLocaleTimeString()}] 🔑 RESET VECTOR SENT: Recovery token routed to ${authEmailInput}.`,
                                  ...prev
                                ]);
                              }, 1000);
                            }} className="space-y-4">
                              <input 
                                type="email" 
                                value={authEmailInput} 
                                onChange={e => setAuthEmailInput(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200" 
                                required 
                              />
                              <button type="submit" disabled={authLoading} className="w-full py-2.5 bg-red-600 hover:bg-red-500 font-bold text-xs text-white rounded-lg transition">
                                {authLoading ? "DISPATCHING COORDINATES..." : "DISPATCH RECOVERY SECURE LINK"}
                              </button>
                            </form>

                            <div className="text-center pt-2">
                              <button onClick={() => { setAuthFormView("login"); setAuthMessage(null); }} className="text-[11px] text-slate-400 hover:text-white transition">Back to Login</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Security & Session Log HUD */}
                      <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                        
                        {/* active session view */}
                        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4 font-mono text-xs">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                            <span className="font-sans font-bold text-white flex items-center gap-1.5">
                              <Database className="h-4 w-4 text-emerald-400" />
                              <span>Stored User Session Token</span>
                            </span>
                            {simulatedUserSession ? (
                              <button 
                                onClick={() => {
                                  setSimulatedUserSession(null);
                                  setAuthMessage({ type: "success", text: "Operator signed out. Local security token dropped." });
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] 🛡️ SESSION EXPIRED: User signed out. sb-access-token deleted.`,
                                    ...prev
                                  ]);
                                }} 
                                className="px-2.5 py-1 bg-red-950/40 border border-red-900/55 hover:border-red-700 rounded text-[10px] text-red-400 font-bold"
                              >
                                Sign Out
                              </button>
                            ) : (
                              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">UNAUTHENTICATED</span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
                              <div className="text-slate-500 text-[10px] uppercase">Active Operator Profile</div>
                              {simulatedUserSession ? (
                                <div className="space-y-1">
                                  <div className="text-white font-bold">{simulatedUserSession.email}</div>
                                  <div className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <UserCheck className="h-3 w-3" />
                                    <span>Clearance: {simulatedUserSession.role.toUpperCase()}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-400 italic">No session active.</div>
                              )}
                            </div>

                            <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
                              <div className="text-slate-500 text-[10px] uppercase">Supabase SSR Cookie Payload</div>
                              {simulatedUserSession ? (
                                <div className="overflow-x-auto select-all max-w-full text-slate-400 text-[10px] whitespace-pre truncate">
                                  {simulatedUserSession.token}
                                </div>
                              ) : (
                                <div className="text-slate-400 italic">sb-access-token is empty.</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Interactive middleware router simulator */}
                        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
                          <h3 className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4 text-emerald-400" />
                            <span>Middleware Interceptor Simulator</span>
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Click below to simulate accessing specific routes on the Next.js server. The middleware will intercept the request and execute the exact JWT validation checks:
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button 
                              onClick={() => {
                                if (!simulatedUserSession) {
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] 🚨 MIDDLEWARE DENIED: Requested GET /dashboard. Status 307. Redirecting to /auth/login`,
                                    ...prev
                                  ]);
                                } else {
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] ✅ MIDDLEWARE PERMITTED: Requested GET /dashboard. Verified ${simulatedUserSession.email}. Access Granted.`,
                                    ...prev
                                  ]);
                                }
                              }}
                              className="p-2.5 rounded bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-300 text-xs font-mono text-center font-bold"
                            >
                              GET /dashboard
                            </button>

                            <button 
                              onClick={() => {
                                if (!simulatedUserSession) {
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] 🚨 MIDDLEWARE DENIED: Requested GET /map. Status 307. Redirecting to /auth/login`,
                                    ...prev
                                  ]);
                                } else {
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] ✅ MIDDLEWARE PERMITTED: Requested GET /map. Verified ${simulatedUserSession.email}. Access Granted.`,
                                    ...prev
                                  ]);
                                }
                              }}
                              className="p-2.5 rounded bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-300 text-xs font-mono text-center font-bold"
                            >
                              GET /map
                            </button>

                            <button 
                              onClick={() => {
                                if (!simulatedUserSession) {
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] 🚨 MIDDLEWARE DENIED: Requested GET /alerts. Status 307. Redirecting to /auth/login`,
                                    ...prev
                                  ]);
                                } else {
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] ✅ MIDDLEWARE PERMITTED: Requested GET /alerts. Verified ${simulatedUserSession.email}. Access Granted.`,
                                    ...prev
                                  ]);
                                }
                              }}
                              className="p-2.5 rounded bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-300 text-xs font-mono text-center font-bold"
                            >
                              GET /alerts
                            </button>

                            <button 
                              onClick={() => {
                                // FastAPI verification with bearer token check
                                if (!simulatedUserSession) {
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] 🚨 fastapi (get_current_user): No Authorization Bearer header supplied. Status 401 Unauthorized.`,
                                    ...prev
                                  ]);
                                } else {
                                  setMiddlewareAccessLog(prev => [
                                    `[${new Date().toLocaleTimeString()}] 🐍 fastapi (get_current_user): Authorization Header matched. Successfully decoded JWT with SUPABASE_JWT_SECRET. Audience: authenticated. Role: [${simulatedUserSession.role}].`,
                                    ...prev
                                  ]);
                                }
                              }}
                              className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/60 hover:border-emerald-700 text-emerald-300 text-xs font-mono text-center font-bold col-span-2 sm:col-span-1"
                            >
                              FastAPI JWT Auth
                            </button>
                          </div>

                          {/* Middleware log console */}
                          <div className="bg-slate-950 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 p-3 h-32 overflow-y-auto space-y-1.5 select-text">
                            {middlewareAccessLog.map((log, i) => (
                              <div key={i} className="leading-relaxed">
                                {log.startsWith(`[${new Date().toLocaleTimeString()}] ❌`) || log.includes("🚨") ? (
                                  <span className="text-red-400">{log}</span>
                                ) : log.includes("✅") || log.includes("🐍") || log.includes("🔑") ? (
                                  <span className="text-emerald-400 font-semibold">{log}</span>
                                ) : (
                                  <span>{log}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB: IBM WATSONX AI FLOW */}
                {activeTab === "watsonx" && (
                  <motion.div 
                    key="watsonx"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                    id="panel-watsonx"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-white">IBM watsonx.ai Granite Integration</h2>
                      <p className="text-sm text-slate-400">Visual mapping of how live spatial telemetry flows to the IBM Granite LLM to generate actionable evacuation plans.</p>
                    </div>

                    <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-8">
                      {/* Visual Flow diagram */}
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
                        
                        {/* Node 1 */}
                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-900 w-full lg:w-64 text-center space-y-2">
                          <div className="text-xs font-mono text-slate-500">STEP 1: SENSORS & GIS</div>
                          <h4 className="text-sm font-semibold text-white">Incident Triggered</h4>
                          <p className="text-[11px] text-slate-400">Reporter inputs coordinates (34.0522, -118.2437) and water level telemetry.</p>
                        </div>

                        <div className="hidden lg:block text-slate-700 font-mono">&rarr;&rarr;</div>

                        {/* Node 2 */}
                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-900 w-full lg:w-64 text-center space-y-2 border-red-500/30">
                          <div className="text-xs font-mono text-red-400">STEP 2: FASTAPI PARSING</div>
                          <h4 className="text-sm font-semibold text-white">System Prompt Synthesis</h4>
                          <p className="text-[11px] text-slate-400">Core parses incident + references database logistics for nearest shelters and personnel assets.</p>
                        </div>

                        <div className="hidden lg:block text-slate-700 font-mono">&rarr;&rarr;</div>

                        {/* Node 3 */}
                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-900 w-full lg:w-64 text-center space-y-2">
                          <div className="text-xs font-mono text-slate-500">STEP 3: watsonx COUPLING</div>
                          <h4 className="text-sm font-semibold text-white">IBM Granite (13b)</h4>
                          <p className="text-[11px] text-slate-400">Granite outputs highly structured evacuations and threat metrics based on prompt details.</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900 space-y-3">
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Operational Prompt Blueprint</h4>
                        <pre className="font-mono text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
{`<|system|>
You are an expert disaster tactical coordinator. Analyze the given emergency details, geographic coordinates, and operational resources. Propose a rigorous response plan with exact evacuation vectors...
<|user|>
Incident: Sector 4-B River Overflow
Coordinates: 34.0522, -118.2437
Available Assets: Base Camp Alpha, Paramedic Team 2
<|assistant|>`}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: LOCAL SETUP & RUN GUIDE */}
                {activeTab === "setup" && (
                  <motion.div 
                    key="setup"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                    id="panel-setup"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-white">Local Run & Deployment Guide</h2>
                      <p className="text-sm text-slate-400">How to spin up both the Next.js 15 frontend and FastAPI backend inside local or containerized environments.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-slate-400">
                      {/* Frontend instructions */}
                      <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4">
                        <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                          <Layers className="h-4 w-4 text-red-500" />
                          <span>Launch Next.js 15 Frontend</span>
                        </h3>

                        <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-900">
                          <div>
                            <div className="text-slate-500"># 1. Enter directory</div>
                            <div className="text-white">cd frontend</div>
                          </div>
                          <div>
                            <div className="text-slate-500"># 2. Install components</div>
                            <div className="text-white">npm install</div>
                          </div>
                          <div>
                            <div className="text-slate-500"># 3. Trigger local development server</div>
                            <div className="text-white">npm run dev</div>
                          </div>
                        </div>
                      </div>

                      {/* Backend instructions */}
                      <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4">
                        <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-orange-500" />
                          <span>Launch FastAPI Backend</span>
                        </h3>

                        <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-900">
                          <div>
                            <div className="text-slate-500"># 1. Enter directory</div>
                            <div className="text-white">cd backend</div>
                          </div>
                          <div>
                            <div className="text-slate-500"># 2. Spin up virtual environment</div>
                            <div className="text-white">python -m venv venv && source venv/bin/activate</div>
                          </div>
                          <div>
                            <div className="text-slate-500"># 3. Install packages & run app</div>
                            <div className="text-white">pip install -r requirements.txt && python app/main.py</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </main>
          </div>
        )}

        {/* ==================== 3. TACTICAL HISTORY LOG MODE ==================== */}
        {mode === "history" && (
          <TacticalHistory
            languageCode={dashLanguage}
            onReopen={(report) => {
              // 1. Set the disaster context
              setDashDisasterId(report.disasterId);
              // 2. Set coordinates & name
              setDashLat(report.lat);
              setDashLng(report.lng);
              setDashLocationName(report.locationName);
              // 3. Set the simulated or loaded activePlan as triagePlan
              setTriagePlan(report.aiResponse);
              // 4. Log the action
              setDashLogs(prev => [
                `[${new Date().toLocaleTimeString()}] 🔄 ARCHIVE LOAD: Reopened previous Granite AI advice report for [${report.disasterName.toUpperCase()}] at [${report.locationName}].`,
                ...prev
              ]);
              // 5. Navigate back to the dashboard HUD!
              setMode("dashboard");
            }}
          />
        )}

      </div>

      {/* Global SaaS Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs text-slate-400">
          
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center font-black text-white text-xs">R</div>
              <span className="font-bold text-white tracking-wide">RESP-AI</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Tactical disaster coordination blueprints. Harnessing spatial GIS calculations and IBM Granite models to aid rescue teams.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <span className="font-semibold text-white">Operational Stack</span>
            <ul className="space-y-1 text-slate-500">
              <li>Next.js 15 AppRouter</li>
              <li>FastAPI Async Server</li>
              <li>Supabase Database + PostGIS</li>
              <li>IBM watsonx.ai SDK</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <span className="font-semibold text-white">Spatial Integrations</span>
            <ul className="space-y-1 text-slate-500">
              <li>OpenStreetMap Layers</li>
              <li>Leaflet Interactive Markers</li>
              <li>OSRM Geometry Routing</li>
              <li>PostGIS Geography Points</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <span className="font-semibold text-white">Contact & Support</span>
            <ul className="space-y-1 text-slate-500">
              <li>Crisis Dispatch Centers</li>
              <li>IBM Granite LLM Support</li>
              <li>System Status Check</li>
              <li>Coordinator Security Register</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500 gap-4">
          <span>&copy; {new Date().getFullYear()} RESP-AI Systems. All tactical blueprints licensed under Apache-2.0.</span>
          <div className="flex gap-4">
            <button onClick={() => setMode("console")} className="hover:text-red-400 transition">Blueprint Console</button>
            <span>&bull;</span>
            <button onClick={() => setMode("landing")} className="hover:text-red-400 transition">Landing Hub</button>
          </div>
        </div>
      </footer>

      <AIChatbot 
        disasterId={dashDisasterId}
        disasterName={dashDisasterId.charAt(0).toUpperCase() + dashDisasterId.slice(1)}
        locationName={dashLocationName}
        lat={dashLat}
        lng={dashLng}
        facilities={facilities}
        gridStatus={dashGridStatus}
        severity={dashSeverity}
        languageCode={dashLanguage}
      />

    </div>
  );
}
