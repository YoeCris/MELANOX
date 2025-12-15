-- =====================================================
-- AGREGAR COLUMNAS FALTANTES
-- Si la tabla no tiene created_at y updated_at, ejecuta esto
-- =====================================================

ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
