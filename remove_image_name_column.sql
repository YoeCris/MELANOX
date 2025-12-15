-- =====================================================
-- ELIMINAR COLUMNA image_name SI EXISTE
-- Esta columna no es parte del diseño y causa errores
-- =====================================================

-- Eliminar la restricción NOT NULL si existe
ALTER TABLE analyses 
ALTER COLUMN image_name DROP NOT NULL;

-- O eliminar la columna completamente
ALTER TABLE analyses 
DROP COLUMN IF EXISTS image_name;
