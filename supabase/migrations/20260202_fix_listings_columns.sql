-- Migration: Add all required columns to listings table for CSV import
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Core financial columns (may already exist - IF NOT EXISTS handles this)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS annual_revenue BIGINT DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS annual_profit BIGINT DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS asking_price BIGINT DEFAULT 0;

-- Business details columns
ALTER TABLE listings ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS highlights TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS year_established TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reason_for_selling TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Status and flags
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS requires_nda BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- New metrics columns (the ones we added earlier)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS customers TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS churn_rate TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS annual_growth TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tech_stack TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS competitors TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS asking_price_reasoning TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Timestamps
ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verify the columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;
