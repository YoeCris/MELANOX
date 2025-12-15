-- =====================================================
-- ARREGLAR RELACIÓN ENTRE ANALYSES Y AUTH.USERS
-- Error: Could not find a relationship between 'analyses' and 'users'
-- =====================================================

-- Primero, eliminar la constraint existente si existe
ALTER TABLE analyses 
DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;

-- Agregar la constraint correcta que referencia auth.users
ALTER TABLE analyses
ADD CONSTRAINT analyses_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Verificar que la relación existe
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'analyses' 
  AND tc.constraint_type = 'FOREIGN KEY';
