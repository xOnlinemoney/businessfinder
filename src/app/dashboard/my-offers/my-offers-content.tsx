'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Input, Textarea } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Offer {
  id: string;
  listing: string;
  listingId: string;
  seller: { name: string; avatar: string };
  offerAmount: number;
  askingPrice: number;
  status: string;
  counterAmount?: number;
  submittedAt: string;
  lastActivity: string;
}

interface Stats {
  activeOffers: number;
  counterOffers: number;
  accepted: number;
  totalOffered: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: 'warning', icon: 'solar:clock-circle-linear' },
  countered: { label: 'Counter Offer', color: 'info', icon: 'solar:refresh-circle-linear' },
  accepted: { label: 'Accepted', color: 'success', icon: 'solar:check-circle-linear' },
  rejected: { label: 'Rejected', color: 'danger', icon: 'solar:close-circle-linear' },
  expired: { label: 'Expired', color: 'default', icon: 'solar:clock-circle-linear' },
  withdrawn: { label: 'Withdrawn', color: 'default', icon: 'solar:minus-circle-linear' },
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export function MyOffersContent() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<Stats>({ activeOffers: 0, counterOffers: 0, accepted: 0, totalOffered: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [negotiateAmount, setNegotiateAmount] = useState('');
  const [negotiateMessage, setNegotiateMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setOffers([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setOffers([]);
          setIsLoading(false);
          return;
        }

        // Fetch offers made by this user (as buyer)
        const { data, error } = await (supabase.from('offers') as any)
          .select(`
            id,
            amount,
            counter_amount,
            status,
            message,
            created_at,
            updated_at,
            listing:listings(
              id,
              title,
              asking_price,
              seller:profiles!seller_id(
                id,
                full_name,
                avatar_url
              )
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedOffers: Offer[] = (data || [])
          .filter((o: any) => o.listing)
          .map((o: any) => ({
            id: o.id,
            listing: o.listing.title,
            listingId: o.listing.id,
            seller: {
              name: o.listing.seller?.full_name || 'Unknown Seller',
              avatar: o.listing.seller?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.listing.seller?.full_name || 'S')}&background=334155&color=fff`,
            },
            offerAmount: o.amount || 0,
            askingPrice: o.listing.asking_price || 0,
            status: o.status || 'pending',
            counterAmount: o.counter_amount || undefined,
            submittedAt: formatRelativeTime(o.created_at),
            lastActivity: getLastActivity(o.status, o.updated_at),
          }));

        setOffers(formattedOffers);

        // Calculate stats
        const activeOffers = formattedOffers.filter(o => o.status === 'pending').length;
        const counterOffers = formattedOffers.filter(o => o.status === 'countered').length;
        const accepted = formattedOffers.filter(o => o.status === 'accepted').length;
        const totalOffered = formattedOffers.reduce((sum, o) => sum + o.offerAmount, 0);

        setStats({ activeOffers, counterOffers, accepted, totalOffered });

      } catch (error) {
        console.error('Error fetching offers:', error);
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const getLastActivity = (status: string, updatedAt: string): string => {
    switch (status) {
      case 'pending': return 'Awaiting seller response';
      case 'countered': return 'Counter offer received';
      case 'accepted': return 'Moving to due diligence';
      case 'rejected': return 'Offer was declined';
      case 'withdrawn': return 'You withdrew this offer';
      default: return `Updated ${formatRelativeTime(updatedAt)}`;
    }
  };

  const filteredOffers = filter === 'all'
    ? offers
    : offers.filter(o => o.status === filter);

  const handleAcceptCounter = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedOffer) return;
    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    if (supabase) {
      await (supabase.from('offers') as any)
        .update({
          status: 'accepted',
          amount: selectedOffer.counterAmount || selectedOffer.offerAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOffer.id);
    }

    setOffers(prev => prev.map(o =>
      o.id === selectedOffer.id
        ? { ...o, status: 'accepted', offerAmount: o.counterAmount || o.offerAmount, lastActivity: 'Moving to due diligence' }
        : o
    ));
    setIsSubmitting(false);
    setShowAcceptModal(false);
    setSelectedOffer(null);
  };

  const handleNegotiate = (offer: Offer) => {
    setSelectedOffer(offer);
    setNegotiateAmount('');
    setNegotiateMessage('');
    setShowNegotiateModal(true);
  };

  const handleSubmitNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    setIsSubmitting(true);

    const newAmount = parseInt(negotiateAmount.replace(/[^0-9]/g, ''));
    const supabase = getSupabaseClient();

    if (supabase && newAmount) {
      await (supabase.from('offers') as any)
        .update({
          amount: newAmount,
          status: 'pending',
          message: negotiateMessage || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOffer.id);
    }

    setOffers(prev => prev.map(o =>
      o.id === selectedOffer.id
        ? { ...o, status: 'pending', offerAmount: newAmount, lastActivity: 'Counter offer sent, awaiting response' }
        : o
    ));
    setIsSubmitting(false);
    setShowNegotiateModal(false);
    setSelectedOffer(null);
  };

  const handleWithdraw = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedOffer) return;
    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    if (supabase) {
      await (supabase.from('offers') as any)
        .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
        .eq('id', selectedOffer.id);
    }

    setOffers(prev => prev.filter(o => o.id !== selectedOffer.id));
    setIsSubmitting(false);
    setShowWithdrawModal(false);
    setSelectedOffer(null);
  };

  const handleContinue = (offer: Offer) => {
    router.push(`/listing/${offer.listingId}`);
  };

  const statsConfig = [
    { label: 'Active Offers', value: stats.activeOffers.toString(), icon: 'solar:document-text-linear', color: 'bg-blue-100 text-blue-600' },
    { label: 'Counter Offers', value: stats.counterOffers.toString(), icon: 'solar:refresh-circle-linear', color: 'bg-amber-100 text-amber-600' },
    { label: 'Accepted', value: stats.accepted.toString(), icon: 'solar:check-circle-linear', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Total Offered', value: formatCurrency(stats.totalOffered, true), icon: 'solar:dollar-linear', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900 tracking-tight">My Offers</h1>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/notifications" className="p-2 text-dark-500 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-colors relative">
            <Icon icon="solar:bell-linear" width={22} />
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-900 tracking-tight">My Offers</h2>
          <p className="text-dark-500 mt-1">Track and manage offers you've made on listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'countered', 'accepted'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize',
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
              )}
            >
              {status === 'all' ? 'All Offers' : status}
            </button>
          ))}
        </div>

        {/* Offers List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} padding="none" className="overflow-hidden animate-pulse">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-dark-100 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-5 w-48 bg-dark-100 rounded mb-2" />
                      <div className="h-4 w-32 bg-dark-100 rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="space-y-4">
            {filteredOffers.map((offer) => {
              const config = statusConfig[offer.status] || statusConfig.pending;
              return (
                <Card key={offer.id} padding="none" className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={offer.seller.avatar}
                          alt={offer.seller.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <Link href={`/listing/${offer.listingId}`}>
                            <h3 className="font-semibold text-dark-900 hover:text-primary transition-colors">
                              {offer.listing}
                            </h3>
                          </Link>
                          <p className="text-sm text-dark-500">Seller: {offer.seller.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={config.color as any} size="sm">
                              <Icon icon={config.icon} width={14} className="mr-1" />
                              {config.label}
                            </Badge>
                            <span className="text-xs text-dark-400">• {offer.submittedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-dark-500 mb-1">Your Offer</p>
                          <p className="text-xl font-bold text-dark-900">{formatCurrency(offer.offerAmount, true)}</p>
                          {offer.status === 'countered' && offer.counterAmount && (
                            <p className="text-sm text-amber-600 font-medium mt-1">
                              Counter: {formatCurrency(offer.counterAmount, true)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {offer.status === 'countered' && (
                            <>
                              <Button size="sm" variant="primary" onClick={() => handleAcceptCounter(offer)}>Accept Counter</Button>
                              <Button size="sm" variant="secondary" onClick={() => handleNegotiate(offer)}>Negotiate</Button>
                            </>
                          )}
                          {offer.status === 'pending' && (
                            <Button size="sm" variant="secondary" onClick={() => handleWithdraw(offer)}>Withdraw</Button>
                          )}
                          {offer.status === 'accepted' && (
                            <Button size="sm" variant="primary" onClick={() => handleContinue(offer)}>
                              <Icon icon="solar:arrow-right-linear" width={16} />
                              Continue
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Footer */}
                  <div className="px-5 py-3 bg-dark-50 border-t border-dark-100">
                    <p className="text-xs text-dark-500">
                      <Icon icon="solar:clock-circle-linear" width={14} className="inline mr-1" />
                      {offer.lastActivity}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:document-text-linear" className="text-dark-400" width={32} />
            </div>
            <h3 className="text-lg font-semibold text-dark-900 mb-2">No offers yet</h3>
            <p className="text-dark-500 mb-6">Browse the marketplace and make an offer on a business you're interested in</p>
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </Card>
        )}

        {/* Accept Counter Modal */}
        <ConfirmModal
          isOpen={showAcceptModal}
          onClose={() => { setShowAcceptModal(false); setSelectedOffer(null); }}
          onConfirm={handleConfirmAccept}
          title="Accept Counter Offer"
          message={`Are you sure you want to accept the counter offer of ${selectedOffer?.counterAmount ? formatCurrency(selectedOffer.counterAmount) : ''} for "${selectedOffer?.listing}"? This will move the deal to due diligence.`}
          confirmText={isSubmitting ? 'Accepting...' : 'Accept Offer'}
          cancelText="Cancel"
          variant="info"
        />

        {/* Withdraw Modal */}
        <ConfirmModal
          isOpen={showWithdrawModal}
          onClose={() => { setShowWithdrawModal(false); setSelectedOffer(null); }}
          onConfirm={handleConfirmWithdraw}
          title="Withdraw Offer"
          message={`Are you sure you want to withdraw your offer on "${selectedOffer?.listing}"? This action cannot be undone.`}
          confirmText={isSubmitting ? 'Withdrawing...' : 'Withdraw Offer'}
          cancelText="Cancel"
          variant="danger"
        />

        {/* Negotiate Modal */}
        <Modal
          isOpen={showNegotiateModal}
          onClose={() => { setShowNegotiateModal(false); setSelectedOffer(null); }}
          title="Submit Counter Offer"
        >
          <form onSubmit={handleSubmitNegotiation} className="space-y-4">
            <div className="bg-dark-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-dark-600">
                <span className="font-medium">Current counter offer:</span>{' '}
                {selectedOffer?.counterAmount ? formatCurrency(selectedOffer.counterAmount) : 'N/A'}
              </p>
              <p className="text-sm text-dark-600">
                <span className="font-medium">Your original offer:</span>{' '}
                {selectedOffer ? formatCurrency(selectedOffer.offerAmount) : 'N/A'}
              </p>
            </div>
            <Input
              label="Your New Offer Amount"
              placeholder="$290,000"
              value={negotiateAmount}
              onChange={(e) => setNegotiateAmount(e.target.value)}
              required
            />
            <Textarea
              label="Message to Seller (Optional)"
              placeholder="Explain your offer or ask questions..."
              rows={3}
              value={negotiateMessage}
              onChange={(e) => setNegotiateMessage(e.target.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowNegotiateModal(false); setSelectedOffer(null); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Counter'}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}

export default MyOffersContent;
