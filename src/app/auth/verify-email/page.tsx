import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Verify Your Email',
  description: 'Please check your email to verify your account.',
};

interface VerifyEmailPageProps {
  searchParams: { email?: string };
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const email = searchParams.email || 'your email';

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="solar:mailbox-bold" width={40} className="text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Check your email</h1>
          <p className="text-dark-600 mb-6">
            We&apos;ve sent a verification link to{' '}
            <span className="font-medium text-dark-900">{email}</span>
          </p>

          {/* Instructions */}
          <div className="bg-dark-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-dark-900 mb-2">Next steps:</h3>
            <ol className="text-sm text-dark-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                Open your email inbox
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                Click the verification link in the email
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                Complete your profile setup
              </li>
            </ol>
          </div>

          {/* Help text */}
          <p className="text-sm text-dark-500 mb-6">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              try again
            </Link>
          </p>

          {/* Back to sign in */}
          <Link href="/auth/signin">
            <Button variant="outline" className="w-full">
              <Icon icon="solar:arrow-left-linear" width={18} className="mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-dark-500 mt-6">
          Need help?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
