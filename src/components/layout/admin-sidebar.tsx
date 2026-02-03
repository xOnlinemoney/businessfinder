'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const adminNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'solar:widget-5-linear' },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { label: 'Listings', href: '/admin/listings', icon: 'solar:shop-2-linear' },
      { label: 'Transactions', href: '/admin/transactions', icon: 'solar:bill-list-linear' },
    ],
  },
  {
    title: 'Users',
    items: [
      { label: 'Buyers', href: '/admin/buyers', icon: 'solar:bag-check-linear' },
      { label: 'Sellers', href: '/admin/sellers', icon: 'solar:shop-linear' },
      { label: 'All Users', href: '/admin/users', icon: 'solar:users-group-rounded-linear' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Messages', href: '/admin/messages', icon: 'solar:chat-round-dots-linear' },
      { label: 'Inquiries', href: '/admin/inquiries', icon: 'solar:inbox-linear' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Verifications', href: '/admin/verifications', icon: 'solar:verified-check-linear', badge: 8 },
      { label: 'Blog & Content', href: '/admin/blog', icon: 'solar:document-text-linear' },
      { label: 'Media Library', href: '/admin/media', icon: 'solar:album-linear' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Platform Settings', href: '/admin/settings', icon: 'solar:settings-linear' },
      { label: 'Audit Logs', href: '/admin/logs', icon: 'solar:list-check-linear' },
    ],
  },
];

interface AdminSidebarProps {
  admin?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/auth/bf-admin-x9k4m');
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

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-dark-200 h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-dark-500 hover:bg-dark-100 rounded-lg"
          >
            <Icon icon="solar:hamburger-menu-linear" width={24} />
          </button>
          <span className="text-dark-900 font-medium">Admin Panel</span>
        </div>
        <button className="relative w-10 h-10 flex items-center justify-center text-dark-500 hover:text-dark-700 hover:bg-dark-100 rounded-xl transition-colors">
          <Icon icon="solar:bell-linear" width={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-72 bg-dark-900 text-white flex flex-col z-50',
          'transform transition-transform duration-300',
          'overflow-hidden shadow-xl shadow-dark-900/10',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Icon icon="solar:graph-up-linear" width={20} className="text-white" />
          </div>
          <div className="overflow-hidden whitespace-nowrap">
            <span className="font-bold text-white text-lg tracking-tight">BusinessFinder</span>
            <span className="block text-[11px] text-dark-400 font-medium uppercase tracking-wider leading-none mt-0.5">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-thin scrollbar-hide">
          {adminNavigation.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[11px] font-bold text-dark-500 uppercase tracking-wider">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group',
                          isActive
                            ? 'text-white bg-primary font-medium shadow-lg shadow-blue-900/20'
                            : 'text-dark-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            icon={item.icon}
                            width={20}
                            className={cn(
                              'shrink-0 transition-colors',
                              !isActive && 'group-hover:text-white'
                            )}
                          />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              'px-2 py-0.5 text-[10px] font-bold rounded-full',
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-primary/20 text-primary'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-white/10 mt-auto bg-dark-900">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
            {admin?.avatar ? (
              <img
                src={admin.avatar}
                alt={admin.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                <Icon icon="solar:user-linear" width={20} className="text-dark-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate text-sm">
                {admin?.name || 'Admin User'}
              </p>
              <p className="text-xs text-dark-400">
                {admin?.role || 'Super Admin'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              {isLoggingOut ? (
                <Icon icon="solar:spinner-linear" width={18} className="animate-spin" />
              ) : (
                <Icon icon="solar:logout-2-linear" width={18} />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
