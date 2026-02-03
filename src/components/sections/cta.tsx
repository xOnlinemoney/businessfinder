'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-dark-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-dark-900/5 border border-dark-200">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
            <Icon icon="solar:gift-linear" width={16} />
            Get Started for Free
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 tracking-tight mb-4">
            Ready to Find Your Perfect Business?
          </h2>
          <p className="text-dark-500 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of entrepreneurs who have successfully bought and sold
            businesses through our marketplace. Create your free account today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                leftIcon={<Icon icon="solar:user-plus-linear" width={20} />}
              >
                Create Free Account
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Icon icon="solar:shop-2-linear" width={20} />}
              >
                Browse Listings
              </Button>
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-10 pt-8 border-t border-dark-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center justify-center gap-2 text-dark-600">
              <Icon icon="solar:verified-check-linear" className="text-emerald-600" width={20} />
              <span className="text-sm font-medium">Verified Listings</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-dark-600">
              <Icon icon="solar:shield-check-linear" className="text-primary" width={20} />
              <span className="text-sm font-medium">Secure Transactions</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-dark-600">
              <Icon icon="solar:users-group-rounded-linear" className="text-purple-600" width={20} />
              <span className="text-sm font-medium">Expert Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
