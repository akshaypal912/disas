import React, { useState, useEffect } from "react";
import { ClipboardList, Plus, Trash2, CheckSquare, Square, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import TextToSpeechController from "./TextToSpeechController";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isCustom?: boolean;
}

interface EmergencyChecklistProps {
  disasterId: string;
  disasterName: string;
  languageCode: string;
}

const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  floods: [
    "Turn off electricity and main power valves to avoid water electrification",
    "Carry critical emergency medicines and prescription drugs",
    "Secure personal identification, deeds, and critical documents in waterproof zip-bags",
    "Stockpile fresh drinking water (minimum 3 liters per person daily)",
    "Pack heavy-duty LED flashlights with spare batteries",
    "Move valuable furniture, electronics, and food stocks to higher floors"
  ],
  earthquakes: [
    "Identify safe shelter spots (DROP, COVER, and HOLD ON positions under heavy desks)",
    "Stay clear of glass windows, mirrors, hanging fixtures, and tall cabinets",
    "Prepare protective headgear (sturdy helmets or thick cushions)",
    "Check and shut off main gas supply valves to prevent fires",
    "Keep a disaster signaling whistle close at hand",
    "Verify emergency go-bag and first aid inventory is complete"
  ],
  cyclones: [
    "Secure or relocate loose outdoor objects (patios, trash bins, signs)",
    "Shut down main power grids and gas supply lines in the station",
    "Fully charge mobile devices, radios, and emergency power banks",
    "Board up external glass windows or apply protective duct tape matrices",
    "Store safe drinking water and non-perishable food for at least 72 hours",
    "Designate a safe shelter point in the central, windowless interior room"
  ],
  fires: [
    "Evacuate immediately if flame front or toxic smoke ingress is detected",
    "Close internal doors and windows to restrict drafts and oxygen supply",
    "Equip wet face masks, damp cloths, or smoke filtration masks",
    "Touch doors with the back of your hand to check for latent heat before opening",
    "Clear highly flammable brush, dry leaves, and firewood within 30 feet of buildings",
    "Stay low to the ground to keep under rising toxic smoke columns"
  ],
  landslides: [
    "Scan slopes for ground cracks, buckled pavements, or tilting utility poles",
    "Prepare immediate evacuation route maps to safety channels",
    "Avoid staying in low-lying canyons, drainage paths, or steep valleys",
    "Retrieve emergency first-aid kit and critical medical records",
    "Listen carefully for heavy rumbling sounds indicating sudden debris flows",
    "Alert nearby neighbors and establish secure line communications"
  ],
  heatwaves: [
    "Drink abundant fluids and hydrate continuously (avoid wait-till-thirsty delay)",
    "Restrict direct sunlight exposure between 11:00 AM and 4:00 PM",
    "Keep curtains, window shutters, and solar blinds closed during peak radiation",
    "Coordinate wellness checks for elderly neighbors, children, and station pets",
    "Wear breathable, lightweight, loose, and light-colored protective clothing",
    "Postpone heavy physical labor or drills to cooling off-peak intervals"
  ]
};

export default function EmergencyChecklist({ disasterId, disasterName, languageCode }: EmergencyChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newText, setNewText] = useState("");

  // Load checklist items for selected disaster from LocalStorage or Fallbacks
  useEffect(() => {
    const storageKey = `disaster_checklist_${disasterId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        initializeFromDefaults();
      }
    } else {
      initializeFromDefaults();
    }
  }, [disasterId]);

  // Save changes to LocalStorage whenever items change
  const saveItems = (updated: ChecklistItem[]) => {
    setItems(updated);
    localStorage.setItem(`disaster_checklist_${disasterId}`, JSON.stringify(updated));
  };

  const initializeFromDefaults = () => {
    const defaultTexts = DEFAULT_CHECKLISTS[disasterId] || [
      "Carry medicines and first aid",
      "Pack clean drinking water",
      "Stay tuned to radio broadcasts",
      "Grab emergency go-bag and keys"
    ];
    const initial = defaultTexts.map((text, idx) => ({
      id: `${disasterId}_preset_${idx}`,
      text,
      completed: false
    }));
    saveItems(initial);
  };

  const toggleItem = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveItems(updated);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `custom_${Date.now()}`,
      text: newText.trim(),
      completed: false,
      isCustom: true
    };
    
    saveItems([...items, newItem]);
    setNewText("");
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
  };

  const resetToDefault = () => {
    if (window.confirm(`Are you sure you want to reset the ${disasterName} checklist to preset standards?`)) {
      initializeFromDefaults();
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-sm" id="disaster-emergency-checklist">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <ClipboardList className="h-4.5 w-4.5 text-red-500" />
          <span>Dynamic Disaster Checklist</span>
        </h3>
        <button
          type="button"
          onClick={resetToDefault}
          className="text-[9px] font-mono text-slate-400 hover:text-red-400 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer"
          title="Reset back to factory presets"
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span>RESET PRESETS</span>
        </button>
      </div>

      <div className="text-xs text-slate-400 leading-relaxed flex items-center justify-between">
        <span>
          Localized preparedness drill for <strong className="text-white">{disasterName} Response Protocols</strong>.
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          [{disasterId.toUpperCase()}]
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">LQE Operations Progress</span>
          <span className={`font-black ${progressPercent === 100 ? "text-emerald-400" : "text-red-400"}`}>
            {completedCount}/{totalCount} Items Completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${progressPercent === 100 ? "bg-emerald-500" : "bg-red-500"}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Voice Guide */}
      <TextToSpeechController
        textToRead={
          items.filter(item => !item.completed).length > 0
            ? `Active emergency safeguards for ${disasterName}: ` + items.filter(item => !item.completed).map((item, idx) => `${idx + 1}, ${item.text}`).join(". ")
            : `All emergency safeguards for ${disasterName} are fully completed. You are secure!`
        }
        languageCode={languageCode}
        title="Checklist Voice Guide"
      />

      {/* Checklist items */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono">
            Checklist is empty. Add a custom task below!
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start justify-between p-2.5 rounded-lg border text-left cursor-pointer transition select-none ${
                item.completed 
                  ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10" 
                  : "bg-slate-950/60 border-slate-900/80 hover:border-slate-800 hover:bg-slate-900/10"
              }`}
            >
              <div className="flex items-start gap-2.5 pr-2">
                <button
                  type="button"
                  className={`mt-0.5 shrink-0 transition ${item.completed ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`}
                >
                  {item.completed ? (
                    <CheckSquare className="h-4.5 w-4.5" />
                  ) : (
                    <Square className="h-4.5 w-4.5" />
                  )}
                </button>
                <span className={`text-xs font-medium leading-tight ${item.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                  {item.text}
                </span>
              </div>
              
              {item.isCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="text-slate-500 hover:text-red-400 transition p-1 rounded hover:bg-slate-900"
                  title="Delete Custom Task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={addItem} className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder={`Add custom ${disasterName.toLowerCase()} safeguard...`}
          className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-red-500 transition font-mono"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      {/* Quick completion banner */}
      {progressPercent === 100 && totalCount > 0 && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-[11px] font-mono animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>PROXIMITY SECURE: Sector drill completed! Ready for evacuation.</span>
        </div>
      )}
    </div>
  );
}
