-- Migration: Fix saved_listings RLS policies
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can save listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can unsave listings" ON saved_listings;

-- Enable RLS (if not already enabled)
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved listings
CREATE POLICY "Users can view own saved listings"
  ON saved_listings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save listings
CREATE POLICY "Users can save listings"
  ON saved_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave (delete) their own saved listings
CREATE POLICY "Users can unsave listings"
  ON saved_listings FOR DELETE
  USING (auth.uid() = user_id);

-- Also fix nda_signatures RLS if needed (the listing_id column type might need to be TEXT not UUID)
-- First check if the table exists and has correct column types
DO $$
BEGIN
  -- Drop and recreate nda_signatures table with correct TEXT type for listing_id
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'nda_signatures'
             AND column_name = 'listing_id'
             AND data_type = 'uuid') THEN

    -- Drop existing table and recreate with TEXT
    DROP TABLE IF EXISTS nda_signatures CASCADE;

    CREATE TABLE nda_signatures (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      signature_name TEXT NOT NULL,
      signed_at TIMESTAMPTZ DEFAULT NOW(),
      ip_address TEXT,
      user_agent TEXT,
      UNIQUE(user_id, listing_id)
    );

    -- Recreate indexes
    CREATE INDEX idx_nda_signatures_user_id ON nda_signatures(user_id);
    CREATE INDEX idx_nda_signatures_listing_id ON nda_signatures(listing_id);
    CREATE INDEX idx_nda_signatures_user_listing ON nda_signatures(user_id, listing_id);

    -- Enable RLS
    ALTER TABLE nda_signatures ENABLE ROW LEVEL SECURITY;

    -- Recreate policies
    CREATE POLICY "Users can view own NDA signatures"
      ON nda_signatures FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can sign NDAs"
      ON nda_signatures FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Verify the policies exist
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('saved_listings', 'nda_signatures');
