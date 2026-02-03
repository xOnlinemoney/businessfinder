'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Listing {
  id: string;
  title: string;
  type: string;
  status: string;
  askingPrice: number;
  views: number;
  saves: number;
  inquiries: number;
  offers: number;
  daysListed: number;
  verified: boolean;
  featured: boolean;
}

interface Stats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'draft', label: 'Draft' },
  { value: 'sold', label: 'Sold' },
];

export function MyListingsContent() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [listingStatuses, setListingStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchListings = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - show empty state
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch user's listings
        const { data: userListings, error } = await (supabase.from('listings') as any)
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (userListings && userListings.length > 0) {
          // Get listing IDs for related queries
          const listingIds = userListings.map((l: any) => l.id);

          // Fetch saves count per listing
          const { data: savesData } = await (supabase.from('saved_listings') as any)
            .select('listing_id')
            .in('listing_id', listingIds);

          // Fetch inquiries count per listing
          const { data: inquiriesData } = await (supabase.from('inquiries') as any)
            .select('listing_id')
            .in('listing_id', listingIds);

          // Fetch offers count per listing
          const { data: offersData } = await (supabase.from('offers') as any)
            .select('listing_id')
            .in('listing_id', listingIds);

          // Count per listing
          const savesByListing: Record<string, number> = {};
          (savesData || []).forEach((s: any) => {
            savesByListing[s.listing_id] = (savesByListing[s.listing_id] || 0) + 1;
          });

          const inquiriesByListing: Record<string, number> = {};
          (inquiriesData || []).forEach((i: any) => {
            inquiriesByListing[i.listing_id] = (inquiriesByListing[i.listing_id] || 0) + 1;
          });

          const offersByListing: Record<string, number> = {};
          (offersData || []).forEach((o: any) => {
            offersByListing[o.listing_id] = (offersByListing[o.listing_id] || 0) + 1;
          });

          // Format listings
          const formattedListings: Listing[] = userListings.map((l: any) => {
            const createdDate = new Date(l.created_at);
            const now = new Date();
            const daysListed = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

            return {
              id: l.id,
              title: l.title,
              type: l.business_type || 'Other',
              status: l.status,
              askingPrice: l.asking_price || 0,
              views: l.views_count || 0,
              saves: savesByListing[l.id] || 0,
              inquiries: inquiriesByListing[l.id] || 0,
              offers: offersByListing[l.id] || 0,
              daysListed: l.status === 'active' ? daysListed : 0,
              verified: l.is_verified || false,
              featured: l.is_featured || false,
            };
          });

          setListings(formattedListings);
          setListingStatuses(
            formattedListings.reduce((acc, l) => ({ ...acc, [l.id]: l.status }), {})
          );

          // Calculate stats
          const totalViews = formattedListings.reduce((sum, l) => sum + l.views, 0);
          const totalInquiries = formattedListings.reduce((sum, l) => sum + l.inquiries, 0);
          const activeCount = formattedListings.filter(l => l.status === 'active').length;

          setStats({
            totalListings: formattedListings.length,
            activeListings: activeCount,
            totalViews,
            totalInquiries,
          });
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handlePauseListing = (listingId: string) => {
    setListingStatuses(prev => ({
      ...prev,
      [listingId]: prev[listingId] === 'active' ? 'paused' : 'active',
    }));
  };

  const getListingStatus = (listingId: string, originalStatus: string) => {
    return listingStatuses[listingId] || originalStatus;
  };

  const filteredListings = listings.filter((listing) => {
    const currentStatus = getListingStatus(listing.id, listing.status);
    if (statusFilter !== 'all' && currentStatus !== statusFilter) return false;
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge status="success">Active</StatusBadge>;
      case 'paused':
        return <StatusBadge status="warning">Paused</StatusBadge>;
      case 'pending_review':
        return <StatusBadge status="warning">Pending Review</StatusBadge>;
      case 'draft':
        return <StatusBadge status="default">Draft</StatusBadge>;
      case 'sold':
        return <StatusBadge status="info">Sold</StatusBadge>;
      default:
        return <StatusBadge status="default">{status}</StatusBadge>;
    }
  };

  const statsConfig = [
    { label: 'Total Listings', value: stats.totalListings, icon: 'solar:layers-bold', color: 'primary' },
    { label: 'Active Listings', value: stats.activeListings, icon: 'solar:check-circle-bold', color: 'emerald' },
    { label: 'Total Views', value: stats.totalViews, icon: 'solar:eye-bold', color: 'purple' },
    { label: 'Total Inquiries', value: stats.totalInquiries, icon: 'solar:chat-round-dots-bold', color: 'amber' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-dark-900 tracking-tight">My Listings</h1>
          <p className="text-sm text-dark-500">Manage your business listings</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/listings/new">
            <Button variant="primary">
              <Icon icon="solar:add-circle-linear" width={18} />
              Create Listing
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsConfig.map((stat) => (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                stat.color === 'primary' && 'bg-primary/10 text-primary',
                stat.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                stat.color === 'purple' && 'bg-purple-100 text-purple-600',
                stat.color === 'amber' && 'bg-amber-100 text-amber-600'
              )}>
                <Icon icon={stat.icon} width={24} />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
                )}
                <p className="text-sm text-dark-500">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Icon icon="solar:magnifer-linear" width={18} />}
              />
            </div>
            <div className="flex gap-3">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-6 w-24 bg-dark-100 rounded mb-4" />
                <div className="h-6 w-3/4 bg-dark-100 rounded mb-4" />
                <div className="h-24 bg-dark-100 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-dark-100 rounded" />
                  <div className="h-10 flex-1 bg-dark-100 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-16">
            <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="solar:layers-linear" width={40} className="text-dark-400" />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">No listings yet</h3>
            <p className="text-dark-500 mb-6 max-w-md mx-auto">
              Create your first listing to start attracting buyers and get offers for your business.
            </p>
            <Link href="/dashboard/listings/new">
              <Button variant="primary" size="lg">
                <Icon icon="solar:add-circle-linear" width={20} />
                Create Your First Listing
              </Button>
            </Link>
          </Card>
        ) : filteredListings.length === 0 ? (
          /* No Results State */
          <Card className="text-center py-12">
            <Icon icon="solar:magnifer-linear" width={48} className="text-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-900 mb-2">No listings found</h3>
            <p className="text-dark-500 mb-4">Try adjusting your search or filter criteria.</p>
            <Button variant="secondary" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          /* Listings Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredListings.map((listing) => {
              const currentStatus = getListingStatus(listing.id, listing.status);
              return (
                <Card key={listing.id} className="hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(currentStatus)}
                      {listing.verified && (
                        <Badge variant="success" size="sm">
                          <Icon icon="solar:verified-check-linear" width={12} />
                          Verified
                        </Badge>
                      )}
                      {listing.featured && (
                        <Badge variant="purple" size="sm">
                          <Icon icon="solar:star-bold" width={12} />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-dark-400">#{listing.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-dark-900 mb-2">{listing.title}</h3>

                  <div className="flex items-center gap-3 text-sm text-dark-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:tag-linear" width={14} />
                      {listing.type}
                    </span>
                    {listing.daysListed > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:calendar-linear" width={14} />
                        {listing.daysListed} days listed
                      </span>
                    )}
                  </div>

                  <div className="bg-dark-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-dark-500">Asking Price</span>
                      <span className="text-xl font-bold text-dark-900">{formatCurrency(listing.askingPrice)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-dark-900">{listing.views.toLocaleString()}</p>
                        <p className="text-xs text-dark-500">Views</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-dark-900">{listing.saves}</p>
                        <p className="text-xs text-dark-500">Saves</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{listing.inquiries}</p>
                        <p className="text-xs text-dark-500">Inquiries</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-600">{listing.offers}</p>
                        <p className="text-xs text-dark-500">Offers</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/listing/${listing.id}`} className="flex-1">
                      <Button variant="ghost" className="w-full">
                        <Icon icon="solar:eye-linear" width={16} />
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Icon icon="solar:pen-linear" width={16} />
                        Edit
                      </Button>
                    </Link>
                    {(currentStatus === 'active' || currentStatus === 'paused') && (
                      <Button
                        variant="ghost"
                        className={currentStatus === 'paused' ? 'text-emerald-500' : 'text-dark-500'}
                        onClick={() => handlePauseListing(listing.id)}
                        title={currentStatus === 'active' ? 'Pause listing' : 'Resume listing'}
                      >
                        <Icon
                          icon={currentStatus === 'active' ? 'solar:pause-circle-linear' : 'solar:play-circle-linear'}
                          width={16}
                        />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyListingsContent;
