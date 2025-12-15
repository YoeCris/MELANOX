-- =====================================================
-- MELANOX - Database Migration (SIMPLIFICADO)
-- Analysis Storage System
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE ANALYSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  
  -- Image URLs (stored in Supabase Storage)
  image_url TEXT,
  processed_image_url TEXT,
  
  -- Analysis Results
  prediction TEXT NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  
  -- Details (SOLO LOS ESENCIALES)
  lesion_type TEXT,
  risk_level TEXT,
  asymmetry TEXT,
  border TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_prediction ON analyses(prediction);
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON analyses(risk_level);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on analyses table
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analyses;

-- Policy: Users can view their own analyses + anonymous analyses
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (
    auth.uid()::text = user_id::text
    OR user_id IS NULL
  );

-- Policy: Users can insert their own analyses (or anonymous)
CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
    OR user_id IS NULL
  );

-- Policy: Users can update only their own analyses
CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete only their own analyses
CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- =====================================================
-- 4. STORAGE BUCKET FOR IMAGES
-- =====================================================

-- Create storage bucket for analysis images
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-images', 'analysis-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can upload analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Storage policies for analysis-images bucket
CREATE POLICY "Anyone can view analysis images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'analysis-images');

CREATE POLICY "Authenticated users can upload analysis images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'analysis-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anonymous users can upload analysis images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'analysis-images' 
    AND auth.role() = 'anon'
  );

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'analysis-images');

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'analysis-images');

-- =====================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_analyses_updated_at ON analyses;
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Migration completed successfully!' AS status;
