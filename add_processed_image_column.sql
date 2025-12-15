-- =====================================================
-- AGREGAR COLUMNA FALTANTE: processed_image_url
-- Ejecuta esto en Supabase SQL Editor
-- =====================================================

ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS processed_image_url TEXT;
