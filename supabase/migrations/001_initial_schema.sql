-- NutriAssist Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE channel_type AS ENUM ('web', 'whatsapp');
CREATE TYPE session_status AS ENUM ('active', 'closed');
CREATE TYPE sender_type AS ENUM ('patient', 'nina', 'nutritionist');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE handoff_status AS ENUM ('pending', 'resolved');

-- Nutritionists table
CREATE TABLE nutritionists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    business_hours JSONB DEFAULT '{
        "monday": {"start": "08:00", "end": "18:00", "enabled": true},
        "tuesday": {"start": "08:00", "end": "18:00", "enabled": true},
        "wednesday": {"start": "08:00", "end": "18:00", "enabled": true},
        "thursday": {"start": "08:00", "end": "18:00", "enabled": true},
        "friday": {"start": "08:00", "end": "18:00", "enabled": true},
        "saturday": {"start": "08:00", "end": "12:00", "enabled": false},
        "sunday": {"start": "08:00", "end": "12:00", "enabled": false}
    }'::jsonb,
    faq_responses JSONB DEFAULT '{
        "price": "O valor da consulta é R$ 250,00. Aceito PIX, cartão de crédito e débito.",
        "location": "Meu consultório fica na Rua Example, 123 - Centro.",
        "preparation": "Para a primeira consulta, traga exames recentes (se tiver) e venha com roupas confortáveis para as medidas.",
        "duration": "A primeira consulta dura cerca de 1 hora. Os retornos duram aproximadamente 30 minutos.",
        "online": "Sim, atendo online! A consulta é feita por videochamada."
    }'::jsonb,
    appointment_duration INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutritionist_id UUID NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    diet_pdf_url TEXT,
    diet_extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutritionist_id UUID NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    channel channel_type DEFAULT 'web',
    status session_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender sender_type NOT NULL,
    content TEXT NOT NULL,
    intent VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutritionist_id UUID NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Handoffs table
CREATE TABLE handoffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status handoff_status DEFAULT 'pending',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_patients_nutritionist ON patients(nutritionist_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_email ON patients(email);

CREATE INDEX idx_chat_sessions_nutritionist ON chat_sessions(nutritionist_id);
CREATE INDEX idx_chat_sessions_patient ON chat_sessions(patient_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);

CREATE INDEX idx_messages_session ON messages(chat_session_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_appointments_nutritionist ON appointments(nutritionist_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_starts ON appointments(starts_at);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_handoffs_session ON handoffs(chat_session_id);
CREATE INDEX idx_handoffs_status ON handoffs(status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER nutritionists_updated_at
    BEFORE UPDATE ON nutritionists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE handoffs ENABLE ROW LEVEL SECURITY;

-- For MVP: Allow all operations (tighten in production with auth)
CREATE POLICY "Allow all for nutritionists" ON nutritionists FOR ALL USING (true);
CREATE POLICY "Allow all for patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all for chat_sessions" ON chat_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all for appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all for handoffs" ON handoffs FOR ALL USING (true);
