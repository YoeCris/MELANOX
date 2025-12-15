-- =====================================================
-- FIX: Supabase Storage RLS para melanox-images
-- Permite subir imágenes de doctores
-- =====================================================

-- NOTA: Si el bucket no existe, créalo primero en Supabase Dashboard:
-- Storage > Create Bucket > Name: melanox-images > Public: Yes

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Super admin can manage all images" ON storage.objects;

-- 1. Permitir a usuarios autenticados subir imágenes
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'melanox-images');

-- 2. Permitir a todos ver imágenes públicas
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'melanox-images');

-- 3. Permitir a super admin gestionar todas las imágenes
CREATE POLICY "Super admin can manage all images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'melanox-images' AND
  (SELECT auth.jwt() ->> 'email') = 'yoelcriscatacora@gmail.com'
)
WITH CHECK (
  bucket_id = 'melanox-images' AND
  (SELECT auth.jwt() ->> 'email') = 'yoelcriscatacora@gmail.com'
);

SELECT 'Storage RLS configurado correctamente!' AS status;
