-- =====================================================
-- ARREGLAR TIPO DE DATO DE CONFIDENCE
-- La columna confidence debe ser DECIMAL, no INTEGER
-- =====================================================

-- Cambiar el tipo de dato de confidence a DECIMAL(5,2)
ALTER TABLE analyses 
ALTER COLUMN confidence TYPE DECIMAL(5,2);
