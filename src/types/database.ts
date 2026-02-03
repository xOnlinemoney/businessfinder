// Database Types for Supabase
// Auto-generated types matching the database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// USER & PROFILE TYPES
// ============================================

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  phone_country_code: string | null;
  company_name: string | null;
  bio: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  location: string | null;
  timezone: string;

  // Role management
  is_seller: boolean;
  is_buyer: boolean;
  is_admin: boolean;

  // Seller-specific
  seller_verified: boolean;
  seller_rating: number;
  total_listings: number;
  total_sales: number;

  // Buyer-specific
  investment_range_min: number | null;
  investment_range_max: number | null;
  interested_categories: string[] | null;
  investor_type: 'individual' | 'private_equity' | 'hedge_fund' | 'family_office' | 'search_fund' | 'strategic_buyer' | null;

  // Onboarding status
  onboarding_completed: boolean;

  // Notifications
  email_notifications: boolean;
  sms_notifications: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface ProfileInsert extends Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>> {
  id: string;
  email: string;
}

export interface ProfileUpdate extends Partial<Omit<Profile, 'id' | 'email' | 'created_at'>> {}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  display_order: number;
  created_at: string;
}

// ============================================
// LISTING TYPES
// ============================================

export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'under_offer' | 'sold' | 'archived';
export type BusinessType = 'saas' | 'ecommerce' | 'app' | 'content' | 'service' | 'marketplace' | 'other';

export interface Listing {
  id: string; // Random alphanumeric ID
  seller_id: string;

  // Basic info
  title: string;
  slug: string | null;
  description: string | null;
  short_description: string | null;

  // Business details
  business_type: BusinessType;
  category_id: string | null;
  industry: string | null;

  // Location
  location: string | null;
  country: string | null;
  is_remote: boolean;

  // Financial info
  asking_price: number;
  revenue_monthly: number | null;
  revenue_yearly: number | null;
  profit_monthly: number | null;
  profit_yearly: number | null;
  profit_margin: number | null;
  revenue_multiple: number | null;

  // Business metrics
  founded_year: number | null;
  employees_count: number;
  customers_count: number;
  mrr: number | null;
  arr: number | null;
  churn_rate: number | null;
  ltv: number | null;
  cac: number | null;

  // Tech stack
  tech_stack: string[] | null;

  // Traffic
  monthly_traffic: number | null;
  traffic_sources: TrafficSources | null;

  // Assets
  assets_included: string[] | null;

  // Media
  logo_url: string | null;
  cover_image_url: string | null;
  gallery_images: string[] | null;
  pitch_deck_url: string | null;

  // Status
  status: ListingStatus;
  is_featured: boolean;
  is_verified: boolean;
  pnl_verified: boolean;

  // Visibility
  is_confidential: boolean;
  requires_nda: boolean;

  // Engagement
  views_count: number;
  saves_count: number;
  inquiries_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
  sold_at: string | null;

  // SEO
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;

  // Relations (populated via joins)
  seller?: Profile;
  category?: Category;
  financials?: ListingFinancial[];
}

export interface TrafficSources {
  organic: number;
  direct: number;
  social: number;
  referral: number;
  paid: number;
  email: number;
}

export interface ListingInsert extends Partial<Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'saves_count' | 'inquiries_count'>> {
  seller_id: string;
  title: string;
  business_type: BusinessType;
  asking_price: number;
}

export interface ListingUpdate extends Partial<Omit<Listing, 'id' | 'seller_id' | 'created_at'>> {}

// ============================================
// FINANCIAL DATA TYPES
// ============================================

export type FinancialSource = 'manual' | 'csv_upload' | 'shopify' | 'stripe' | 'quickbooks' | 'xero' | 'woocommerce' | 'square';

export interface ListingFinancial {
  id: string;
  listing_id: string;

  // Date info
  month: number;
  year: number;
  date_key: string;

  // Financial data
  revenue: number;
  cogs: number;
  gross_profit: number;
  marketing: number;
  operating_expenses: number;
  net_profit: number;

  // Additional metrics
  customers_acquired: number | null;
  customers_churned: number | null;
  active_customers: number | null;

  // Source
  source: FinancialSource;
  verified: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ListingFinancialInsert extends Omit<ListingFinancial, 'id' | 'created_at' | 'updated_at'> {}

// ============================================
// INTEGRATION TYPES
// ============================================

export type IntegrationType = 'shopify' | 'stripe' | 'quickbooks' | 'xero' | 'woocommerce' | 'square';

export interface ListingIntegration {
  id: string;
  listing_id: string;
  integration_type: IntegrationType;
  integration_name: string;
  is_connected: boolean;
  last_sync_at: string | null;
  sync_status: 'success' | 'failed' | 'in_progress' | null;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// MESSAGE & CONVERSATION TYPES
// ============================================

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Conversation {
  id: string;
  listing_id: string | null;
  participant_1_id: string;
  participant_2_id: string;
  subject: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  participant_1_unread: number;
  participant_2_unread: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  participant_1?: Profile;
  participant_2?: Profile;
  listing?: Listing;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments: MessageAttachment[] | null;
  status: MessageStatus;
  read_at: string | null;
  created_at: string;

  // Relations
  sender?: Profile;
}

export interface MessageAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface MessageInsert {
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments?: MessageAttachment[] | null;
}

// ============================================
// OFFER TYPES
// ============================================

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn' | 'expired';
export type OfferType = 'cash' | 'financing' | 'earnout' | 'mixed';

export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;

