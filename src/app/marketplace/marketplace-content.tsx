'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ListingCard } from '@/components/cards/listing-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { ListingCategory } from '@/types';

const categories = [
  { value: 'all', label: 'All', icon: 'solar:widget-5-linear' },
  { value: 'saas', label: 'SaaS', icon: 'solar:cloud-linear' },
  { value: 'ecommerce', label: 'E-commerce', icon: 'solar:cart-large-minimalistic-linear' },
  { value: 'content', label: 'Content', icon: 'solar:document-text-linear' },
  { value: 'agency', label: 'Agency', icon: 'solar:buildings-2-linear' },
  { value: 'marketplace', label: 'Marketplace', icon: 'solar:shop-linear' },
  { value: 'mobile_app', label: 'Mobile App', icon: 'solar:smartphone-linear' },
  { value: 'other', label: 'Other', icon: 'solar:layers-linear' },
];

const priceRanges = [
  { label: 'Under $100K', min: 0, max: 100000 },
  { label: '$100K - $500K', min: 100000, max: 500000 },
  { label: '$500K - $1M', min: 500000, max: 1000000 },
  { label: '$1M - $5M', min: 1000000, max: 5000000 },
  { label: '$5M+', min: 5000000, max: null },
];

const revenueRanges = [
  { label: 'Under $50K', min: 0, max: 50000 },
  { label: '$50K - $250K', min: 50000, max: 250000 },
  { label: '$250K - $1M', min: 250000, max: 1000000 },
  { label: '$1M - $5M', min: 1000000, max: 5000000 },
  { label: '$5M+', min: 5000000, max: null },
];

const locations = [
  'All Locations',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Remote',
];

interface Listing {
  id: string;
  title: string;
  category: ListingCategory;
  askingPrice: number;
  revenue: number;
  profit: number;
  location: string;
  isVerified: boolean;
  isConfidential: boolean;
  status: 'active' | 'pending' | 'sold' | 'withdrawn';
  requires_nda?: boolean;
  image_url?: string;
}

// Fallback mock listings for when database is not connected
const mockListings: Listing[] = [
  {
    id: 'demo-1',
    title: 'Profitable B2B SaaS - Marketing Automation Platform',
    category: 'saas' as ListingCategory,
    askingPrice: 2500000,
    revenue: 840000,
    profit: 420000,
    location: 'United States',
    isVerified: true,
    isConfidential: false,
    status: 'active',
  },
  {
    id: 'demo-2',
    title: 'D2C E-commerce Brand - Health & Wellness',
    category: 'ecommerce' as ListingCategory,
    askingPrice: 1200000,
    revenue: 1800000,
    profit: 320000,
    location: 'United States',
    isVerified: true,
    isConfidential: false,
    status: 'active',
  },
  {
    id: 'demo-3',
    title: 'Content Site Portfolio - Finance Niche',
    category: 'content' as ListingCategory,
    askingPrice: 450000,
    revenue: 180000,
    profit: 145000,
    location: 'Remote',
    isVerified: true,
    isConfidential: true,
    status: 'active',
  },
  {
    id: 'demo-4',
    title: 'Digital Marketing Agency - Est. 2018',
    category: 'agency' as ListingCategory,
    askingPrice: 890000,
    revenue: 1200000,
    profit: 280000,
    location: 'United Kingdom',
    isVerified: false,
    isConfidential: false,
    status: 'active',
  },
];

