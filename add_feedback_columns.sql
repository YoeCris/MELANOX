-- =====================================================
-- AGREGAR COLUMNA DE FEEDBACK MÉDICO
-- Para que usuarios reporten diagnóstico real del doctor
-- =====================================================

-- Agregar columna para feedback médico
ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS medical_feedback TEXT,
ADD COLUMN IF NOT EXISTS medical_diagnosis TEXT,
ADD COLUMN IF NOT EXISTS feedback_date TIMESTAMPTZ;

-- Agregar comentario explicativo
COMMENT ON COLUMN analyses.medical_feedback IS 'Comentario del usuario sobre el diagnóstico médico real';
COMMENT ON COLUMN analyses.medical_diagnosis IS 'Diagnóstico real dado por el médico (Benigno/Maligno)';
COMMENT ON COLUMN analyses.feedback_date IS 'Fecha cuando el usuario agregó el feedback';
