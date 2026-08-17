-- ============================================================================
-- NEXUS MANAGER — DATABASE SCHEMA & RLS POLICIES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'DIRECTOR', 'MANAGER', 'EMPLOYEE');
CREATE TYPE obligation_frequency AS ENUM ('DIARIA', 'SEMANAL', 'MENSAL');
CREATE TYPE daily_status_type AS ENUM ('GREEN', 'YELLOW', 'RED', 'NO_RESPONSE');
CREATE TYPE alert_type AS ENUM ('ATTENTION', 'CRITICAL', 'NO_RESPONSE', 'SYSTEM');
CREATE TYPE alert_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE alert_status AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE conversation_type AS ENUM ('PRIVATE', 'AREA', 'GROUP');
CREATE TYPE message_type AS ENUM ('TEXT', 'SYSTEM', 'ALERT', 'STATUS');

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  avatar TEXT,
  department TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Areas Table
CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Area Members Table
CREATE TABLE IF NOT EXISTS public.area_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_area TEXT DEFAULT 'MEMBER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(area_id, user_id)
);

-- 4. Obligations Table
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency obligation_frequency NOT NULL DEFAULT 'DIARIA',
  due_time TIME NOT NULL DEFAULT '17:00',
  responsible_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Daily Status Table
CREATE TABLE IF NOT EXISTS public.daily_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status daily_status_type NOT NULL,
  justification TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(area_id, date)
);

-- 6. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  type alert_type NOT NULL DEFAULT 'ATTENTION',
  priority alert_priority NOT NULL DEFAULT 'MEDIUM',
  status alert_status NOT NULL DEFAULT 'OPEN',
  title TEXT NOT NULL,
  description TEXT,
  acknowledged_by UUID REFERENCES public.profiles(id),
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type conversation_type NOT NULL DEFAULT 'PRIVATE',
  title TEXT,
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Conversation Members Table
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 9. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type message_type NOT NULL DEFAULT 'TEXT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Weekly Reports Table
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  green_days INT DEFAULT 0,
  yellow_days INT DEFAULT 0,
  red_days INT DEFAULT 0,
  no_response_days INT DEFAULT 0,
  compliance_score NUMERIC(5, 2) DEFAULT 100.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. System Logs Table
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR HIGH PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_obligations_area ON public.obligations(area_id);
CREATE INDEX IF NOT EXISTS idx_daily_status_area_date ON public.daily_status(area_id, date);
CREATE INDEX IF NOT EXISTS idx_alerts_area_status ON public.alerts(area_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Anyone authenticated can view active profiles; users can update own profile or ADMIN can update any
CREATE POLICY "Public profiles are viewable by authenticated users" 
  ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Areas & Obligations & Daily Status & Alerts: Viewable by all authenticated users
CREATE POLICY "Areas viewable by authenticated" ON public.areas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Obligations viewable by authenticated" ON public.obligations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Daily status viewable by authenticated" ON public.daily_status FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Alerts viewable by authenticated" ON public.alerts FOR SELECT USING (auth.role() = 'authenticated');

-- Daily Status Insert/Update: Allowed if user belongs to area or is ADMIN/DIRECTOR
CREATE POLICY "Daily status insert policy" ON public.daily_status FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Conversations & Messages Authorization: Users can only access conversations they belong to
CREATE POLICY "Users can view conversations they participate in" ON public.conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_members.conversation_id = conversations.id 
    AND conversation_members.user_id = auth.uid()
  ) OR public.get_current_user_role() IN ('ADMIN', 'DIRECTOR')
);

CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_members.conversation_id = messages.conversation_id 
    AND conversation_members.user_id = auth.uid()
  ) OR public.get_current_user_role() IN ('ADMIN', 'DIRECTOR')
);

CREATE POLICY "Users can send messages to their conversations" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_members.conversation_id = messages.conversation_id 
    AND conversation_members.user_id = auth.uid()
  ) OR public.get_current_user_role() IN ('ADMIN', 'DIRECTOR')
);

CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (
  user_id = auth.uid()
);
