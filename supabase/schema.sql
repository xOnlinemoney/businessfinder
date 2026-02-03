-- BusinessFinder Database Schema for Supabase
-- Run this in the Supabase SQL Editor to create all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate random alphanumeric IDs for listings (10-20 chars)
CREATE OR REPLACE FUNCTION generate_listing_id(length INT DEFAULT 16)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate URL-safe slugs
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USERS & PROFILES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company_name TEXT,
  bio TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',

  -- Role management (users can be both buyers and sellers)
  is_seller BOOLEAN DEFAULT FALSE,
  is_buyer BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,

  -- Seller-specific fields
  seller_verified BOOLEAN DEFAULT FALSE,
  seller_rating DECIMAL(3,2) DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,

  -- Buyer-specific fields
  investment_range_min DECIMAL(15,2),
  investment_range_max DECIMAL(15,2),
  interested_categories TEXT[], -- Array of category slugs

  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTINGS
-- ============================================

-- Business categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Iconify icon name
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business listings
CREATE TABLE IF NOT EXISTS listings (
  -- Use random alphanumeric ID instead of sequential
  id TEXT PRIMARY KEY DEFAULT generate_listing_id(16),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,

  -- Business details
  business_type TEXT NOT NULL, -- 'saas', 'ecommerce', 'app', 'content', 'service', 'other'
  category_id UUID REFERENCES categories(id),
  industry TEXT,

  -- Location
  location TEXT,
  country TEXT,
  is_remote BOOLEAN DEFAULT TRUE,

  -- Financial info
  asking_price DECIMAL(15,2) NOT NULL,
  revenue_monthly DECIMAL(15,2),
  revenue_yearly DECIMAL(15,2),
  profit_monthly DECIMAL(15,2),
  profit_yearly DECIMAL(15,2),
  profit_margin DECIMAL(5,2),
  revenue_multiple DECIMAL(5,2),

  -- Business metrics
  founded_year INTEGER,
  employees_count INTEGER DEFAULT 0,
  customers_count INTEGER DEFAULT 0,
  mrr DECIMAL(15,2), -- Monthly Recurring Revenue
  arr DECIMAL(15,2), -- Annual Recurring Revenue
  churn_rate DECIMAL(5,2),
  ltv DECIMAL(15,2), -- Lifetime Value
  cac DECIMAL(15,2), -- Customer Acquisition Cost

  -- Tech stack (for SaaS/Apps)
  tech_stack TEXT[],

  -- Traffic & Marketing
  monthly_traffic INTEGER,
  traffic_sources JSONB,

  -- Assets included
  assets_included TEXT[],

  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[],
  pitch_deck_url TEXT,

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'pending_review', 'active', 'under_offer', 'sold', 'archived'
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  pnl_verified BOOLEAN DEFAULT FALSE,

  -- Visibility
  is_confidential BOOLEAN DEFAULT FALSE,
  requires_nda BOOLEAN DEFAULT FALSE,

  -- Views & engagement
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[]
);

-- Generate slug on insert
CREATE OR REPLACE FUNCTION listing_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title) || '-' || substring(NEW.id from 1 for 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_slug_trigger
  BEFORE INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION listing_generate_slug();

-- ============================================
-- FINANCIAL DATA (P&L)
-- ============================================

-- P&L Monthly Data
CREATE TABLE IF NOT EXISTS listing_financials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,

  -- Date info
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  date_key TEXT NOT NULL, -- e.g., "January-2024" for merging

  -- Financial data
  revenue DECIMAL(15,2) DEFAULT 0,
  cogs DECIMAL(15,2) DEFAULT 0, -- Cost of Goods Sold
  gross_profit DECIMAL(15,2) DEFAULT 0,
  marketing DECIMAL(15,2) DEFAULT 0,
  operating_expenses DECIMAL(15,2) DEFAULT 0,
  net_profit DECIMAL(15,2) DEFAULT 0,

  -- Additional metrics
  customers_acquired INTEGER,
  customers_churned INTEGER,
  active_customers INTEGER,

  -- Source tracking
  source TEXT DEFAULT 'manual', -- 'manual', 'csv_upload', 'shopify', 'stripe', etc.
  verified BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(listing_id, month, year)
);

-- Integration connections for verified P&L
CREATE TABLE IF NOT EXISTS listing_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,

  -- Integration details
  integration_type TEXT NOT NULL, -- 'shopify', 'stripe', 'quickbooks', 'xero', 'woocommerce', 'square'
  integration_name TEXT NOT NULL,

  -- OAuth tokens (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Connection status
  is_connected BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT, -- 'success', 'failed', 'in_progress'
  sync_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(listing_id, integration_type)
);

-- ============================================
-- MESSAGES & CONVERSATIONS
-- ============================================

-- Conversations between users
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,

  -- Participants
  participant_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Conversation metadata
  subject TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,

  -- Unread counts
  participant_1_unread INTEGER DEFAULT 0,
  participant_2_unread INTEGER DEFAULT 0,

  -- Status
  is_archived BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(listing_id, participant_1_id, participant_2_id)
);

