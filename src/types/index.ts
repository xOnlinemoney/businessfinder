// Business Listing Types
export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  businessModel: BusinessModel;
  askingPrice: number;
  revenue: number;
  profit: number;
  margin: number;
  multiple: number;
  location: string;
  established: number;
  employees: string;
  ownerHours: string;
  monthlyVisitors?: number;
  subscribers?: number;
  customers?: number;
  isVerified: boolean;
  isConfidential: boolean;
  ndaRequired: boolean;
  status: ListingStatus;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
}

export type ListingCategory =
  | 'saas'
  | 'ecommerce'
  | 'content'
  | 'agency'
  | 'marketplace'
  | 'mobile-app'
  | 'newsletter'
  | 'other';

export type BusinessModel =
  | 'subscription'
  | 'one-time'
  | 'advertising'
  | 'affiliate'
  | 'services'
  | 'hybrid';

export type ListingStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'under-offer'
  | 'sold'
  | 'withdrawn';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  accountType: AccountType;
  isVerified: boolean;
  createdAt: Date;
}

export type UserRole = 'user' | 'admin' | 'super-admin';
export type AccountType = 'buyer' | 'seller' | 'both';

// NDA Types
export interface NDA {
  id: string;
  listingId: string;
  userId: string;
  signedAt: Date;
  fullName: string;
  signature: string;
}

// Inquiry Types
export interface Inquiry {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
}

export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';

// Offer Types
export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
  status: OfferStatus;
  createdAt: Date;
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';

// Transaction Types
export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  stage: TransactionStage;
  createdAt: Date;
  completedAt?: Date;
}

export type TransactionStage =
  | 'inquiry'
  | 'negotiation'
  | 'loi'
  | 'diligence'
  | 'escrow'
  | 'closing'
  | 'completed';

// Blog/Article Types
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: ArticleCategory;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  readingTime: number;
  status: ArticleStatus;
  publishedAt?: Date;
  createdAt: Date;
}

export type ArticleCategory =
  | 'guides'
  | 'analysis'
  | 'case-studies'
  | 'news'
  | 'tips';

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
}

// Filter Types
export interface ListingFilters {
  category?: ListingCategory[];
  priceMin?: number;
  priceMax?: number;
  revenueMin?: number;
  revenueMax?: number;
  location?: string;
  businessModel?: BusinessModel[];
  sort?: 'newest' | 'price-low' | 'price-high' | 'revenue';
}

// Stats Types
export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  pendingOffers: number;
  totalRevenue?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingVerifications: number;
}
