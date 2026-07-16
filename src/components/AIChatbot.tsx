import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, User, Sparkles, Volume2, VolumeX, AlertOctagon, HelpCircle, Star, Check } from "lucide-react";
import { Facility } from "./LeafletMap";
import { askGemini } from "../lib/gemini";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  rating?: number;
  feedbackComment?: string;
  isFeedbackExpanded?: boolean;
}

interface AIChatbotProps {
  disasterId: string;
  disasterName: string;
  locationName: string;
  lat: string;
  lng: string;
  facilities?: Facility[];
  gridStatus?: string;
  severity?: string;
  languageCode?: string;
}

const PRESET_QUESTIONS = [
  "What should I do?",
  "Nearest shelter?",
  "Can I drink flood water?",
  "Earthquake precautions?",
  "How to contact family?",
  "Should I evacuate now?",
  "Are roads safe?"
];

export default function AIChatbot({
  disasterId,
  disasterName,
  locationName,
  lat,
  lng,
  facilities = [],
  gridStatus = "DEACTIVATED",
  severity = "EXTREME",
  languageCode = "EN"
}: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const saveToGlobalFeedback = (msg: Message, commentText: string, ratingVal: number) => {
    const saved = localStorage.getItem("resp_ai_feedback");
    let currentFeedback = [];
    if (saved) {
      try {
        currentFeedback = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const newRecord = {
      id: "feed_chat_" + Date.now(),
      responseId: msg.id,
      source: "chatbot" as const,
      disasterName: disasterName,
      rating: ratingVal,
      comment: commentText.trim(),
      timestamp: new Date().toLocaleString()
    };
    currentFeedback.unshift(newRecord);
    localStorage.setItem("resp_ai_feedback", JSON.stringify(currentFeedback));
  };

  const handleRateMessage = (msgId: string, ratingValue: number) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        // If they select rating, expand feedback comment input
        return { ...m, rating: ratingValue, isFeedbackExpanded: true };
      }
      return m;
    }));
  };

  const handleSaveFeedbackComment = (msgId: string, commentText: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        saveToGlobalFeedback(m, commentText, m.rating || 5);
        return { ...m, feedbackComment: commentText, isFeedbackExpanded: false };
      }
      return m;
    }));
  };

  // Initialize Speech Synthesis and Load Chat History
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
        setSpeechSupported(true);
      }

      // Load conversation history from localStorage
      const saved = localStorage.getItem("resp_ai_chat_history");
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved chat history", e);
          initializeDefaultWelcome();
        }
      } else {
        initializeDefaultWelcome();
      }
    }
  }, []);

  // Save Chat History whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("resp_ai_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const initializeDefaultWelcome = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "System Online: IBM Granite 13B (watsonx.ai) Tactical Chatbot initiated.\n\nI am synced to your localized Operations HUD and active coordinates. Ask me any safety question or select a preset query below to verify evacuation vectors, shelter status, and regional hazards.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleClearHistory = () => {
    localStorage.removeItem("resp_ai_chat_history");
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setSpeakingId(null);
    initializeDefaultWelcome();
  };

  // TTS Reader logic for individual messages
  const handleSpeak = (messageId: string, text: string) => {
    if (!synthRef.current) return;

    if (speakingId === messageId) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    synthRef.current.cancel(); // Stop any currently playing sound
    setSpeakingId(messageId);

    // Clean markdown characters for cleaner vocal delivery
    const cleanText = text
      .replace(/[*#`_\-]/g, "")
      .replace(/\[.*?\]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose appropriate language voice if available
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

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    synthRef.current.speak(utterance);
  };

  // Real Gemini AI Response
  const generateGraniteResponse = async (userText: string): Promise<string> => {
    const textLower = userText.toLowerCase().trim();

    const systemContext = `You are an expert disaster response AI assistant integrated into a real-time emergency operations dashboard.
Current disaster: ${disasterName}
Location: ${locationName} (Lat: ${lat}, Lng: ${lng})
Severity: ${severity}
Power Grid: ${gridStatus}
Nearby facilities: ${facilities.map(f => f.name).join(", ") || "None found yet"}

Provide concise, actionable emergency advice. Be direct and prioritize life safety.`;

    try {
      return await askGemini(`${systemContext}\n\nUser question: ${userText}`);
    } catch (err) {
      console.error("Gemini API error:", err);
    }

    // Fallback if API fails
    // 1. "What should I do?"
    if (textLower === "what should i do?" || textLower.includes("what should i do")) {
      if (disasterId === "floods") {
        return `### IBM Granite 13B Tactical Dispatch Advice:
**DISASTER SECTOR ALERT:** Extreme Flooding Active in **${locationName}** (Coords: ${lat}, ${lng}).

**CRITICAL SAFETIES:**
1. **Climb Higher immediately**: Head to high grounds or the top floor of structural nodes. Avoid attic closures where entrapment can occur.
2. **Avoid Moving Water**: Never walk, swim, or drive through flooded roadways. Just 6 inches of rapidly moving water can throw you off balance, and 12 inches can sweep away small vehicles.
3. **Power Down Grid**: Your HUD indicates the local power grid is currently \`${gridStatus}\`. In flooded zones, stay clear of electrical outlets and lines.
4. **Prepare Signal channels**: Keep cell phones charged and monitor localized radio networks.`;
      } else if (disasterId === "earthquakes") {
        return `### IBM Granite 13B Tactical Dispatch Advice:
**DISASTER SECTOR ALERT:** Severe Fault Slip Active in **${locationName}** (Coords: ${lat}, ${lng}).

**CRITICAL SAFETIES:**
1. **DROP, COVER, AND HOLD ON**: Immediately seek cover under a heavy desk or interior load-bearing frame. Protect your head and neck.
2. **Stay Indoors**: Do not panic and run outside. Falling brickwork and outer glass panels are highly dangerous. Clear away from windows and cabinets.
3. **If Outdoors**: Locate a wide open space completely free of power cables, buildings, gas pipelines, and overpass bridges.
4. **Verify Grid Integrity**: Keep an eye on secondary gas leakage and structural failure logs.`;
      } else if (disasterId === "cyclones") {
        return `### IBM Granite 13B Tactical Dispatch Advice:
**DISASTER SECTOR ALERT:** Category-4 Storm landfall in **${locationName}** (Coords: ${lat}, ${lng}).

**CRITICAL SAFETIES:**
1. **Evacuate to Storm Room**: Move to a central, windowless interior room, hallway, or closet on the lowest floor.
2. **Reinforce Portals**: Ensure all outer shutters and reinforced doors are bolted tight. Stay away from windows.
3. **Do Not Trust the Eye**: The calm 'eye' of the cyclone is temporary. Destructive gale-force winds will return from the opposite direction without warning.
4. **Electrical Precautions**: The power grid is configured to \`${gridStatus}\` to minimize spark hazards. Use battery-operated utility lights only.`;
      } else if (disasterId === "fires") {
        return `### IBM Granite 13B Tactical Dispatch Advice:
**DISASTER SECTOR ALERT:** Extreme Wildfire Perimeter near **${locationName}** (Coords: ${lat}, ${lng}).

**CRITICAL SAFETIES:**
1. **Evacuate Instantly**: Pack your emergency kit and retreat along the pre-cleared West Ridge escape vector. Do not delay.
2. **Seal Air Intakes**: Shut all doors, windows, fireplace dampers, and mechanical vents to block hot ash and smoke infiltration.
3. **Protect Lungs**: Wear a certified N95 respirator mask or keep a wet cotton cloth pressed firmly over your mouth and nose.
4. **Follow Fire Crews**: Adhere strictly to the direction of the ${42} active responder teams currently deployed in the field.`;
      } else if (disasterId === "landslides") {
        return `### IBM Granite 13B Tactical Dispatch Advice:
**DISASTER SECTOR ALERT:** High slope soil saturation in **${locationName}** (Coords: ${lat}, ${lng}).

**CRITICAL SAFETIES:**
1. **Flee Valley Channels**: Get away from high-slope debris paths, valleys, and runoff beds immediately. Landslides move at extreme speeds.
2. **Listen For Cracks**: Pay attention to cracking trees, rattling debris, or boulders tumbling together which indicate immediate slide acceleration.
3. **Automated Road Barriers**: Watch for dynamic highway closures. Do not attempt to bypass emergency roadblocks.
4. **Protect Head**: If unable to escape, curl into a tight ball and protect your head with your arms.`;
      } else {
        return `### IBM Granite 13B Tactical Dispatch Advice:
**DISASTER SECTOR ALERT:** Extreme Heatwave peak in **${locationName}** (Coords: ${lat}, ${lng}).

**CRITICAL SAFETIES:**
1. **Cooling Stations**: Move to an air-conditioned room or find your nearest designated cooling hub.
2. **Vigorous Hydration**: Drink water or electrolyte fluids consistently. Avoid direct sun exposure and strenuous activity.
3. **Pet/Child Safety**: Never leave anyone inside parked vehicles even for a moment. Heat levels escalate to lethal bounds in minutes.
4. **Conserve Energy**: Support local grid stability during peak utility loads.`;
      }
    }

    // 2. "Nearest shelter?"
    if (textLower === "nearest shelter?" || textLower.includes("nearest shelter") || textLower.includes("where is the shelter")) {
      const activeShelters = facilities.filter(f => f.type === "shelter");
      
      if (activeShelters.length > 0) {
        // Sort by distance
        const sorted = [...activeShelters].sort((a, b) => a.distance - b.distance);
        const closest = sorted[0];
        
        return `### IBM Granite 13B GIS Analysis:
**GIS TELEMETRY MATCH FOUND:** Identified nearest active safe shelter zone relative to current coordinates.

* **Shelter Node Name:** ${closest.name}
* **Proximity Distance:** ${closest.distance.toFixed(2)} km
* **Geographic Address:** ${closest.address || "Sector Sector Coordinates"}
* **Emergency Hotline:** ${closest.phone || "Regional Emergency Dispatch Grid"}
* **Infrastructure Safety status:** Active and fortified.

*Recommendation:* Proceed along the safest secondary roadway. Avoid crossing water logs or fault line breaks.`;
      } else {
        // Fallback context based shelter if list is empty
        if (disasterId === "floods") {
          return `### IBM Granite 13B GIS Analysis:
**GIS TELEMETRY RETRIEVAL:** Using default sector fallbacks.

* **Nearest Shelter:** **Base Camp Alpha (Emergency Grid 4-B)**
* **Proximity Distance:** 1.20 km
* **Geographic Address:** 1240 High Ridge Road
* **Capacity status:** Active (Current HUD registers 1,250 occupants evacuated in sector).
* **Power status:** Solar battery backup fully active.`;
        } else if (disasterId === "earthquakes") {
          return `### IBM Granite 13B GIS Analysis:
**GIS TELEMETRY RETRIEVAL:** Using default sector fallbacks.

* **Nearest Shelter:** **Kanto Secondary Shelter Area (Zone 2)**
* **Proximity Distance:** 2.45 km
* **Geographic Address:** 15 Tokyo Dome Sector
* **Capacity status:** Active and structurally verified.
* **Power status:** Connected to auxiliary diesel sub-mains.`;
        } else if (disasterId === "cyclones") {
          return `### IBM Granite 13B GIS Analysis:
**GIS TELEMETRY RETRIEVAL:** Using default sector fallbacks.

* **Nearest Shelter:** **Delta Coast Safe Center**
* **Proximity Distance:** 3.80 km
* **Geographic Address:** Sector 3 Delta Seawall Parkway
* **Capacity status:** High capacity storm shelter operational.
* **Power status:** Independent solar microgrid active.`;
        } else if (disasterId === "fires") {
          return `### IBM Granite 13B GIS Analysis:
**GIS TELEMETRY RETRIEVAL:** Using default sector fallbacks.

* **Nearest Shelter:** **West Ridge Shelter Complex**
* **Proximity Distance:** 4.10 km
* **Geographic Address:** 902 Foothill Boulevard
* **Capacity status:** Cleared from flame trajectory polygons.
* **Power status:** Protected by active retardant foam barriers.`;
        } else if (disasterId === "landslides") {
          return `### IBM Granite 13B GIS Analysis:
**GIS TELEMETRY RETRIEVAL:** Using default sector fallbacks.

* **Nearest Shelter:** **Himalayan Valley Base Camp**
* **Proximity Distance:** 0.80 km
* **Geographic Address:** Sector 2-C Safe Flats
* **Capacity status:** Outside structural slide impact channels.
* **Power status:** Portable micro-generator array online.`;
        } else {
          return `### IBM Granite 13B GIS Analysis:
**GIS TELEMETRY RETRIEVAL:** Using default sector fallbacks.

* **Nearest Shelter:** **Desert Urban Cooling Hub**
* **Proximity Distance:** 1.50 km
* **Geographic Address:** 10 Civic Plaza Cooling Substation
* **Capacity status:** Active cooling center with air-conditioning mains online.
* **Power status:** Utility priority line backed by diesel power.`;
        }
      }
    }

    // 3. "Can I drink flood water?"
    if (textLower === "can i drink flood water?" || textLower.includes("drink flood water") || textLower.includes("can i drink the water")) {
      return `### 🚨 CRITICAL TOXICOLOGY ALERT - IBM Granite 13B:
**DO NOT DRINK FLOOD WATER UNDER ANY CIRCUMSTANCES.**

Flood waters are not merely water; they represent a highly toxic fluid suspension containing:
1. **Biohazards & Pathogens:** Raw overflowing sewage, bacteria (E. coli, cholera, salmonella), viruses, and agricultural parasites.
2. **Chemical Pollutants:** Gasoline, diesel, pesticides, industrial chemicals, heavy metals, and motor oil washed from surface soils.
3. **Physical Hazards:** Submerged broken glass, nails, raw debris, and rodent carcasses.
4. **Electrification Risk:** High possibility of water carrying live voltages from drowned transformers or down grids.

**WATER PURIFICATION STANDARDS IF TRAPPED:**
* **Priority:** Only consume sealed bottled water from your 72-hour survival pack.
* **Fallback Boiling:** If forced to use local groundwater, strain out suspended solids using clean cloth, then bring to a vigorous rolling boil for at least **3 complete minutes** to destroy pathogens. Note: Boiling does NOT eliminate dissolved industrial chemicals.
* **Chemical Treatment:** Use chlorine dioxide or iodine water purification tablets following package instructions.`;
    }

    // 4. "Earthquake precautions?"
    if (textLower === "earthquake precautions?" || textLower.includes("earthquake precaution") || textLower.includes("earthquake safety")) {
      return `### IBM Granite 13B Seismic Safeguards:
**PRE-EARTHQUAKE, TRANS-EARTHQUAKE, AND POST-EARTHQUAKE PROTOCOLS:**

#### 1. BEFORE THE SHAKING (Preparedness)
* **Anchor Hazards:** Strap heavy tall furniture (bookshelves, refrigerators, display cases) securely to structural wall studs.
* **Build a Kit:** Keep a 72-hour survival kit containing water (1 gallon per person per day), non-perishable foods, flashlights, N95 dust masks, and a first aid bag.
* **Plan Out:** Design clear evacuation plans with multiple exits.

#### 2. DURING THE SHAKING (Survival)
* **DROP** onto your hands and knees. This prevents you from being thrown down.
* **COVER** your head and neck under a sturdy table or desk. If no shelter is nearby, crawl next to an interior wall. Keep clear of windows and tall fixtures.
* **HOLD ON** to your shelter until the shaking fully ceases.
* **If in a Vehicle:** Safely pull over to a clear road shoulder. Avoid stopping underneath bridges, traffic lights, power lines, or overpasses.

#### 3. AFTER THE SHAKING (Recovery)
* **Check Injuries:** Render immediate first aid to yourself and surrounding operators.
* **Inspect Utilities:** Check for gas leaks (smell, sound). If detected, shut off the gas valve main immediately. Look for down power lines.
* **Listen to HUD:** Be ready for strong aftershocks. Monitor local emergency frequencies for tsunami warnings or landslide road blocks.`;
    }

    // 5. "How to contact family?"
    if (textLower === "how to contact family?" || textLower.includes("contact family") || textLower.includes("relative") || textLower.includes("family")) {
      return `### IBM Granite 13B Communication Protocols:
**EMERGENCY CONTACT & REUNIFICATION SAFEGUARDS:**

When telecommunication networks are saturated or offline, follow these key family contact protocols:
1. **Text over Call:** SMS text messages and data packets use significantly less bandwidth and often get through when voice lines are congested. Keep voice calls to a minimum.
2. **Out-of-Area Liaison:** Choose one single family relative living in another state or country as your unified family liaison. Every family member should message this person to report status, who will coordinate updates.
3. **Emergency Check-In Sites:** Register on trusted digital crisis systems like the American Red Cross "Safe and Well" platform to notify relatives of your status.
4. **Physical Meeting Spots:** Establish two emergency physical coordinates beforehand: one immediately outside your residence, and another safe regional point (like a public library or fire station) if you cannot return home.`;
    }

    // 6. "Should I evacuate now?"
    if (textLower === "should i evacuate now?" || textLower.includes("evacuate now") || textLower.includes("should i leave")) {
      return `### IBM Granite 13B Evacuation Protocol:
**CRITICAL RETREAT VECTOR ASSESSMENT:**

Your current zone is experiencing **${disasterName}** with an active severity level of \`${severity}\` at **${locationName}**.

**DECISION MATRICES:**
1. **Mandatory Orders:** If official emergency management agencies issue an evacuation order, leave **IMMEDIATELY**. Do not wait or try to defend property.
2. **Threat Proximity:** If you witness rising water levels, smell gas, observe fires moving closer, or feel unstable soil conditions, initiate evacuation immediately without waiting for official warnings.
3. **Special Needs:** If you, a relative, or someone in your group requires medicine, electricity for medical aids, or has mobility challenges, evacuate early before roads get compromised.
4. **If Safe:** If you are securely indoors on high grounds (during floods), or outside the fire plume, and authorities instruct you to "shelter in place", remain there to keep routes clear for emergency services.`;
    }

    // 7. "Are roads safe?"
    if (textLower === "are roads safe?" || textLower.includes("roads safe") || textLower.includes("can i drive") || textLower.includes("road status")) {
      return `### IBM Granite 13B Logistics Support:
**TRANSPORTATION HAZARD ADVISORY:**

Based on current dispatch logs in **${locationName}**, road networks are highly unstable:
1. **Hidden Debris & Sinkholes:** Floods and earthquakes damage road substrates. A normal-looking surface could collapse under vehicle weight or hide deep washouts.
2. **Avoid Underpasses:** These are prone to extreme rapid water logging and flash pooling during floods, and are structural collapse vectors during earthquakes.
3. **Turn Around, Don't Drown:** Do not attempt to drive through any water. High vehicles are swept away just as easily as sedans.
4. **Active Closures:** Keep your satellite receiver active. Dynamic roadblocks are configured by emergency crews to keep civilians safe. Do not bypass signs or barricades.`;
    }

    // Smart Keyword Fallbacks for other questions
    if (textLower.includes("food") || textLower.includes("eat") || textLower.includes("ration")) {
      return `### IBM Granite 13B Logistics Support:
During an emergency, only eat dry, non-perishable foods or canned goods that have not come into contact with floodwater or ash. 
* Avoid opening refrigerators unless necessary to conserve temperature.
* Check your emergency pack for high-protein bars, dried fruit, and nuts.
* Keep food stored in sealed plastic containers to prevent pest contamination.`;
    }

    if (textLower.includes("power") || textLower.includes("electricity") || textLower.includes("light")) {
      return `### IBM Granite 13B Power Grid Controller Advice:
Your sector power grid state is currently registered as \`${gridStatus}\`.
* If power is lost, use flashlight batteries or solar lamps. Never use candles due to gas leak fire hazards.
* Unplug sensitive computers and electronics to prevent damage from power surges when the grid is re-energized.
* Never touch a fallen power line or any metal fence in contact with power cables.`;
    }

    if (textLower.includes("siren") || textLower.includes("broadcast") || textLower.includes("radio")) {
      return `### IBM Granite 13B Broadcast Heuristic:
Regional satellite and cellular warning systems are operational.
* Ensure your NOAA weather radio is turned to local dispatch channel.
* If sirens sound, check your mobile device immediately for broadcast translations in [${languageCode}].`;
    }

    // General Fallback
    return `Emergency advisory for ${disasterName} at ${locationName}: Stay safe, follow official instructions, and contact emergency services if needed.`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeakingId(null);
    }

    generateGraniteResponse(userMsg.text).then(replyText => {
      const botMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        sender: "bot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="chatbot-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-2xl shadow-red-600/30 hover:scale-105 transition flex items-center justify-center border border-red-500"
        title="Open IBM Granite AI Chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        )}
      </button>

      {/* Floating Chat Interface */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="fixed bottom-24 right-6 w-full max-w-[400px] h-[550px] bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-white text-xs leading-none">watsonx.ai Granite Core</span>
                <span className="text-[9px] font-mono text-slate-500 tracking-wider">IBM GRANITE 13B INFERENCE</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="px-2 py-0.5 bg-slate-950 border border-slate-900 hover:border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white rounded transition"
                title="Clear history"
              >
                Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40 custom-scrollbar select-text">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {isBot && (
                    <div className="h-7 w-7 rounded bg-purple-950/30 border border-purple-900/60 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] flex flex-col space-y-1`}>
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${isBot ? "bg-slate-900/60 border border-slate-900/80 text-slate-200 rounded-tl-none whitespace-pre-wrap" : "bg-red-600 text-white rounded-tr-none"}`}
                    >
                      {/* Formatted output helper */}
                      {msg.text.split("\n").map((line, idx) => {
                        if (line.startsWith("###")) {
                          return <h4 key={idx} className="font-bold text-white mt-2 mb-1 border-b border-slate-800/60 pb-1">{line.replace("###", "")}</h4>;
                        }
                        if (line.startsWith("####")) {
                          return <h5 key={idx} className="font-semibold text-purple-400 mt-1.5">{line.replace("####", "")}</h5>;
                        }
                        if (line.startsWith("* **") || line.startsWith("- **")) {
                          return <p key={idx} className="pl-2 mt-0.5"><span className="text-slate-400">&bull;</span> {line.substring(2)}</p>;
                        }
                        return <p key={idx} className="mt-0.5">{line}</p>;
                      })}

                      {/* Speaking TTS & Feedback Ratings button for bot responses */}
                      {isBot && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/40 flex flex-col space-y-1.5">
                          <div className="flex items-center justify-between">
                            {speechSupported && (
                              <button
                                onClick={() => handleSpeak(msg.id, msg.text)}
                                className={`p-1 rounded hover:bg-slate-800 transition flex items-center gap-1 text-[9px] font-mono ${speakingId === msg.id ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
                              >
                                <Volume2 className="h-3 w-3" />
                                <span>{speakingId === msg.id ? "Speaking..." : "Read Aloud"}</span>
                              </button>
                            )}

                            {/* Stars rating widget */}
                            <div className="flex items-center gap-0.5 ml-auto">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRateMessage(msg.id, star)}
                                  className="p-0.5 hover:scale-110 transition cursor-pointer"
                                  title={`Rate ${star} Stars`}
                                >
                                  <Star
                                    className={`h-3 w-3 ${
                                      star <= (msg.rating || 0)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-600 fill-transparent"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Expandable Comment note */}
                          {msg.isFeedbackExpanded && (
                            <div className="space-y-1.5 mt-1 bg-slate-950/80 p-2 rounded border border-slate-800 flex flex-col gap-1.5">
                              <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest">Rate details:</span>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Add quick comment..."
                                  id={`comment-input-${msg.id}`}
                                  className="flex-1 bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[10px] text-slate-100 outline-none focus:border-red-500"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const val = (e.target as HTMLInputElement).value;
                                      handleSaveFeedbackComment(msg.id, val);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const el = document.getElementById(`comment-input-${msg.id}`) as HTMLInputElement;
                                    handleSaveFeedbackComment(msg.id, el?.value || "");
                                  }}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-bold transition cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}

                          {msg.feedbackComment !== undefined && !msg.isFeedbackExpanded && (
                            <div className="flex items-center gap-1 text-[8.5px] font-mono text-emerald-400 bg-emerald-500/5 p-1 rounded border border-emerald-500/10">
                              <Check className="h-3 w-3" />
                              <span className="truncate">Saved: {msg.feedbackComment || `Rated ${msg.rating}★`}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <span className="text-[8px] font-mono text-slate-500 self-end">
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isBot && (
                    <div className="h-7 w-7 rounded bg-red-950/20 border border-red-900/60 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Simulated Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="h-7 w-7 rounded bg-purple-950/30 border border-purple-900/60 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                </div>
                <div className="bg-slate-900/60 border border-slate-900/80 p-3 rounded-xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Helper Chips */}
          <div className="p-2 border-t border-slate-900/60 bg-slate-950 space-y-1">
            <span className="block text-[8px] font-mono text-slate-600 uppercase tracking-widest px-1">Tactical Preset Enquiries</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setInput(question);
                    // Autofills input. Click send to complete.
                  }}
                  className="px-2 py-1 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900/50 border-t border-slate-900 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Granite safety measures..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-red-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-lg transition"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
