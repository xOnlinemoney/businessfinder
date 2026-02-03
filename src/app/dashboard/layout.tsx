'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { getSupabaseClient } from '@/lib/supabase/client';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_buyer: boolean;
  is_seller: boolean;
  onboarding_completed: boolean;
}

interface SidebarCounts {
  listings: number;
  inquiriesReceived: number;
  offersReceived: number;
  savedListings: number;
  myOffers: number;
  ndasSigned: number;
  unreadMessages: number;
  unreadNotifications: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [counts, setCounts] = useState<SidebarCounts>({
    listings: 0,
    inquiriesReceived: 0,
    offersReceived: 0,
    savedListings: 0,
    myOffers: 0,
    ndasSigned: 0,
    unreadMessages: 0,
    unreadNotifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode
        setUser({
          id: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          is_buyer: true,
          is_seller: false,
          onboarding_completed: true,
        });
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/auth/signin');
          return;
        }

        // Get user profile - fetch all name-related fields
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('first_name, last_name, full_name, is_buyer, is_seller, onboarding_completed, avatar_url')
          .eq('id', authUser.id)
          .single();

        // Construct name with proper fallbacks
        let displayName = 'User';
        if (profile?.first_name || profile?.last_name) {
          displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        } else if (profile?.full_name) {
          displayName = profile.full_name;
        } else if (authUser.email) {
          displayName = authUser.email.split('@')[0];
        }

        const userData: UserData = {
          id: authUser.id,
          name: displayName,
          email: authUser.email || '',
          avatar: profile?.avatar_url || undefined,
          is_buyer: profile?.is_buyer ?? true,
          is_seller: profile?.is_seller ?? false,
          onboarding_completed: profile?.onboarding_completed ?? false,
        };

        setUser(userData);

        // Fetch counts based on role
        const newCounts: SidebarCounts = {
          listings: 0,
          inquiriesReceived: 0,
          offersReceived: 0,
          savedListings: 0,
          myOffers: 0,
          ndasSigned: 0,
          unreadMessages: 0,
          unreadNotifications: 0,
        };

        // Seller counts
        if (userData.is_seller) {
          // Listings count
          const { count: listingsCount } = await (supabase.from('listings') as any)
            .select('id', { count: 'exact', head: true })
            .eq('seller_id', authUser.id);
          newCounts.listings = listingsCount || 0;

          // Get listing IDs for related queries
          const { data: userListings } = await (supabase.from('listings') as any)
            .select('id')
            .eq('seller_id', authUser.id);

          const listingIds = userListings?.map((l: any) => l.id) || [];

          if (listingIds.length > 0) {
            // Inquiries received on seller's listings
            const { count: inquiriesCount } = await (supabase.from('inquiries') as any)
              .select('id', { count: 'exact', head: true })
              .in('listing_id', listingIds)
              .eq('status', 'pending');
            newCounts.inquiriesReceived = inquiriesCount || 0;

            // Offers received on seller's listings
            const { count: offersReceivedCount } = await (supabase.from('offers') as any)
              .select('id', { count: 'exact', head: true })
              .in('listing_id', listingIds)
              .eq('status', 'pending');
            newCounts.offersReceived = offersReceivedCount || 0;
          }
        }

        // Buyer counts
        if (userData.is_buyer) {
          // Saved listings
          const { count: savedCount } = await (supabase.from('saved_listings') as any)
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authUser.id);
          newCounts.savedListings = savedCount || 0;

          // My offers (as buyer)
          const { count: myOffersCount } = await (supabase.from('offers') as any)
            .select('id', { count: 'exact', head: true })
            .eq('buyer_id', authUser.id);
          newCounts.myOffers = myOffersCount || 0;

          // NDAs signed
          const { count: ndasCount } = await (supabase.from('ndas') as any)
            .select('id', { count: 'exact', head: true })
            .eq('buyer_id', authUser.id);
          newCounts.ndasSigned = ndasCount || 0;
        }

        // Message count (unread)
        const { data: conversations } = await (supabase.from('conversations') as any)
          .select('participant_1_id, participant_2_id, participant_1_unread, participant_2_unread')
          .or(`participant_1_id.eq.${authUser.id},participant_2_id.eq.${authUser.id}`);

        let unreadMessages = 0;
        if (conversations) {
          conversations.forEach((c: any) => {
            if (c.participant_1_id === authUser.id) {
              unreadMessages += c.participant_1_unread || 0;
            } else {
              unreadMessages += c.participant_2_unread || 0;
            }
          });
        }
        newCounts.unreadMessages = unreadMessages;

        // Notification count (unread)
        const { count: notifCount } = await (supabase.from('notifications') as any)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', authUser.id)
          .eq('is_read', false);
        newCounts.unreadNotifications = notifCount || 0;

        setCounts(newCounts);

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <Sidebar
        user={user ? {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        } : undefined}
        counts={counts}
        isBuyer={user?.is_buyer ?? true}
        isSeller={user?.is_seller ?? false}
      />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
