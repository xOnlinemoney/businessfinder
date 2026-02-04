'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number | string;
  badgeColor?: 'primary' | 'warning' | 'success' | 'danger';
}

interface NavSection {
  title: string;
  items: NavItem[];
  showFor?: 'buyer' | 'seller' | 'both';
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

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  counts?: SidebarCounts;
  isBuyer?: boolean;
  isSeller?: boolean;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ user, counts, isBuyer = true, isSeller = false, isCollapsed: externalCollapsed, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setIsCollapsed = (value: boolean) => {
    if (onCollapseChange) {
      onCollapseChange(value);
    } else {
      setInternalCollapsed(value);
    }
  };

  // Build navigation dynamically based on counts and role
  const navigation: NavSection[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'solar:home-smile-linear' },
        { label: 'Marketplace', href: '/marketplace', icon: 'solar:shop-linear' },
      ],
    },
  ];

  // Selling section - always visible (users might want to list a business later)
  navigation.push({
    title: 'Selling',
    items: [
      {
        label: 'My Listings',
        href: '/dashboard/listings',
        icon: 'solar:layers-linear',
        badge: counts?.listings || undefined
      },
      {
        label: 'Inquiries',
        href: '/dashboard/inquiries',
        icon: 'solar:chat-line-linear',
        badge: counts?.inquiriesReceived || undefined,
        badgeColor: counts?.inquiriesReceived ? 'warning' : undefined
      },
      {
        label: 'Offers Received',
        href: '/dashboard/offers',
        icon: 'solar:file-text-linear',
        badge: counts?.offersReceived || undefined,
        badgeColor: counts?.offersReceived ? 'success' : undefined
      },
      { label: 'Analytics', href: '/dashboard/analytics', icon: 'solar:chart-2-linear' },
    ],
  });

  // Buying section - always visible
  navigation.push({
    title: 'Buying',
    items: [
      {
        label: 'Saved Listings',
        href: '/dashboard/saved',
        icon: 'solar:heart-linear',
        badge: counts?.savedListings || undefined
      },
      {
        label: 'My Offers',
        href: '/dashboard/my-offers',
        icon: 'solar:plain-2-linear',
        badge: counts?.myOffers || undefined
      },
      {
        label: 'NDAs Signed',
        href: '/dashboard/ndas',
        icon: 'solar:file-check-linear',
        badge: counts?.ndasSigned || undefined
      },
    ],
  });

  // Communication section
  navigation.push({
    title: 'Communication',
    items: [
      {
        label: 'Messages',
        href: '/dashboard/messages',
        icon: 'solar:letter-linear',
        badge: counts?.unreadMessages || undefined,
        badgeColor: counts?.unreadMessages ? 'primary' : undefined
      },
      {
        label: 'Notifications',
        href: '/dashboard/notifications',
        icon: 'solar:bell-linear',
        badge: counts?.unreadNotifications || undefined,
        badgeColor: counts?.unreadNotifications ? 'danger' : undefined
      },
    ],
  });

  // Account section
  navigation.push({
    title: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: 'solar:settings-linear' },
      { label: 'Help & Support', href: '/support', icon: 'solar:help-circle-linear' },
    ],
  });

  const getBadgeClasses = (color?: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'success':
        return 'bg-emerald-500 text-white';
      case 'danger':
        return 'bg-red-500 text-white';
      default:
        return 'bg-dark-700 text-dark-300';
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-dark-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Header - Fixed to top */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-dark-200 shadow-sm h-16 px-4 flex items-center">
        {/* Left - Hamburger Menu */}
        <button
          onClick={() => setIsMobileOpen(true)}
          onTouchEnd={(e) => {
            e.preventDefault();
            setIsMobileOpen(true);
          }}
          className="text-dark-600 p-2 -ml-2"
          style={{ touchAction: 'manipulation' }}
          aria-label="Open menu"
        >
          <Icon icon="solar:hamburger-menu-linear" width={24} />
        </button>

        {/* Center - Logo */}
        <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Icon icon="solar:graph-up-linear" width={18} />
          </div>
          <span className="font-bold text-dark-900 tracking-tight">BusinessFinder</span>
        </Link>

        {/* Right - Notifications */}
        <Link href="/dashboard/notifications" className="relative p-2 text-dark-500 ml-auto -mr-2">
          <Icon icon="solar:bell-linear" width={24} />
          {(counts?.unreadNotifications || 0) > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
          )}
        </Link>
      </header>

      {/* Mobile Header Spacer - pushes content below fixed header */}
      <div className="lg:hidden h-16" />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 bg-dark-900 flex flex-col z-50',
          'transform transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'shadow-xl lg:shadow-none'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-dark-800 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
              <Icon icon="solar:graph-up-linear" width={18} />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-white tracking-tight text-lg">
                Business<span className="font-normal text-dark-400">Finder</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-thin">
          {navigation.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-bold text-dark-500 uppercase tracking-widest">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                          isActive
                            ? 'text-white bg-primary shadow-md shadow-blue-900/20'
                            : 'text-dark-400 hover:text-white hover:bg-dark-800'
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon
                          icon={item.icon}
                          width={20}
                          className="shrink-0"
                        />
                        {!isCollapsed && (
                          <>
                            <span className="text-sm font-medium flex-1">
                              {item.label}
                            </span>
                            {item.badge !== undefined && (typeof item.badge === 'string' || item.badge > 0) && (
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors',
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : getBadgeClasses(item.badgeColor)
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* CTA Button - Always visible */}
        <div className="p-3 border-t border-dark-800">
          <Link href="/dashboard/listings/new">
            <Button
              variant="primary"
              className={cn(
                'w-full shadow-lg shadow-blue-900/20',
                isCollapsed && 'px-0'
              )}
            >
              <Icon icon="solar:add-circle-linear" width={18} />
              {!isCollapsed && <span>List a Business</span>}
            </Button>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-dark-800">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full ring-2 ring-dark-800 shrink-0 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <span className="text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-dark-400 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-dark-500 hover:text-white transition-colors disabled:opacity-50"
                  title="Sign out"
                >
                  <Icon icon={isLoggingOut ? "solar:loading-linear" : "solar:logout-2-linear"} width={20} className={isLoggingOut ? "animate-spin" : ""} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-dark-800 border border-dark-700 rounded-full items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
        >
          <Icon
            icon={isCollapsed ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-left-linear'}
            width={12}
          />
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
