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
  return (
    <div className="min-h-screen bg-dark-50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-dark-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 bg-dark-900 flex flex-col z-50 w-64',
          'transform transition-all duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'shadow-xl lg:shadow-none'
        )}
      >
        <Sidebar
          user={userData || undefined}
          counts={counts}
        />
      </aside>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        'lg:ml-64' // Push content to the right on desktop
      )}>
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-dark-200 h-14 px-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-dark-600 p-1"
          >
            <span className="sr-only">Open menu</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-dark-900 tracking-tight">BusinessFinder</span>
          <div className="w-6" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}

export default AppLayout;
