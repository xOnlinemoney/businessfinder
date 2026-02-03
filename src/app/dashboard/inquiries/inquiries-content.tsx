'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Inquiry {
  id: string;
  buyer: {
    id: string;
    name: string;
    avatar: string;
    company: string;
    verified: boolean;
  };
  listing: {
    id: string;
    title: string;
    price: number;
  };
  message: string;
  status: string;
  qualified: boolean;
  proofOfFunds: boolean;
  ndaSigned: boolean;
  date: string;
  unread: boolean;
}

interface Stats {
  total: number;
  newThisWeek: number;
  qualified: number;
  responseRate: string;
}

const mockInquiries: Inquiry[] = [
  {
    id: '1',
    buyer: { id: 'b1', name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?img=11', company: 'Acquisition Partners LLC', verified: true },
    listing: { id: 'BL-2847', title: 'Marketing Automation SaaS Platform', price: 2800000 },
    message: 'I am very interested in this business. I have experience running SaaS companies and have the capital ready.',
    status: 'new',
    qualified: true,
    proofOfFunds: true,
    ndaSigned: true,
    date: '2024-01-15T10:30:00',
    unread: true,
  },
  {
    id: '2',
    buyer: { id: 'b2', name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?img=5', company: 'Williams Ventures', verified: true },
    listing: { id: 'BL-2103', title: 'E-Commerce Fashion Brand', price: 1500000 },
    message: 'This looks like a great opportunity. Can you provide more details about the supplier relationships?',
    status: 'responded',
    qualified: true,
    proofOfFunds: true,
    ndaSigned: false,
    date: '2024-01-14T15:45:00',
    unread: false,
  },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'responded', label: 'Responded' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'pending', label: 'Pending Review' },
];

export function InquiriesContent() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, newThisWeek: 0, qualified: 0, responseRate: '0%' });
  const [listingOptions, setListingOptions] = useState<{ value: string; label: string }[]>([{ value: 'all', label: 'All Listings' }]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [listingFilter, setListingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchInquiries = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setInquiries(mockInquiries);
        setStats({ total: 12, newThisWeek: 5, qualified: 8, responseRate: '94%' });
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setInquiries(mockInquiries);
          setIsLoading(false);
          return;
        }

        // Get user's listings
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title, asking_price')
          .eq('seller_id', user.id) as { data: Array<{ id: string; title: string; asking_price: number | null }> | null };

        if (!listings || listings.length === 0) {
          setInquiries([]);
          setStats({ total: 0, newThisWeek: 0, qualified: 0, responseRate: '0%' });
          setIsLoading(false);
          return;
        }

        // Build listing options for filter
        const listingOpts = [
          { value: 'all', label: 'All Listings' },
          ...listings.map(l => ({ value: l.id, label: l.title.substring(0, 30) }))
        ];
        setListingOptions(listingOpts);

        // Fetch inquiries for user's listings
        const listingIds = listings.map(l => l.id);
        const { data: inquiriesData } = await supabase
          .from('inquiries')
          .select(`
            id,
            message,
            status,
            is_read,
            created_at,
            listing_id,
            buyer:profiles!inquiries_buyer_id_fkey(id, first_name, last_name, avatar_url, company)
          `)
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false });

        if (inquiriesData && inquiriesData.length > 0) {
          const transformedInquiries: Inquiry[] = inquiriesData.map((inq: any) => {
            const listing = listings.find(l => l.id === inq.listing_id);
            return {
              id: inq.id,
              buyer: {
                id: inq.buyer?.id || '',
                name: `${inq.buyer?.first_name || ''} ${inq.buyer?.last_name || ''}`.trim() || 'Unknown Buyer',
                avatar: inq.buyer?.avatar_url || '',
                company: inq.buyer?.company || 'Individual Buyer',
                verified: true,
              },
              listing: {
                id: listing?.id || '',
                title: listing?.title || 'Unknown Listing',
                price: listing?.asking_price || 0,
              },
              message: inq.message,
              status: inq.status || 'new',
              qualified: true,
              proofOfFunds: false,
              ndaSigned: false,
              date: inq.created_at,
              unread: !inq.is_read,
            };
          });

          setInquiries(transformedInquiries);

          // Calculate stats
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const newThisWeek = transformedInquiries.filter(i => new Date(i.date) > oneWeekAgo).length;
          const responded = transformedInquiries.filter(i => i.status === 'responded').length;
          const total = transformedInquiries.length;

          setStats({
            total,
            newThisWeek,
            qualified: transformedInquiries.filter(i => i.qualified).length,
            responseRate: total > 0 ? `${Math.round((responded / total) * 100)}%` : '0%',
          });
        } else {
          setInquiries([]);
          setStats({ total: 0, newThisWeek: 0, qualified: 0, responseRate: '0%' });
        }
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        setInquiries(mockInquiries);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (statusFilter !== 'all' && inquiry.status !== statusFilter) return false;
    if (listingFilter !== 'all' && inquiry.listing.id !== listingFilter) return false;
    if (searchQuery && !inquiry.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleReply = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedInquiry || isSending) return;

    setIsSending(true);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Send message to buyer
        await (supabase.from('messages') as any).insert({
          sender_id: user.id,
          receiver_id: selectedInquiry.buyer.id,
          content: replyMessage.trim(),
          is_read: false,
        });

        // Update inquiry status
        await (supabase.from('inquiries') as any)
          .update({ status: 'responded', is_read: true })
          .eq('id', selectedInquiry.id);

        // Create notification for buyer
        await (supabase.from('notifications') as any).insert({
          user_id: selectedInquiry.buyer.id,
          type: 'inquiry_reply',
          message: `You received a reply to your inquiry about "${selectedInquiry.listing.title}"`,
          is_read: false,
        });

        // Update local state
        setInquiries(prev => prev.map(i =>
          i.id === selectedInquiry.id ? { ...i, status: 'responded', unread: false } : i
        ));

        setShowReplyModal(false);
        setSelectedInquiry(null);
        setReplyMessage('');

      } catch (error) {
        console.error('Error sending reply:', error);
      }
    } else {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInquiries(prev => prev.map(i =>
        i.id === selectedInquiry.id ? { ...i, status: 'responded', unread: false } : i
      ));
      setShowReplyModal(false);
    }

    setIsSending(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <StatusBadge status="info">New</StatusBadge>;
      case 'responded':
        return <StatusBadge status="success">Responded</StatusBadge>;
      case 'qualified':
        return <StatusBadge status="success">Qualified</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning">Pending</StatusBadge>;
      default:
        return <StatusBadge status="default">{status}</StatusBadge>;
    }
  };

  const statsConfig = [
    { label: 'Total Inquiries', value: stats.total, icon: 'solar:chat-round-dots-bold', color: 'primary' },
    { label: 'New This Week', value: stats.newThisWeek, icon: 'solar:add-circle-bold', color: 'emerald' },
    { label: 'Qualified Buyers', value: stats.qualified, icon: 'solar:verified-check-bold', color: 'purple' },
    { label: 'Response Rate', value: stats.responseRate, icon: 'solar:chart-2-bold', color: 'amber' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-dark-900 tracking-tight">Inquiries</h1>
          <p className="text-sm text-dark-500">Manage buyer inquiries for your listings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Icon icon="solar:export-linear" width={18} />
            Export
          </Button>
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
                <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
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
                placeholder="Search by buyer name..."
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
              <Select
                options={listingOptions}
                value={listingFilter}
                onChange={(e) => setListingFilter(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </Card>

        {/* Inquiries List */}
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <Card
              key={inquiry.id}
              className={cn(
                'hover:border-primary/30 transition-colors',
                inquiry.unread && 'border-l-4 border-l-primary'
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Buyer Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative shrink-0">
                    {inquiry.buyer.avatar ? (
                      <img
                        src={inquiry.buyer.avatar}
                        alt={inquiry.buyer.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon icon="solar:user-bold" width={24} className="text-primary" />
                      </div>
                    )}
                    {inquiry.buyer.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Icon icon="solar:verified-check-bold" width={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-dark-900">{inquiry.buyer.name}</h3>
                      {inquiry.unread && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-dark-500 mb-2">{inquiry.buyer.company}</p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getStatusBadge(inquiry.status)}
                      {inquiry.qualified && (
                        <Badge variant="success" size="sm">
                          <Icon icon="solar:verified-check-linear" width={12} />
                          Qualified
                        </Badge>
                      )}
                      {inquiry.proofOfFunds && (
                        <Badge variant="purple" size="sm">
                          <Icon icon="solar:wallet-linear" width={12} />
                          POF
                        </Badge>
                      )}
                      {inquiry.ndaSigned && (
                        <Badge variant="primary" size="sm">
                          <Icon icon="solar:shield-check-linear" width={12} />
                          NDA
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-dark-600 line-clamp-2">{inquiry.message}</p>
                  </div>
                </div>

                {/* Listing & Actions */}
                <div className="lg:w-64 shrink-0">
                  <div className="bg-dark-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-dark-500 mb-1">Regarding</p>
                    <Link href={`/listing/${inquiry.listing.id}`} className="text-sm font-medium text-dark-900 hover:text-primary line-clamp-1">
                      {inquiry.listing.title}
                    </Link>
                    <p className="text-sm font-bold text-primary mt-1">{formatCurrency(inquiry.listing.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-400">{formatDate(inquiry.date)}</span>
                    <div className="flex gap-2">
                      <Link href="/dashboard/messages">
                        <Button variant="ghost" size="sm">
                          <Icon icon="solar:chat-round-dots-linear" width={16} />
                        </Button>
                      </Link>
                      <Button variant="primary" size="sm" onClick={() => handleReply(inquiry)}>
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredInquiries.length === 0 && (
          <Card className="text-center py-12">
            <Icon icon="solar:chat-round-dots-linear" width={48} className="text-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-900 mb-2">No inquiries found</h3>
            <p className="text-dark-500">
              {inquiries.length === 0
                ? 'You haven\'t received any inquiries yet. Make sure your listings are active!'
                : 'Try adjusting your filters or check back later.'}
            </p>
          </Card>
        )}
      </main>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title="Reply to Inquiry"
        size="lg"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            {/* Inquiry Details */}
            <div className="flex items-center gap-4 p-4 bg-dark-50 rounded-xl">
              {selectedInquiry.buyer.avatar ? (
                <img
                  src={selectedInquiry.buyer.avatar}
                  alt={selectedInquiry.buyer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon icon="solar:user-bold" width={20} className="text-primary" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-dark-900">{selectedInquiry.buyer.name}</span>
                  {selectedInquiry.buyer.verified && (
                    <Icon icon="solar:verified-check-bold" className="text-primary" width={16} />
                  )}
                </div>
                <p className="text-sm text-dark-500">{selectedInquiry.buyer.company}</p>
              </div>
            </div>

            {/* Original Message */}
            <div>
              <p className="text-xs text-dark-500 font-semibold mb-2">Original Inquiry</p>
              <p className="text-dark-700 p-4 bg-dark-50 rounded-xl">{selectedInquiry.message}</p>
            </div>

            {/* Reply Input */}
            <div>
              <p className="text-xs text-dark-500 font-semibold mb-2">Your Reply</p>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full h-32 p-4 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-dark-200">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSendReply}
                isLoading={isSending}
                disabled={!replyMessage.trim()}
              >
                <Icon icon="solar:plain-bold" width={18} />
                Send Reply
              </Button>
              <Button variant="ghost" onClick={() => setShowReplyModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default InquiriesContent;
