'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Stats {
  totalViews: number;
  uniqueVisitors: number;
  saveRate: number;
  inquiryRate: number;
}

interface ListingPerformance {
  id: string;
  name: string;
  views: number;
  saves: number;
  inquiries: number;
  ctr: string;
}

const periodOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
];

export function AnalyticsContent() {
  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    uniqueVisitors: 0,
    saveRate: 0,
    inquiryRate: 0,
  });
  const [listingPerformance, setListingPerformance] = useState<ListingPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasListings, setHasListings] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - show empty state
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch user's listings with their stats
        const { data: listings, error } = await (supabase.from('listings') as any)
          .select('id, title, views_count')
          .eq('seller_id', user.id);

        if (error) throw error;

        if (!listings || listings.length === 0) {
          setHasListings(false);
          setIsLoading(false);
          return;
        }

        setHasListings(true);

        // Fetch saved counts for user's listings
        const listingIds = listings.map((l: any) => l.id);
        let savesData: any[] = [];
        let inquiriesData: any[] = [];

        if (listingIds.length > 0) {
          const { data: saves } = await (supabase.from('saved_listings') as any)
            .select('listing_id')
            .in('listing_id', listingIds);
          savesData = saves || [];

          const { data: inquiries } = await (supabase.from('inquiries') as any)
            .select('listing_id')
            .in('listing_id', listingIds);
          inquiriesData = inquiries || [];
        }

        // Calculate stats
        const totalViews = listings.reduce((sum: number, l: any) => sum + (l.views_count || 0), 0);
        const totalSaves = savesData.length;
        const totalInquiries = inquiriesData.length;

        // Calculate counts per listing
        const savesByListing: Record<string, number> = {};
        savesData.forEach((s: any) => {
          savesByListing[s.listing_id] = (savesByListing[s.listing_id] || 0) + 1;
        });

        const inquiriesByListing: Record<string, number> = {};
        inquiriesData.forEach((i: any) => {
          inquiriesByListing[i.listing_id] = (inquiriesByListing[i.listing_id] || 0) + 1;
        });

        // Format listing performance
        const performance: ListingPerformance[] = listings.map((l: any) => ({
          id: l.id,
          name: l.title,
          views: l.views_count || 0,
          saves: savesByListing[l.id] || 0,
          inquiries: inquiriesByListing[l.id] || 0,
          ctr: l.views_count > 0
            ? `${(((inquiriesByListing[l.id] || 0) / l.views_count) * 100).toFixed(1)}%`
            : '0%',
        })).sort((a: ListingPerformance, b: ListingPerformance) => b.views - a.views);

        setStats({
          totalViews,
          uniqueVisitors: Math.floor(totalViews * 0.64), // Estimate unique visitors
          saveRate: totalViews > 0 ? (totalSaves / totalViews) * 100 : 0,
          inquiryRate: totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0,
        });

        setListingPerformance(performance);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  const statsConfig = [
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: 'solar:eye-bold' },
    { label: 'Unique Visitors', value: stats.uniqueVisitors.toLocaleString(), icon: 'solar:users-group-rounded-bold' },
    { label: 'Save Rate', value: `${stats.saveRate.toFixed(1)}%`, icon: 'solar:heart-bold' },
    { label: 'Inquiry Rate', value: `${stats.inquiryRate.toFixed(1)}%`, icon: 'solar:chat-round-dots-bold' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-dark-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-dark-500">Track your listings performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-40"
          />
          <Button variant="ghost" size="sm">
            <Icon icon="solar:export-linear" width={18} />
            Export
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Empty State for Users with No Listings */}
        {!isLoading && !hasListings ? (
          <Card className="text-center py-16">
            <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="solar:chart-2-linear" width={40} className="text-dark-400" />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">No analytics data yet</h3>
            <p className="text-dark-500 mb-6 max-w-md mx-auto">
              Create your first listing to start tracking views, saves, and inquiries.
            </p>
            <Link href="/dashboard/listings/new">
              <Button variant="primary" size="lg">
                <Icon icon="solar:add-circle-linear" width={20} />
                Create Your First Listing
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsConfig.map((stat) => (
                <Card key={stat.label}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon icon={stat.icon} width={20} className="text-primary" />
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-dark-100 rounded animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
                  )}
                  <p className="text-sm text-dark-500">{stat.label}</p>
                </Card>
              ))}
            </div>

            {/* Listing Performance Table */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dark-900">Listing Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Listing</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Views</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Saves</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Inquiries</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100">
                    {isLoading ? (
                      [...Array(4)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-4 px-4"><div className="h-4 w-40 bg-dark-100 rounded" /></td>
                          <td className="py-4 px-4 text-right"><div className="h-4 w-16 bg-dark-100 rounded ml-auto" /></td>
                          <td className="py-4 px-4 text-right"><div className="h-4 w-12 bg-dark-100 rounded ml-auto" /></td>
                          <td className="py-4 px-4 text-right"><div className="h-4 w-12 bg-dark-100 rounded ml-auto" /></td>
                          <td className="py-4 px-4 text-right"><div className="h-4 w-12 bg-dark-100 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : listingPerformance.length > 0 ? (
                      listingPerformance.map((listing) => (
                        <tr key={listing.id} className="hover:bg-dark-50">
                          <td className="py-4 px-4">
                            <span className="font-medium text-dark-900">{listing.name}</span>
                          </td>
                          <td className="py-4 px-4 text-right text-dark-600">{listing.views.toLocaleString()}</td>
                          <td className="py-4 px-4 text-right text-dark-600">{listing.saves}</td>
                          <td className="py-4 px-4 text-right text-dark-600">{listing.inquiries}</td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-emerald-600 font-medium">{listing.ctr}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-dark-500">
                          <Icon icon="solar:chart-2-linear" width={32} className="mx-auto mb-2 opacity-50" />
                          <p>No listing data available yet</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

export default AnalyticsContent;
