import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2, VolumeX, AlertTriangle } from "lucide-react";

interface TextToSpeechControllerProps {
  textToRead: string;
  languageCode: string; // "EN" | "ES" | "FR" | "JA" | "HI"
  title?: string;
}

const LANG_MAPPING: Record<string, { bcp47: string; name: string }> = {
  EN: { bcp47: "en-US", name: "English" },
  ES: { bcp47: "es-ES", name: "Español" },
  FR: { bcp47: "fr-FR", name: "Français" },
  JA: { bcp47: "ja-JP", name: "日本語" },
  HI: { bcp47: "hi-IN", name: "हिन्दी" },
};

export default function TextToSpeechController({
  textToRead,
  languageCode,
  title = "AI Voice Broadcast"
}: TextToSpeechControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const [activeVoice, setActiveVoice] = useState<string>("");
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
    
    return () => {
      // Stop speech on unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Whenever the text or language changes, stop speaking and reset state
  useEffect(() => {
    stopSpeech();
  }, [textToRead, languageCode]);

  const selectVoiceForLang = (lang: string): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const config = LANG_MAPPING[lang] || LANG_MAPPING.EN;
    
    // First try: exact BCP47 match
    let match = voices.find(v => v.lang.toLowerCase() === config.bcp47.toLowerCase());
    
    // Second try: starts with BCP47 prefix (e.g. "en")
    if (!match) {
      const prefix = config.bcp47.split("-")[0].toLowerCase();
      match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    }
    
    return match || null;
  };

  const startSpeech = () => {
    if (!supported || typeof window === "undefined" || !window.speechSynthesis) return;

    // If we were paused, resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // Otherwise, start a fresh utterance
    window.speechSynthesis.cancel(); // Cancel any existing speech

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utteranceRef.current = utterance;

    // Set voice based on language
    const voice = selectVoiceForLang(languageCode);
    if (voice) {
      utterance.voice = voice;
      setActiveVoice(voice.name);
    } else {
      // Fallback: set the lang string
      utterance.lang = (LANG_MAPPING[languageCode] || LANG_MAPPING.EN).bcp47;
      setActiveVoice("Default System Voice");
    }

    // Set callbacks
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesisUtterance error:", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (!supported || typeof window === "undefined" || !window.speechSynthesis) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stopSpeech = () => {
    if (!supported || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Listen to voice list loading (for browsers like Chrome where voices load asynchronously)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const handleVoicesChanged = () => {
      const voice = selectVoiceForLang(languageCode);
      if (voice) {
        setActiveVoice(voice.name);
      }
    };

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, [languageCode]);

  if (!supported) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono">
        <VolumeX className="h-4 w-4 shrink-0" />
        <span>SpeechSynthesis is not supported in this browser environment.</span>
      </div>
    );
  }

  const currentLangName = (LANG_MAPPING[languageCode] || LANG_MAPPING.EN).name;

  return (
    <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg" id="tts-audio-broadcast-controller">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg border transition-all ${isPlaying ? "bg-red-500/15 border-red-500/30 text-red-400 animate-pulse" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
          <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-bounce" : ""}`} />
        </div>
        <div className="text-left">
          <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            {title} ({currentLangName})
          </span>
          <span className="block text-[9px] font-mono text-slate-400 truncate max-w-[200px]">
            {isPlaying ? `Speaking: ${activeVoice || "Voice Ready"}` : isPaused ? "Playback Paused" : "Voice Broadcast Ready"}
          </span>
        </div>
      </div>

      {/* TTS Playback Actions */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
        <button
          type="button"
          onClick={startSpeech}
          className={`px-2.5 py-1 text-[10px] font-mono font-extrabold rounded-lg border transition flex items-center gap-1 cursor-pointer ${
            isPlaying 
              ? "bg-red-600 border-red-500 text-white" 
              : "bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
          }`}
          title="Play instructions aloud"
        >
          <Play className="h-3 w-3 fill-current shrink-0" />
          <span>{isPaused ? "RESUME" : "PLAY"}</span>
        </button>

        <button
          type="button"
          onClick={pauseSpeech}
          disabled={!isPlaying && !isPaused}
          className={`px-2.5 py-1 text-[10px] font-mono font-extrabold rounded-lg border transition flex items-center gap-1 cursor-pointer ${
            isPaused
              ? "bg-amber-600 border-amber-500 text-white"
              : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
          title="Pause speaking"
        >
          <Pause className="h-3 w-3 fill-current shrink-0" />
          <span>PAUSE</span>
        </button>

        <button
          type="button"
          onClick={stopSpeech}
          disabled={!isPlaying && !isPaused}
          className="px-2.5 py-1 text-[10px] font-mono font-extrabold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Stop reading instructions"
        >
          <Square className="h-3 w-3 fill-current shrink-0" />
          <span>STOP</span>
        </button>
      </div>
    </div>
  );
}
