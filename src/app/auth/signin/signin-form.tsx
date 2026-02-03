'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase/client';

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = getSupabaseClient();

    if (!supabase) {
      // Demo mode - just redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/dashboard');
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes('suspended')) {
          setError('Your account has been suspended. Please contact support.');
        } else if (authError.message.includes('Invalid login')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        // Check if user is suspended
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single() as { data: { is_admin: boolean | null } | null };

        // Redirect based on role
        if (profile?.is_admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google');
    }
  };

  const handleLinkedInSignIn = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error('LinkedIn sign in error:', err);
      setError('Failed to sign in with LinkedIn');
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <div className="flex items-center gap-2">
            <Icon icon="solar:danger-circle-bold" width={20} />
            {error}
          </div>
        </div>
      )}

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-2 h-11 px-4 bg-white border border-dark-200 rounded-xl text-sm font-medium text-dark-700 hover:bg-dark-50 transition-colors"
        >
          <Icon icon="flat-color-icons:google" width={20} />
          Google
        </button>
        <button
          type="button"
          onClick={handleLinkedInSignIn}
          className="flex items-center justify-center gap-2 h-11 px-4 bg-[#0A66C2] rounded-xl text-sm font-medium text-white hover:bg-[#004182] transition-colors"
        >
          <Icon icon="mdi:linkedin" width={20} />
          LinkedIn
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-dark-500">or continue with email</span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon="solar:letter-linear"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon="solar:lock-linear"
            rightIcon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'}
            onRightIconClick={() => setShowPassword(!showPassword)}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <div className="flex justify-end mt-2">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded border-dark-300 text-primary focus:ring-primary/20"
          />
          <label htmlFor="remember" className="text-sm text-dark-600">
            Remember me for 30 days
          </label>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      {/* Terms */}
      <p className="text-xs text-center text-dark-500">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

export default SignInForm;
