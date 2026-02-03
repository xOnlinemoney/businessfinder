-- Migration: Add new listing fields for enhanced business information
-- Run this in your Supabase SQL Editor

-- Add new columns to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS customers TEXT,
ADD COLUMN IF NOT EXISTS churn_rate TEXT,
ADD COLUMN IF NOT EXISTS annual_growth TEXT,
ADD COLUMN IF NOT EXISTS tech_stack TEXT,
ADD COLUMN IF NOT EXISTS competitors TEXT,
ADD COLUMN IF NOT EXISTS business_model TEXT,
ADD COLUMN IF NOT EXISTS asking_price_reasoning TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add comments explaining each field
COMMENT ON COLUMN listings.customers IS 'Customer count or range (e.g., "500+", "100-500", "10000+")';
COMMENT ON COLUMN listings.churn_rate IS 'Monthly or annual churn rate (e.g., "3-5%", "2%")';
COMMENT ON COLUMN listings.annual_growth IS 'Year-over-year growth rate (e.g., "25%", "35%")';
COMMENT ON COLUMN listings.tech_stack IS 'Technologies used, comma-separated (e.g., "React, Node.js, PostgreSQL, AWS")';
COMMENT ON COLUMN listings.competitors IS 'Named competitors, comma-separated (e.g., "Mixpanel, Amplitude, Heap")';
COMMENT ON COLUMN listings.business_model IS 'Business model description (e.g., "B2B SaaS", "D2C Subscription", "Marketplace")';
COMMENT ON COLUMN listings.asking_price_reasoning IS 'Seller''s justification for the asking price and valuation';
COMMENT ON COLUMN listings.source_url IS 'Admin-only: Original source URL of the listing (for scraped/imported listings)';

-- Optional: Create an index on source_url for faster lookups
-- This is useful if you want to check for duplicate imports
CREATE INDEX IF NOT EXISTS idx_listings_source_url ON listings(source_url) WHERE source_url IS NOT NULL;

-- Grant appropriate permissions (adjust based on your RLS policies)
-- The existing RLS policies should automatically apply to new columns
