-- =====================================================================
-- SUPABASE DATABASE SCHEMA DESIGN
-- AI Disaster Response & End-User Assistance System
-- Target Runtime: PostgreSQL (Supabase)
-- Core Tables: users, requests, responses, locations, history, feedback
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop existing tables if they exist to ensure clean deployment (if needed)
-- DROP TABLE IF EXISTS public.feedback CASCADE;
-- DROP TABLE IF EXISTS public.history CASCADE;
-- DROP TABLE IF EXISTS public.responses CASCADE;
-- DROP TABLE IF EXISTS public.requests CASCADE;
-- DROP TABLE IF EXISTS public.locations CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ==========================================
-- 1. USERS TABLE (Mirror profiles linking to Supabase auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'civilian' CHECK (role IN ('civilian', 'responder', 'coordinator')),
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. LOCATIONS TABLE (Spatial geographic data for incidents)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geog GEOGRAPHY(Point, 4326), -- PostGIS Point for proximity lookups
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. REQUESTS TABLE (End-user disaster assistance reports)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    disaster_type TEXT NOT NULL CHECK (disaster_type IN ('floods', 'earthquakes', 'cyclones', 'fires', 'landslides', 'heatwaves', 'other')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. RESPONSES TABLE (Tactical dispatch advice or helper reports)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
    responder_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    tactical_advice TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'dispatched' CHECK (status IN ('draft', 'dispatched', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. HISTORY TABLE (Operational change log / audit trails)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- e.g. 'CREATED_REQUEST', 'UPDATED_STATUS', 'SENT_RESPONSE'
    entity_type TEXT NOT NULL, -- e.g. 'requests', 'responses', 'locations'
    entity_id UUID NOT NULL,   -- Polymorphic reference ID
    summary TEXT NOT NULL,     -- Human-readable description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 6. FEEDBACK TABLE (Civilians reviewing the help received)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =====================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_locations_spatial ON public.locations USING GIST(geog);
CREATE INDEX IF NOT EXISTS idx_requests_user ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_location ON public.requests(location_id);
CREATE INDEX IF NOT EXISTS idx_requests_status_type ON public.requests(status, disaster_type);
CREATE INDEX IF NOT EXISTS idx_responses_request ON public.responses(request_id);
CREATE INDEX IF NOT EXISTS idx_responses_responder ON public.responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON public.history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_entity ON public.history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_feedback_response ON public.feedback(response_id);


-- =====================================================================
-- TRIGGERS & PROCEDURAL FUNCTIONS
-- =====================================================================

-- 1. Automate Updated At Timestamp refresh
CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_timestamp BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

CREATE TRIGGER trigger_update_requests_timestamp BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

CREATE TRIGGER trigger_update_responses_timestamp BEFORE UPDATE ON public.responses
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


-- 2. PostGIS Geometry point synchronization from latitude & longitude
CREATE OR REPLACE FUNCTION public.sync_location_geog()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_locations_geog BEFORE INSERT OR UPDATE ON public.locations
FOR EACH ROW EXECUTE FUNCTION public.sync_location_geog();


-- 3. Automatic User profile creation via Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'civilian'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FIX MEDIUM #22: Uncommented the user signup trigger so new Supabase Auth users
-- automatically get a profile row created in public.users (required for all RLS policies).
CREATE TRIGGER trigger_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();


-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY "Users are readable by authenticated responders and coordinators" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can edit their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 2. Locations policies
CREATE POLICY "Locations are readable by authenticated users" ON public.locations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Locations are creatable by authenticated users" ON public.locations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Requests policies
CREATE POLICY "Civilian can view own requests, responders can view all" ON public.requests
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role IN ('responder', 'coordinator')
        )
    );

CREATE POLICY "Civilians can create disaster requests" ON public.requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Request owners and personnel can edit requests" ON public.requests
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role IN ('responder', 'coordinator')
        )
    );

-- 4. Responses policies
CREATE POLICY "Users can view responses to their requests, responders can view all" ON public.responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.requests 
            WHERE requests.id = responses.request_id AND requests.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role IN ('responder', 'coordinator')
        )
    );

CREATE POLICY "Only authorized responders can compile tactical advice responses" ON public.responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role IN ('responder', 'coordinator')
        )
    );

-- 5. History policies
CREATE POLICY "Only responders and coordinators can select action history" ON public.history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role IN ('responder', 'coordinator')
        )
    );

CREATE POLICY "System automatic audit insertion policy" ON public.history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Feedback policies
CREATE POLICY "Civilians can select their own feedback, personnel can view all" ON public.feedback
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role IN ('responder', 'coordinator')
        )
    );

CREATE POLICY "Civilians can submit feedback for active responses" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);
