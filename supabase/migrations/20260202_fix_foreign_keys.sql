-- Migration: Fix foreign key constraints and RLS policies
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- =============================================
-- STEP 1: Fix saved_listings table
-- =============================================

-- Drop existing foreign key constraint on saved_listings
ALTER TABLE saved_listings DROP CONSTRAINT IF EXISTS saved_listings_user_id_fkey;

-- Add new foreign key that references auth.users directly
ALTER TABLE saved_listings
  ADD CONSTRAINT saved_listings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix RLS policies for saved_listings
DROP POLICY IF EXISTS "Users can view own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can save listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can unsave listings" ON saved_listings;

ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved listings"
  ON saved_listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings"
  ON saved_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave listings"
  ON saved_listings FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- STEP 2: Fix nda_signatures table
-- =============================================

-- Check if nda_signatures exists, if not create it
CREATE TABLE IF NOT EXISTS nda_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  listing_id TEXT NOT NULL,
  signature_name TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(user_id, listing_id)
);

-- Drop and re-add foreign keys with correct types
ALTER TABLE nda_signatures DROP CONSTRAINT IF EXISTS nda_signatures_user_id_fkey;
ALTER TABLE nda_signatures DROP CONSTRAINT IF EXISTS nda_signatures_listing_id_fkey;

-- Add foreign keys
ALTER TABLE nda_signatures
  ADD CONSTRAINT nda_signatures_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE nda_signatures
  ADD CONSTRAINT nda_signatures_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_nda_signatures_user_id ON nda_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_nda_signatures_listing_id ON nda_signatures(listing_id);

-- Fix RLS policies for nda_signatures
DROP POLICY IF EXISTS "Users can view own NDA signatures" ON nda_signatures;
DROP POLICY IF EXISTS "Users can sign NDAs" ON nda_signatures;
DROP POLICY IF EXISTS "Admins can view all NDA signatures" ON nda_signatures;

ALTER TABLE nda_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own NDA signatures"
  ON nda_signatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can sign NDAs"
  ON nda_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STEP 3: Verify everything
-- =============================================

-- Check saved_listings policies
SELECT 'saved_listings policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'saved_listings';

-- Check nda_signatures policies
SELECT 'nda_signatures policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'nda_signatures';

-- Check table structures
SELECT 'saved_listings columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'saved_listings';

SELECT 'nda_signatures columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'nda_signatures';
