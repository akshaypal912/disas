# Disaster Response Platform — Deep Codebase Analysis

> **Branch:** Experimental  
> **Repository:** ooseni/Disaster-Response-Platform  
> **Stack:** React 18 + TypeScript / FastAPI (Python) / Express.js / Supabase + Postgres  
> **AI:** Gemini (server.ts) + IBM watsonx Granite (backend/)

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 6 |
| 🟠 High | 9 |
| 🟡 Medium | 8 |
| 🔵 Low / Missing Feature | 7 |
| **Total** | **30** |

---

## 🔴 Critical Issues

### 1. Fake authentication — any password ≥ 6 chars grants coordinator access
- **File:** `src/components/LoginPage.tsx` — `handleEmailSignIn()`
- The email/password login route never calls Firebase or any real auth service. The condition is `if (email === 'commander@resp.ai' || password.length >= 6)` — meaning *any* account with a password of 6+ characters is granted full Coordinator (admin) access with a mock token. This bypasses all RBAC entirely.
- **Tags:** Security, RBAC Bypass, Auth

---

### 2. Mock tokens accepted by server API routes — authentication is illusory
- **File:** `server.ts` + `src/middleware/auth.ts`
- The Express server uses `requireAuth` which calls `adminAuth.verifyIdToken(token)` from Firebase Admin. However, the simulated access path in LoginPage produces tokens like `mock_token_coordinator_<timestamp>`. These will fail Firebase Admin verification, meaning every API call (`/api/logs`, `/api/feedback`, `/api/timeline`) will return 401 for simulated sessions — the SOS queue sync will silently fail.
- **Tags:** Security, API, Broken Auth Flow

---

### 3. IBM watsonx IAM token is a hardcoded string "mock-iam-token" — real LLM calls always fail
- **File:** `backend/app/services/watsonx.py` — `_get_iam_token()`
- `_get_iam_token()` simply `return "mock-iam-token"`. Even when a real `WATSONX_API_KEY` is provided, HTTP requests to `/ml/v4/generation` are sent with `Authorization: Bearer mock-iam-token` and will be rejected with HTTP 401 by IBM Cloud. The actual IAM exchange endpoint (`https://iam.cloud.ibm.com/identity/token`) is mentioned in a comment but never implemented.
- **Tags:** AI/LLM, IBM watsonx, Credentials

---

### 4. Gemini model name "gemini-3.5-flash" does not exist — all AI triage calls fail
- **File:** `server.ts` — lines 286, 431
- Both `/api/disaster` and `/api/severity/classify` routes call `client.models.generateContent({ model: "gemini-3.5-flash", ... })`. The real model identifier is `gemini-1.5-flash` or `gemini-2.0-flash`. An invalid model name causes a 404, so every chat query silently falls back to the static hardcoded `getFallbackDisasterGuidance()` function with no indication to the user.
- **Tags:** AI/LLM, Gemini API

---

### 5. SSL disabled on Postgres connection pool — data transmitted in plaintext
- **File:** `src/db/index.ts` — `createPool()`
- The DB pool is created with `ssl: false`. Cloud-hosted Postgres instances (Google Cloud SQL, Supabase, AWS RDS) require TLS. In production this sends SOS events, user credentials, and emergency logs over an unencrypted channel. It will also silently fail to connect on Cloud SQL instances that enforce SSL.
- **Tags:** Security, Database

---

### 6. Health check endpoint hard-codes "connected: true" regardless of real state
- **File:** `backend/app/main.py` — `health_check()`
- The `GET /` health endpoint unconditionally returns `"database_connected": True, "llm_connected": True` without actually pinging Supabase or watsonx. Any monitoring system relying on this will incorrectly report the service as healthy even when both are unreachable.
- **Tags:** API, Observability

---

## 🟠 High Severity Issues

### 7. Python backend CRUD endpoints return mock IDs — Supabase is never actually written to
- **Files:** `backend/app/api/v1/endpoints/disaster.py`, `alerts.py`, `resources.py`
- All three endpoint files return hardcoded mock responses like `"id": "mock-disaster-id-abc"` and never call `get_supabase_client()`. The `GET` list endpoints always return an empty array. The `supabase.py` client is defined but completely unused.
- **Tags:** API, Supabase, Unimplemented

---

### 8. Two completely separate, incompatible database systems in use simultaneously
- **Files:** `src/db/` (Drizzle + Postgres) vs `supabase/` (Supabase RLS) vs `backend/` (Supabase Python)
- Three distinct data stores that are architecturally incompatible:
  1. **Express (Node.js)** uses Drizzle ORM against a raw Postgres TCP pool with `users/logs/feedback/timeline_events`.
  2. **Python FastAPI** uses the Supabase Python client against a different schema (`profiles/disasters/resources/alerts/shelters`).
  3. **Two Supabase SQL files** define yet another conflicting schema (`users` vs `profiles`, `requests` vs `disasters`).
