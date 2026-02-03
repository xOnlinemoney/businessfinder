'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalBuyers: number;
  totalSellers: number;
  activeListings: number;
  pendingListings: number;
  totalTransactions: number;
  revenue: number;
  pendingVerifications: number;
}

interface Transaction {
  id: string;
  listing: string;
  buyer: string;
  seller: string;
  amount: number;
  status: string;
  date: string;
}

interface PendingVerification {
  id: string;
  type: string;
  name: string;
  submitted: string;
  priority: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const categoryColors: Record<string, string> = {
  saas: 'bg-blue-500',
  ecommerce: 'bg-emerald-500',
  content: 'bg-purple-500',
  agency: 'bg-amber-500',
  marketplace: 'bg-pink-500',
  mobile_app: 'bg-cyan-500',
  other: 'bg-dark-400',
};

const categoryLabels: Record<string, string> = {
  saas: 'SaaS',
  ecommerce: 'E-commerce',
  content: 'Content',
  agency: 'Agency',
  marketplace: 'Marketplace',
  mobile_app: 'Mobile App',
  other: 'Other',
};

export function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBuyers: 0,
    totalSellers: 0,
    activeListings: 0,
    pendingListings: 0,
    totalTransactions: 0,
    revenue: 0,
    pendingVerifications: 0,
  });
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - use mock data
        setStats({
          totalBuyers: 18542,
          totalSellers: 6350,
          activeListings: 3847,
          pendingListings: 156,
          totalTransactions: 287,
          revenue: 847000,
          pendingVerifications: 42,
        });
        setCategoryDistribution([
          { name: 'SaaS', value: 35, color: 'bg-blue-500' },
          { name: 'E-commerce', value: 28, color: 'bg-emerald-500' },
          { name: 'Content', value: 18, color: 'bg-purple-500' },
          { name: 'Agency', value: 12, color: 'bg-amber-500' },
          { name: 'Other', value: 7, color: 'bg-dark-400' },
        ]);
        setRecentTransactions([
          { id: 'TXN-001', listing: 'B2B SaaS Platform', buyer: 'John M.', seller: 'Sarah K.', amount: 2500000, status: 'closing', date: '2 hours ago' },
          { id: 'TXN-002', listing: 'E-commerce Brand', buyer: 'Mike R.', seller: 'Emily T.', amount: 890000, status: 'diligence', date: '5 hours ago' },
          { id: 'TXN-003', listing: 'Content Portfolio', buyer: 'Alex S.', seller: 'Chris W.', amount: 320000, status: 'escrow', date: '1 day ago' },
        ]);
        setPendingVerifications([
          { id: 'V-001', type: 'Business', name: 'AI Analytics Tool', submitted: '2 hours ago', priority: 'high' },
          { id: 'V-002', type: 'User', name: 'Michael Johnson', submitted: '4 hours ago', priority: 'medium' },
          { id: 'V-003', type: 'Business', name: 'SaaS CRM Platform', submitted: '6 hours ago', priority: 'low' },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all stats in parallel
        const [
          buyersResult,
          sellersResult,
          activeListingsResult,
          pendingListingsResult,
          transactionsResult,
          offersResult,
          listingsByCategoryResult,
        ] = await Promise.all([
          // Count buyers: is_buyer = true
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_buyer', true),
          // Count sellers: is_seller = true
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_seller', true),
          supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('listings').select('id', { count: 'exact', head: true }).in('status', ['pending', 'pending_review']),
          supabase.from('transactions').select('id, amount', { count: 'exact' }),
          supabase.from('offers').select('amount').eq('status', 'accepted'),
          supabase.from('listings').select('category').eq('status', 'active'),
        ]);

        // Calculate stats
        const totalRevenue = (transactionsResult.data || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        setStats({
          totalBuyers: buyersResult.count || 0,
          totalSellers: sellersResult.count || 0,
          activeListings: activeListingsResult.count || 0,
          pendingListings: pendingListingsResult.count || 0,
          totalTransactions: transactionsResult.count || 0,
          revenue: totalRevenue,
          pendingVerifications: pendingListingsResult.count || 0,
        });

        // Calculate category distribution
        const categoryCounts: Record<string, number> = {};
        (listingsByCategoryResult.data || []).forEach((listing: any) => {
          const cat = listing.category || 'other';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const totalListings = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
        const categoryData = Object.entries(categoryCounts)
          .map(([name, count]) => ({
            name: categoryLabels[name] || name,
            value: totalListings > 0 ? Math.round((count / totalListings) * 100) : 0,
            color: categoryColors[name] || 'bg-dark-400',
          }))
          .sort((a, b) => b.value - a.value);

        setCategoryDistribution(categoryData);

        // Fetch recent transactions
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            status,
            created_at,
            listing:listings(title),
            buyer:profiles!transactions_buyer_id_fkey(first_name, last_name),
            seller:profiles!transactions_seller_id_fkey(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (transactionsData && transactionsData.length > 0) {
          setRecentTransactions(transactionsData.map((t: any) => ({
            id: t.id.substring(0, 8).toUpperCase(),
            listing: t.listing?.title || 'Unknown Listing',
            buyer: t.buyer ? `${t.buyer.first_name || ''} ${(t.buyer.last_name || '').charAt(0)}.` : 'Unknown',
            seller: t.seller ? `${t.seller.first_name || ''} ${(t.seller.last_name || '').charAt(0)}.` : 'Unknown',
            amount: t.amount || 0,
            status: t.status || 'pending',
            date: formatRelativeTime(t.created_at),
          })));
        }

        // Fetch pending listings as verifications
        const { data: pendingListingsData } = await supabase
          .from('listings')
          .select('id, title, created_at, asking_price')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        if (pendingListingsData && pendingListingsData.length > 0) {
          setPendingVerifications(pendingListingsData.map((l: any) => ({
            id: l.id.substring(0, 8).toUpperCase(),
            type: 'Business',
            name: l.title || 'Untitled Listing',
            submitted: formatRelativeTime(l.created_at),
            priority: (l.asking_price || 0) > 1000000 ? 'high' : (l.asking_price || 0) > 500000 ? 'medium' : 'low',
          })));
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const statsConfig = [
    { label: 'Total Buyers', value: stats.totalBuyers.toLocaleString(), change: '+12%', icon: 'solar:bag-check-linear', color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Sellers', value: stats.totalSellers.toLocaleString(), change: '+8%', icon: 'solar:shop-linear', color: 'bg-cyan-100 text-cyan-600' },
    { label: 'Active Listings', value: stats.activeListings.toLocaleString(), change: '+8%', icon: 'solar:shop-2-linear', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Pending Listings', value: stats.pendingListings.toLocaleString(), change: '', icon: 'solar:clock-circle-linear', color: 'bg-orange-100 text-orange-600' },
    { label: 'Transactions', value: stats.totalTransactions.toLocaleString(), change: '+24%', icon: 'solar:bill-list-linear', color: 'bg-purple-100 text-purple-600' },
    { label: 'Revenue', value: formatCurrency(stats.revenue, true), change: '+18%', icon: 'solar:dollar-linear', color: 'bg-amber-100 text-amber-600' },
  ];

  const totalCategoryValue = categoryDistribution.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-dark-200 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-dark-500">
          <span className="text-dark-900 font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 flex items-center justify-center text-dark-500 hover:text-dark-700 hover:bg-dark-100 rounded-xl transition-colors">
            <Icon icon="solar:bell-linear" width={20} />
            {stats.pendingVerifications > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-dark-500 text-sm mt-1">Overview of platform performance and activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statsConfig.map((stat) => (
            <Card key={stat.label} padding="md">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon icon={stat.icon} width={22} />
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-dark-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
              )}
              <p className="text-xs text-dark-500 font-medium">{stat.label}</p>
              {stat.change && (
                <p className={`text-[10px] font-bold mt-1 ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.change} vs last month
                </p>
              )}
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Category Distribution */}
          <Card padding="none">
            <div className="p-5 border-b border-dark-200">
              <h3 className="font-bold text-dark-900">Listings by Category</h3>
            </div>
            <div className="p-5">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-32 h-32 rounded-full bg-dark-100 animate-pulse" />
                </div>
              ) : categoryDistribution.length > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {categoryDistribution.reduce((acc, cat, i) => {
                          const offset = acc.offset;
                          const dashArray = cat.value * 3.14;
                          acc.elements.push(
                            <circle
                              key={cat.name}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="20"
                              strokeDasharray={`${dashArray} 314`}
                              strokeDashoffset={-offset}
                              className={cat.color.replace('bg-', 'text-')}
                            />
                          );
                          acc.offset += dashArray;
                          return acc;
                        }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-dark-900">{stats.activeListings.toLocaleString()}</p>
                          <p className="text-xs text-dark-500">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {categoryDistribution.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                          <span className="text-sm text-dark-600">{cat.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-dark-900">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-dark-500">
                  <Icon icon="solar:chart-2-linear" width={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card padding="none" className="lg:col-span-2">
            <div className="flex items-center justify-between p-5 border-b border-dark-200">
              <h3 className="font-bold text-dark-900">Recent Transactions</h3>
              <Link href="/admin/transactions" className="text-sm text-primary hover:text-primary-dark font-medium">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-dark-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="h-5 w-48 bg-dark-100 rounded mb-2" />
                        <div className="h-3 w-32 bg-dark-100 rounded" />
                      </div>
                      <div className="text-right">
                        <div className="h-5 w-24 bg-dark-100 rounded mb-2" />
                        <div className="h-4 w-16 bg-dark-100 rounded" />
                      </div>
                    </div>
                  </div>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((txn) => (
                  <div key={txn.id} className="p-4 hover:bg-dark-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-dark-900 truncate">{txn.listing}</p>
                        <p className="text-xs text-dark-500 mt-1">
                          {txn.buyer} → {txn.seller} • {txn.date}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-dark-900">{formatCurrency(txn.amount, true)}</p>
                        <Badge
                          variant={
                            txn.status === 'completed' || txn.status === 'closing' ? 'success' :
                            txn.status === 'escrow' ? 'primary' : 'warning'
                          }
                          size="sm"
                        >
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-dark-500">
                  <Icon icon="solar:bill-list-linear" width={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Pending Verifications */}
        <Card padding="none">
          <div className="flex items-center justify-between p-5 border-b border-dark-200">
            <h3 className="font-bold text-dark-900">Pending Verifications</h3>
            <Link href="/admin/listings?status=pending" className="text-sm text-primary hover:text-primary-dark font-medium">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Priority</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 w-16 bg-dark-100 rounded" /></td>
                      <td className="px-5 py-4"><div className="h-5 w-20 bg-dark-100 rounded" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-32 bg-dark-100 rounded" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-24 bg-dark-100 rounded" /></td>
                      <td className="px-5 py-4"><div className="h-5 w-16 bg-dark-100 rounded" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-16 bg-dark-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : pendingVerifications.length > 0 ? (
                  pendingVerifications.map((item) => (
                    <tr key={item.id} className="hover:bg-dark-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-dark-900">{item.id}</td>
                      <td className="px-5 py-4">
                        <Badge variant={item.type === 'Business' ? 'primary' : 'default'} size="sm">
                          {item.type}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm text-dark-700">{item.name}</td>
                      <td className="px-5 py-4 text-sm text-dark-500">{item.submitted}</td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            item.priority === 'high' ? 'danger' :
                            item.priority === 'medium' ? 'warning' : 'default'
                          }
                          size="sm"
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/listings`}
                          className="text-sm font-medium text-primary hover:text-primary-dark"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-dark-500">
                      <Icon icon="solar:check-circle-bold" width={32} className="mx-auto mb-2 text-emerald-500" />
                      <p className="text-sm">All caught up! No pending verifications.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </>
  );
}

export default AdminDashboardContent;