export function MarketplaceContent() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedRevenueRange, setSelectedRevenueRange] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const PAGE_SIZE = 12;

  // Fetch listings from database
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);

      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - use mock data
        setListings(mockListings);
        setTotalCount(mockListings.length);
        setIsLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('listings')
          .select('*', { count: 'exact' })
          .eq('status', 'active');

        // Apply category filter
        if (activeCategory !== 'all') {
          query = query.eq('category', activeCategory);
        }

        // Apply search filter
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        // Apply price range filter
        if (selectedPriceRange !== null) {
          const range = priceRanges[selectedPriceRange];
          query = query.gte('asking_price', range.min);
          if (range.max) {
            query = query.lte('asking_price', range.max);
          }
        }

        // Apply revenue range filter
        if (selectedRevenueRange !== null) {
          const range = revenueRanges[selectedRevenueRange];
          query = query.gte('annual_revenue', range.min);
          if (range.max) {
            query = query.lte('annual_revenue', range.max);
          }
        }

        // Apply location filter
        if (selectedLocation !== 'All Locations') {
          query = query.eq('location', selectedLocation);
        }

        // Apply verified filter
        if (showVerifiedOnly) {
          query = query.eq('is_verified', true);
        }

        // Apply sorting
        switch (sortBy) {
          case 'price-low':
            query = query.order('asking_price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('asking_price', { ascending: false });
            break;
          case 'revenue':
            query = query.order('annual_revenue', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        // Apply pagination
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching listings:', error);
          setListings(mockListings);
          setTotalCount(mockListings.length);
          return;
        }

        // Transform data to match our interface
        const transformedListings: Listing[] = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category as ListingCategory,
          askingPrice: item.asking_price,
          revenue: item.annual_revenue,
          profit: item.annual_profit,
          location: item.location || 'Remote',
          isVerified: item.is_verified,
          isConfidential: item.requires_nda,
          status: item.status,
          requires_nda: item.requires_nda,
          image_url: item.image_url,
        }));

        if (page === 1) {
          setListings(transformedListings);
        } else {
          setListings((prev) => [...prev, ...transformedListings]);
        }

        setTotalCount(count || 0);
        setHasMore((count || 0) > page * PAGE_SIZE);
      } catch (err) {
        console.error('Error:', err);
        setListings(mockListings);
        setTotalCount(mockListings.length);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [activeCategory, sortBy, searchQuery, selectedPriceRange, selectedRevenueRange, selectedLocation, showVerifiedOnly, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, sortBy, searchQuery, selectedPriceRange, selectedRevenueRange, selectedLocation, showVerifiedOnly]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSelectedPriceRange(null);
    setSelectedRevenueRange(null);
    setSelectedLocation('All Locations');
    setShowVerifiedOnly(false);
  };

  const activeFiltersCount = [
    activeCategory !== 'all',
    selectedPriceRange !== null,
    selectedRevenueRange !== null,
    selectedLocation !== 'All Locations',
    showVerifiedOnly,
  ].filter(Boolean).length;

  // Sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-dark-900 mb-3">Asking Price</h3>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={selectedPriceRange === index}
                onChange={() => setSelectedPriceRange(selectedPriceRange === index ? null : index)}
                className="w-4 h-4 text-primary border-dark-300 focus:ring-primary/20"
              />
              <span className="text-sm text-dark-600">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Revenue Range */}
      <div>
        <h3 className="text-sm font-semibold text-dark-900 mb-3">Annual Revenue</h3>
        <div className="space-y-2">
          {revenueRanges.map((range, index) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="revenueRange"
                checked={selectedRevenueRange === index}
                onChange={() => setSelectedRevenueRange(selectedRevenueRange === index ? null : index)}
                className="w-4 h-4 text-primary border-dark-300 focus:ring-primary/20"
              />
              <span className="text-sm text-dark-600">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-dark-900 mb-3">Location</h3>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full h-10 px-3 bg-dark-50 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Verified Only */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showVerifiedOnly}
            onChange={(e) => setShowVerifiedOnly(e.target.checked)}
            className="w-4 h-4 text-primary border-dark-300 rounded focus:ring-primary/20"
          />
          <div className="flex items-center gap-2">
            <Icon icon="solar:verified-check-bold" className="text-primary" width={18} />
            <span className="text-sm font-medium text-dark-900">Verified Only</span>
          </div>
        </label>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <Icon icon="solar:trash-bin-2-linear" width={16} className="mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 tracking-tight">
          Business Marketplace
        </h1>
        <p className="text-dark-500 mt-2">
          Browse {totalCount}+ verified businesses for sale
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="sticky top-24">
            <FilterSidebar />
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-dark-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Icon
                  icon="solar:magnifer-linear"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                  width={20}
                />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-dark-50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-dark-100 rounded-lg text-sm font-medium text-dark-600"
              >
                <Icon icon="solar:filter-linear" width={18} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-primary text-white text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      activeCategory === cat.value
                        ? 'bg-primary text-white'
                        : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                    )}
                  >
                    <Icon icon={cat.icon} width={18} />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 pl-4 pr-10 bg-dark-50 border-none rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="revenue">Highest Revenue</option>
                </select>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none"
                  width={16}
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && page === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-dark-200 p-6 animate-pulse">
                  <div className="h-6 bg-dark-100 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-dark-100 rounded w-1/2 mb-6"></div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="h-12 bg-dark-100 rounded"></div>
                    <div className="h-12 bg-dark-100 rounded"></div>
                  </div>
                  <div className="h-10 bg-dark-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              {/* Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-10">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={loadMore}
                    isLoading={isLoading && page > 1}
                  >
                    Load More Listings
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:box-minimalistic-linear" className="text-dark-400" width={32} />
              </div>
              <h3 className="text-lg font-semibold text-dark-900 mb-2">No listings found</h3>
              <p className="text-dark-500 mb-6">Try adjusting your filters or search query</p>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white">
            <div className="flex items-center justify-between p-4 border-b border-dark-200">
              <h2 className="text-lg font-semibold text-dark-900">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-dark-100 rounded-lg">
                <Icon icon="solar:close-circle-linear" width={24} className="text-dark-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t border-dark-200">
              <Button className="w-full" onClick={() => setShowMobileFilters(false)}>
                Show {totalCount} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketplaceContent;
