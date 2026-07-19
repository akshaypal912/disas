import React, { useState } from "react";
import { AlertTriangle, Wifi, WifiOff, CheckCircle, RefreshCw } from "lucide-react";

export interface EmergencyChecklistProps {
  disasterId: string;
  disasterName: string;
  languageCode: string;
  pendingCount?: number;
  syncStatus?: "idle" | "saved_offline" | "syncing" | "synced_success";
  onTriggerSOS?: (message?: string) => void;
  lat?: string;
  lng?: string;
  severity?: "EXTREME" | "SEVERE" | "MODERATE" | "CLEAR" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export function EmergencyChecklist({
  disasterId,
  disasterName,
  languageCode,
  pendingCount = 0,
  syncStatus = "idle",
  onTriggerSOS,
  lat = "34.0522",
  lng = "-118.2437",
  severity = "CRITICAL"
}: EmergencyChecklistProps) {
  const [active, setActive] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const handleActivateSOS = () => {
    setActive(true);
    if (onTriggerSOS) {
      const msg = customMessage.trim() || `TACTICAL EMERGENCY SOS: Active ${disasterName.toUpperCase()} hazard reported at sector coordinates (${lat}, ${lng}). Immediate rescue dispatch requested.`;
      onTriggerSOS(msg);
      setCustomMessage("");
    }
    // FIX LOW #29: Reset active state after 8 seconds so operators can re-send SOS
    setTimeout(() => setActive(false), 8000);
  };

  return (
    <div className="bg-red-950/10 border border-red-900/30 p-5 rounded-2xl text-xs space-y-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 h-24 w-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-red-950/40 pb-2.5">
        <h3 className="font-mono text-red-500 font-black tracking-wider uppercase flex items-center gap-2 text-xs">
          <AlertTriangle className="h-4 w-4 animate-pulse text-red-500" />
          <span>Tactical SOS Command</span>
        </h3>
        <span className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">
          SATELLITE BEACON
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Active Threat:</span>
          <span className="text-red-400 font-bold uppercase">{disasterName} ({disasterId.toUpperCase()})</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Target Sector coordinates:</span>
          <span className="text-white font-semibold">({parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)})</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Uplink Status:</span>
          <span className="flex items-center gap-1 font-bold">
            {typeof navigator !== "undefined" && navigator.onLine ? (
              <>
                <Wifi className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 uppercase">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-400 animate-pulse" />
                <span className="text-red-400 uppercase">OFFLINE</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Custom distress memo */}
      <div className="space-y-1">
        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Custom Distress Memo (Optional)</label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="e.g. 3 residents trapped in heavy stream, medical support needed."
          className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-[11px] text-slate-200 outline-none focus:border-red-500/40 transition font-mono min-h-[50px] resize-none"
        />
      </div>

      <button 
        onClick={handleActivateSOS} 
        className={`w-full py-3 font-mono text-xs font-bold rounded-xl transition-all duration-300 shadow-md ${
          active 
            ? "bg-orange-600 hover:bg-orange-500 text-white animate-pulse shadow-orange-600/20" 
            : "bg-red-600 hover:bg-red-500 text-white hover:scale-[1.02] shadow-red-600/20 active:scale-95"
        }`}
      >
        {active ? "SOS ACTIVE - TRANSMITTING LOCATION" : "TRANSMIT EMERGENCY SOS"}
      </button>

      {/* Sync Status Displays */}
      {(pendingCount > 0 || syncStatus !== "idle") && (
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 space-y-2 mt-2 transition-all duration-300">
          <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-900 pb-1.5">
            <span className="text-slate-500 uppercase">QUEUE STATISTICS</span>
            <span className="text-slate-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">
              {pendingCount} Pending Offline
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Show SOS Saved Offline */}
            {syncStatus === "saved_offline" && (
              <div className="flex items-center gap-2 text-[11px] text-amber-400 font-mono">
                <WifiOff className="h-3.5 w-3.5 animate-pulse text-amber-500" />
                <span>SOS Saved Offline</span>
              </div>
            )}

            {/* Show Syncing Pending SOS */}
            {syncStatus === "syncing" && (
              <div className="flex items-center gap-2 text-[11px] text-blue-400 font-mono">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400" />
                <span>Syncing Pending SOS...</span>
              </div>
            )}

            {/* Show Pending SOS Synced Successfully */}
            {syncStatus === "synced_success" && (
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono font-bold">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
                <span>Pending SOS Synced Successfully</span>
              </div>
            )}

            <p className="text-[9px] text-slate-500 leading-relaxed font-sans">
              All SOS signals are given a unique cryptographic timestamp, preventing duplicates and keeping sequence integrity intact.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencyChecklist;
