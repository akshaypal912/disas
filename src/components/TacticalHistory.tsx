import React, { useState, useEffect } from "react";
import { History, Trash2, ExternalLink, Calendar, MapPin, Sparkles, Volume2, ShieldAlert, Layers, Search, RefreshCw, CheckCircle2 } from "lucide-react";

export interface HistoryReport {
  id: string;
  disasterId: string;
  disasterName: string;
  locationName: string;
  lat: string;
  lng: string;
  date: string;
  aiResponse: string;
}

interface TacticalHistoryProps {
  onReopen: (report: HistoryReport) => void;
  languageCode: string;
}

const SEED_REPORTS: HistoryReport[] = [
  {
    id: "seed_1",
    disasterId: "floods",
    disasterName: "Floods",
    locationName: "Emergency Sector 4-B",
    lat: "34.0522",
    lng: "-118.2437",
    date: "2026-07-14, 10:45:00 AM",
    aiResponse: "CRISIS DISPATCH PLAN: Establish sandbag buffer vectors at coordinates. Establish dynamic escape vectors along secondary roadways. Target Shelter Alpha."
  },
  {
    id: "seed_2",
    disasterId: "earthquakes",
    disasterName: "Earthquakes",
    locationName: "Kanto Fault Line Zone",
    lat: "35.6762",
    lng: "139.6503",
    date: "2026-07-12, 04:12:15 PM",
    aiResponse: "CRISIS DISPATCH PLAN: High structure collapse potential. K9 scouts dispatch coordinates: Sector fault intersection. Mobilize heavy rescue excavators."
  }
];

export default function TacticalHistory({ onReopen, languageCode }: TacticalHistoryProps) {
  const [reports, setReports] = useState<HistoryReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDisaster, setFilterDisaster] = useState("all");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const synthRef = React.useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );

  // Load reports from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("resp_ai_report_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReports(parsed);
      } catch (e) {
        console.error("Failed to parse saved report history", e);
        setReports(SEED_REPORTS);
        localStorage.setItem("resp_ai_report_history", JSON.stringify(SEED_REPORTS));
      }
    } else {
      setReports(SEED_REPORTS);
      localStorage.setItem("resp_ai_report_history", JSON.stringify(SEED_REPORTS));
    }
  }, []);

  const saveReports = (updated: HistoryReport[]) => {
    setReports(updated);
    localStorage.setItem("resp_ai_report_history", JSON.stringify(updated));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reports.filter(r => r.id !== id);
    saveReports(updated);
    showNotification("Report deleted successfully.");
    if (speakingId === id && synthRef.current) {
      synthRef.current.cancel();
      setSpeakingId(null);
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to permanently wipe all tactical report logs?")) {
      saveReports([]);
      showNotification("Report history wiped clean.");
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setSpeakingId(null);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  const handleSpeak = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!synthRef.current) return;

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    synthRef.current.cancel();
    setSpeakingId(id);

    const cleanText = text.replace(/[*#`_\-]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    let bcp47 = "en-US";
    if (languageCode === "ES") bcp47 = "es-ES";
    else if (languageCode === "FR") bcp47 = "fr-FR";
    else if (languageCode === "JA") bcp47 = "ja-JP";
    else if (languageCode === "HI") bcp47 = "hi-IN";

    utterance.lang = bcp47;

    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang.toLowerCase().startsWith(bcp47.split("-")[0].toLowerCase()));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    synthRef.current.speak(utterance);
  };

  const getDisasterEmoji = (disasterId: string) => {
    switch (disasterId) {
      case "floods": return "🌊";
      case "earthquakes": return "🌋";
      case "cyclones": return "🌀";
      case "fires": return "🔥";
      case "landslides": return "⛰️";
      case "heatwaves": return "☀️";
      default: return "🚨";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.disasterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.aiResponse.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterDisaster === "all" || report.disasterId === filterDisaster;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 w-full text-left relative z-10" id="tactical-history-page">
      
      {/* Title Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <History className="h-3.5 w-3.5" />
            <span>REPORT LOG ARCHIVE SECURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tactical Advice <span className="text-red-400">History Log</span>
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Review previous tactical deployment plans synthesized by the IBM Granite 13B model. Reload any incident context directly back onto the active GIS mapping HUD.
          </p>
        </div>

        {reports.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-xs font-bold text-red-400 border border-red-500/25 rounded-xl transition flex items-center gap-2 self-start md:self-center"
          >
            <Trash2 className="h-4 w-4" />
            Wipe Entire Log Archive
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex gap-2 items-center">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900/10 border border-slate-900 rounded-xl p-4">
        {/* Search Input */}
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs by location, disaster, or advice keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-red-500 transition"
          />
        </div>

        {/* Disaster Select Filter */}
        <div className="md:col-span-4 flex gap-2">
          <select
            value={filterDisaster}
            onChange={(e) => setFilterDisaster(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-red-500 transition"
          >
            <option value="all">All Disaster Types</option>
            <option value="floods">🌊 Floods</option>
            <option value="earthquakes">🌋 Earthquakes</option>
            <option value="cyclones">🌀 Cyclones</option>
            <option value="fires">🔥 Fires</option>
            <option value="landslides">⛰️ Landslides</option>
            <option value="heatwaves">☀️ Heatwaves</option>
          </select>
        </div>
      </div>

      {/* Main Reports List */}
      {filteredReports.length === 0 ? (
        <div className="border border-dashed border-slate-900 rounded-2xl p-12 text-center space-y-3 bg-slate-950/20">
          <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mx-auto">
            <History className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Matching Reports Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {reports.length === 0 
                ? "No previous tactical decisions have been logged yet. Head over to the Operations Dashboard and click 'Granite AI Routing Heuristics' to generate one."
                : "Try adjusting your search criteria or choosing 'All Disaster Types' to find your archived files."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onReopen(report)}
              className="group p-5 bg-slate-900/20 border border-slate-900/80 hover:border-red-500/30 rounded-2xl transition duration-200 text-left flex flex-col justify-between h-[280px] hover:shadow-lg hover:shadow-red-500/[0.02] cursor-pointer"
            >
              {/* Header Info */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={report.disasterName}>
                      {getDisasterEmoji(report.disasterId)}
                    </span>
                    <div>
                      <span className="block font-extrabold text-xs text-white uppercase tracking-wider">
                        {report.disasterName} Advisory
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {report.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleSpeak(report.id, report.aiResponse, e)}
                      className={`p-1.5 bg-slate-950 border border-slate-900 rounded-md hover:border-slate-800 transition ${speakingId === report.id ? "text-emerald-400" : "text-slate-400"}`}
                      title="Read aloud"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(report.id, e)}
                      className="p-1.5 bg-slate-950 border border-slate-900 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-md transition"
                      title="Delete report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Location Info */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-900 text-[11px] font-mono text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="truncate flex-1 font-bold">{report.locationName}</span>
                  <span className="text-slate-600 text-[9px]">({report.lat}, {report.lng})</span>
                </div>

                {/* Advice Output */}
                <p className="text-xs font-mono text-slate-400 leading-relaxed line-clamp-3 select-all">
                  {report.aiResponse}
                </p>
              </div>

              {/* Action Button Footer */}
              <div className="border-t border-slate-900/60 pt-3 flex justify-between items-center mt-3">
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  IBM Granite 13B
                </span>
                <span className="text-[10px] font-bold text-red-400 group-hover:text-red-300 flex items-center gap-1.5">
                  <span>Reopen on HUD</span>
                  <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
