'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface Seller {
  id: string;
  name: string;
  email: string;
  businessName: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'pending';
  verified: boolean;
  onboardingCompleted: boolean;
  totalListings: number;
  activeListings: number;
  totalRevenue: string;
  askingPrice: string;
}

export function SellersContent() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // No database connection - show empty state
        setSellers([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all profiles that are sellers (is_seller = true)
        // Use select('*') to handle any missing columns gracefully
        const { data: profilesData, error: profilesError } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('is_seller', true)
          .order('created_at', { ascending: false });

        console.log('Sellers query result:', { profilesData, profilesError });

        if (profilesError) throw profilesError;

        // Fetch all listings to calculate stats per seller
        const { data: listingsData } = await (supabase.from('listings') as any)
          .select(`
            id,
            title,
            status,
            asking_price,
            revenue,
            seller_id
          `);

        // Calculate listing stats per seller
        const sellerStats: Record<string, { total: number; active: number; revenue: number; askingPrice: number; businessName: string }> = {};
        (listingsData || []).forEach((listing: any) => {
          if (!sellerStats[listing.seller_id]) {
            sellerStats[listing.seller_id] = { total: 0, active: 0, revenue: 0, askingPrice: 0, businessName: listing.title || 'N/A' };
          }
          sellerStats[listing.seller_id].total += 1;
          if (listing.status === 'active') {
            sellerStats[listing.seller_id].active += 1;
            sellerStats[listing.seller_id].businessName = listing.title || sellerStats[listing.seller_id].businessName;
          }
          sellerStats[listing.seller_id].revenue += listing.revenue || 0;
          sellerStats[listing.seller_id].askingPrice += listing.asking_price || 0;
        });

        const formattedSellers: Seller[] = (profilesData || []).map((profile: any) => {
          const stats = sellerStats[profile.id] || { total: 0, active: 0, revenue: 0, askingPrice: 0, businessName: '' };

          // Determine status - default to 'active' if columns don't exist
          let status: 'active' | 'inactive' | 'pending' = 'active';
          if (profile.is_suspended === true) {
            status = 'inactive';
          } else if (profile.is_verified === false) {
            status = 'pending';
          }

          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email?.split('@')[0] || 'Unknown',
            email: profile.email || '-',
            businessName: stats.businessName || profile.company_name || '-',
            joinedDate: profile.created_at,
            status,
            verified: profile.is_verified || false,
            onboardingCompleted: profile.onboarding_completed || false,
            totalListings: stats.total,
            activeListings: stats.active,
            totalRevenue: stats.revenue > 0 ? formatCurrency(stats.revenue, true) + '/year' : '-',
            askingPrice: stats.active === 0 ? '-' : formatCurrency(stats.askingPrice, true),
          };
        });

        setSellers(formattedSellers);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        setSellers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         seller.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || seller.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSuspend = async (id: string) => {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('profiles') as any)
          .update({ is_suspended: true })
          .eq('id', id);
      } catch (error) {
        console.error('Error suspending seller:', error);
      }
    }

    setSellers(prev => prev.map(s =>
      s.id === id ? { ...s, status: 'inactive' as const } : s
    ));
  };

  const handleActivate = async (id: string) => {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('profiles') as any)
          .update({ is_suspended: false })
          .eq('id', id);
      } catch (error) {
        console.error('Error activating seller:', error);
      }
    }

    setSellers(prev => prev.map(s =>
      s.id === id ? { ...s, status: 'active' as const } : s
    ));
  };

  const stats = {
    total: sellers.length,
    active: sellers.filter(s => s.status === 'active').length,
    verified: sellers.filter(s => s.verified).length,
    totalListings: sellers.reduce((acc, s) => acc + s.activeListings, 0),
  };

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-dark-900">Sellers</h1>
          <p className="text-sm text-dark-500">Manage seller accounts and their listings</p>
        </div>
        <Button variant="ghost" size="sm">
          <Icon icon="solar:export-linear" width={18} />
          Export
        </Button>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon icon="solar:shop-2-linear" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.total}</p>
                )}
                <p className="text-sm text-dark-500">Total Sellers</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon icon="solar:check-circle-linear" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.active}</p>
                )}
                <p className="text-sm text-dark-500">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Icon icon="solar:verified-check-linear" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.verified}</p>
                )}
                <p className="text-sm text-dark-500">Verified</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Icon icon="solar:document-text-linear" className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.totalListings}</p>
                )}
                <p className="text-sm text-dark-500">Active Listings</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Icon icon="solar:magnifer-linear" className="w-5 h-5 text-dark-400" />}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-dark-200 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </Card>

        {/* Sellers Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Seller</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Business</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Listings</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-40 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-16 bg-dark-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredSellers.length > 0 ? (
                  filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-dark-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {seller.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-dark-900 flex items-center gap-2">
                              {seller.name}
                              {seller.verified && (
                                <Icon icon="solar:verified-check-bold" className="w-4 h-4 text-blue-500" />
                              )}
                              {!seller.onboardingCompleted && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
                                  Incomplete
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-dark-500">{seller.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-dark-900">{seller.businessName}</div>
                        <div className="text-sm text-dark-500">Asking: {seller.askingPrice}</div>
                      </td>
                      <td className="px-6 py-4 text-dark-700">{seller.totalRevenue}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-dark-900">{seller.activeListings} active</div>
                          <div className="text-dark-500">{seller.totalListings} total</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={seller.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowModal(true);
                            }}
                          >
                            <Icon icon="solar:eye-linear" className="w-4 h-4" />
                          </Button>
                          {seller.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspend(seller.id)}
                            >
                              <Icon icon="solar:pause-linear" className="w-4 h-4 text-yellow-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivate(seller.id)}
                            >
                              <Icon icon="solar:play-linear" className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                      <Icon icon="solar:shop-2-linear" width={32} className="mx-auto mb-2 opacity-50" />
                      <p>No sellers found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Seller Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Seller Details"
        size="lg"
      >
        {selectedSeller && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xl font-semibold">
                  {selectedSeller.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
                  {selectedSeller.name}
                  {selectedSeller.verified && (
                    <Icon icon="solar:verified-check-bold" className="w-5 h-5 text-blue-500" />
                  )}
                </h3>
                <p className="text-dark-500">{selectedSeller.businessName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-dark-500">Email</label>
                <p className="text-dark-900">{selectedSeller.email}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500">Joined</label>
                <p className="text-dark-900">{new Date(selectedSeller.joinedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500">Annual Revenue</label>
                <p className="text-dark-900 font-semibold">{selectedSeller.totalRevenue}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500">Asking Price</label>
                <p className="text-dark-900 font-semibold">{selectedSeller.askingPrice}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-dark-50 rounded-lg">
                <p className="text-2xl font-bold text-dark-900">{selectedSeller.activeListings}</p>
                <p className="text-sm text-dark-500">Active Listings</p>
              </div>
              <div className="text-center p-4 bg-dark-50 rounded-lg">
                <p className="text-2xl font-bold text-dark-900">{selectedSeller.totalListings}</p>
                <p className="text-sm text-dark-500">Total Listings</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="secondary" className="flex-1">
                <Icon icon="solar:document-text-linear" className="w-5 h-5 mr-2" />
                View Listings
              </Button>
              <Button className="flex-1">
                <Icon icon="solar:letter-linear" className="w-5 h-5 mr-2" />
                Contact Seller
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
