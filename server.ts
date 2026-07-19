import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { createLog, getLogsByUid } from "./src/db/logs.ts";
import { createFeedback, getFeedbackByUid } from "./src/db/feedback.ts";
import { createTimelineEvent, getTimelineEventsByDisaster } from "./src/db/timeline.ts";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. Falling back to simulated/mock responses.");
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

function getFallbackDisasterGuidance(disasterType: string, userLocation: string, userQuery: string, selectedLanguage: string) {
  const isSpanish = selectedLanguage.toUpperCase() === "ES";
  const isFrench = selectedLanguage.toUpperCase() === "FR";

  if (isSpanish) {
    return {
      summary: `[ASISTENTE TÁCTICO - SERVICIO REPLICADO] Guía de emergencia de respaldo para ${disasterType} en la ubicación ${userLocation}.`,
      priority: "ALTA",
      immediate_actions: [
        "Sintonice la radio local de emergencia para recibir instrucciones de inmediato.",
        "Mantenga las vías respiratorias protegidas y el equipo de emergencia listo.",
        "Evite las zonas de peligro identificadas en los mapas tácticos."
      ],
      things_to_avoid: [
        "No cruce zonas inundadas o estructuras inestables a pie o en coche.",
        "No regrese a las áreas evacuadas hasta que las autoridades lo consideren seguro."
      ],
      emergency_checklist: [
        "Botiquín de primeros auxilios",
        "Documentos de identidad protegidos en bolsas de plástico",
        "Suministro de agua potable para 32 horas"
      ],
      nearby_resources: [
        "Servicios de respuesta a emergencias locales",
        "Puntos de encuentro y refugio civil"
      ],
      first_aid: [
        "Limpie y proteja las heridas abiertas inmediatamente para evitar infecciones.",
        "Trate las quemaduras o traumatismos utilizando gasas estériles del botiquín."
      ],
      evacuation_steps: [
        "Estudie la ruta segura al refugio operativo más cercano en su panel.",
        "Siga los vectores de evacuación señalizados por las brigadas tácticas."
      ]
    };
  } else if (isFrench) {
    return {
      summary: `[ASSISTANT TACTIQUE - SERVICE RÉPLIQUÉ] Directives d'urgence de secours pour ${disasterType} à l'emplacement ${userLocation}.`,
      priority: "HAUTE",
      immediate_actions: [
        "Écoutez immédiatement la radio d'urgence locale pour obtenir des instructions.",
        "Gardez vos voies respiratoires protégées et votre équipement d'urgence prêt.",
        "Évitez les zones à haut risque identifiées sur vos cartes tactiques."
      ],
      things_to_avoid: [
        "Ne traversez pas de zones inondées ou de structures instables à pied ou en véhicule.",
        "Ne retournez pas dans les zones évacuées avant l'autorisation officielle."
      ],
      emergency_checklist: [
        "Trousse de premiers secours",
        "Documents d'identité scellés dans des sacs étanches",
        "Réserve d'eau potable pour au moins 32 heures"
      ],
      nearby_resources: [
        "Équipes locales d'intervention d'urgence",
        "Points de rassemblement et abris opérationnels"
      ],
      first_aid: [
        "Nettoyez et protégez immédiatement toute blessure ouverte contre les infections.",
        "Soignez les brûlures ou traumatismes avec des bandages stériles."
      ],
      evacuation_steps: [
        "Étudiez l'itinéraire sécurisé vers l'abri le plus proche disponible sur votre tableau de bord.",
        "Suivez les vecteurs d'évacuation indiqués par les équipes de secours."
      ]
    };
  } else {
    return {
      summary: `[TACTICAL ASSISTANT - REPLICATED BACKUP] Fallback emergency guidance for ${disasterType} at location ${userLocation}.`,
      priority: "HIGH",
      immediate_actions: [
        "Tune in to local emergency radio broadcasts immediately for official instructions.",
        "Keep your airway protected and your personal safety gear ready.",
        "Avoid any high-risk zones highlighted on your tactical mapping panels."
      ],
      things_to_avoid: [
        "Do not cross flooded roadways or compromise structural boundaries on foot or in vehicles.",
        "Do not return to evacuated sectors until clearance is explicitly issued."
      ],
      emergency_checklist: [
        "Portable first-aid kit",
        "Government IDs sealed in waterproof pouches",
        "Bottled water supply for a minimum of 32 hours"
      ],
      nearby_resources: [
        "Local disaster response dispatch teams",
        "Active humanitarian shelters and logistics nodes"
      ],
      first_aid: [
        "Immediately clean and seal open wounds to prevent waterborne or airborne pathogens.",
        "Dress burns or impact trauma with sterile dressings from your emergency gear."
      ],
      evacuation_steps: [
        "Verify the safest route to the nearest operational facility in your area.",
        "Follow emergency evacuation vectors designated by ground response squads."
      ]
    };
  }
}

