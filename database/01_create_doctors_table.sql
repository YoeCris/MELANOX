-- =====================================================
-- TABLA: DOCTORS
-- Almacena información de médicos dermatólogos
-- =====================================================

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del doctor
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL, -- ej: "Dermatólogo Oncólogo"
  workplace TEXT NOT NULL, -- ej: "Hospital Nacional"
  position TEXT NOT NULL, -- ej: "Jefe de Dermatología"
  profile_image_url TEXT,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON doctors(is_active);

-- Trigger para updated_at
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

-- Comentarios
COMMENT ON TABLE doctors IS 'Médicos dermatólogos registrados en el sistema';
COMMENT ON COLUMN doctors.specialization IS 'Especialización médica del doctor';
COMMENT ON COLUMN doctors.workplace IS 'Lugar de trabajo del doctor';
COMMENT ON COLUMN doctors.position IS 'Cargo o posición del doctor';
COMMENT ON COLUMN doctors.is_active IS 'Si el doctor está activo y puede recibir consultas';
