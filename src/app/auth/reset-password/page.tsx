'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if user has a valid session (came from email link)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the password recovery link
        console.log('Password recovery mode active');
      }
    });
  }, []);

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
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    const supabase = getSupabaseClient();

    if (!supabase) {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIsSuccess(true);

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err) {
      console.error('Password update error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-2xl font-bold text-primary">BusinessFinder</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-dark">
          Create new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <Icon icon="solar:danger-circle-bold" width={18} />
                  {error}
                </div>
              )}

              <Input
                label="New password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                leftIcon="solar:lock-linear"
                rightIcon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'}
                onRightIconClick={() => setShowPassword(!showPassword)}
                hint="At least 8 characters with a number and symbol"
                required
              />

              <Input
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                leftIcon="solar:lock-linear"
                required
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Reset Password
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Icon icon="solar:check-circle-bold" width={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-dark mb-2">Password updated!</h3>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You&apos;ll be redirected to sign in shortly.
              </p>
              <Link href="/auth/signin">
                <Button className="w-full">
                  Sign in now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
