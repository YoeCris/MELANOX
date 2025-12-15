-- =====================================================
-- ARREGLAR POLÍTICAS RLS PARA ADMIN DASHBOARD
-- Permitir que admins vean TODOS los análisis
-- =====================================================

-- 1. Eliminar política restrictiva de SELECT
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;

-- 2. Crear nueva política que permite:
--    - Usuarios ver sus propios análisis
--    - Admins ver TODOS los análisis
CREATE POLICY "Users can view own analyses or admins view all"
ON analyses
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com'
);

-- 3. Verificar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'analyses';
