-- =====================================================
-- MIGRACIÓN RÁPIDA: Agregar columna email a doctors
-- Ejecuta SOLO este archivo si ya tienes la tabla doctors
-- =====================================================

-- 1. Agregar columna email
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Crear índice único en email
CREATE UNIQUE INDEX IF NOT EXISTS doctors_email_key ON doctors(email);

-- 3. Hacer user_id nullable (si no lo es)
ALTER TABLE doctors 
ALTER COLUMN user_id DROP NOT NULL;

-- 4. Verificar que funciona
SELECT 'Migración completada! Ahora puedes crear doctores con email' AS status;

-- NOTA: Después de ejecutar esto, recarga la página del admin
