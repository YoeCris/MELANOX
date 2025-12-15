-- =====================================================
-- PASO 2: CREAR ÍNDICES
-- Ejecuta esto DESPUÉS del paso 1
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_prediction ON analyses(prediction);
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON analyses(risk_level);
