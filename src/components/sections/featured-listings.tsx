'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ListingCard } from '@/components/cards/listing-card';
import { Button } from '@/components/ui/button';
import type { ListingCategory } from '@/types';

// Mock data - in production this would come from an API
const featuredListings = [
  {
    id: '1',
    title: 'Profitable B2B SaaS - Marketing Automation Platform',
    category: 'saas' as ListingCategory,
    askingPrice: 2500000,
    revenue: 840000,
    profit: 420000,
    margin: 50,
    multiple: 5.95,
    location: 'United States',
    isVerified: true,
    isConfidential: false,
    status: 'active' as const,
  },
  {
    id: '2',
    title: 'D2C E-commerce Brand - Health & Wellness Supplements',
    category: 'ecommerce' as ListingCategory,
    askingPrice: 1200000,
    revenue: 1800000,
    profit: 320000,
    margin: 18,
    multiple: 3.75,
    location: 'United States',
    isVerified: true,
    isConfidential: false,
    status: 'active' as const,
  },
  {
    id: '3',
    title: 'Content Site Portfolio - Finance & Investing Niche',
    category: 'content' as ListingCategory,
    askingPrice: 450000,
    revenue: 180000,
    profit: 145000,
    margin: 81,
    multiple: 3.1,
    location: 'Remote',
    isVerified: true,
    isConfidential: true,
    status: 'active' as const,
  },
  {
    id: '4',
    title: 'Full-Service Digital Marketing Agency - Established 2018',
    category: 'agency' as ListingCategory,
    askingPrice: 890000,
    revenue: 1200000,
    profit: 280000,
    margin: 23,
    multiple: 3.18,
    location: 'United Kingdom',
    isVerified: false,
    isConfidential: false,
    status: 'active' as const,
  },
  {
    id: '5',
    title: 'AI-Powered HR Software - Growing MRR',
    category: 'saas' as ListingCategory,
    askingPrice: 3200000,
    revenue: 720000,
    profit: 480000,
    margin: 67,
    multiple: 6.67,
    location: 'Remote',
    isVerified: true,
    isConfidential: true,
    status: 'active' as const,
  },
  {
    id: '6',
    title: 'Subscription Box - Pet Products with 5K Active Subscribers',
    category: 'ecommerce' as ListingCategory,
    askingPrice: 580000,
    revenue: 920000,
    profit: 180000,
    margin: 20,
    multiple: 3.22,
    location: 'Canada',
    isVerified: true,
    isConfidential: false,
    status: 'active' as const,
  },
];

export function FeaturedListings() {
  return (
    <section className="py-16 lg:py-24 bg-dark-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 tracking-tight">
              Featured Opportunities
            </h2>
            <p className="text-dark-500 mt-2">
              Hand-picked businesses with verified financials and growth potential
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="secondary" rightIcon={<Icon icon="solar:arrow-right-linear" width={16} />}>
              View All Listings
            </Button>
          </Link>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Ready to Sell Your Business?
          </h3>
          <p className="text-white/80 max-w-2xl mx-auto mb-6">
            Get a free valuation and connect with thousands of qualified buyers.
            Our advisors help you every step of the way.
          </p>
          <Link href="/onboarding">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              leftIcon={<Icon icon="solar:add-circle-linear" width={20} />}
            >
              List Your Business
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedListings;
