'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Footer } from './footer';
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

interface PageShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerClassName?: string;
  mainClassName?: string;
}

export function PageShell({
  children,
  showHeader = true,
  showFooter = true,
  headerClassName,
  mainClassName,
}: PageShellProps) {
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
          const [listingsResult, savedResult, ndasResult] = await Promise.all([
            supabase.from('listings').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
            supabase.from('saved_listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('nda_signatures').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
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


  // While loading, show regular layout
  if (isLoading) {
    return (
      <>
        {showHeader && <Header />}
        <main className={mainClassName}>{children}</main>
        {showFooter && <Footer />}
      </>
    );
  }

  // If not logged in, show regular layout
  if (!isLoggedIn) {
    return (
      <>
        {showHeader && <Header />}
        <main className={mainClassName}>{children}</main>
        {showFooter && <Footer />}
      </>
    );
  }

  // Logged in - show with sidebar
  // Note: Sidebar component handles its own mobile menu, overlay, and header internally
  return (
    <div className="min-h-screen bg-dark-50">
      {/* Sidebar - handles its own mobile menu internally */}
      <Sidebar
        user={userData || undefined}
        counts={counts}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300 min-h-screen flex flex-col',
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        {/* Page Content */}
        <main className={mainClassName}>{children}</main>
        {showFooter && <Footer />}
      </div>
    </div>
  );
}

export default PageShell;
