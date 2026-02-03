-- Migration: Add NDA signatures table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Create NDA signatures table
CREATE TABLE IF NOT EXISTS nda_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  signature_name TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,

  -- Prevent duplicate signatures
  UNIQUE(user_id, listing_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_nda_signatures_user_id ON nda_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_nda_signatures_listing_id ON nda_signatures(listing_id);
CREATE INDEX IF NOT EXISTS idx_nda_signatures_user_listing ON nda_signatures(user_id, listing_id);

-- Enable RLS
ALTER TABLE nda_signatures ENABLE ROW LEVEL SECURITY;

-- Users can view their own NDA signatures
CREATE POLICY "Users can view own NDA signatures"
  ON nda_signatures FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create NDA signatures for themselves
CREATE POLICY "Users can sign NDAs"
  ON nda_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all NDA signatures (for compliance)
CREATE POLICY "Admins can view all NDA signatures"
  ON nda_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comments
COMMENT ON TABLE nda_signatures IS 'Tracks NDA signatures by users for listings requiring NDA';
COMMENT ON COLUMN nda_signatures.signature_name IS 'The legal name typed by the user as their electronic signature';
COMMENT ON COLUMN nda_signatures.ip_address IS 'IP address at time of signing for audit purposes';
COMMENT ON COLUMN nda_signatures.user_agent IS 'Browser user agent at time of signing for audit purposes';

-- Verify table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'nda_signatures'
ORDER BY ordinal_position;
