import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { SignInForm } from './signin-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your BusinessFinder account to browse listings and manage your business.',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Icon icon="solar:graph-up-linear" width={24} />
            </div>
            <span className="text-2xl font-bold text-white">BusinessFinder</span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Welcome back to the{' '}
            <span className="text-primary">marketplace</span>
          </h1>
          <p className="text-dark-300 text-lg max-w-md">
            Sign in to access your dashboard, manage listings, and connect with buyers and sellers.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl font-bold text-white mb-1">15K+</div>
              <div className="text-dark-400 text-sm">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl font-bold text-white mb-1">$2.4B</div>
              <div className="text-dark-400 text-sm">Transaction Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white">
                <Icon icon="solar:graph-up-linear" width={20} />
              </div>
              <span className="text-xl font-bold text-dark-900">BusinessFinder</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Sign in to your account</h2>
            <p className="text-dark-500">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-primary-dark font-medium">
                Sign up free
              </Link>
            </p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
