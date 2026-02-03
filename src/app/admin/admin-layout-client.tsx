'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { getSupabaseClient } from '@/lib/supabase/client';

interface AdminData {
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // No Supabase = demo mode, allow access
        setAdminData({
          name: 'Demo Admin',
          role: 'Super Admin',
          email: 'demo@businessfinder.co',
        });
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/bf-admin-x9k4m');
          return;
        }

        // Check if user has admin access
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, avatar_url, is_admin, role')
          .eq('id', user.id)
          .single() as { data: { first_name: string | null; last_name: string | null; email: string | null; avatar_url: string | null; is_admin: boolean | null; role: string | null } | null; error: Error | null };

        if (error || (!profile?.is_admin && profile?.role !== 'super_admin')) {
          // Not an admin, redirect to home or show access denied
          router.push('/dashboard');
          return;
        }

        // User is authorized
        setAdminData({
          name: profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile.email || user.email || 'Admin User',
          role: profile.role === 'super_admin' ? 'Super Admin' : 'Admin',
          email: profile.email || user.email || '',
          avatar: profile.avatar_url || undefined,
        });
        setIsAuthorized(true);
      } catch (err) {
        console.error('Admin access check failed:', err);
        router.push('/auth/bf-admin-x9k4m');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="solar:spinner-linear"
            width={40}
            className="text-primary animate-spin mx-auto mb-4"
          />
          <p className="text-dark-400 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="solar:shield-cross-bold-duotone"
            width={64}
            className="text-red-500 mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-dark-400 text-sm">You don&apos;t have permission to access this area.</p>
        </div>
      </div>
    );
  }

  // Authorized - render admin dashboard
  return (
    <div className="min-h-screen bg-dark-50">
      <AdminSidebar admin={adminData || undefined} />
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default AdminLayoutClient;
