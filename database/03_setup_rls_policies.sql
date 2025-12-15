-- =====================================================
-- POLÍTICAS RLS PARA DOCTORS
-- =====================================================

-- Habilitar RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- 1. Super Admin puede ver todos los doctores
DROP POLICY IF EXISTS "Super admin can view all doctors" ON doctors;
CREATE POLICY "Super admin can view all doctors"
ON doctors
FOR SELECT
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

-- 2. Todos pueden ver doctores activos
DROP POLICY IF EXISTS "Anyone can view active doctors" ON doctors;
CREATE POLICY "Anyone can view active doctors"
ON doctors
FOR SELECT
USING (is_active = true);

-- 3. Solo super admin puede insertar doctores
DROP POLICY IF EXISTS "Super admin can insert doctors" ON doctors;
CREATE POLICY "Super admin can insert doctors"
ON doctors
FOR INSERT
WITH CHECK (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

-- 4. Solo super admin puede actualizar doctores
DROP POLICY IF EXISTS "Super admin can update doctors" ON doctors;
CREATE POLICY "Super admin can update doctors"
ON doctors
FOR UPDATE
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

-- 5. Solo super admin puede eliminar doctores
DROP POLICY IF EXISTS "Super admin can delete doctors" ON doctors;
CREATE POLICY "Super admin can delete doctors"
ON doctors
FOR DELETE
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

-- =====================================================
-- POLÍTICAS RLS PARA CONSULTATIONS
-- =====================================================

-- Habilitar RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- 1. Usuarios pueden ver sus propias consultas
DROP POLICY IF EXISTS "Users can view own consultations" ON consultations;
CREATE POLICY "Users can view own consultations"
ON consultations
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Doctores pueden ver sus consultas asignadas
DROP POLICY IF EXISTS "Doctors can view assigned consultations" ON consultations;
CREATE POLICY "Doctors can view assigned consultations"
ON consultations
FOR SELECT
USING (
  doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  )
);

-- 3. Super admin puede ver todas las consultas
DROP POLICY IF EXISTS "Super admin can view all consultations" ON consultations;
CREATE POLICY "Super admin can view all consultations"
ON consultations
FOR SELECT
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

-- 4. Usuarios autenticados pueden crear consultas
DROP POLICY IF EXISTS "Authenticated users can create consultations" ON consultations;
CREATE POLICY "Authenticated users can create consultations"
ON consultations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Doctores pueden actualizar sus consultas asignadas
DROP POLICY IF EXISTS "Doctors can update assigned consultations" ON consultations;
CREATE POLICY "Doctors can update assigned consultations"
ON consultations
FOR UPDATE
USING (
  doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  )
);

-- 6. Super admin puede actualizar cualquier consulta
DROP POLICY IF EXISTS "Super admin can update consultations" ON consultations;
CREATE POLICY "Super admin can update consultations"
ON consultations
FOR UPDATE
USING (auth.jwt() ->> 'email' = 'yoelcriscatacora@gmail.com');

-- 7. Usuarios pueden cancelar sus propias consultas pendientes
DROP POLICY IF EXISTS "Users can cancel own pending consultations" ON consultations;
CREATE POLICY "Users can cancel own pending consultations"
ON consultations
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (status = 'cancelled');