- **Tags:** Database, Architecture

---

### 9. firebase-admin initialized without service account credentials — token verification will fail
- **File:** `src/lib/firebase-admin.ts`
- `firebase-admin` is initialized with only a `projectId` from the client-side JSON config file. Firebase Admin SDK requires a service account key or Application Default Credentials (ADC) for server-side token verification. Without them, every call to `adminAuth.verifyIdToken(token)` will throw, breaking all protected API routes.
- **Tags:** Security, Firebase Admin

---

### 10. AIChatbot header reads "GEMINI PROXIED" but always returns static fallback
- **File:** `src/components/AIChatbot.tsx` — lines 127, 135
- Due to the wrong model name (issue #4), every response the user sees is pre-written boilerplate, not live AI output, with no indication to the operator. In an emergency context this false confidence is dangerous.
- **Tags:** UI/UX, AI/LLM

---

### 11. IncidentTimeline auto-seeds duplicate events on every component remount
- **File:** `src/components/IncidentTimeline.tsx` — lines 138–159
- The seeding `useEffect` fires when `events.length === 0 && !loading`. There is a race window where this briefly evaluates to true while a fetch is still in flight, leading to double-seeding on slow connections or re-renders caused by parent state changes.
- **Tags:** Race Condition, Database

---

### 12. watsonx generate_tactical_plan() response parsing is fully stubbed — LLM output is discarded
- **File:** `backend/app/services/watsonx.py` — lines 94–101
- Even in the "real HTTP path", after the API call succeeds, the `result` variable is never parsed. The code has a comment *"Extract and parse response matching LLM format instructions…"* followed by returning a second static hardcoded dict.
- **Tags:** AI/LLM, Unimplemented

---

### 13. SOS Queue syncs on every mount even when queue is empty — redundant Firebase token fetch
- **File:** `src/lib/sosQueue.ts` — lines 248–251
- `useSOSQueue` calls `syncQueue()` on mount whenever `navigator.onLine` is true, regardless of queue size. `syncQueue()` calls `getActiveToken()` which forces `auth.currentUser.getIdToken(true)` — a network call to Firebase on every page load.
- **Tags:** Performance, Token Leak

---

### 14. Supabase JWT secret is missing from config — Python JWT verification will always crash
- **Files:** `backend/app/core/config.py` + `backend/app/core/security.py`
- `settings.SUPABASE_JWT_SECRET` is referenced in `security.py` but never defined in `config.py`. This will raise an `AttributeError` at runtime when any protected Python route is accessed.
- **Tags:** Security, Runtime Crash

---

### 15. LeafletMap initializes icons outside useEffect — causes SSR / module-load crash risk
- **File:** `src/components/LeafletMap.tsx` — lines 45–102
- `L.divIcon()` calls are made at component render time, not inside a `useEffect`. Leaflet requires a DOM environment. If the component ever renders server-side or in a test environment without a DOM, it will throw.
- **Tags:** Leaflet, SSR Risk

---

## 🟡 Medium Severity Issues

### 16. .env.example is missing all backend and Firebase credentials
- **File:** `.env.example`
- Missing: `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`, `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, and Firebase Admin service account path.
- **Tags:** DX, Config

---

### 17. Google sign-in ignores the /api/auth/session response — role always hardcoded to "coordinator"
- **File:** `src/components/LoginPage.tsx` — `handleGoogleSignIn()` lines 36–40
- After calling `/api/auth/session`, the returned `data` object is fetched but never read. The role is unconditionally set to `'coordinator'`, making all three RBAC levels identical.
- **Tags:** RBAC, Auth

---

### 18. TacticalHistory "Wipe Entire Log" ghost-data bug — DB records reappear on refresh
- **File:** `src/components/TacticalHistory.tsx` — `handleClearAll()`
- `handleClearAll` clears localStorage and in-memory state. However, DB logs are re-fetched from `/api/logs` on every mount. The user sees the wipe succeed, but records return immediately on next navigation.
- **Tags:** UI/UX, State

---

### 19. feedback.comments is NOT NULL in schema but server route has no validation
- **Files:** `src/db/schema.ts` (line 31) vs `server.ts`
- A direct API call with an empty or missing `comments` field will cause a Postgres constraint violation and return a 500 error with a raw stack trace exposed to the client.
- **Tags:** Validation, Database

---

### 20. WeatherPanel fallback rain probability can exceed 100%
- **File:** `src/components/WeatherPanel.tsx` — lines 153–159
- The formula `(estimatedHumidity - 40) * 1.2` can produce values above 100% with no `Math.min(100, ...)` clamp, meaning the UI can display "Rain Prob: 132%".
- **Tags:** Display Bug, WeatherPanel

---

### 21. Drizzle schema uses serial() integer PKs while Supabase migration uses UUID PKs
- **Files:** `src/db/schema.ts` vs `supabase/schema.sql` + `supabase/migrations/`
- The Drizzle schema uses auto-increment `serial` integer PKs. The Supabase SQL files use UUID PKs. These schemas are incompatible and there is no migration path defined for Drizzle.
- **Tags:** Schema Mismatch, Database

---

### 22. handle_new_user_signup trigger is commented out — user profiles never auto-created
- **File:** `supabase/schema.sql` — lines 167–170
- The SQL trigger `trigger_on_auth_user_created` that inserts into `public.users` on signup is commented out. Without it, the `public.users` table will always be empty and all RLS policies will silently fail.
- **Tags:** Supabase, RLS

---

### 23. React production SPA catch-all route conflicts with API routes
- **File:** `server.ts` — lines 495–497
- `app.get('*', ...)` will match any GET path not already handled — including unregistered API paths, which will silently return `index.html` instead of a 404 JSON error.
- **Tags:** Express, Routing

---

## 🔵 Low / Missing Features

### 24. TextToSpeechController does not handle speech synthesis errors or unavailability
- **File:** `src/components/TextToSpeechController.tsx`
- No `onerror` handler on the utterance. If speech synthesis is unavailable, the button stays in "speaking" state permanently.
- **Tags:** Accessibility, Error Handling

### 25. README references "RESP-AI Defense Network" monitoring that does not exist
- **Files:** `README.md` + `src/components/LoginPage.tsx` — line 236
- No such monitoring system is implemented anywhere in the codebase.
- **Tags:** Misleading, UI Copy

### 26. NearbyFacilitiesFinder error message is in mixed English/Spanish
- **File:** `src/components/NearbyFacilitiesFinder.tsx` — line 124
- Error string: `'OSM Live API unavailable, utilizando respaldo localizado.'` mixes English and Spanish.
- **Tags:** i18n, Copy

### 27. getFallbackSeverityClass() is defined inside startServer() — cannot be unit tested
- **File:** `server.ts` — line 367
- Nested inside the async `startServer()` function; should be at module scope alongside `getFallbackDisasterGuidance`.
- **Tags:** Code Quality

### 28. Socket.IO CORS is set to "*" (wildcard) with no auth on socket events
- **File:** `server.ts` — lines 501–505
- Any external client can emit `disaster_update` events that are broadcast to all connected coordinators, potentially injecting false emergency data.
- **Tags:** Security, WebSocket

### 29. EmergencyChecklist "active" SOS state is never reset after submission
- **File:** `src/components/EmergencyChecklist.tsx` — `handleActivateSOS()`
- Once `setActive(true)` is called there is no path to reset it. The button permanently reads "SOS ACTIVE - TRANSMITTING LOCATION" for the rest of the session.
- **Tags:** UI/UX, State

### 30. package.json name is "react-example" — generic placeholder not updated
- **File:** `package.json` — line 2
- The package name is still the default scaffold name `"react-example"`.
- **Tags:** Config

---

## 📊 Component Readiness Matrix

| Component | State | Notes |
|-----------|-------|-------|
| Frontend React UI (HUD, Map, Panels) | ✅ Functional | Renders correctly; cosmetic/UX issues only |
| Leaflet Map + OSM Facilities | ✅ Functional | Real OSM data + fallback; minor icon init timing risk |
| Weather Panel | ✅ Functional | Open-Meteo fallback works; rain% overflow bug |
| Disaster Preparedness Checklist | ✅ Functional | localStorage-backed, works offline |
| Email / Password Login | ❌ Broken | Fake auth — any 6-char password grants admin |
| Google Firebase Login | ⚠️ Partial | Real Firebase auth; role always hardcoded to coordinator |
| Simulated Access | ⚠️ Demo only | Mock token breaks all protected API calls |
| Firebase Admin (server-side) | ❌ Broken | No service account; verifyIdToken() will fail |
| Express API (logs, feedback, timeline) | ⚠️ Partial | Routes exist; DB works if Postgres is provisioned with SSL fix |
| SOS Offline Queue | ⚠️ Partial | Queue logic correct; sync fails with mock tokens |
| Gemini AI Chatbot (server.ts) | ❌ Broken | Wrong model name; always uses static fallback |
| Python FastAPI Backend | ⚠️ Stub only | All routes return mock data; Supabase never called |
| IBM watsonx Granite Integration | ❌ Broken | IAM token is hardcoded "mock-iam-token" |
| Python JWT Verification | ❌ Runtime crash | SUPABASE_JWT_SECRET missing from config |
| Supabase Schema / RLS | ⚠️ Incomplete | User signup trigger commented out; conflicting schemas |
| Socket.IO Real-time Events | ✅ Functional | Works; no auth on socket events (CORS wildcard) |
| Incident Timeline | ⚠️ Partial | Race condition in auto-seeding; works when auth is valid |
| TTS / Speech Controller | ✅ Functional | Missing onerror handler; otherwise works |
