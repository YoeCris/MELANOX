-- =====================================================
-- TABLA: CONSULTATIONS
-- Almacena consultas médicas de usuarios con doctores
-- =====================================================

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  
  -- Estado de la consulta
  status TEXT NOT NULL DEFAULT 'pending',
  -- Valores: 'pending', 'in_progress', 'completed', 'cancelled'
  
  -- ==========================================
  -- DATOS DEL PACIENTE (Formulario Médico)
  -- ==========================================
  patient_full_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  patient_gender TEXT NOT NULL, -- 'male', 'female', 'other'
  patient_phone TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_address TEXT,
  
  -- Historial médico
  medical_history TEXT, -- Enfermedades previas, cirugías, etc.
  current_medications TEXT, -- Medicamentos actuales
  allergies TEXT, -- Alergias conocidas
  additional_notes TEXT, -- Notas adicionales del paciente
  
  -- ==========================================
  -- RESPUESTA DEL DOCTOR
  -- ==========================================
  doctor_diagnosis TEXT, -- Diagnóstico del doctor
  doctor_recommendations TEXT, -- Recomendaciones y tratamiento
  doctor_notes TEXT, -- Notas privadas del doctor
  doctor_response_date TIMESTAMPTZ, -- Fecha de respuesta
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT valid_gender CHECK (patient_gender IN ('male', 'female', 'other')),
  CONSTRAINT valid_age CHECK (patient_age > 0 AND patient_age < 150)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_analysis_id ON consultations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);

-- Trigger para updated_at
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

-- Comentarios
COMMENT ON TABLE consultations IS 'Consultas médicas entre usuarios y doctores';
COMMENT ON COLUMN consultations.status IS 'Estado de la consulta: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN consultations.medical_history IS 'Historial médico del paciente';
COMMENT ON COLUMN consultations.doctor_diagnosis IS 'Diagnóstico proporcionado por el doctor';
