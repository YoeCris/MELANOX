-- =====================================================
-- FIX: Políticas RLS para permitir crear doctores
-- Versión actualizada con DROP IF EXISTS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Super admin full access" ON doctors;
DROP POLICY IF EXISTS "Super admin can manage doctors" ON doctors;
DROP POLICY IF EXISTS "Super admin can view all doctors" ON doctors;
DROP POLICY IF EXISTS "Anyone can view active doctors" ON doctors;
DROP POLICY IF EXISTS "Authenticated users can view active doctors" ON doctors;

-- Crear política única para super admin con todos los permisos
CREATE POLICY "Super admin full access"
ON doctors FOR ALL
TO authenticated
USING (
  (SELECT auth.jwt() ->> 'email') = 'yoelcriscatacora@gmail.com'
)
WITH CHECK (
  (SELECT auth.jwt() ->> 'email') = 'yoelcriscatacora@gmail.com'
);

-- Permitir a usuarios autenticados ver doctores activos
CREATE POLICY "Authenticated users can view active doctors"
ON doctors FOR SELECT
TO authenticated
USING (is_active = true);

-- Verificar
SELECT 'Políticas RLS actualizadas correctamente!' AS status;
