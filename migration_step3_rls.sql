-- =====================================================
-- PASO 3: CONFIGURAR RLS
-- Ejecuta esto DESPUÉS del paso 2
-- =====================================================

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analyses;

-- Crear políticas nuevas
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid()::text = user_id::text);

