-- =====================================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN
-- Ejecuta este archivo en Supabase SQL Editor
-- =====================================================

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREAR TABLA DOCTORS
-- =====================================================

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  workplace TEXT NOT NULL,
  position TEXT NOT NULL,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON doctors(is_active);

-- =====================================================
-- 2. CREAR TABLA CONSULTATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  patient_full_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  patient_gender TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_address TEXT,
  medical_history TEXT,
  current_medications TEXT,
  allergies TEXT,
  additional_notes TEXT,
  doctor_diagnosis TEXT,
  doctor_recommendations TEXT,
  doctor_notes TEXT,
  doctor_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT valid_gender CHECK (patient_gender IN ('male', 'female', 'other')),
  CONSTRAINT valid_age CHECK (patient_age > 0 AND patient_age < 150)
);

CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_analysis_id ON consultations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);

-- =====================================================
-- 3. TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_doctors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_doctors_updated_at();

CREATE OR REPLACE FUNCTION update_consultations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_consultations_updated_at();

-- =====================================================
-- 4. RLS POLICIES - DOCTORS
-- =====================================================

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can view all doctors" ON doctors;
CREATE POLICY "Super admin can view all doctors"
ON doctors FOR SELECT
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

DROP POLICY IF EXISTS "Anyone can view active doctors" ON doctors;
CREATE POLICY "Anyone can view active doctors"
ON doctors FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Super admin can manage doctors" ON doctors;
CREATE POLICY "Super admin can manage doctors"
ON doctors FOR ALL
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

-- =====================================================
-- 5. RLS POLICIES - CONSULTATIONS
-- =====================================================

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own consultations" ON consultations;
CREATE POLICY "Users can view own consultations"
ON consultations FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors can view assigned consultations" ON consultations;
CREATE POLICY "Doctors can view assigned consultations"
ON consultations FOR SELECT
USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Super admin can view all consultations" ON consultations;
CREATE POLICY "Super admin can view all consultations"
ON consultations FOR SELECT
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

DROP POLICY IF EXISTS "Authenticated users can create consultations" ON consultations;
CREATE POLICY "Authenticated users can create consultations"
ON consultations FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors can update assigned consultations" ON consultations;
CREATE POLICY "Doctors can update assigned consultations"
ON consultations FOR UPDATE
USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Super admin can update consultations" ON consultations;
CREATE POLICY "Super admin can update consultations"
ON consultations FOR UPDATE
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 'Configuración completada exitosamente!' AS status;
