'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

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
  return (
    <div className="min-h-screen bg-dark-50">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-dark-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 bg-dark-900 flex flex-col z-50',
          'transform transition-all duration-300',
          isSidebarCollapsed ? 'w-20' : 'w-64',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'shadow-xl lg:shadow-none'
        )}
      >
        <Sidebar
          user={userData || undefined}
          counts={counts}
          isCollapsed={isSidebarCollapsed}
          onCollapseChange={setIsSidebarCollapsed}
        />
      </aside>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        {/* Header for logged-in users */}
        <header className="sticky top-0 z-30 bg-white border-b border-dark-200 h-14 px-4 flex items-center justify-between">
          {/* Mobile: hamburger menu */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden text-dark-600 p-1"
          >
            <Icon icon="solar:hamburger-menu-linear" width={24} />
          </button>

          {/* Desktop: Navigation links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/marketplace" className="text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors">
              Marketplace
            </Link>
            <Link href="/financing" className="text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors">
              Financing
            </Link>
            <Link href="/resources" className="text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors">
              Resources
            </Link>
          </div>

          {/* Mobile: Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white">
              <Icon icon="solar:graph-up-linear" width={16} />
            </div>
            <span className="font-bold text-dark-900 tracking-tight">BusinessFinder</span>
          </Link>

          {/* Right side: notifications */}
          <Link href="/dashboard/notifications" className="text-dark-500 hover:text-dark-900 p-1 transition-colors">
            <Icon icon="solar:bell-linear" width={24} />
          </Link>
        </header>

        {/* Page Content */}
        <main className={mainClassName}>{children}</main>
        {showFooter && <Footer />}
      </div>
    </div>
  );
}

export default PageShell;
