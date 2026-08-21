-- ==============================================================================
-- YGGDRON MANAGER — POSTGRESQL INITIAL DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE', -- 'OWNER', 'DIRECTOR', 'MANAGER', 'EMPLOYEE', 'ADMIN'
    area_id VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. OPERATIONAL AREAS (DEPARTMENTS)
CREATE TABLE IF NOT EXISTS areas (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DAILY CLOSINGS (FECHAMENTO DIÁRIO)
CREATE TABLE IF NOT EXISTS daily_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id VARCHAR(50) REFERENCES areas(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL, -- 'OK', 'ALERT', 'CRITICAL', 'PENDING'
    justification TEXT,
    responsible_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_daily_status_per_area_date UNIQUE (area_id, date)
);

-- 4. OBLIGATIONS & PERIODIC ROADMAP (TAREFAS DO SETOR)
CREATE TABLE IF NOT EXISTS obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    area_id VARCHAR(50) REFERENCES areas(id) ON DELETE CASCADE,
    frequency VARCHAR(50) NOT NULL, -- 'DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL'
    due_time VARCHAR(20) DEFAULT '17:00',
    responsible_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUPPORT TICKETS & INCIDENTS (#INC)
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'TI_SUPPORTE', 'MANUTENCAO', 'SEGURANCA', 'SUPRIMENTOS', 'RH_PESSOAS'
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CORPORATE MESSAGES & AI AUDIO TRANSCRIPTS
CREATE TABLE IF NOT EXISTS audio_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    area_id VARCHAR(50) REFERENCES areas(id) ON DELETE SET NULL,
    transcript TEXT NOT NULL,
    summary TEXT,
    extracted_kpis JSONB DEFAULT '{}'::jsonb,
    audio_duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_daily_statuses_date ON daily_statuses(date);
CREATE INDEX IF NOT EXISTS idx_daily_statuses_area ON daily_statuses(area_id);
CREATE INDEX IF NOT EXISTS idx_obligations_area ON obligations(area_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
