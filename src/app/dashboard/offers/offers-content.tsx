'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Offer {
  id: string;
  listing: string;
  listingId: string;
  buyer: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  amount: number;
  askingPrice: number;
  status: string;
  message: string;
  submittedAt: string;
  expiresIn: string | null;
}

interface Stats {
  total: number;
  pending: number;
  totalValue: number;
  avgPercentage: number;
}

const mockOffers: Offer[] = [
  {
    id: 'OFF-001',
    listing: 'B2B SaaS - Marketing Automation',
    listingId: '1',
    buyer: { id: 'b1', name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?img=11', verified: true },
    amount: 2350000,
    askingPrice: 2500000,
    status: 'pending',
    message: 'Very interested in this opportunity. I have extensive experience in marketing technology.',
    submittedAt: '2 hours ago',
    expiresIn: '5 days',
  },
  {
    id: 'OFF-002',
    listing: 'E-commerce Brand - Health Supplements',
    listingId: '2',
    buyer: { id: 'b2', name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?img=5', verified: true },
    amount: 1150000,
    askingPrice: 1200000,
    status: 'pending',
    message: 'Looking to expand my portfolio in the health and wellness space.',
    submittedAt: '1 day ago',
    expiresIn: '6 days',
  },
];

export function OffersReceivedContent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, totalValue: 0, avgPercentage: 0 });
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setOffers(mockOffers);
        setStats({
          total: 3,
          pending: 2,
          totalValue: 3920000,
          avgPercentage: 94,
        });
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setOffers(mockOffers);
          setIsLoading(false);
          return;
        }

        // Get user's listings
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title, asking_price')
          .eq('seller_id', user.id) as { data: Array<{ id: string; title: string; asking_price: number | null }> | null };

        if (!listings || listings.length === 0) {
          setOffers([]);
          setStats({ total: 0, pending: 0, totalValue: 0, avgPercentage: 0 });
          setIsLoading(false);
          return;
        }

        // Fetch offers for user's listings
        const listingIds = listings.map(l => l.id);
        const { data: offersData } = await supabase
          .from('offers')
          .select(`
            id,
            amount,
            message,
            status,
            created_at,
            expires_at,
            listing_id,
            buyer:profiles!offers_buyer_id_fkey(id, first_name, last_name, avatar_url)
          `)
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false });

        if (offersData && offersData.length > 0) {
          const transformedOffers: Offer[] = offersData.map((offer: any) => {
            const listing = listings.find(l => l.id === offer.listing_id);
            const expiresAt = offer.expires_at ? new Date(offer.expires_at) : null;
            const now = new Date();
            let expiresIn = null;

            if (expiresAt && expiresAt > now) {
              const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              expiresIn = `${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
            }

            return {
              id: offer.id,
              listing: listing?.title || 'Unknown Listing',
              listingId: listing?.id || '',
              buyer: {
                id: offer.buyer?.id || '',
                name: `${offer.buyer?.first_name || ''} ${offer.buyer?.last_name || ''}`.trim() || 'Unknown Buyer',
                avatar: offer.buyer?.avatar_url || '',
                verified: true,
              },
              amount: offer.amount || 0,
              askingPrice: listing?.asking_price || 0,
              status: offer.status || 'pending',
              message: offer.message || '',
              submittedAt: formatRelativeTime(offer.created_at),
              expiresIn,
            };
          });

          setOffers(transformedOffers);

          // Calculate stats
          const pending = transformedOffers.filter(o => o.status === 'pending').length;
          const totalValue = transformedOffers.reduce((sum, o) => sum + o.amount, 0);
          const avgPercentage = transformedOffers.length > 0
            ? Math.round(transformedOffers.reduce((sum, o) => sum + (o.amount / o.askingPrice) * 100, 0) / transformedOffers.length)
            : 0;

          setStats({
            total: transformedOffers.length,
            pending,
            totalValue,
            avgPercentage,
          });
        } else {
          setOffers([]);
          setStats({ total: 0, pending: 0, totalValue: 0, avgPercentage: 0 });
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setOffers(mockOffers);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
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

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const handleOfferAction = async (action: 'accept' | 'decline' | 'counter') => {
    if (!selectedOffer) return;

    setActionLoading(action);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const newStatus = action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'countered';

        // Update offer status
        await (supabase.from('offers') as any)
          .update({ status: newStatus })
          .eq('id', selectedOffer.id);

        // Send notification to buyer
        await (supabase.from('notifications') as any).insert({
          user_id: selectedOffer.buyer.id,
          type: 'offer_update',
          message: `Your offer on "${selectedOffer.listing}" has been ${newStatus}`,
          is_read: false,
        });

        // If accepted, also notify the agent/seller
        if (action === 'accept') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await (supabase.from('notifications') as any).insert({
              user_id: user.id,
              type: 'offer_accepted',
              message: `You accepted an offer of ${formatCurrency(selectedOffer.amount)} on "${selectedOffer.listing}"`,
              is_read: false,
            });
          }
        }

        // Update local state
        setOffers(prev => prev.map(o =>
          o.id === selectedOffer.id ? { ...o, status: newStatus } : o
        ));

        setShowModal(false);
        setSelectedOffer(null);

      } catch (error) {
        console.error('Error updating offer:', error);
      }
    } else {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newStatus = action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'countered';
      setOffers(prev => prev.map(o =>
        o.id === selectedOffer.id ? { ...o, status: newStatus } : o
      ));
      setShowModal(false);
    }

    setActionLoading(null);
  };

  const statsConfig = [
    { label: 'Total Offers', value: stats.total.toString(), icon: 'solar:document-text-linear', color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Review', value: stats.pending.toString(), icon: 'solar:clock-circle-linear', color: 'bg-amber-100 text-amber-600' },
    { label: 'Total Value', value: formatCurrency(stats.totalValue, true), icon: 'solar:dollar-linear', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Avg. % of Ask', value: `${stats.avgPercentage}%`, icon: 'solar:chart-2-linear', color: 'bg-purple-100 text-purple-600' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900 tracking-tight">Offers Received</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 text-dark-500 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-colors relative">
            <Icon icon="solar:bell-linear" width={22} />
            {stats.pending > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-900 tracking-tight">Offers Received</h2>
          <p className="text-dark-500 mt-1">Review and respond to offers on your listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsConfig.map((stat) => (
            <Card key={stat.label} padding="md">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon icon={stat.icon} width={22} />
              </div>
              <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
              <p className="text-xs text-dark-500 font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Offers List */}
        <Card padding="none">
          <div className="p-5 border-b border-dark-200">
            <h3 className="font-bold text-dark-900">All Offers</h3>
          </div>
          {offers.length > 0 ? (
            <div className="divide-y divide-dark-100">
              {offers.map((offer) => (
                <div key={offer.id} className="p-5 hover:bg-dark-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {offer.buyer.avatar ? (
                        <img
                          src={offer.buyer.avatar}
                          alt={offer.buyer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon icon="solar:user-bold" width={20} className="text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-dark-900">{offer.buyer.name}</span>
                          {offer.buyer.verified && (
                            <Icon icon="solar:verified-check-bold" className="text-primary" width={16} />
                          )}
                        </div>
                        <p className="text-sm text-dark-600 mb-2">
                          Offer on <Link href={`/listing/${offer.listingId}`} className="text-primary hover:underline">{offer.listing}</Link>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-dark-500">
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:clock-circle-linear" width={14} />
                            {offer.submittedAt}
                          </span>
                          {offer.expiresIn && offer.status === 'pending' && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Icon icon="solar:hourglass-linear" width={14} />
                              Expires in {offer.expiresIn}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-dark-900">{formatCurrency(offer.amount, true)}</p>
                        <p className="text-xs text-dark-500">
                          {Math.round((offer.amount / offer.askingPrice) * 100)}% of asking ({formatCurrency(offer.askingPrice, true)})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            offer.status === 'pending' ? 'warning' :
                            offer.status === 'accepted' ? 'success' : 'danger'
                          }
                        >
                          {offer.status}
                        </Badge>
                        <Button size="sm" onClick={() => handleViewOffer(offer)}>
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Icon icon="solar:document-text-linear" width={48} className="text-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-900 mb-2">No offers yet</h3>
              <p className="text-dark-500">Offers from buyers will appear here when they're made on your listings.</p>
            </div>
          )}
        </Card>
      </main>

      {/* Offer Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Offer Details"
        size="lg"
      >
        {selectedOffer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-dark-50 rounded-xl">
              {selectedOffer.buyer.avatar ? (
                <img
                  src={selectedOffer.buyer.avatar}
                  alt={selectedOffer.buyer.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon icon="solar:user-bold" width={24} className="text-primary" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-dark-900">{selectedOffer.buyer.name}</span>
                  {selectedOffer.buyer.verified && (
                    <Icon icon="solar:verified-check-bold" className="text-primary" width={16} />
                  )}
                </div>
                <p className="text-sm text-dark-500">Offer submitted {selectedOffer.submittedAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-600 font-semibold mb-1">Offer Amount</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(selectedOffer.amount)}</p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-xs text-dark-500 font-semibold mb-1">Your Asking Price</p>
                <p className="text-2xl font-bold text-dark-900">{formatCurrency(selectedOffer.askingPrice)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-dark-500 font-semibold mb-2">Buyer's Message</p>
              <p className="text-dark-700 p-4 bg-dark-50 rounded-xl">{selectedOffer.message}</p>
            </div>

            {selectedOffer.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-dark-200">
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={() => handleOfferAction('accept')}
                  isLoading={actionLoading === 'accept'}
                  disabled={!!actionLoading}
                >
                  <Icon icon="solar:check-circle-linear" width={18} />
                  Accept Offer
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleOfferAction('counter')}
                  isLoading={actionLoading === 'counter'}
                  disabled={!!actionLoading}
                >
                  <Icon icon="solar:chat-round-dots-linear" width={18} />
                  Counter Offer
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleOfferAction('decline')}
                  isLoading={actionLoading === 'decline'}
                  disabled={!!actionLoading}
                >
                  <Icon icon="solar:close-circle-linear" width={18} />
                  Decline
                </Button>
              </div>
            )}

            {selectedOffer.status !== 'pending' && (
              <div className="pt-4 border-t border-dark-200 text-center">
                <Badge
                  variant={selectedOffer.status === 'accepted' ? 'success' : 'danger'}
                  size="lg"
                >
                  This offer has been {selectedOffer.status}
                </Badge>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export default OffersReceivedContent;
