'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'content', label: 'Content & Media' },
  { value: 'agency', label: 'Agency' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'mobile-app', label: 'Mobile Apps' },
];

const revenueRanges = [
  { value: '', label: 'Any Revenue' },
  { value: '0-100000', label: 'Under $100K' },
  { value: '100000-500000', label: '$100K - $500K' },
  { value: '500000-1000000', label: '$500K - $1M' },
  { value: '1000000-5000000', label: '$1M - $5M' },
  { value: '5000000+', label: '$5M+' },
];

const locations = [
  { value: '', label: 'Any Location' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'eu', label: 'Europe' },
  { value: 'au', label: 'Australia' },
  { value: 'remote', label: 'Remote / Global' },
];

export function HeroSection() {
  const [category, setCategory] = useState('');
  const [revenue, setRevenue] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (revenue) params.set('revenue', revenue);
    if (location) params.set('location', location);
    window.location.href = `/marketplace${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8">
            <Icon icon="solar:star-bold" className="text-amber-400" width={16} />
            Trusted by 15,000+ entrepreneurs
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Find Your Next{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Profitable Business
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-12">
            The premium marketplace for buying and selling verified online businesses.
            Browse thousands of opportunities with verified financials.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/20 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {/* Category */}
              <div className="relative">
                <Icon
                  icon="solar:widget-5-linear"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400"
                  width={20}
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-dark-50 border-none rounded-xl text-sm text-dark-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none"
                  width={16}
                />
              </div>

              {/* Revenue */}
              <div className="relative">
                <Icon
                  icon="solar:dollar-linear"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400"
                  width={20}
                />
                <select
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-dark-50 border-none rounded-xl text-sm text-dark-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {revenueRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none"
                  width={16}
                />
              </div>

              {/* Location */}
              <div className="relative">
                <Icon
                  icon="solar:map-point-linear"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400"
                  width={20}
                />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-dark-50 border-none rounded-xl text-sm text-dark-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {locations.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none"
                  width={16}
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="h-12 text-base"
                leftIcon={<Icon icon="solar:magnifer-linear" width={20} />}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="text-dark-400 text-sm">Popular:</span>
            {['SaaS', 'E-commerce', 'Content', 'Agency'].map((cat) => (
              <Link
                key={cat}
                href={`/marketplace?category=${cat.toLowerCase()}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-sm rounded-lg transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#F8FAFC"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