-- Individual messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Message content
  content TEXT NOT NULL,

  -- Attachments
  attachments JSONB, -- Array of {name, url, type, size}

  -- Status
  status TEXT DEFAULT 'sent', -- 'sending', 'sent', 'delivered', 'read'
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OFFERS & TRANSACTIONS
-- ============================================

-- Offers on listings
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Offer details
  offer_amount DECIMAL(15,2) NOT NULL,
  offer_type TEXT DEFAULT 'cash', -- 'cash', 'financing', 'earnout', 'mixed'
  earnout_amount DECIMAL(15,2),
  earnout_terms TEXT,

  -- Additional terms
  due_diligence_days INTEGER DEFAULT 30,
  closing_timeline TEXT,
  contingencies TEXT[],
  notes TEXT,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'expired'
  seller_response TEXT,

  -- Counter offer
  counter_amount DECIMAL(15,2),
  counter_terms TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- NDA tracking
CREATE TABLE IF NOT EXISTS ndas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- NDA details
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  UNIQUE(listing_id, buyer_id)
);

-- ============================================
-- SAVED LISTINGS & SEARCHES
-- ============================================

-- Saved/favorited listings
CREATE TABLE IF NOT EXISTS saved_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)
);

-- Saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Search criteria
  name TEXT,
  filters JSONB NOT NULL, -- Stores all filter criteria

  -- Alerts
  alert_enabled BOOLEAN DEFAULT FALSE,
  alert_frequency TEXT DEFAULT 'daily', -- 'instant', 'daily', 'weekly'
  last_alert_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOG & CONTENT
-- ============================================

-- Blog posts (admin only)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- Markdown or HTML

  -- Media
  featured_image_url TEXT,

  -- Categorization
  category TEXT, -- 'guides', 'news', 'success-stories', 'tips', 'market-analysis'
  tags TEXT[],

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'

  -- Engagement
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Generate slug for blog posts
CREATE OR REPLACE FUNCTION blog_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_slug_trigger
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION blog_generate_slug();

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL, -- 'message', 'offer', 'listing_view', 'saved', 'system', etc.
  title TEXT NOT NULL,
  body TEXT,

  -- Related entities
  listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,

  -- Action URL
  action_url TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Activity details
  action TEXT NOT NULL, -- 'listing_created', 'listing_viewed', 'offer_made', etc.
  entity_type TEXT, -- 'listing', 'offer', 'message', etc.
  entity_id TEXT,

  -- Additional data
  metadata JSONB,

  -- Context
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,

  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,

  -- Status
  is_verified BOOLEAN DEFAULT FALSE, -- Verified transaction
  is_visible BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(reviewer_id, reviewed_user_id, listing_id)
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (seller_id = auth.uid());

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (seller_id = auth.uid());

-- Financials policies
CREATE POLICY "Financials viewable by listing owner"
  ON listing_financials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_financials.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "Financials editable by listing owner"
  ON listing_financials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_financials.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

-- Blog posts policies
CREATE POLICY "Published blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Only admins can create blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Listings indexes
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_business_type ON listings(business_type);
CREATE INDEX idx_listings_asking_price ON listings(asking_price);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_is_featured ON listings(is_featured) WHERE is_featured = true;

-- Financials indexes
CREATE INDEX idx_financials_listing_id ON listing_financials(listing_id);
CREATE INDEX idx_financials_date ON listing_financials(year, month);

-- Messages indexes
CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Blog indexes
CREATE INDEX idx_blog_status ON blog_posts(status);
CREATE INDEX idx_blog_published ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_category ON blog_posts(category);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('SaaS', 'saas', 'Software as a Service businesses', 'solar:cloud-bold', 1),
  ('E-Commerce', 'ecommerce', 'Online retail and e-commerce stores', 'solar:cart-large-bold', 2),
  ('Mobile Apps', 'apps', 'iOS and Android applications', 'solar:smartphone-bold', 3),
  ('Content & Media', 'content', 'Blogs, newsletters, and media sites', 'solar:document-bold', 4),
  ('Marketplace', 'marketplace', 'Two-sided marketplace platforms', 'solar:shop-bold', 5),
  ('Agency', 'agency', 'Digital agencies and service businesses', 'solar:buildings-bold', 6),
  ('Subscription Box', 'subscription-box', 'Physical subscription products', 'solar:box-bold', 7),
  ('Other', 'other', 'Other online business types', 'solar:widget-bold', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = substring(NEW.content from 1 for 100),
    participant_1_unread = CASE
      WHEN participant_1_id != NEW.sender_id THEN participant_1_unread + 1
      ELSE participant_1_unread
    END,
    participant_2_unread = CASE
      WHEN participant_2_id != NEW.sender_id THEN participant_2_unread + 1
      ELSE participant_2_unread
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to update seller listing count
CREATE OR REPLACE FUNCTION update_seller_listing_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET total_listings = total_listings + 1, is_seller = true
    WHERE id = NEW.seller_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET total_listings = total_listings - 1
    WHERE id = OLD.seller_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_count_trigger
  AFTER INSERT OR DELETE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_listing_count();
