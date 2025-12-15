-- =====================================================
-- PASO 1: CREAR TABLA ANALYSES
-- Ejecuta SOLO esta sección primero
-- =====================================================

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  image_url TEXT,
  processed_image_url TEXT,
  prediction TEXT NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  lesion_type TEXT,
  risk_level TEXT,
  asymmetry TEXT,
  border TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
