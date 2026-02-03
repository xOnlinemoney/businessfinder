'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface NDA {
  id: string;
  listing: string;
  listingId: string;
  signedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'listing-sold';
  category: string;
  askingPrice: number;
}

// No mock data - show empty state for new users

export function NDAsContent() {
  const [ndas, setNDAs] = useState<NDA[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNDAs = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - show empty state
        setNDAs([]);
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setNDAs([]);
          setIsLoading(false);
          return;
        }

        // Step 1: Fetch NDA signatures for this user
        const { data: ndaData, error: ndaError } = await (supabase.from('nda_signatures') as any)
          .select('id, signed_at, signature_name, listing_id')
          .eq('user_id', user.id)
          .order('signed_at', { ascending: false });

        if (ndaError) {
          console.error('Supabase NDA error:', ndaError);
          throw ndaError;
        }

        console.log('Fetched NDA signatures:', ndaData);

        if (!ndaData || ndaData.length === 0) {
          setNDAs([]);
          return;
        }

        // Step 2: Get listing IDs and fetch those listings
        const listingIds = ndaData.map((nda: any) => nda.listing_id);
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

        const formattedNDAs: NDA[] = ndaData
          .map((item: any) => {
            const listing = listingsMap.get(item.listing_id);
            if (!listing) {
              console.log('Listing not found for id:', item.listing_id);
              return null;
            }

            // Calculate expiry date (2 years from signing)
            const signedDate = new Date(item.signed_at);
            const expiryDate = new Date(signedDate);
            expiryDate.setFullYear(expiryDate.getFullYear() + 2);

            // Determine NDA status based on listing status and expiry
            let ndaStatus: 'active' | 'expired' | 'listing-sold' = 'active';
            if (listing.status === 'sold') {
              ndaStatus = 'listing-sold';
            } else if (expiryDate < new Date()) {
              ndaStatus = 'expired';
            }

            // Handle different possible column names
            const category = listing.business_type ?? listing.category ?? 'Other';

            return {
              id: item.id.substring(0, 8).toUpperCase(),
              listing: listing.title,
              listingId: listing.id,
              signedAt: signedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              expiresAt: expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              status: ndaStatus,
              category: category,
              askingPrice: listing.asking_price || 0,
            };
          })
          .filter(Boolean) as NDA[];

        setNDAs(formattedNDAs);
      } catch (error) {
        console.error('Error fetching NDAs:', error);
        setNDAs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNDAs();
  }, []);

  const activeNDAs = ndas.filter(n => n.status === 'active').length;

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900 tracking-tight">NDAs Signed</h1>
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
            <h2 className="text-2xl font-bold text-dark-900 tracking-tight">NDAs Signed</h2>
            <p className="text-dark-500 mt-1">{activeNDAs} active agreements</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Icon icon="solar:info-circle-linear" className="text-blue-600 shrink-0 mt-0.5" width={20} />
          <div>
            <p className="text-sm text-blue-900 font-medium">About NDAs</p>
            <p className="text-sm text-blue-700">
              Non-disclosure agreements protect confidential business information. Once signed, you can access
              detailed financials, customer data, and seller contact information for that listing.
            </p>
          </div>
        </div>

        {/* NDAs Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} padding="none" className="overflow-hidden animate-pulse">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-dark-100 rounded-lg" />
                      <div>
                        <div className="h-3 w-20 bg-dark-100 rounded mb-2" />
                        <div className="h-5 w-16 bg-dark-100 rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-dark-100 rounded-full" />
                  </div>
                  <div className="h-5 w-3/4 bg-dark-100 rounded mb-3" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-dark-50 rounded-lg h-16" />
                    <div className="p-3 bg-dark-50 rounded-lg h-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : ndas.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {ndas.map((nda) => (
              <Card key={nda.id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Icon icon="solar:shield-check-linear" className="text-emerald-600" width={22} />
                      </div>
                      <div>
                        <p className="text-xs text-dark-500 font-medium">{nda.id}</p>
                        <Badge
                          variant={nda.status === 'active' ? 'success' : 'default'}
                          size="sm"
                        >
                          {nda.status === 'active' ? 'Active' : nda.status === 'expired' ? 'Expired' : 'Listing Sold'}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" size="sm">{nda.category}</Badge>
                  </div>

                  <Link href={`/listing/${nda.listingId}`}>
                    <h3 className="font-semibold text-dark-900 hover:text-primary transition-colors mb-3">
                      {nda.listing}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between text-sm text-dark-600 mb-4">
                    <span>Asking Price</span>
                    <span className="font-bold text-dark-900">{formatCurrency(nda.askingPrice, true)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-dark-50 rounded-lg">
                      <p className="text-dark-500 mb-1">Signed</p>
                      <p className="font-medium text-dark-900">{nda.signedAt}</p>
                    </div>
                    <div className="p-3 bg-dark-50 rounded-lg">
                      <p className="text-dark-500 mb-1">Expires</p>
                      <p className="font-medium text-dark-900">{nda.expiresAt}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-dark-50 border-t border-dark-100 flex items-center justify-between">
                  <button className="text-sm text-dark-600 hover:text-dark-900 flex items-center gap-1">
                    <Icon icon="solar:document-text-linear" width={16} />
                    View Agreement
                  </button>
                  <Link href={`/listing/${nda.listingId}`}>
                    <Button size="sm" variant="primary">
                      View Listing
                      <Icon icon="solar:arrow-right-linear" width={14} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:shield-check-linear" className="text-dark-400" width={32} />
            </div>
            <h3 className="text-lg font-semibold text-dark-900 mb-2">No NDAs signed yet</h3>
            <p className="text-dark-500 mb-6">Sign an NDA on a listing to access confidential details</p>
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </Card>
        )}
      </main>
    </>
  );
}

export default NDAsContent;
