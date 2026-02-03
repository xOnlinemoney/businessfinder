'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { getSupabaseClient } from '@/lib/supabase/client';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
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

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pages that should NOT show sidebar even when logged in
  const noSidebarPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/bf-admin-x9k4m',
  ];

  const shouldShowSidebar = isLoggedIn && !noSidebarPaths.some(path => pathname?.startsWith(path));

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);

        if (user) {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', user.id)
            .single() as { data: { first_name: string | null; last_name: string | null; email: string | null } | null };

          if (profileData) {
            const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
            setUserData({
              name: fullName || profileData.email?.split('@')[0] || 'User',
              email: profileData.email || user.email || '',
            });
          }

          // Fetch counts
          await fetchCounts(supabase, user.id);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setIsLoggedIn(!!session?.user);
        if (!session?.user) {
          setUserData(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const fetchCounts = async (supabase: any, userId: string) => {
    try {
      // Fetch counts in parallel
      const [
        listingsResult,
        savedResult,
        ndasResult,
      ] = await Promise.all([
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('seller_id', userId),
        supabase
          .from('saved_listings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('nda_signatures')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

      setCounts({
        listings: listingsResult.count || 0,
        inquiriesReceived: 0,
        offersReceived: 0,
        savedListings: savedResult.count || 0,
        myOffers: 0,
        ndasSigned: ndasResult.count || 0,
        unreadMessages: 0,
        unreadNotifications: 0,
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  // If loading, show children without sidebar (avoid flash)
  if (isLoading) {
    return <>{children}</>;
  }

  // If not logged in or on excluded pages, just show children
  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  // Logged in - show with sidebar
  // Note: Sidebar component handles its own mobile menu, overlay, and header
  return (
    <div className="min-h-screen bg-dark-50">
      {/* Sidebar - handles its own mobile menu internally */}
      <Sidebar
        user={userData || undefined}
        counts={counts}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}

export default AppLayout;