  // Offer details
  offer_amount: number;
  offer_type: OfferType;
  earnout_amount: number | null;
  earnout_terms: string | null;

  // Terms
  due_diligence_days: number;
  closing_timeline: string | null;
  contingencies: string[] | null;
  notes: string | null;

  // Status
  status: OfferStatus;
  seller_response: string | null;

  // Counter offer
  counter_amount: number | null;
  counter_terms: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;

  // Relations
  buyer?: Profile;
  listing?: Listing;
}

// ============================================
// NDA TYPES
// ============================================

export interface NDA {
  id: string;
  listing_id: string;
  buyer_id: string;
  signed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  revoked_at: string | null;
  revoked_reason: string | null;
}

// ============================================
// SAVED LISTINGS & SEARCHES
// ============================================

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  notes: string | null;
  created_at: string;

  // Relations
  listing?: Listing;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string | null;
  filters: SearchFilters;
  alert_enabled: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly';
  last_alert_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  business_type?: BusinessType[];
  price_min?: number;
  price_max?: number;
  revenue_min?: number;
  revenue_max?: number;
  profit_min?: number;
  profit_max?: number;
  location?: string;
  is_remote?: boolean;
  has_verified_pnl?: boolean;
}

// ============================================
// BLOG TYPES
// ============================================

export type BlogStatus = 'draft' | 'published' | 'archived';
export type BlogCategory = 'guides' | 'news' | 'success-stories' | 'tips' | 'market-analysis';

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  category: BlogCategory | null;
  tags: string[] | null;
  status: BlogStatus;
  views_count: number;
  likes_count: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;

  // Relations
  author?: Profile;
}

export interface BlogPostInsert extends Omit<BlogPost, 'id' | 'slug' | 'created_at' | 'updated_at' | 'views_count' | 'likes_count'> {}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'message' | 'offer' | 'listing_view' | 'saved' | 'system' | 'inquiry' | 'nda_signed';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  listing_id: string | null;
  conversation_id: string | null;
  offer_id: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// ============================================
// ACTIVITY LOG TYPES
// ============================================

export type ActivityAction =
  | 'listing_created'
  | 'listing_updated'
  | 'listing_published'
  | 'listing_viewed'
  | 'listing_saved'
  | 'offer_made'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'message_sent'
  | 'nda_signed'
  | 'login'
  | 'logout';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: ActivityAction;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  listing_id: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  reviewer?: Profile;
  reviewed_user?: Profile;
}

// ============================================
// DATABASE SCHEMA TYPE (for Supabase client)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      listings: {
        Row: Listing;
        Insert: ListingInsert;
        Update: ListingUpdate;
      };
      listing_financials: {
        Row: ListingFinancial;
        Insert: ListingFinancialInsert;
        Update: Partial<ListingFinancialInsert>;
      };
      listing_integrations: {
        Row: ListingIntegration;
        Insert: Omit<ListingIntegration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ListingIntegration, 'id'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'last_message_at'>;
        Update: Partial<Omit<Conversation, 'id'>>;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: Partial<Omit<Message, 'id' | 'conversation_id' | 'sender_id' | 'created_at'>>;
      };
      offers: {
        Row: Offer;
        Insert: Omit<Offer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Offer, 'id'>>;
      };
      ndas: {
        Row: NDA;
        Insert: Omit<NDA, 'id' | 'signed_at'>;
        Update: Partial<Omit<NDA, 'id'>>;
      };
      saved_listings: {
        Row: SavedListing;
        Insert: Omit<SavedListing, 'id' | 'created_at'>;
        Update: Partial<Omit<SavedListing, 'id'>>;
      };
      saved_searches: {
        Row: SavedSearch;
        Insert: Omit<SavedSearch, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SavedSearch, 'id'>>;
      };
      blog_posts: {
        Row: BlogPost;
        Insert: BlogPostInsert;
        Update: Partial<Omit<BlogPost, 'id' | 'slug'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id'>>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: never;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Review, 'id'>>;
      };
    };
    Functions: {
      generate_listing_id: {
        Args: { length?: number };
        Returns: string;
      };
      generate_slug: {
        Args: { title: string };
        Returns: string;
      };
      increment_listing_views: {
        Args: { listing_id: string };
        Returns: void;
      };
    };
  };
}
