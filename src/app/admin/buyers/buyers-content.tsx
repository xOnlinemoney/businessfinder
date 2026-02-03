'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Buyer {
  id: string;
  name: string;
  email: string;
  company: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'pending';
  verified: boolean;
  onboardingCompleted: boolean;
  totalInquiries: number;
  activeNDAs: number;
  budget: string;
  interests: string[];
}

export function BuyersContent() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuyers = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // No database connection - show empty state
        setBuyers([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all profiles that are buyers (is_buyer = true)
        // Only select columns that definitely exist in the database
        const { data: profilesData, error } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('is_buyer', true)
          .order('created_at', { ascending: false });

        console.log('Buyers query result:', { profilesData, error });

        if (error) throw error;

        // Fetch inquiry counts for each user
        const { data: inquiriesData } = await (supabase.from('inquiries') as any)
          .select('buyer_id');

        // Fetch NDA counts for each user
        const { data: ndasData } = await (supabase.from('ndas') as any)
          .select('buyer_id, status')
          .eq('status', 'signed');

        // Calculate counts
        const inquiryCounts: Record<string, number> = {};
        (inquiriesData || []).forEach((inq: any) => {
          inquiryCounts[inq.buyer_id] = (inquiryCounts[inq.buyer_id] || 0) + 1;
        });

        const ndaCounts: Record<string, number> = {};
        (ndasData || []).forEach((nda: any) => {
          ndaCounts[nda.buyer_id] = (ndaCounts[nda.buyer_id] || 0) + 1;
        });

        const formattedBuyers: Buyer[] = (profilesData || []).map((profile: any) => {
          // Format budget range - handle missing columns gracefully
          let budget = '-';
          if (profile.investment_range_min || profile.investment_range_max) {
            const min = profile.investment_range_min;
            const max = profile.investment_range_max;
            if (min && max) {
              budget = `$${(min / 1000).toFixed(0)}K - $${max >= 1000000 ? (max / 1000000).toFixed(0) + 'M' : (max / 1000).toFixed(0) + 'K'}`;
            } else if (min) {
              budget = `$${(min / 1000).toFixed(0)}K+`;
            } else if (max) {
              budget = `Up to $${max >= 1000000 ? (max / 1000000).toFixed(0) + 'M' : (max / 1000).toFixed(0) + 'K'}`;
            }
          }

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
            company: profile.company_name || '-',
            joinedDate: profile.created_at,
            status,
            verified: profile.is_verified || false,
            onboardingCompleted: profile.onboarding_completed || false,
            totalInquiries: inquiryCounts[profile.id] || 0,
            activeNDAs: ndaCounts[profile.id] || 0,
            budget,
            interests: profile.interested_categories || [],
          };
        });

        setBuyers(formattedBuyers);
      } catch (error) {
        console.error('Error fetching buyers:', error);
        setBuyers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyers();
  }, []);

  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         buyer.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || buyer.status === filterStatus;
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
        console.error('Error suspending buyer:', error);
      }
    }

    setBuyers(prev => prev.map(b =>
      b.id === id ? { ...b, status: 'inactive' as const } : b
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
        console.error('Error activating buyer:', error);
      }
    }

    setBuyers(prev => prev.map(b =>
      b.id === id ? { ...b, status: 'active' as const } : b
    ));
  };

  const stats = {
    total: buyers.length,
    active: buyers.filter(b => b.status === 'active').length,
    verified: buyers.filter(b => b.verified).length,
    pending: buyers.filter(b => b.status === 'pending').length,
  };

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-dark-900">Buyers</h1>
          <p className="text-sm text-dark-500">Manage buyer accounts and activity</p>
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
                <Icon icon="solar:users-group-rounded-linear" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.total}</p>
                )}
                <p className="text-sm text-dark-500">Total Buyers</p>
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
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.pending}</p>
                )}
                <p className="text-sm text-dark-500">Pending</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search buyers..."
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

        {/* Buyers Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Buyer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Budget</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Activity</th>
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
                ) : filteredBuyers.length > 0 ? (
                  filteredBuyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-dark-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {buyer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-dark-900 flex items-center gap-2">
                              {buyer.name}
                              {buyer.verified && (
                                <Icon icon="solar:verified-check-bold" className="w-4 h-4 text-blue-500" />
                              )}
                              {!buyer.onboardingCompleted && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
                                  Incomplete
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-dark-500">{buyer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-700">{buyer.company}</td>
                      <td className="px-6 py-4 text-dark-700">{buyer.budget}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-dark-900">{buyer.totalInquiries} inquiries</div>
                          <div className="text-dark-500">{buyer.activeNDAs} active NDAs</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={buyer.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBuyer(buyer);
                              setShowModal(true);
                            }}
                          >
                            <Icon icon="solar:eye-linear" className="w-4 h-4" />
                          </Button>
                          {buyer.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspend(buyer.id)}
                            >
                              <Icon icon="solar:pause-linear" className="w-4 h-4 text-yellow-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivate(buyer.id)}
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
                      <Icon icon="solar:users-group-rounded-linear" width={32} className="mx-auto mb-2 opacity-50" />
                      <p>No buyers found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Buyer Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Buyer Details"
        size="lg"
      >
        {selectedBuyer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xl font-semibold">
                  {selectedBuyer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
                  {selectedBuyer.name}
                  {selectedBuyer.verified && (
                    <Icon icon="solar:verified-check-bold" className="w-5 h-5 text-blue-500" />
                  )}
                </h3>
                <p className="text-dark-500">{selectedBuyer.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-dark-500">Email</label>
                <p className="text-dark-900">{selectedBuyer.email}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500">Joined</label>
                <p className="text-dark-900">{new Date(selectedBuyer.joinedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500">Budget Range</label>
                <p className="text-dark-900">{selectedBuyer.budget}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedBuyer.status} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-dark-500 block mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {selectedBuyer.interests.length > 0 ? (
                  selectedBuyer.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-dark-100 rounded-full text-sm text-dark-700">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-dark-500 text-sm">No interests specified</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-dark-50 rounded-lg">
                <p className="text-2xl font-bold text-dark-900">{selectedBuyer.totalInquiries}</p>
                <p className="text-sm text-dark-500">Total Inquiries</p>
              </div>
              <div className="text-center p-4 bg-dark-50 rounded-lg">
                <p className="text-2xl font-bold text-dark-900">{selectedBuyer.activeNDAs}</p>
                <p className="text-sm text-dark-500">Active NDAs</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
