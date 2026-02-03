'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  is_buyer: boolean;
  is_seller: boolean;
  onboarding_completed: boolean;
}

interface SellerStats {
  totalListings: number;
  activeListings: number;
  draftListings: number;
  totalViews: number;
  totalInquiries: number;
  offersReceived: number;
  pendingOffers: number;
  estimatedValue: number;
}

interface BuyerStats {
  savedListings: number;
  inquiriesSent: number;
  offersMade: number;
  ndasSigned: number;
  activeConversations: number;
}

interface Listing {
  id: string;
  title: string;
  status: string;
  views: number;
  inquiries: number;
  price: number;
}

interface SavedListing {
  id: string;
  listing_id: string;
  title: string;
  asking_price: number;
  business_type: string;
  saved_at: string;
}

interface Activity {
  type: string;
  message: string;
  time: string;
  icon: string;
  color: string;
}

export function DashboardContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sellerStats, setSellerStats] = useState<SellerStats>({
    totalListings: 0,
    activeListings: 0,
    draftListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    offersReceived: 0,
    pendingOffers: 0,
    estimatedValue: 0,
  });
  const [buyerStats, setBuyerStats] = useState<BuyerStats>({
    savedListings: 0,
    inquiriesSent: 0,
    offersMade: 0,
    ndasSigned: 0,
    activeConversations: 0,
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - show empty state for new users
        setProfile({
          first_name: 'Demo',
          last_name: 'User',
          full_name: 'Demo User',
          is_buyer: true,
          is_seller: false,
          onboarding_completed: true,
        });
        setActivities([
          { type: 'welcome', message: 'Welcome to BusinessFinder! Explore the marketplace to find your perfect business.', time: 'Just now', icon: 'solar:hand-shake-linear', color: 'bg-primary/10 text-primary' },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get user profile - use select('*') to get all available fields
        const { data: userProfile } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Dashboard profile data:', userProfile);

        if (userProfile) {
          setProfile({
            first_name: userProfile.first_name || null,
            last_name: userProfile.last_name || null,
            full_name: userProfile.full_name || null,
            is_buyer: userProfile.is_buyer ?? true,
            is_seller: userProfile.is_seller ?? false,
            onboarding_completed: userProfile.onboarding_completed ?? false,
          });
        } else {
          // New user without profile
          setProfile({
            first_name: null,
            last_name: null,
            full_name: user.email?.split('@')[0] || 'User',
            is_buyer: true,
            is_seller: false,
            onboarding_completed: false,
          });
        }

        const isSeller = userProfile?.is_seller || false;
        const isBuyer = userProfile?.is_buyer || true; // Default to buyer

        // ===== SELLER DATA =====
        if (isSeller) {
          // Get user's listings with stats
          const { data: userListings } = await (supabase.from('listings') as any)
            .select('id, title, status, asking_price, views_count, inquiries_count')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (userListings && userListings.length > 0) {
            const formattedListings = userListings.map((listing: any) => ({
              id: listing.id,
              title: listing.title,
              status: listing.status,
              views: listing.views_count || 0,
              inquiries: listing.inquiries_count || 0,
              price: listing.asking_price || 0,
            }));
            setListings(formattedListings);

            // Calculate seller stats
            const totalListings = userListings.length;
            const activeListings = userListings.filter((l: any) => l.status === 'active').length;
            const draftListings = userListings.filter((l: any) => l.status === 'draft').length;
            const totalViews = userListings.reduce((sum: number, l: any) => sum + (l.views_count || 0), 0);
            const totalInquiries = userListings.reduce((sum: number, l: any) => sum + (l.inquiries_count || 0), 0);
            const estimatedValue = userListings.reduce((sum: number, l: any) => sum + (l.asking_price || 0), 0);

            // Get offers received
            const listingIds = userListings.map((l: any) => l.id);
            const { data: offers } = await (supabase.from('offers') as any)
              .select('id, status')
              .in('listing_id', listingIds);

            const offersReceived = offers?.length || 0;
            const pendingOffers = offers?.filter((o: any) => o.status === 'pending').length || 0;

            setSellerStats({
              totalListings,
              activeListings,
              draftListings,
              totalViews,
              totalInquiries,
              offersReceived,
              pendingOffers,
              estimatedValue,
            });
          }
        }

        // ===== BUYER DATA =====
        if (isBuyer) {
          // Get saved listings
          const { data: saved } = await (supabase.from('saved_listings') as any)
            .select(`
              id,
              listing_id,
              created_at,
              listings:listing_id (
                title,
                asking_price,
                business_type
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (saved && saved.length > 0) {
            const formattedSaved = saved.map((s: any) => ({
              id: s.id,
              listing_id: s.listing_id,
              title: s.listings?.title || 'Untitled',
              asking_price: s.listings?.asking_price || 0,
              business_type: s.listings?.business_type || 'other',
              saved_at: s.created_at,
            }));
            setSavedListings(formattedSaved);
          }

          // Get buyer stats
          const { count: savedCount } = await (supabase.from('saved_listings') as any)
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

          const { count: inquiriesCount } = await (supabase.from('inquiries') as any)
            .select('id', { count: 'exact', head: true })
            .eq('buyer_id', user.id);

          const { count: offersCount } = await (supabase.from('offers') as any)
            .select('id', { count: 'exact', head: true })
            .eq('buyer_id', user.id);

          const { count: ndasCount } = await (supabase.from('ndas') as any)
            .select('id', { count: 'exact', head: true })
            .eq('buyer_id', user.id);

          const { count: conversationsCount } = await (supabase.from('conversations') as any)
            .select('id', { count: 'exact', head: true })
            .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

          setBuyerStats({
            savedListings: savedCount || 0,
            inquiriesSent: inquiriesCount || 0,
            offersMade: offersCount || 0,
            ndasSigned: ndasCount || 0,
            activeConversations: conversationsCount || 0,
          });
        }

        // ===== ACTIVITY & NOTIFICATIONS =====
        const { data: notifications } = await (supabase.from('notifications') as any)
          .select('id, type, title, body, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (notifications && notifications.length > 0) {
          setActivities(notifications.map((n: any) => ({
            type: n.type,
            message: n.body || n.title,
            time: formatRelativeTime(n.created_at),
            icon: getActivityIcon(n.type),
            color: getActivityColor(n.type),
          })));
        } else {
          // Welcome message for new users
          const welcomeMessage = isSeller
            ? 'Welcome to BusinessFinder! Start by creating your first listing.'
            : 'Welcome to BusinessFinder! Explore the marketplace to find your perfect business.';
          setActivities([
            { type: 'welcome', message: welcomeMessage, time: 'Just now', icon: 'solar:hand-shake-linear', color: 'bg-primary/10 text-primary' },
          ]);
        }

        // Get unread message count from conversations
        const { data: conversations } = await (supabase.from('conversations') as any)
          .select('participant_1_id, participant_2_id, participant_1_unread, participant_2_unread')
          .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

        let unreadCount = 0;
        if (conversations) {
          conversations.forEach((c: any) => {
            if (c.participant_1_id === user.id) {
              unreadCount += c.participant_1_unread || 0;
            } else {
              unreadCount += c.participant_2_unread || 0;
            }
          });
        }
        setUnreadMessages(unreadCount);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string): string => {
    const icons: Record<string, string> = {
      inquiry: 'solar:chat-round-dots-linear',
      view: 'solar:eye-linear',
      offer: 'solar:document-text-linear',
      nda: 'solar:shield-check-linear',
      message: 'solar:letter-linear',
      welcome: 'solar:hand-shake-linear',
      listing_view: 'solar:eye-linear',
      saved: 'solar:heart-linear',
      nda_signed: 'solar:shield-check-linear',
      system: 'solar:bell-linear',
    };
    return icons[type] || 'solar:bell-linear';
  };

  const getActivityColor = (type: string): string => {
    const colors: Record<string, string> = {
      inquiry: 'bg-purple-100 text-purple-600',
      view: 'bg-blue-100 text-blue-600',
      offer: 'bg-amber-100 text-amber-600',
      nda: 'bg-emerald-100 text-emerald-600',
      message: 'bg-primary/10 text-primary',
      welcome: 'bg-primary/10 text-primary',
      listing_view: 'bg-blue-100 text-blue-600',
      saved: 'bg-rose-100 text-rose-600',
      nda_signed: 'bg-emerald-100 text-emerald-600',
      system: 'bg-dark-100 text-dark-600',
    };
    return colors[type] || 'bg-dark-100 text-dark-600';
  };

  const getFirstName = (): string => {
    // Prefer first_name if available
    if (profile?.first_name) return profile.first_name;
    // Fall back to full_name
    if (profile?.full_name) {
      const firstName = profile.full_name.split(' ')[0];
      return firstName || 'there';
    }
    return 'there';
  };

  const isSeller = profile?.is_seller || false;
  const isBuyer = profile?.is_buyer || true;

  // Stats config based on user role
  const sellerStatsConfig = [
    { label: 'Total Listings', value: sellerStats.totalListings, icon: 'solar:layers-linear', color: 'text-dark-600 bg-dark-100' },
    { label: 'Active', value: sellerStats.activeListings, icon: 'solar:check-circle-linear', color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Draft', value: sellerStats.draftListings, icon: 'solar:document-linear', color: 'text-amber-600 bg-amber-100' },
    { label: 'Total Views', value: sellerStats.totalViews, icon: 'solar:eye-linear', color: 'text-blue-600 bg-blue-100' },
    { label: 'Inquiries', value: sellerStats.totalInquiries, icon: 'solar:chat-round-dots-linear', color: 'text-purple-600 bg-purple-100' },
    { label: 'Offers', value: sellerStats.offersReceived, icon: 'solar:document-text-linear', color: 'text-primary bg-primary/10' },
  ];

  const buyerStatsConfig = [
    { label: 'Saved Listings', value: buyerStats.savedListings, icon: 'solar:heart-linear', color: 'text-rose-600 bg-rose-100' },
    { label: 'Inquiries Sent', value: buyerStats.inquiriesSent, icon: 'solar:chat-round-dots-linear', color: 'text-purple-600 bg-purple-100' },
    { label: 'Offers Made', value: buyerStats.offersMade, icon: 'solar:document-text-linear', color: 'text-amber-600 bg-amber-100' },
    { label: 'NDAs Signed', value: buyerStats.ndasSigned, icon: 'solar:shield-check-linear', color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Conversations', value: buyerStats.activeConversations, icon: 'solar:chat-line-linear', color: 'text-blue-600 bg-blue-100' },
  ];

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900 tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/notifications" className="p-2 text-dark-500 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-colors relative">
            <Icon icon="solar:bell-linear" width={22} />
            {activities.length > 0 && activities[0].type !== 'welcome' && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </Link>
          <Link href="/dashboard/messages" className="p-2 text-dark-500 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-colors relative">
            <Icon icon="solar:letter-linear" width={22} />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 px-1 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full ring-2 ring-white">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            {isLoading ? (
              <div className="h-8 w-48 bg-dark-100 rounded animate-pulse mb-2" />
            ) : (
              <h2 className="text-2xl font-bold text-dark-900 tracking-tight">
                Welcome back, {getFirstName()}
              </h2>
            )}
            <p className="text-dark-500 mt-1">
              {isSeller && isBuyer
                ? "Here's what's happening with your account"
                : isSeller
                ? "Here's what's happening with your listings"
                : "Explore businesses and track your activity"}
            </p>
          </div>
          {isSeller ? (
            <Link href="/dashboard/listings/new">
              <Button leftIcon={<Icon icon="solar:add-circle-linear" width={18} />}>
                Create Listing
              </Button>
            </Link>
          ) : (
            <Link href="/marketplace">
              <Button leftIcon={<Icon icon="solar:magnifer-linear" width={18} />}>
                Browse Marketplace
              </Button>
            </Link>
          )}
        </div>

        {/* Onboarding prompt for new users */}
        {!isLoading && profile && !profile.onboarding_completed && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon icon="solar:user-check-rounded-linear" className="text-primary" width={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-dark-900 mb-1">Complete Your Profile</h3>
                <p className="text-sm text-dark-500">
                  Finish setting up your account to get the most out of BusinessFinder
                </p>
              </div>
              <Link href="/onboarding">
                <Button size="sm">Complete Setup</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Seller Stats */}
        {isSeller && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="solar:shop-linear" className="text-emerald-600" width={20} />
              <h3 className="font-semibold text-dark-900">Seller Overview</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {sellerStatsConfig.map((stat) => (
                <Card key={stat.label} padding="md">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    <Icon icon={stat.icon} width={22} />
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-dark-100 rounded animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-dark-900 tracking-tight">{stat.value.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-dark-500 font-medium">{stat.label}</p>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Buyer Stats */}
        {isBuyer && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="solar:bag-3-linear" className="text-purple-600" width={20} />
              <h3 className="font-semibold text-dark-900">Buyer Activity</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {buyerStatsConfig.map((stat) => (
                <Card key={stat.label} padding="md">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    <Icon icon={stat.icon} width={22} />
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-dark-100 rounded animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-dark-900 tracking-tight">{stat.value.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-dark-500 font-medium">{stat.label}</p>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Seller: My Listings / Buyer: Saved Listings */}
          <div className="lg:col-span-2">
            <Card padding="none">
              <div className="flex items-center justify-between p-5 border-b border-dark-200">
                <h3 className="font-bold text-dark-900">
                  {isSeller ? 'My Listings' : 'Saved Listings'}
                </h3>
                <Link
                  href={isSeller ? '/dashboard/listings' : '/dashboard/saved'}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="divide-y divide-dark-100">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="h-5 w-48 bg-dark-100 rounded mb-2" />
                          <div className="h-4 w-32 bg-dark-100 rounded" />
                        </div>
                        <div className="h-6 w-24 bg-dark-100 rounded" />
                      </div>
                    </div>
                  ))
                ) : isSeller && listings.length > 0 ? (
                  listings.map((listing) => (
                    <div key={listing.id} className="p-4 hover:bg-dark-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="font-medium text-dark-900 truncate">{listing.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge
                              variant={
                                listing.status === 'active' ? 'success' :
                                listing.status === 'pending_review' ? 'warning' :
                                listing.status === 'draft' ? 'default' : 'default'
                              }
                              size="sm"
                            >
                              {listing.status === 'pending_review' ? 'Pending' : listing.status}
                            </Badge>
                            <span className="text-xs text-dark-500">{listing.views} views</span>
                            <span className="text-xs text-dark-500">{listing.inquiries} inquiries</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-dark-900">{formatCurrency(listing.price, true)}</p>
                          <Link href={`/dashboard/listings/${listing.id}`} className="text-xs text-primary hover:text-primary-dark">
                            Manage
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : !isSeller && savedListings.length > 0 ? (
                  savedListings.map((saved) => (
                    <div key={saved.id} className="p-4 hover:bg-dark-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="font-medium text-dark-900 truncate">{saved.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="default" size="sm">
                              {saved.business_type}
                            </Badge>
                            <span className="text-xs text-dark-500">
                              Saved {formatRelativeTime(saved.saved_at)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-dark-900">{formatCurrency(saved.asking_price, true)}</p>
                          <Link href={`/listing/${saved.listing_id}`} className="text-xs text-primary hover:text-primary-dark">
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon icon={isSeller ? 'solar:shop-linear' : 'solar:heart-linear'} className="text-dark-400" width={28} />
                    </div>
                    <h4 className="font-medium text-dark-900 mb-2">
                      {isSeller ? 'No listings yet' : 'No saved listings'}
                    </h4>
                    <p className="text-sm text-dark-500 mb-4">
                      {isSeller
                        ? 'Start by listing your first business for sale'
                        : 'Save listings you\'re interested in to track them here'}
                    </p>
                    <Link href={isSeller ? '/dashboard/listings/new' : '/marketplace'}>
                      <Button size="sm">
                        <Icon icon={isSeller ? 'solar:add-circle-linear' : 'solar:magnifer-linear'} width={16} className="mr-2" />
                        {isSeller ? 'Create Listing' : 'Browse Marketplace'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card padding="none">
              <div className="p-5 border-b border-dark-200">
                <h3 className="font-bold text-dark-900">Recent Activity</h3>
              </div>
              <div className="p-4 space-y-4">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-lg bg-dark-100" />
                      <div className="flex-1">
                        <div className="h-4 w-full bg-dark-100 rounded mb-2" />
                        <div className="h-3 w-20 bg-dark-100 rounded" />
                      </div>
                    </div>
                  ))
                ) : activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${activity.color}`}>
                        <Icon icon={activity.icon} width={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-dark-700 leading-snug">{activity.message}</p>
                        <p className="text-xs text-dark-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-dark-500">
                    <Icon icon="solar:clock-circle-linear" width={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-dark-100">
                <Link href="/dashboard/notifications" className="text-sm text-primary hover:text-primary-dark font-medium">
                  View All Activity →
                </Link>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card padding="md" className="mt-6">
              <h3 className="font-bold text-dark-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/marketplace" className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon icon="solar:magnifer-linear" className="text-blue-600" width={18} />
                  </div>
                  <span className="text-sm font-medium text-dark-700">Browse Marketplace</span>
                </Link>
                {isSeller && (
                  <Link href="/dashboard/listings/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Icon icon="solar:add-circle-linear" className="text-emerald-600" width={18} />
                    </div>
                    <span className="text-sm font-medium text-dark-700">Create New Listing</span>
                  </Link>
                )}
                <Link href="/dashboard/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Icon icon="solar:chat-round-dots-linear" className="text-purple-600" width={18} />
                  </div>
                  <span className="text-sm font-medium text-dark-700">View Messages</span>
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-dark-100 flex items-center justify-center">
                    <Icon icon="solar:settings-linear" className="text-dark-600" width={18} />
                  </div>
                  <span className="text-sm font-medium text-dark-700">Account Settings</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

export default DashboardContent;
