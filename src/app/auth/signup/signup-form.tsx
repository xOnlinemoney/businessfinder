'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input, PhoneInput } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase/client';

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountryCode: '+1',
    password: '',
    agreedToTerms: false,
  });

  // Password validation
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one symbol';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate terms agreement
    if (!formData.agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      setIsLoading(false);
      return;
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      // Demo mode - just redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/onboarding');
      return;
    }

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      // Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        // Use UPSERT to create or update profile with signup data
        // This handles the case where a database trigger already created a basic profile
        const { error: profileError } = await (supabase.from('profiles') as any).upsert({
          id: data.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: fullName,
          phone: formData.phone || null,
          phone_country_code: formData.phoneCountryCode || '+1',
          is_buyer: true, // Default to buyer
          is_seller: false,
          is_admin: false,
          onboarding_completed: false,
          is_verified: false,
          is_suspended: false,
          email_notifications: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

        if (profileError) {
          console.error('Profile creation/update error:', profileError);
        } else {
          console.log('Profile saved successfully with signup data');
        }

        // Store signup data in sessionStorage for onboarding to pick up
        // This ensures the data is available even if the DB write has issues
        sessionStorage.setItem('signupData', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          phoneCountryCode: formData.phoneCountryCode,
          email: formData.email,
        }));

        // Check if email confirmation is required
        if (data.user.identities?.length === 0) {
          // Email confirmation required
          router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email));
        } else {
          // Direct login (email confirmation disabled or already confirmed)
          router.push('/onboarding');
        }
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });
    } catch (err) {
      console.error('Google sign up error:', err);
      setError('Failed to sign up with Google');
    }
  };

  const handleLinkedInSignUp = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });
    } catch (err) {
      console.error('LinkedIn sign up error:', err);
      setError('Failed to sign up with LinkedIn');
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
          onClick={handleGoogleSignUp}
          className="flex items-center justify-center gap-2 h-11 px-4 bg-white border border-dark-200 rounded-xl text-sm font-medium text-dark-700 hover:bg-dark-50 transition-colors"
        >
          <Icon icon="flat-color-icons:google" width={20} />
          Google
        </button>
        <button
          type="button"
          onClick={handleLinkedInSignUp}
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Last name"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon="solar:letter-linear"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <PhoneInput
          label="Phone number"
          value={formData.phone}
          countryCode={formData.phoneCountryCode}
          onValueChange={(phone) => setFormData({ ...formData, phone })}
          onCountryCodeChange={(code) => setFormData({ ...formData, phoneCountryCode: code })}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a strong password"
          leftIcon="solar:lock-linear"
          rightIcon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'}
          onRightIconClick={() => setShowPassword(!showPassword)}
          hint="At least 8 characters with a number and symbol"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={formData.agreedToTerms}
            onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded border-dark-300 text-primary focus:ring-primary/20"
          />
          <label htmlFor="terms" className="text-sm text-dark-600">
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      {/* Security Note */}
      <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
        <Icon icon="solar:shield-check-linear" className="text-emerald-600 shrink-0" width={20} />
        <p className="text-xs text-emerald-700">
          Your information is protected with bank-level encryption
        </p>
      </div>
    </div>
  );
}

export default SignUpForm;
