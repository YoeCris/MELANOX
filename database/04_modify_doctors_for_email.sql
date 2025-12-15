-- =====================================================
-- MODIFICAR TABLA DOCTORS PARA USAR EMAIL
-- Permite crear doctores sin user_id, solo con email
-- =====================================================

-- 1. Agregar columna email a doctors
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 2. Hacer user_id nullable (opcional)
ALTER TABLE doctors 
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Agregar constraint para que tenga email O user_id
ALTER TABLE doctors
ADD CONSTRAINT doctors_email_or_user_id_check 
CHECK (email IS NOT NULL OR user_id IS NOT NULL);

-- 4. Crear índice en email
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);

-- 5. Actualizar constraint unique para permitir múltiples NULL en user_id
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_user_id_key;

-- Comentarios
COMMENT ON COLUMN doctors.email IS 'Email del doctor para login. Se vincula automáticamente con user_id al hacer login';
