import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { SignUpForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free BusinessFinder account to buy and sell online businesses.',
};

export default function SignUpPage() {
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Icon icon="solar:graph-up-linear" width={24} />
            </div>
            <span className="text-2xl font-bold text-white">BusinessFinder</span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Join the #1{' '}
            <span className="text-emerald-400">business marketplace</span>
          </h1>
          <p className="text-dark-300 text-lg max-w-md">
            Create your free account to browse listings, connect with sellers, and start your acquisition journey.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: 'solar:verified-check-linear', text: 'Access to 5,000+ verified listings' },
              { icon: 'solar:shield-check-linear', text: 'Secure & confidential transactions' },
              { icon: 'solar:users-group-rounded-linear', text: 'Expert advisor support' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Icon icon={item.icon} className="text-emerald-400" width={18} />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
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
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Create your free account</h2>
            <p className="text-dark-500">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:text-primary-dark font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
