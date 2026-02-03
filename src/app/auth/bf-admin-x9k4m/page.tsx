'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check if already logged in as admin
  useEffect(() => {
    const checkExistingSession = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .single() as { data: { is_admin: boolean | null; role: string | null } | null };

        if (profile?.is_admin || profile?.role === 'super_admin') {
          router.push('/admin');
        }
      }
    };

    checkExistingSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = getSupabaseClient();

    if (!supabase) {
      setError('System configuration error. Please contact support.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setError('Invalid credentials');
        return;
      }

      if (data.user) {
        // Check if user has admin access
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', data.user.id)
          .single() as { data: { is_admin: boolean | null; role: string | null } | null; error: Error | null };

        if (profileError || (!profile?.is_admin && profile?.role !== 'super_admin')) {
          // Sign out if not an admin
          await supabase.auth.signOut();
          setError('Access denied. This portal is restricted to administrators.');
          return;
        }

        // Redirect to admin dashboard
        router.push('/admin');
      }
    } catch (err) {
      console.error('Admin sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-700/50 border border-dark-600 rounded-full">
            <Icon icon="solar:shield-keyhole-bold-duotone" width={20} className="text-amber-500" />
            <span className="text-sm font-medium text-dark-300">Admin Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Secure Access</h1>
            <p className="text-dark-400 text-sm">
              This portal is restricted to authorized administrators only.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <div className="flex items-center gap-2">
                <Icon icon="solar:danger-circle-bold" width={20} />
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
                  <Icon icon="solar:letter-linear" width={20} />
                </div>
                <input
                  type="email"
                  placeholder="admin@businessfinder.co"
                  className="w-full h-12 pl-10 pr-4 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
                  <Icon icon="solar:lock-linear" width={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-12 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  <Icon icon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={20} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-dark-900 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Icon icon="solar:spinner-linear" width={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Icon icon="solar:login-3-bold" width={20} />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-dark-700">
            <div className="flex items-start gap-3 text-xs text-dark-500">
              <Icon icon="solar:info-circle-linear" width={16} className="mt-0.5 flex-shrink-0" />
              <p>
                All login attempts are logged and monitored. Unauthorized access attempts
                will be reported and may result in legal action.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-600 text-xs mt-6">
          © {new Date().getFullYear()} BusinessFinder. Internal use only.
        </p>
      </div>
    </div>
  );
}
