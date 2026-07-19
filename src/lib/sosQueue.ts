import { useState, useEffect, useCallback } from "react";
import { auth } from "./firebase.ts";

export interface SOSRequest {
  id: string; // unique ID
  timestamp: number; // unique timestamp
  disasterId: string;
  severity: "EXTREME" | "SEVERE" | "MODERATE" | "CLEAR" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lat: string;
  lng: string;
  message: string;
}

export type SyncStatus = "idle" | "saved_offline" | "syncing" | "synced_success";

const QUEUE_KEY = "pendingSOSQueue";

/**
 * Retrieves the list of pending SOS requests from localStorage.
 */
export function getPendingSOSQueue(): SOSRequest[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(QUEUE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("[SOS Queue] Failed to parse SOS queue from localStorage:", e);
    return [];
  }
}

/**
 * Saves the list of pending SOS requests to localStorage.
 */
export function savePendingSOSQueue(queue: SOSRequest[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Enqueues a new SOS request if it does not already exist (duplicate prevention).
 */
export function enqueueSOSRequest(request: SOSRequest): SOSRequest[] {
  const queue = getPendingSOSQueue();
  // Prevent duplicate uploads by verifying ID uniqueness
  if (queue.some((item) => item.id === request.id)) {
    console.warn(`[SOS Queue] SOS request with ID ${request.id} already exists in the queue.`);
    return queue;
  }
  queue.push(request);
  savePendingSOSQueue(queue);
  return queue;
}

/**
 * Dequeues/removes an SOS request by ID.
 */
export function dequeueSOSRequest(id: string): SOSRequest[] {
  const queue = getPendingSOSQueue();
  const updated = queue.filter((item) => item.id !== id);
  savePendingSOSQueue(updated);
  return updated;
}

/**
 * Sends a single SOS request to the backend.
 */
export async function sendSOSToBackend(request: SOSRequest, idToken: string): Promise<boolean> {
  try {
    const response = await fetch("/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({
        disasterId: request.disasterId,
        severity: request.severity,
        lat: request.lat,
        lng: request.lng,
        message: request.message
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with HTTP status ${response.status}`);
    }

    const data = await response.json();
    return !!data.success;
  } catch (error) {
    console.error(`[SOS Queue] Error posting SOS ${request.id} to backend:`, error);
    return false;
  }
}

/**
 * React hook to interact with the Offline SOS Queue.
 * Synchronizes with window "online" events and handles notifications.
 */
export function useSOSQueue(idTokenFromSession: string | null, onLogAdded?: (msg: string) => void) {
  const [queue, setQueue] = useState<SOSRequest[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Load initial queue
  const updateQueueFromStorage = useCallback(() => {
    setQueue(getPendingSOSQueue());
  }, []);

  useEffect(() => {
    updateQueueFromStorage();
  }, [updateQueueFromStorage]);

  // Retrieve active token safely, prioritizing a fresh token from Firebase
  const getActiveToken = useCallback(async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken(true);
      } catch (err) {
        console.error("[SOS Queue] Failed to retrieve fresh auth token:", err);
      }
    }
    return idTokenFromSession;
  }, [idTokenFromSession]);

  // Synchronizes all queued SOS requests to the backend
  const syncQueue = useCallback(async () => {
    const currentQueue = getPendingSOSQueue();
    if (currentQueue.length === 0) {
      return;
    }

    const token = await getActiveToken();
    if (!token) {
      console.warn("[SOS Queue] Sync deferred: User not authenticated or token missing.");
      return;
    }

    setSyncStatus("syncing");
    if (onLogAdded) {
      onLogAdded(`[${new Date().toLocaleTimeString()}] 🔄 SOS SYNC: Initiating synchronization of ${currentQueue.length} pending offline SOS requests...`);
    }

    let successCount = 0;
    const itemsToSync = [...currentQueue];

    for (const item of itemsToSync) {
      const success = await sendSOSToBackend(item, token);
      if (success) {
        dequeueSOSRequest(item.id);
        successCount++;
        if (onLogAdded) {
          onLogAdded(`[${new Date().toLocaleTimeString()}] ✅ SOS SYNCED: Offline SOS Event [${item.id}] successfully saved in cloud database.`);
        }
      } else {
        if (onLogAdded) {
          onLogAdded(`[${new Date().toLocaleTimeString()}] ⚠️ SOS SYNC FAILURE: Retrying SOS Event [${item.id}] next connection cycle.`);
        }
      }
    }

    updateQueueFromStorage();

    if (successCount === itemsToSync.length) {
      setSyncStatus("synced_success");
      if (onLogAdded) {
        onLogAdded(`[${new Date().toLocaleTimeString()}] 🟢 SYNC COMPLETE: All pending SOS requests successfully sent.`);
      }
      const t = setTimeout(() => setSyncStatus("idle"), 5000);
      return () => clearTimeout(t);
    } else {
      setSyncStatus("saved_offline");
      if (onLogAdded) {
        onLogAdded(`[${new Date().toLocaleTimeString()}] ⚠️ SYNC INCOMPLETE: ${itemsToSync.length - successCount} SOS requests remained offline.`);
      }
    }
  }, [getActiveToken, updateQueueFromStorage, onLogAdded]);

  // Trigger an SOS request
  const triggerSOS = useCallback(async (
    disasterId: string,
    severity: "EXTREME" | "SEVERE" | "MODERATE" | "CLEAR" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    lat: string,
    lng: string,
    message: string
  ) => {
    const uniqueId = `sos_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const timestamp = Date.now();
    
    const request: SOSRequest = {
      id: uniqueId,
      timestamp,
      disasterId,
      severity,
      lat,
      lng,
      message: message || `Tactical SOS triggered for ${disasterId.toUpperCase()} at coordinates (${lat}, ${lng})`
    };

    // Save locally first to guarantee no loss
    enqueueSOSRequest(request);
    updateQueueFromStorage();

    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    const token = await getActiveToken();

    if (isOnline && token) {
      setSyncStatus("syncing");
      if (onLogAdded) {
        onLogAdded(`[${new Date().toLocaleTimeString()}] 📡 SOS TRANSMITTING: Live uplink available. Posting SOS directly...`);
      }
      
      const success = await sendSOSToBackend(request, token);
      if (success) {
        dequeueSOSRequest(uniqueId);
        updateQueueFromStorage();
        setSyncStatus("synced_success");
        if (onLogAdded) {
          onLogAdded(`[${new Date().toLocaleTimeString()}] ✅ SOS SYNCED: Direct SOS uplink successful! Telemetry recorded in cloud database.`);
        }
        setTimeout(() => setSyncStatus("idle"), 5000);
      } else {
        setSyncStatus("saved_offline");
        if (onLogAdded) {
          onLogAdded(`[${new Date().toLocaleTimeString()}] ⚠️ SOS SAVED OFFLINE: Direct upload failed due to network error. Queued for auto-sync.`);
        }
      }
    } else {
      setSyncStatus("saved_offline");
      if (onLogAdded) {
        onLogAdded(`[${new Date().toLocaleTimeString()}] ⚠️ SOS SAVED OFFLINE: Local network link down. Queued safely under pendingSOSQueue.`);
      }
    }
  }, [getActiveToken, updateQueueFromStorage, onLogAdded]);

  // Setup network restoration event listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      console.log("[SOS Queue] Network restoration detected. Syncing...");
      syncQueue();
    };

    window.addEventListener("online", handleOnline);

    // FIX HIGH #13: Only trigger initial sync if there are actually pending items,
    // avoiding an unnecessary Firebase token fetch on every page load.
    if (navigator.onLine && getPendingSOSQueue().length > 0) {
      syncQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncQueue]);

  return {
    queue,
    pendingCount: queue.length,
    syncStatus,
    triggerSOS,
    syncQueue
  };
}
