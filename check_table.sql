-- =====================================================
-- VERIFICAR ESTRUCTURA DE LA TABLA
-- Ejecuta esto para ver qué columnas tiene la tabla
-- =====================================================

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analyses' 
ORDER BY ordinal_position;