// FIX LOW #27: Moved to module scope so it can be tested independently
function getFallbackSeverityClass(
  disasterType: string,
  affectedUsers: number,
  hospitalsCount: number
): { severity: string; reasoning: string } {
  let severity = "LOW";
  let reason = "";

  const dTypeLower = disasterType.toLowerCase();
  const isHighRiskDisaster =
    dTypeLower.includes("fire") ||
    dTypeLower.includes("earthquake") ||
    dTypeLower.includes("cyclone") ||
    dTypeLower.includes("flood");

  if (affectedUsers > 2000) {
    severity = "CRITICAL";
    reason = `Extremely high density of affected individuals (${affectedUsers} users) with active ${disasterType} threatening life and grid infrastructure.`;
  } else if (affectedUsers > 500 || (isHighRiskDisaster && affectedUsers > 200)) {
    severity = "HIGH";
    reason = `Significant population affected (${affectedUsers} users) with high risk of escalating damage from active ${disasterType}.`;
  } else if (affectedUsers > 50 || isHighRiskDisaster) {
    severity = "MEDIUM";
    reason = `Moderate population impact for active ${disasterType}. Localized response resources are currently sufficient.`;
  } else {
    severity = "LOW";
    reason = `Minor population impact (${affectedUsers} users). Handled entirely by primary municipal responder units.`;
  }

  if (hospitalsCount === 0 && (severity === "HIGH" || severity === "MEDIUM")) {
    severity = severity === "HIGH" ? "CRITICAL" : "HIGH";
    reason += " Proximity warning: No operational hospital facilities detected within active sector radius.";
  }

  return { severity, reasoning: reason };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies
  app.use(express.json());

  // API Route - register/upsert user session
  app.post("/api/auth/session", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || "no-email@example.com";
      const dbUser = await getOrCreateUser(uid, email);
      res.json({ success: true, user: dbUser });
    } catch (error: any) {
      console.error("Error in /api/auth/session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route - save an operational log / SOS event
  app.post("/api/logs", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { disasterId, severity, lat, lng, message } = req.body;
      const log = await createLog(uid, disasterId, severity, lat, lng, message);

      const ioInstance = app.get("io");
      if (ioInstance) {
        ioInstance.emit("disaster_update", {
          disasterId,
          severity,
          lat,
          lng,
          message,
          timestamp: new Date().toLocaleTimeString(),
          id: log.id,
          source: "database_sos"
        });

        ioInstance.emit("notification", {
          type: "sos",
          message: `🚨 SECURE SOS RECORDED: ${message} (Severity: ${severity})`,
          disasterId,
          severity
        });
      }

      res.json({ success: true, log });
    } catch (error: any) {
      console.error("Error creating log:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route - get logs for the logged-in user
  app.get("/api/logs", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const logs = await getLogsByUid(uid);
      res.json({ success: true, logs });
    } catch (error: any) {
      console.error("Error getting logs:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route - save user feedback
  // FIX MEDIUM #19: Validate required fields before hitting the database
  app.post("/api/feedback", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { rating, comments } = req.body;

      if (!comments || typeof comments !== "string" || comments.trim() === "") {
        return res.status(400).json({ error: "comments field is required and cannot be empty." });
      }
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "rating must be a number between 1 and 5." });
      }

      const feedbackRecord = await createFeedback(uid, rating, comments.trim());
      res.json({ success: true, feedback: feedbackRecord });
    } catch (error: any) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route - get feedback for the logged in user
  app.get("/api/feedback", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const feedbacks = await getFeedbackByUid(uid);
      res.json({ success: true, feedbacks });
    } catch (error: any) {
      console.error("Error getting feedback:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route - save an incident timeline event
  app.post("/api/timeline", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { disasterId, title, description, status } = req.body;
      const timelineRecord = await createTimelineEvent(uid, disasterId, title, description, status);

      const ioInstance = app.get("io");
      if (ioInstance) {
        ioInstance.emit("timeline_event_added", {
          disasterId,
          event: timelineRecord
        });
      }

      res.json({ success: true, event: timelineRecord });
    } catch (error: any) {
      console.error("Error creating timeline event:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route - get timeline events for a given disaster
  app.get("/api/timeline/:disasterId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { disasterId } = req.params;
      const events = await getTimelineEventsByDisaster(uid, disasterId);
      res.json({ success: true, events });
    } catch (error: any) {
      console.error("Error getting timeline events:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route - Google Gemini disaster analysis pipeline
  // FIX CRITICAL #4: Corrected model name from "gemini-3.5-flash" to "gemini-2.0-flash"
  app.post("/api/disaster", async (req, res) => {
    const { disasterType, userLocation, userQuery, selectedLanguage } = req.body;

    const dType = disasterType || "Floods";
    const uLoc = userLocation || "Unknown Location";
    const uQuery = userQuery || "What are the immediate survival and evacuation protocols?";
    const sLang = selectedLanguage || "en";

    try {
      const client = getGeminiClient();

      const contents = `Analyze this disaster context:
Disaster Type: ${dType}
User Location: ${uLoc}
User Query: ${uQuery}
Selected Language: ${sLang}

Provide structured, highly precise tactical and lifesaving emergency coordinator guidance. Ensure the entire response is returned fully translated into the requested language (language code: ${sLang}).`;

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A concise summary of the active disaster and current context." },
              priority: { type: Type.STRING, description: "The immediate threat priority level (e.g. Critical, High, Medium, Low)." },
              immediate_actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of critical actions the user should perform immediately to ensure safety."
              },
              things_to_avoid: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Dangerous actions, locations, or behaviors the user must avoid during this disaster."
              },
              emergency_checklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Essential items to pack or check off before or during evacuation."
              },
              nearby_resources: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Types of resources or departments the user should contact or seek (e.g. Fire station, shelter type)."
              },
              first_aid: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Basic immediate first aid guidance specific to common injuries associated with this disaster."
              },
              evacuation_steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Clear, step-by-step instructions for safely navigating evacuation paths."
              }
            },
            required: [
              "summary",
              "priority",
              "immediate_actions",
              "things_to_avoid",
              "emergency_checklist",
              "nearby_resources",
              "first_aid",
              "evacuation_steps"
            ]
          },
          systemInstruction: "You are an expert disaster tactical coordinator. Return highly practical, localized, clear, and actionable lifesaving instructions."
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini returned empty response text");
      }

      let parsedData;
      try {
        parsedData = JSON.parse(responseText.trim());
      } catch (parseErr) {
        console.error("Failed to parse Gemini response as JSON, trying regex match:", responseText);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Unable to extract valid JSON from Gemini response");
        }
      }

      res.json(parsedData);
    } catch (error: any) {
      console.warn("Gemini service unavailable, executing context-aware fallback response pipeline:", error.message);
      const fallbackData = getFallbackDisasterGuidance(dType, uLoc, uQuery, sLang);
      res.json(fallbackData);
    }
  });

  // API Route - automatically classify incident severity using AI
  // FIX CRITICAL #4: Corrected model name from "gemini-3.5-flash" to "gemini-2.0-flash"
  app.post("/api/severity/classify", async (req, res) => {
    const { disasterType, locationName, lat, lng, affectedUsers, nearbyHospitals } = req.body;

    const dType = disasterType || "Floods";
    const locName = locationName || "Unknown Location";
    const latitude = lat || "0";
    const longitude = lng || "0";
    const usersCount = affectedUsers !== undefined ? Number(affectedUsers) : 100;
    const hospitals = Array.isArray(nearbyHospitals) ? nearbyHospitals : [];

    try {
      const client = getGeminiClient();

      const contents = `You are an AI disaster coordinator. Your task is to analyze the active disaster context and automatically classify the incident severity.
Context details:
- Disaster Type: ${dType}
- User/Epicenter Location: ${locName} (${latitude}, ${longitude})
- Number of affected users: ${usersCount}
- Nearby hospitals count: ${hospitals.length}
${hospitals.length > 0 ? `- Nearby hospitals details: ${JSON.stringify(hospitals.map((h: any) => ({ name: h.name, distance: h.distance })))}` : ''}

Analyze the situation. Consider that:
- Certain disaster types (e.g. Wildfire, Earthquake, Hurricane) are inherently more severe than others.
- Large numbers of affected users highly escalate severity.
- If there are zero nearby hospitals, any severe disaster has its risk escalated to CRITICAL.
- If there are nearby hospitals but they are far away, this also increases severity.

Assign exactly one of these severity levels: "LOW", "MEDIUM", "HIGH", or "CRITICAL".
Provide a clear, brief (1-2 sentences) reasoning for this classification.`;

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              severity: {
                type: Type.STRING,
                description: "Must be exactly one of: 'LOW', 'MEDIUM', 'HIGH', or 'CRITICAL'."
              },
              reasoning: {
                type: Type.STRING,
                description: "A very concise explanation (1-2 sentences) explaining the AI risk analysis and why this severity level was assigned."
              }
            },
            required: ["severity", "reasoning"]
          },
          systemInstruction: "You are a professional disaster threat assessment AI. Always classify severity levels logically and return a strict, JSON-formatted assessment."
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini returned empty response text");
      }

      let parsedData;
      try {
        parsedData = JSON.parse(responseText.trim());
      } catch (parseErr) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Unable to extract valid JSON from Gemini response");
        }
      }

      // Force severity to uppercase and validate
      if (parsedData.severity) {
        parsedData.severity = parsedData.severity.toUpperCase();
        if (!["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsedData.severity)) {
          parsedData.severity = "MEDIUM";
        }
      } else {
        parsedData.severity = "MEDIUM";
      }

      res.json({ success: true, ...parsedData });
    } catch (error: any) {
      console.warn("Gemini severity classification unavailable. Running fallback heuristic:", error.message);
      const fallback = getFallbackSeverityClass(dType, usersCount, hospitals.length);
      res.json({ success: true, ...fallback });
    }
  });

  // FIX MEDIUM #23: Explicit 404 handler for unmatched API routes — must come before the SPA catch-all
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  });

  // Vite middleware for development or static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA catch-all — only non-API GET requests reach here
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = http.createServer(app);

  // FIX LOW #28: Restrict Socket.IO CORS to whitelisted origins instead of wildcard "*"
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : ["http://localhost:3000", "http://localhost:5173"];

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      methods: ["GET", "POST"]
    }
  });

  const connectedSockets = new Set<string>();

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    connectedSockets.add(socket.id);

    // Broadcast active users count
    io.emit("online_users", connectedSockets.size);

    socket.on("disaster_update", (data) => {
      console.log("[Socket.IO] disaster_update:", data);
      socket.broadcast.emit("disaster_update", data);

      socket.broadcast.emit("notification", {
        type: "disaster",
        message: `🚨 DISASTER UPDATE: ${data.disasterName || data.disasterId} at ${data.locationName || 'updated epicenter'}. Severity: ${data.severity}`,
        data
      });
    });

    socket.on("responder_location_update", (data) => {
      console.log("[Socket.IO] responder_location_update:", data);
      socket.broadcast.emit("responder_location_update", data);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      connectedSockets.delete(socket.id);
      io.emit("online_users", connectedSockets.size);
    });
  });

  // Attach io to app so routes can access it
  app.set("io", io);

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
