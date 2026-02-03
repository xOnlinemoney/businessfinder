'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface SavedListing {
  id: string;
  listingId: string;
  title: string;
  category: string;
  askingPrice: number;
  revenue: number;
  profit: number;
  multiple: number;
  image: string;
  savedAt: string;
  isVerified: boolean;
  status: string;
}

// No mock data - show empty state for new users

const categories = ['All', 'SaaS', 'E-commerce', 'Content', 'Agency'];

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
};

export function SavedListingsContent() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedItems, setSavedItems] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedListings = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - show empty state
        setSavedItems([]);
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSavedItems([]);
          setIsLoading(false);
          return;
        }

        // Step 1: Fetch saved listings for this user
        const { data: savedData, error: savedError } = await (supabase.from('saved_listings') as any)
          .select('id, created_at, listing_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (savedError) {
          console.error('Supabase saved error:', savedError);
          throw savedError;
        }

        console.log('Fetched saved listings:', savedData);

        if (!savedData || savedData.length === 0) {
          setSavedItems([]);
          return;
        }

        // Step 2: Get listing IDs and fetch those listings
        const listingIds = savedData.map((item: any) => item.listing_id);
        console.log('Looking up listings with IDs:', listingIds);

        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .in('id', listingIds);

        if (listingsError) {
          console.error('Supabase listings error:', listingsError);
          throw listingsError;
        }

        console.log('Fetched listings:', listingsData);

        // Create a map for quick lookup
        const listingsMap = new Map((listingsData || []).map((l: any) => [l.id, l]));

        const formattedListings: SavedListing[] = savedData
          .map((item: any) => {
            const listing = listingsMap.get(item.listing_id);
            if (!listing) {
              console.log('Listing not found for id:', item.listing_id);
              return null;
            }

            // Handle different possible column names
            const revenue = listing.annual_revenue ?? listing.revenue_yearly ?? listing.revenue ?? 0;
            const profit = listing.annual_profit ?? listing.profit_yearly ?? listing.profit ?? 0;
            const category = listing.business_type ?? listing.category ?? 'Other';
            const imageUrl = listing.image_url ?? listing.cover_image_url ?? listing.logo_url;

            return {
              id: item.id,
              listingId: listing.id,
              title: listing.title,
              category: category,
              askingPrice: listing.asking_price || 0,
              revenue: revenue,
              profit: profit,
              multiple: listing.asking_price && profit
                ? parseFloat((listing.asking_price / profit).toFixed(2))
                : 0,
              image: imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
              savedAt: formatRelativeTime(item.created_at),
              isVerified: listing.is_verified || false,
              status: listing.status || 'active',
            };
          })
          .filter(Boolean) as SavedListing[];

        setSavedItems(formattedListings);
      } catch (error) {
        console.error('Error fetching saved listings:', error);
        setSavedItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedListings();
  }, []);

  const filteredListings = activeCategory === 'All'
    ? savedItems
    : savedItems.filter(l => l.category === activeCategory);

  const handleRemove = async (id: string) => {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('saved_listings') as any)
          .delete()
          .eq('id', id);
      } catch (error) {
        console.error('Error removing saved listing:', error);
      }
    }

    setSavedItems(items => items.filter(item => item.id !== id));
  };

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900 tracking-tight">Saved Listings</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 text-dark-500 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-colors relative">
            <Icon icon="solar:bell-linear" width={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 tracking-tight">Saved Listings</h2>
            <p className="text-dark-500 mt-1">{savedItems.length} businesses saved</p>
          </div>
          <Link href="/marketplace">
            <Button variant="secondary">
              <Icon icon="solar:shop-2-linear" width={18} />
              Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} padding="none" className="overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-dark-100" />
                <div className="p-4">
                  <div className="h-4 w-20 bg-dark-100 rounded mb-2" />
                  <div className="h-5 w-full bg-dark-100 rounded mb-3" />
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 bg-dark-50 rounded-lg h-12" />
                    <div className="p-2 bg-dark-50 rounded-lg h-12" />
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <div className="h-6 w-20 bg-dark-100 rounded" />
                    <div className="h-8 w-16 bg-dark-100 rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} padding="none" hover className="group overflow-hidden">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleRemove(listing.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <Icon icon="solar:heart-bold" width={20} />
                  </button>
                  {listing.status === 'under-offer' && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning">Under Offer</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" size="sm">{listing.category}</Badge>
                    {listing.isVerified && (
                      <Icon icon="solar:verified-check-bold" className="text-primary" width={16} />
                    )}
                  </div>
                  <Link href={`/listing/${listing.listingId}`}>
                    <h3 className="font-semibold text-dark-900 line-clamp-2 group-hover:text-primary transition-colors mb-3">
                      {listing.title}
                    </h3>
                  </Link>

                  <div className="grid grid-cols-2 gap-2 text-center mb-4">
                    <div className="p-2 bg-dark-50 rounded-lg">
                      <p className="text-[10px] text-dark-500 font-medium uppercase">Revenue</p>
                      <p className="text-sm font-bold text-dark-900">{formatCurrency(listing.revenue, true)}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <p className="text-[10px] text-emerald-600 font-medium uppercase">Profit</p>
                      <p className="text-sm font-bold text-emerald-700">{formatCurrency(listing.profit, true)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dark-100">
                    <div>
                      <p className="text-lg font-bold text-dark-900">{formatCurrency(listing.askingPrice, true)}</p>
                      <p className="text-xs text-dark-500">{listing.multiple}x multiple</p>
                    </div>
                    <Link href={`/listing/${listing.listingId}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:heart-linear" className="text-dark-400" width={32} />
            </div>
            <h3 className="text-lg font-semibold text-dark-900 mb-2">No saved listings</h3>
            <p className="text-dark-500 mb-6">Browse the marketplace and save listings you're interested in</p>
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </Card>
        )}
      </main>
    </>
  );
}

export default SavedListingsContent;
