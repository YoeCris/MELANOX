-- =====================================================
-- PASO 4: CREAR BUCKET DE STORAGE
-- Ejecuta esto DESPUÉS del paso 3
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-images', 'analysis-images', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Anyone can view analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload analysis images" ON storage.objects;

-- Crear políticas nuevas
CREATE POLICY "Anyone can view analysis images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'analysis-images');

CREATE POLICY "Users can upload analysis images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'analysis-images');

