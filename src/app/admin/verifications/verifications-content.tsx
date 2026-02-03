'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface Verification {
  id: string;
  listingId: string;
  businessName: string;
  sellerName: string;
  sellerEmail: string;
  submittedDate: string;
  type: 'listing' | 'identity' | 'business' | 'financial';
  status: 'pending' | 'approved' | 'rejected';
  askingPrice: number;
  priority: 'high' | 'medium' | 'low';
}

export function VerificationsContent() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVerifications = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setVerifications([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch pending listings as verifications
        const { data: listingsData, error } = await (supabase.from('listings') as any)
          .select(`
            id,
            title,
            status,
            asking_price,
            created_at,
            seller:profiles!listings_seller_id_fkey(id, first_name, last_name, email)
          `)
          .in('status', ['pending', 'pending_review'])
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedVerifications: Verification[] = (listingsData || []).map((listing: any) => ({
          id: listing.id,
          listingId: listing.id,
          businessName: listing.title || 'Untitled Listing',
          sellerName: listing.seller ? `${listing.seller.first_name || ''} ${listing.seller.last_name || ''}`.trim() : 'Unknown',
          sellerEmail: listing.seller?.email || '',
          submittedDate: listing.created_at,
          type: 'listing' as const,
          status: 'pending' as const,
          askingPrice: listing.asking_price || 0,
          priority: (listing.asking_price || 0) > 1000000 ? 'high' as const :
                   (listing.asking_price || 0) > 500000 ? 'medium' as const : 'low' as const,
        }));

        setVerifications(formattedVerifications);
      } catch (error) {
        console.error('Error fetching verifications:', error);
        setVerifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerifications();
  }, []);

  const filteredVerifications = verifications.filter(v => {
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesSearch = v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  const handleApprove = async (id: string) => {
    setIsSubmitting(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('listings') as any)
          .update({ status: 'active' })
          .eq('id', id);
      } catch (error) {
        console.error('Error approving listing:', error);
      }
    }

    setVerifications(prev => prev.filter(v => v.id !== id));
    setIsSubmitting(false);
    setShowModal(false);
  };

  const handleReject = async (id: string) => {
    setIsSubmitting(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('listings') as any)
          .update({ status: 'rejected' })
          .eq('id', id);
      } catch (error) {
        console.error('Error rejecting listing:', error);
      }
    }

    setVerifications(prev => prev.filter(v => v.id !== id));
    setIsSubmitting(false);
    setShowModal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-dark-900">Verifications</h1>
          <p className="text-sm text-dark-500">Review and approve pending listings</p>
        </div>
        <Badge variant="warning" size="lg">
          {pendingCount} Pending Reviews
        </Badge>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by business or seller name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Icon icon="solar:magnifer-linear" className="w-5 h-5 text-dark-400" />}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        {/* Verifications Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Asking Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-40 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-20 bg-dark-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredVerifications.length > 0 ? (
                  filteredVerifications.map((verification) => (
                    <tr key={verification.id} className="hover:bg-dark-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-dark-900">{verification.businessName}</div>
                        <div className="text-sm text-dark-500">{verification.id.substring(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-dark-900">{verification.sellerName}</div>
                        <div className="text-sm text-dark-500">{verification.sellerEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-dark-900">
                        {formatCurrency(verification.askingPrice, true)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(verification.priority)}`}>
                          {verification.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-600">
                        {new Date(verification.submittedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedVerification(verification);
                            setShowModal(true);
                          }}
                        >
                          <Icon icon="solar:eye-linear" className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Icon icon="solar:check-circle-bold" width={48} className="mx-auto mb-4 text-emerald-500" />
                      <h3 className="text-lg font-semibold text-dark-900 mb-2">All caught up!</h3>
                      <p className="text-dark-500">No pending listings to review.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Review Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Review Listing"
        size="lg"
      >
        {selectedVerification && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-500">Business Name</label>
                <p className="text-dark-900 font-medium">{selectedVerification.businessName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-500">Asking Price</label>
                <p className="text-dark-900 font-bold text-lg">{formatCurrency(selectedVerification.askingPrice, true)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-500">Seller</label>
                <p className="text-dark-900">{selectedVerification.sellerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-500">Email</label>
                <p className="text-dark-900">{selectedVerification.sellerEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-500">Submitted</label>
                <p className="text-dark-900">{new Date(selectedVerification.submittedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-500">Priority</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(selectedVerification.priority)}`}>
                  {selectedVerification.priority}
                </span>
              </div>
            </div>

            <div className="bg-dark-50 rounded-lg p-4">
              <p className="text-sm text-dark-600">
                Approving this listing will make it visible on the marketplace. Rejecting will notify the seller and remove the listing.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="success"
                className="flex-1"
                onClick={() => handleApprove(selectedVerification.id)}
                isLoading={isSubmitting}
              >
                <Icon icon="solar:check-circle-linear" className="w-5 h-5 mr-2" />
                Approve Listing
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => handleReject(selectedVerification.id)}
                isLoading={isSubmitting}
              >
                <Icon icon="solar:close-circle-linear" className="w-5 h-5 mr-2" />
                Reject Listing
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
