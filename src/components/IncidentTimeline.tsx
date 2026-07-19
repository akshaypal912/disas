import React, { useEffect, useState, useCallback } from "react";
import { 
  MapPin, 
  AlertTriangle, 
  Brain, 
  Radio, 
  UserCheck, 
  Truck, 
  CheckCircle2, 
  Activity, 
  RefreshCw,
  Plus,
  Clock
} from "lucide-react";
import { Socket } from "socket.io-client";

export interface TimelineEvent {
  id: number;
  disasterId: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface IncidentTimelineProps {
  disasterId: string;
  disasterName: string;
  idToken: string | null;
  socketConnected: boolean;
  socketRef: React.MutableRefObject<Socket | null>;
  lat: string;
  lng: string;
  severity: "EXTREME" | "SEVERE" | "MODERATE" | "CLEAR" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  onAddLog?: (msg: string) => void;
}

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  location_detected: MapPin,
  disaster_selected: AlertTriangle,
  ai_guidance_generated: Brain,
  sos_sent: Radio,
  dispatcher_assigned: UserCheck,
  emergency_team_responding: Truck,
  resolved: CheckCircle2,
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  location_detected: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/35" },
  disaster_selected: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/35" },
  ai_guidance_generated: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/35" },
  sos_sent: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/35" },
  dispatcher_assigned: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/35" },
  emergency_team_responding: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/35" },
  resolved: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/35" },
};

export function IncidentTimeline({
  disasterId,
  disasterName,
  idToken,
  socketConnected,
  socketRef,
  lat,
  lng,
  severity,
  onAddLog
}: IncidentTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customStatus, setCustomStatus] = useState("location_detected");
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch timeline events for active disaster
  const fetchTimeline = useCallback(async () => {
    if (!idToken || !disasterId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/timeline/${disasterId}`, {
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvents(data.events || []);
        }
      }
    } catch (error) {
      console.error("[Timeline] Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [idToken, disasterId]);

  // Helper to trigger / write a new timeline event
  const addTimelineEvent = useCallback(async (
    title: string,
    description: string,
    status: string
  ) => {
    if (!idToken || !disasterId) return;
    try {
      const response = await fetch("/api/timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          disasterId,
          title,
          description,
          status
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Socket.IO event is emitted by server, which will broadcast to all clients including us
          // But just in case, we can refresh or wait for socket event
          fetchTimeline();
          if (onAddLog) {
            onAddLog(`[${new Date().toLocaleTimeString()}] 📜 TIMELINE UPDATED: Event "${title}" added to active incident timeline.`);
          }
        }
      }
    } catch (error) {
      console.error("[Timeline] Error posting timeline event:", error);
    }
  }, [idToken, disasterId, fetchTimeline, onAddLog]);

  // FIX HIGH #11: Use a ref flag to prevent duplicate seeding caused by the race between
  // fetchTimeline (async, sets loading=true) and this effect checking !loading.
  const seedingRef = React.useRef(false);

  useEffect(() => {
    if (idToken && disasterId && events.length === 0 && !loading && !seedingRef.current) {
      seedingRef.current = true;
      const seedInitialEvents = async () => {
        setLoading(true);
        await addTimelineEvent(
          "Location Detected",
          `GPS/Sector coordinates locked at (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`,
          "location_detected"
        );
        await addTimelineEvent(
          "Disaster Selected",
          `Active emergency alert set to ${disasterName.toUpperCase()} threat profile.`,
          "disaster_selected"
        );
        setLoading(false);
      };
      seedInitialEvents();
    }
  }, [idToken, disasterId, events.length, lat, lng, disasterName]);

  // Fetch on mount or token/disaster change
  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Socket.IO real-time binding
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleTimelineEventAdded = (data: { disasterId: string; event: TimelineEvent }) => {
      if (data.disasterId === disasterId) {
        setEvents((prev) => {
          // Prevent duplicates
          if (prev.some((item) => item.id === data.event.id)) {
            return prev;
          }
          return [data.event, ...prev];
        });
      }
    };

    socket.on("timeline_event_added", handleTimelineEventAdded);

    return () => {
      socket.off("timeline_event_added", handleTimelineEventAdded);
    };
  }, [socketRef, disasterId]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDesc.trim()) return;
    addTimelineEvent(customTitle.trim(), customDesc.trim(), customStatus);
    setCustomTitle("");
    setCustomDesc("");
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 h-20 w-20 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="space-y-0.5">
          <h3 className="font-mono text-slate-200 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-blue-400 animate-pulse" />
            <span>Incident Lifecycle Timeline</span>
          </h3>
          <p className="text-[9px] text-slate-500 font-sans">
            Tracking sequence and telemetry transitions for {disasterName.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchTimeline}
            disabled={loading}
            className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-50"
            title="Refresh Timeline"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 bg-blue-600 border border-blue-500/30 rounded-lg text-white hover:bg-blue-500 transition flex items-center gap-1 text-[10px] font-mono font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>ADD EVENT</span>
          </button>
        </div>
      </div>

      {/* Manual Timeline Event Entry */}
      {showAddForm && (
        <form onSubmit={handleCustomSubmit} className="bg-slate-950 border border-slate-900 rounded-xl p-3 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] font-mono text-slate-500 uppercase">Event Title</label>
              <input
                type="text"
                placeholder="e.g., Rescue Zone Established"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-blue-500/40 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono text-slate-500 uppercase">Phase Type</label>
              <select
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-blue-500/40 font-mono"
              >
                <option value="location_detected">Location Detected</option>
                <option value="disaster_selected">Disaster Selected</option>
                <option value="ai_guidance_generated">AI Guidance</option>
                <option value="sos_sent">SOS Transmitted</option>
                <option value="dispatcher_assigned">Dispatcher Action</option>
                <option value="emergency_team_responding">Responder Deploy</option>
                <option value="resolved">Threat Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-mono text-slate-500 uppercase">Detailed Description</label>
            <textarea
              placeholder="e.g., Medical relief point setup completed at safety coordinate sector A."
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-[11px] text-white outline-none focus:border-blue-500/40 font-mono h-12 resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-1.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 bg-blue-600 rounded text-white hover:bg-blue-500"
            >
              Save Event
            </button>
          </div>
        </form>
      )}

      {/* Vertical Timeline Body */}
      {events.length === 0 ? (
        <div className="py-8 text-center text-slate-500 font-mono text-[10px]">
          {idToken ? "Establishing secure connection & compiling timeline..." : "Authenticate via the login page to initialize incident tracking."}
        </div>
      ) : (
        <div className="relative pl-4 space-y-4 border-l border-slate-900/80 ml-2">
          {events.map((event, index) => {
            const IconComponent = STATUS_ICONS[event.status] || Activity;
            const colors = STATUS_COLORS[event.status] || { bg: "bg-slate-900", text: "text-slate-400", border: "border-slate-800" };
            const timeFormatted = new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div key={event.id} className="relative group transition-all duration-300">
                {/* Visual node on timeline */}
                <div className={`absolute -left-[25px] top-1 h-4 w-4 rounded-full border ${colors.border} ${colors.bg} flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition duration-300`}>
                  <IconComponent className={`h-2.5 w-2.5 ${colors.text}`} />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className={`text-[11px] font-mono font-bold tracking-wide ${colors.text}`}>
                      {event.title}
                    </span>
                    
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-950/80 border border-slate-900/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-slate-600" />
                      <span>{timeFormatted}</span>
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans max-w-full">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default IncidentTimeline;
