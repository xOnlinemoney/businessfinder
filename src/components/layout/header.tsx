'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client';

const navLinks = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/financing', label: 'Financing' },
  { href: '/resources', label: 'Resources' },
];

const loggedInNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'solar:home-smile-linear' },
  { href: '/marketplace', label: 'Marketplace', icon: 'solar:shop-linear' },
  { href: '/dashboard/listings', label: 'My Listings', icon: 'solar:layers-linear' },
  { href: '/dashboard/saved', label: 'Saved Listings', icon: 'solar:heart-linear' },
  { href: '/dashboard/messages', label: 'Messages', icon: 'solar:letter-linear' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: 'solar:bell-linear' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'solar:settings-linear' },
];

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedInSidebarOpen, setIsLoggedInSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if on homepage (hero has dark background)
  // Only use white text on desktop when on homepage and not scrolled
  // Mobile always uses dark text with white background
  const isHomepage = pathname === '/';
  const useWhiteText = isHomepage && !isScrolled;
  // Mobile always uses the "scrolled" style (white bg, dark text)
  const useMobileWhiteText = false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth state
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
            .select('id, first_name, last_name, email')
            .eq('id', user.id)
            .single() as { data: { id: string; first_name: string | null; last_name: string | null; email: string | null } | null };

          if (profileData) {
            setUserProfile({
              id: profileData.id,
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: profileData.email || user.email || '',
            });
          }
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
          setUserProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLoggedInSidebarOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  const getUserInitials = () => {
    if (userProfile?.firstName || userProfile?.lastName) {
      return `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (userProfile?.firstName || userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`.trim();
    }
    return 'User';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        // Mobile: always white background with border
        'bg-white/95 backdrop-blur-md border-b border-dark-200 shadow-sm',
        // Desktop: transparent on homepage when not scrolled
        'lg:border-0 lg:shadow-none',
        isScrolled
          ? 'lg:bg-white/80 lg:backdrop-blur-md lg:border-b lg:border-dark-200 lg:shadow-sm'
          : 'lg:bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile: Logged In - Hamburger Left, Logo Center, Bell Right */}
          {isLoggedIn && !isLoading && (
            <>
              {/* Mobile Hamburger - Left */}
              <button
                onClick={() => setIsLoggedInSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg transition-colors text-dark-600 hover:bg-dark-100"
              >
                <Icon icon="solar:hamburger-menu-linear" width={24} />
              </button>

              {/* Mobile Logo - Centered */}
              <Link href="/" className="lg:hidden flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg bg-primary shadow-primary/20">
                  <Icon icon="solar:graph-up-linear" width={18} />
                </div>
                <span className="font-bold text-lg tracking-tight text-dark-900">
                  Business<span className="font-normal text-dark-500">Finder</span>
                </span>
              </Link>

              {/* Mobile Notifications - Right */}
              <Link
                href="/dashboard/notifications"
                className="lg:hidden p-2 -mr-2 rounded-lg transition-colors text-dark-600 hover:bg-dark-100"
              >
                <Icon icon="solar:bell-linear" width={24} />
              </Link>
            </>
          )}

          {/* Mobile: Not Logged In - Logo Left (always dark text on white bg) */}
          {(!isLoggedIn || isLoading) && (
            <Link href="/" className="lg:hidden flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg bg-primary shadow-primary/20">
                <Icon icon="solar:graph-up-linear" width={20} />
              </div>
              <span className="font-bold text-lg tracking-tight text-dark-900">
                Business<span className="font-normal text-dark-500">Finder</span>
              </span>
            </Link>
          )}

          {/* Desktop: Logo - Always Left */}
          <Link href="/" className="hidden lg:flex items-center gap-2.5 shrink-0">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg',
              useWhiteText ? 'bg-white/20 backdrop-blur-sm' : 'bg-primary shadow-primary/20'
            )}>
              <Icon icon="solar:graph-up-linear" width={20} />
            </div>
            <span className={cn(
              'font-bold text-lg tracking-tight',
              useWhiteText ? 'text-white' : 'text-dark-900'
            )}>
              Business<span className={cn(
                'font-normal',
                useWhiteText ? 'text-white/70' : 'text-dark-500'
              )}>Finder</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? useWhiteText
                      ? 'text-white bg-white/10'
                      : 'text-primary bg-primary/5'
                    : useWhiteText
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-dark-600 hover:text-dark-900 hover:bg-dark-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {!isLoading && (
              isLoggedIn ? (
                /* Logged In - Show User Menu */
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-full transition-colors',
                      useWhiteText
                        ? 'hover:bg-white/10'
                        : 'hover:bg-dark-100'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      useWhiteText
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary'
                    )}>
                      {getUserInitials()}
                    </div>
                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      width={16}
                      className={useWhiteText ? 'text-white/70' : 'text-dark-500'}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-dark-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-dark-100">
                        <p className="text-sm font-semibold text-dark-900">{getUserDisplayName()}</p>
                        <p className="text-xs text-dark-500">{userProfile?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <Icon icon="solar:home-smile-linear" width={18} className="text-dark-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/listings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <Icon icon="solar:layers-linear" width={18} className="text-dark-400" />
                          My Listings
                        </Link>
                        <Link
                          href="/dashboard/saved"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <Icon icon="solar:heart-linear" width={18} className="text-dark-400" />
                          Saved Listings
                        </Link>
                        <Link
                          href="/dashboard/messages"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <Icon icon="solar:letter-linear" width={18} className="text-dark-400" />
                          Messages
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <Icon icon="solar:settings-linear" width={18} className="text-dark-400" />
                          Settings
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-dark-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <Icon icon="solar:logout-2-linear" width={18} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Not Logged In - Show Sign In / Get Started */
                <>
                  <Link href="/auth/signin">
                    <Button
                      variant={useWhiteText ? 'ghost' : 'ghost'}
                      size="md"
                      className={useWhiteText ? 'text-white hover:bg-white/10 hover:text-white' : ''}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      variant="primary"
                      size="md"
                      className={useWhiteText ? 'bg-white text-dark-900 hover:bg-white/90' : ''}
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button - Only for non-logged-in users (always dark on white bg) */}
          {(!isLoggedIn || isLoading) && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors text-dark-600 hover:bg-dark-100"
            >
              <Icon
                icon={isMobileMenuOpen ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear'}
                width={24}
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu (Only for non-logged-in users) */}
      {!isLoggedIn && (
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300',
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="bg-white border-t border-dark-200 px-4 py-4">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === link.href
                      ? 'text-primary bg-primary/5'
                      : 'text-dark-600 hover:text-dark-900 hover:bg-dark-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t border-dark-200">
              <Link href="/auth/signin" className="w-full">
                <Button variant="secondary" size="md" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar for Logged-in Users */}
      {isLoggedIn && (
        <>
          {/* Overlay */}
          {isLoggedInSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-dark-900/50 z-[55] backdrop-blur-sm"
              onClick={() => setIsLoggedInSidebarOpen(false)}
            />
          )}

          {/* Sidebar Panel */}
          <aside
            className={cn(
              'lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-dark-900 z-[60]',
              'transform transition-transform duration-300 ease-in-out',
              isLoggedInSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800 bg-dark-900">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsLoggedInSidebarOpen(false)}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <Icon icon="solar:graph-up-linear" width={18} />
                </div>
                <span className="font-bold text-white tracking-tight">
                  Business<span className="font-normal text-dark-400">Finder</span>
                </span>
              </Link>
              <button
                onClick={() => setIsLoggedInSidebarOpen(false)}
                className="p-2 text-dark-400 hover:text-white transition-colors"
              >
                <Icon icon="solar:close-circle-linear" width={24} />
              </button>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-dark-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="text-sm font-bold">{getUserInitials()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                  <p className="text-xs text-dark-400">{userProfile?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-1">
                {loggedInNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsLoggedInSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                          isActive
                            ? 'text-white bg-primary'
                            : 'text-dark-400 hover:text-white hover:bg-dark-800'
                        )}
                      >
                        <Icon icon={item.icon} width={20} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* List Business CTA */}
            <div className="p-3 border-t border-dark-800">
              <Link href="/dashboard/listings/new" onClick={() => setIsLoggedInSidebarOpen(false)}>
                <Button variant="primary" className="w-full">
                  <Icon icon="solar:add-circle-linear" width={18} />
                  <span>List a Business</span>
                </Button>
              </Link>
            </div>

            {/* Logout */}
            <div className="p-3 border-t border-dark-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
              >
                <Icon icon="solar:logout-2-linear" width={20} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}

export default Header;
